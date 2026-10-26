<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import ChatHeader from "./ChatHeader.vue"
import MessageList from "./MessageList.vue"
import MessageInput from "./MessageInput.vue"
import UserProfilePanel from "./UserProfilePanel.vue"

import { getChat } from "@/api/chats"
import { useMessagesStore } from "@/stores/messages"
import type { Message } from "@/api/messages"

const emit = defineEmits<{
  messageSent: [message: Message]
}>()

const route = useRoute()
import { useRouter } from "vue-router"
const router = useRouter()

const messagesStore = useMessagesStore()

const chatId = computed(
  () => route.params.chatId as string | undefined,
)

import { onBeforeUnmount } from "vue"
import {
  connectChatSocket,
  type RealtimeEvent,
} from "@/api/realtime"


let chatSocket: WebSocket | null = null

const realtimeConnected = ref(false)

function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.close()
    chatSocket = null
  }

  realtimeConnected.value = false
}

function connectToChat(chatId: string) {
  disconnectChatSocket()

  chatSocket = connectChatSocket(
    chatId,
    (event: RealtimeEvent) => {
      if (chatId !== messagesStore.currentChatId) return

      if (event.type === "message:new") {
        if (event.message.chatId !== chatId) return

        messagesStore.upsertMessage(event.message)
        emit("messageSent", event.message)
      }
    },
    (connected) => {
      realtimeConnected.value = connected
    },
  )
}

const showInfo = ref(false)
const loading = ref(false)

const user = ref({
  id: "",
  displayName: "",
  username: "",
})

async function loadChat(id: string) {
  disconnectChatSocket()
  loading.value = true

  try {
    const response = await getChat(id)

    if (!response.chat?.user) {
      console.error("Chat does not contain user")
      return
    }



    user.value = response.chat.user

await messagesStore.loadMessages(id)

if (messagesStore.currentChatId === id) {
  connectToChat(id)
}
  } catch (error) {
    console.error("Failed to load chat:", error)

    user.value = {
      id: "",
      displayName: "",
      username: "",
    }

    messagesStore.clearMessages()
  } finally {
    loading.value = false
  }
}

async function sendMessage(content: string) {
  if (!chatId.value) {
    return
  }

  try {
    const message = await messagesStore.addMessage(
      chatId.value,
      content,
    )
    if (message) emit("messageSent", message)
  } catch {
    // Ошибка уже обработана store
  }
}

function toggleInfo() {
  showInfo.value = !showInfo.value
}

onMounted(() => {
  if (chatId.value) {
    loadChat(chatId.value)
  }
})
watch(chatId, (newChatId) => {
  disconnectChatSocket()
  showInfo.value = false

  if (newChatId) {
    loadChat(newChatId)
  } else {
    user.value = {
      id: "",
      displayName: "",
      username: "",
    }

    messagesStore.clearMessages()
  }
})

onBeforeUnmount(() => {
  messagesStore.clearMessages()
  disconnectChatSocket()
})

</script>

<template>
  <div class="relative flex min-h-0 min-w-0 flex-1">
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <Transition name="chat-fade" mode="out-in">
        <div
          v-if="!chatId"
          key="empty"
          class="flex flex-1 items-center justify-center text-sm text-muted-foreground"
        >
          Select a chat
        </div>

        <div
          v-else-if="loading"
          key="loading"
          class="flex flex-1 items-center justify-center text-sm text-muted-foreground"
        >
          Loading chat...
        </div>

        <div
          v-else
          key="chat"
          class="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <ChatHeader
            :name="user.displayName"
            :username="user.username"
            @back="router.push('/c')"
            @show-info="toggleInfo"
          />

          <MessageList
          style="padding-bottom: 64px !important; scroll-behavior: smooth;"
            :messages="messagesStore.messages"
            :buser-id="user.id"
            :current-user-id="messagesStore.authenticatedUserId"
          />

          <MessageInput
            :disabled="messagesStore.sending"
            @send="sendMessage"
          />
        </div>
      </Transition>
    </div>

    <Transition name="info">
      <UserProfilePanel
        v-if="showInfo && chatId"
        :open="showInfo"
        :user="user"
        @update:open="showInfo = $event"
      />
    </Transition>
  </div>
</template>

<style scoped>
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 0.25s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
}

.info-enter-active,
.info-leave-active {
  transition:
    width 0.25s ease,
    opacity 0.2s ease;
}

.info-enter-from,
.info-leave-to {
  width: 0;
  opacity: 0;
}
</style>
