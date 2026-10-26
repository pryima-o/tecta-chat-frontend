import {
  getOrCreateKeyPair,
  loadKeyPair,
  generateRecoverySecret,
  encryptPrivateKeyForRecovery,
  decryptPrivateKeyFromRecovery,
  exportPublicKey,
  recoverySecretToBase64,
} from './keys'

export async function testTectaCrypto() {
  console.group('[TECTA_Crypto] TEST')

  try {
    // ========================================================
    // 1. Create / load identity
    // ========================================================

    console.log('1. Getting identity key...')

    const identity = await getOrCreateKeyPair()

    console.log('Public key:', identity.publicKeyBase64)

    console.log(
      'Private key:',
      identity.keyPair.privateKey,
    )

    console.log(
      'Private key extractable:',
      identity.keyPair.privateKey.extractable,
    )

    // ========================================================
    // 2. Check IndexedDB
    // ========================================================

    console.log('2. Checking IndexedDB...')

    const stored = await loadKeyPair()

    if (!stored) {
      throw new Error(
        'Key pair was not found in IndexedDB',
      )
    }

    console.log(
      'Private key restored from IndexedDB:',
      stored.privateKey,
    )

    console.log(
      'Public key restored from IndexedDB:',
      stored.publicKey,
    )

    // ========================================================
    // 3. Compare public keys
    // ========================================================

    console.log('3. Comparing public keys...')

    const storedPublicKey =
      await exportPublicKey(
        stored.publicKey,
      )

    if (
      storedPublicKey !==
      identity.publicKeyBase64
    ) {
      throw new Error(
        'Public keys do not match!',
      )
    }

    console.log(
      '✓ Public keys match',
    )

    // ========================================================
    // 4. Generate recovery secret
    // ========================================================

    console.log(
      '4. Generating recovery secret...',
    )

    const recoverySecret =
      generateRecoverySecret()

    console.log(
      'Recovery secret:',
      recoverySecretToBase64(
        recoverySecret,
      ),
    )

    console.log(
      'Recovery secret length:',
      recoverySecret.byteLength,
      'bytes',
    )

    // ========================================================
    // 5. Encrypt private key
    // ========================================================

    console.log(
      '5. Encrypting private key...',
    )

    const backup =
      await encryptPrivateKeyForRecovery(
        identity.keyPair.privateKey,
        recoverySecret,
      )

    console.log(
      'Encrypted backup:',
      backup,
    )

    // ========================================================
    // 6. Decrypt private key
    // ========================================================

    console.log(
      '6. Decrypting private key...',
    )

    const restoredPrivateKey =
      await decryptPrivateKeyFromRecovery(
        backup,
        recoverySecret,
      )

    console.log(
      'Restored private key:',
      restoredPrivateKey,
    )

    // ========================================================
    // 7. Check restored key
    // ========================================================

    console.log(
      '7. Checking restored key...',
    )

    console.log(
      'Restored key type:',
      restoredPrivateKey.type,
    )

    console.log(
      'Restored key algorithm:',
      restoredPrivateKey.algorithm,
    )

    console.log(
      'Restored key extractable:',
      restoredPrivateKey.extractable,
    )

    // ========================================================
    // 8. Verify recovery key actually works
    // ========================================================

    console.log(
      '8. Testing recovered private key...',
    )

    const testKeyPair =
      await crypto.subtle.generateKey(
        {
          name: 'X25519',
        },
        false,
        ['deriveBits'],
      )

    const originalSharedSecret =
      await crypto.subtle.deriveBits(
        {
          name: 'X25519',
          public: testKeyPair.publicKey,
        },
        identity.keyPair.privateKey,
        256,
      )

    const restoredSharedSecret =
      await crypto.subtle.deriveBits(
        {
          name: 'X25519',
          public: testKeyPair.publicKey,
        },
        restoredPrivateKey,
        256,
      )

    const originalBytes =
      new Uint8Array(
        originalSharedSecret,
      )

    const restoredBytes =
      new Uint8Array(
        restoredSharedSecret,
      )

    if (
      originalBytes.length !==
      restoredBytes.length
    ) {
      throw new Error(
        'Shared secrets have different lengths',
      )
    }

    for (
      let i = 0;
      i < originalBytes.length;
      i++
    ) {
      if (
        originalBytes[i] !==
        restoredBytes[i]
      ) {
        throw new Error(
          'Recovered private key is NOT equivalent!',
        )
      }
    }

    console.log(
      '✓ Recovered private key produces the same shared secret',
    )

    // ========================================================
    // SUCCESS
    // ========================================================

    console.log(
      '✓ ALL CRYPTO TESTS PASSED',
    )

    console.groupEnd()

    return true
  } catch (error) {
    console.error(
      '[TECTA_Crypto] TEST FAILED:',
      error,
    )

    console.groupEnd()

    return false
  }
}