import { apiFetch } from "@/api/config"

export async function enablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Push notifications are not supported in this browser")
  }
  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("Notification permission was not granted")

  const { publicKey } = await apiFetch("/notifications/vapid-public-key")
    console.log(publicKey)
  const registration = await navigator.serviceWorker.ready

  console.log("Service worker registration:", registration)
  const base64 = publicKey.replace(/-/g, "+").replace(/_/g, "/")
  const applicationServerKey = Uint8Array.from(atob(base64 + "=".repeat((4 - base64.length % 4) % 4)), (char) => char.charCodeAt(0))
  let subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    const existingKey = subscription.options.applicationServerKey
    const matches = existingKey && new Uint8Array(existingKey).every((value, index) => value === applicationServerKey[index])
    if (!matches) {
      await subscription.unsubscribe()
      subscription = null
    }
  }
  subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
  await apiFetch("/notifications/subscriptions", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  })
}

export async function disablePushNotifications() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await apiFetch(`/notifications/subscriptions?endpoint=${encodeURIComponent(endpoint)}`, { method: "DELETE" })
}
