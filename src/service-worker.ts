/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core"
import { precacheAndRoute } from "workbox-precaching"

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<unknown> }

precacheAndRoute(self.__WB_MANIFEST)
self.skipWaiting()
clientsClaim()

self.addEventListener("push", (event) => {
  let payload: { title?: string; body?: string; url?: string; chatId?: string; tag?: string } = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { body: event.data?.text() }
  }

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
    const chatIsVisible = payload.chatId && windows.some((client) => {
      const windowClient = client as WindowClient
      return windowClient.visibilityState === "visible" && new URL(windowClient.url).pathname === `/c/${payload.chatId}`
    })
    if (chatIsVisible) return
    await self.registration.showNotification(payload.title || "Tecta", {
      body: payload.body || "You have a new message",
      icon: "/assets/img/logo.png",
      badge: "/assets/img/logo.png",
      tag: payload.tag,
      data: { url: payload.url || "/" },
    })
  })())
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = new URL((event.notification.data as { url?: string })?.url || "/", self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
    for (const client of windows) {
      if ("focus" in client) {
        await client.focus()
        await client.navigate(url)
        return
      }
    }
    await self.clients.openWindow(url)
  })())
})
