import { apiFetch } from "./config"

export async function createChat(userId: string) {
  const response = await apiFetch("/chats", {
    method: "POST",
    body: JSON.stringify({
      userId,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create chat")
  }

  console.log("createChat response:", response)

  return response
}

export async function getChats() {
  const response = await apiFetch("/chats")

  if (!response.ok) {
    throw new Error("Failed to get chats")
  }

  console.log("getChats response:", response)

  return response
}

export async function getChat(chatId: string) {
  const response = await apiFetch(
    `/chats/${encodeURIComponent(chatId)}`
  )

  if (!response.ok) {
    throw new Error("Failed to get chat")
  }

  console.log("getChat response:", response)

  return response
}