// crypto/persistence.ts

/**
 * Requests persistent storage so the browser won't silently evict
 * IndexedDB data (including stored CryptoKeys) under storage pressure.
 * Must be called from a user-interaction context in some browsers
 * (e.g. after a click), not guaranteed to succeed silently on load.
 */
export async function ensurePersistentStorage(): Promise<boolean> {
  console.log("[TECTA_Crypto] Requesting persistent storage...")
  console.log("persisted:", await navigator.storage.persisted())
console.log("estimate:", await navigator.storage.estimate())

  if (!navigator.storage?.persist) {
    console.log(
      "[TECTA_Crypto] Persistent storage API not supported in this browser"
    )

    return false
  }

  const alreadyPersisted = await navigator.storage.persisted()

  if (alreadyPersisted) {
    console.log("[TECTA_Crypto] Persistent storage already enabled")

    return true
  }

  const granted = await navigator.storage.persist()

  console.log(
    "[TECTA_Crypto] Persistent storage enabled:",
    granted
  )

  return granted
}

/**
 * Optional: check current storage usage/quota, useful for debugging
 * whether eviction risk exists.
 */
export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return null
  }

  return navigator.storage.estimate() // { usage, quota }
}