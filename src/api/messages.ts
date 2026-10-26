import { apiFetch } from "./config"

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface GetMessagesResponse {
  ok: boolean
  messages: Message[]
}

export interface SendMessageResponse {
  ok: boolean
  message: Message
}

export async function getMessages(
  chatId: string,
  limit = 50,
): Promise<GetMessagesResponse> {
  const response = await apiFetch(
    `/chats/${encodeURIComponent(chatId)}/messages?limit=${limit}`,
  )

  if (!response.ok) {
    throw new Error("Failed to get messages")
  }

  return response
}

export async function sendMessage(
  chatId: string,
  content: string,
): Promise<SendMessageResponse> {
  const response = await apiFetch(
    `/chats/${encodeURIComponent(chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  )

  if (!response.ok) {
    throw new Error("Failed to send message")
  }

  return response
}