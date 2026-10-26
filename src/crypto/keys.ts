// crypto/keys.ts

const DB_NAME = 'tecta-keystore'
const STORE_NAME = 'keys'
const DB_VERSION = 1

const IDENTITY_KEY = 'identity-keypair'

// ============================================================
// IndexedDB
// ============================================================

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
      const db = request.result

      db.onversionchange = () => {
        db.close()
      }

      resolve(db)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function idbSet(
  key: string,
  value: unknown,
): Promise<void> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    store.put(value, key)

    tx.oncomplete = () => {
      db.close()
      resolve()
    }

    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }

    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbGet<T>(
  key: string,
): Promise<T | undefined> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)

    request.onsuccess = () => {
      db.close()
      resolve(request.result as T | undefined)
    }

    request.onerror = () => {
      db.close()
      reject(request.error)
    }
  })
}

async function idbDelete(
  key: string,
): Promise<void> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')

    tx.objectStore(STORE_NAME).delete(key)

    tx.oncomplete = () => {
      db.close()
      resolve()
    }

    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

// ============================================================
// Base64
// ============================================================

function arrayBufferToBase64(
  buffer: ArrayBuffer,
): string {
  const bytes = new Uint8Array(buffer)

  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function base64ToUint8Array(
  value: string,
): Uint8Array {
  const binary = atob(value)

  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

// ============================================================
// Persistent storage
// ============================================================

export async function ensurePersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    console.warn(
      '[TECTA_Crypto] Persistent Storage API unavailable',
    )

    return false
  }

  const alreadyPersisted =
    await navigator.storage.persisted()

  if (alreadyPersisted) {
    console.log(
      '[TECTA_Crypto] Persistent storage already enabled',
    )

    return true
  }

  const granted =
    await navigator.storage.persist()

  console.log(
    '[TECTA_Crypto] Persistent storage enabled:',
    granted,
  )

  return granted
}

// ============================================================
// X25519 identity
// ============================================================

export type IdentityKeyPair = {
  privateKey: CryptoKey
  publicKey: CryptoKey
}

export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
  const keyPair =
    await crypto.subtle.generateKey(
      {
        name: 'X25519',
      },
      true,
      ['deriveBits'],
    )

  return keyPair
}

// ============================================================
// Public key
// ============================================================

export async function exportPublicKey(
  publicKey: CryptoKey,
): Promise<string> {
  const raw =
    await crypto.subtle.exportKey(
      'raw',
      publicKey,
    )

  return arrayBufferToBase64(raw)
}

// ============================================================
// Generate + store identity
// ============================================================

export async function generateAndStoreKeyPair(): Promise<{
  keyPair: IdentityKeyPair
  publicKeyBase64: string
}> {
  console.log(
    '[TECTA_Crypto] Generating X25519 identity...',
  )

  await ensurePersistentStorage()

  const keyPair =
    await generateIdentityKeyPair()

  await idbSet(
    IDENTITY_KEY,
    {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    },
  )

  const publicKeyBase64 =
    await exportPublicKey(
      keyPair.publicKey,
    )

  console.log(
    '[TECTA_Crypto] Identity key generated and stored',
  )

  return {
    keyPair,
    publicKeyBase64,
  }
}

// ============================================================
// Load identity
// ============================================================

export async function loadKeyPair(): Promise<
  IdentityKeyPair | null
> {
  const stored =
    await idbGet<IdentityKeyPair>(
      IDENTITY_KEY,
    )

  if (!stored) {
    return null
  }

  if (
    !stored.privateKey ||
    !stored.publicKey
  ) {
    return null
  }

  return stored
}

// ============================================================
// Get or create identity
// ============================================================

export async function getOrCreateKeyPair(): Promise<{
  keyPair: IdentityKeyPair
  publicKeyBase64: string
}> {
  await ensurePersistentStorage()

  const existing =
    await loadKeyPair()

  if (existing) {
    console.log(
      '[TECTA_Crypto] Existing identity restored',
    )

    const publicKeyBase64 =
      await exportPublicKey(
        existing.publicKey,
      )

    return {
      keyPair: existing,
      publicKeyBase64,
    }
  }

  return generateAndStoreKeyPair()
}

// ============================================================
// Recovery secret
// ============================================================

export function generateRecoverySecret(): Uint8Array {
  return crypto.getRandomValues(
    new Uint8Array(32),
  )
}

export function recoverySecretToBase64(
  secret: Uint8Array,
): string {
  return arrayBufferToBase64(secret)
}

export function recoverySecretFromBase64(
  value: string,
): Uint8Array {
  return base64ToUint8Array(value)
}

// ============================================================
// Recovery AES key
// ============================================================

async function importRecoveryKey(
  recoverySecret: Uint8Array,
): Promise<CryptoKey> {
  if (recoverySecret.byteLength !== 32) {
    throw new Error(
      'Recovery secret must be 32 bytes',
    )
  }

  return crypto.subtle.importKey(
    'raw',
    recoverySecret,
    {
      name: 'AES-GCM',
    },
    false,
    [
      'encrypt',
      'decrypt',
    ],
  )
}

// ============================================================
// Export private key for recovery
// ============================================================

async function exportPrivateKey(
  privateKey: CryptoKey,
): Promise<ArrayBuffer> {
  if (!privateKey.extractable) {
    throw new Error(
      'Private key is not extractable and cannot be backed up',
    )
  }

  return crypto.subtle.exportKey(
    'pkcs8',
    privateKey,
  )
}

// ============================================================
// Encrypt private key
// ============================================================

export type EncryptedPrivateKeyBackup = {
  version: 1
  algorithm: 'X25519+AES-256-GCM'
  iv: string
  ciphertext: string
}

export async function encryptPrivateKeyForRecovery(
  privateKey: CryptoKey,
  recoverySecret: Uint8Array,
): Promise<EncryptedPrivateKeyBackup> {
  const privateKeyRaw =
    await exportPrivateKey(
      privateKey,
    )

  const recoveryKey =
    await importRecoveryKey(
      recoverySecret,
    )

  const iv =
    crypto.getRandomValues(
      new Uint8Array(12),
    )

  const ciphertext =
    await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      recoveryKey,
      privateKeyRaw,
    )

  return {
    version: 1,
    algorithm: 'X25519+AES-256-GCM',
    iv: arrayBufferToBase64(iv),
    ciphertext:
      arrayBufferToBase64(ciphertext),
  }
}

// ============================================================
// Restore private key from recovery
// ============================================================

export async function decryptPrivateKeyFromRecovery(
  backup: EncryptedPrivateKeyBackup,
  recoverySecret: Uint8Array,
): Promise<CryptoKey> {
  if (backup.version !== 1) {
    throw new Error(
      'Unsupported recovery backup version',
    )
  }

  const recoveryKey =
    await importRecoveryKey(
      recoverySecret,
    )

  const iv =
    base64ToUint8Array(
      backup.iv,
    )

  const ciphertext =
    base64ToUint8Array(
      backup.ciphertext,
    )

  const privateKeyRaw =
    await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      recoveryKey,
      ciphertext,
    )

  return crypto.subtle.importKey(
    'pkcs8',
    privateKeyRaw,
    {
      name: 'X25519',
    },
    true,
    ['deriveBits'],
  )
}

// ============================================================
// Restore complete identity from recovery
// ============================================================

export async function restoreIdentityFromRecovery(
  backup: EncryptedPrivateKeyBackup,
  recoverySecret: Uint8Array,
): Promise<{
  keyPair: IdentityKeyPair
  publicKeyBase64: string
}> {
  const privateKey =
    await decryptPrivateKeyFromRecovery(
      backup,
      recoverySecret,
    )

  /*
   * X25519 public key is derived from the private key.
   *
   * Web Crypto does not expose a direct
   * "derive public key from private key" operation,
   * so the public key should normally be stored
   * alongside the encrypted backup.
   */

  throw new Error(
    'Public key must be restored from the recovery metadata',
  )
}

// ============================================================
// Delete local identity
// ============================================================

export async function deleteLocalIdentity(): Promise<void> {
  await idbDelete(IDENTITY_KEY)

  console.log(
    '[TECTA_Crypto] Local identity deleted',
  )
}