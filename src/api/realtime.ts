import type { Message } from "@/api/messages"

export type RealtimeEvent =
  | { type: "connection:ready" }
  | { type: "message:new"; message: Message }
  | { type: "error"; error: string }

export function connectChatSocket(
  chatId: string,
  onEvent: (event: RealtimeEvent) => void,
  onStatus?: (connected: boolean) => void,
) {
  const apiUrl = import.meta.env.VITE_API_URL

  const url = new URL(
    "/ws",
    apiUrl,
  )
  url.searchParams.set("chatId", chatId)

  url.protocol =
    url.protocol === "https:" ? "wss:" : "ws:"

  const socket = new WebSocket(url)

  socket.addEventListener("open", () => {
    onStatus?.(true)
  })

  socket.addEventListener("message", (event) => {
    try {
      onEvent(JSON.parse(event.data) as RealtimeEvent)
    } catch (error) {
      console.error("Invalid WebSocket event:", error)
    }
  })

  socket.addEventListener("close", () => {
    onStatus?.(false)
  })

  socket.addEventListener("error", () => {
    onStatus?.(false)
  })

  return socket
}
