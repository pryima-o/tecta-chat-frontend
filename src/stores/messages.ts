
import { defineStore } from "pinia"
import { ref } from "vue"

import {
  getMessages,
  sendMessage,
  type Message,
} from "@/api/messages"

export const useMessagesStore = defineStore("messages", () => {
  const messages = ref<Message[]>([])

  const loading = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)

  const currentChatId = ref<string | null>(null)

  function upsertMessage(message: Message) {
    if (currentChatId.value !== message.chatId) return

    const index = messages.value.findIndex(
      (item) => item.id === message.id,
    )

    if (index === -1) {
      messages.value.push(message)
    } else {
      messages.value[index] = message
    }
  }

  async function loadMessages(chatId: string) {
    if (!chatId) return

    currentChatId.value = chatId
    loading.value = true
    error.value = null
    messages.value = []

    try {
      const response = await getMessages(chatId)

      if (currentChatId.value !== chatId) return

      messages.value = response.messages
    } catch (err) {
      console.error("Failed to load messages:", err)

      if (currentChatId.value === chatId) {
        error.value = "Failed to load messages"
        messages.value = []
      }
    } finally {
      if (currentChatId.value === chatId) {
        loading.value = false
      }
    }
  }

  async function addMessage(
    chatId: string,
    content: string,
  ) {
    if (!content.trim()) return

    sending.value = true
    error.value = null

    try {
      const response = await sendMessage(
        chatId,
        content.trim(),
      )

      upsertMessage(response.message)

      return response.message
    } catch (err) {
      console.error("Failed to send message:", err)
      error.value = "Failed to send message"
      throw err
    } finally {
      sending.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    currentChatId.value = null
    error.value = null
    loading.value = false
    sending.value = false
  }

  return {
    messages,
    loading,
    sending,
    error,
    currentChatId,
    loadMessages,
    upsertMessage,
    addMessage,
    clearMessages,
    
  }
})
