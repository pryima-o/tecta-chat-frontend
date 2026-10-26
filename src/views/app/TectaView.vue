<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import ChatList from "@/components/chat/ChatList.vue"
import ChatEmptyState from "@/components/chat/ChatEmptyState.vue"
import ChatLoadingState from "@/components/chat/ChatLoadingState.vue"
import ChatConversation from "@/components/chat/ChatConversation.vue"

import { getChat } from "@/api/chats"
import type { Message } from "@/api/messages"

const chatList = ref<{ updateLastMessage: (message: Message) => void } | null>(null)
const incomingNotice = ref<{ chatId: string; text: string } | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | undefined

function showIncomingNotice(message: Message) {
  incomingNotice.value = { chatId: message.chatId, text: message.content }
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { incomingNotice.value = null }, 5000)
}

onBeforeUnmount(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
})

const route = useRoute()
const router = useRouter()

const chatId = computed(() => route.params.chatId as string | undefined)

const loading = ref(false)

const user = ref({
  id: "",
  displayName: "",
  username: "",
})

async function loadChat(id: string) {
  loading.value = true

  try {
    const response = await getChat(id)

    if (!response.chat?.user) {
      console.error("Chat does not contain user")
      return
    }

    user.value = response.chat.user
  } catch (error) {
    console.error("Error fetching chat:", error)

    user.value = { id: "", displayName: "", username: "" }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (chatId.value) loadChat(chatId.value)
})

watch(chatId, (newChatId) => {
  if (newChatId) {
    loadChat(newChatId)
  } else {
    user.value = { id: "", displayName: "", username: "" }
  }
})
</script>
<template>
  <section class="flex h-dvh w-full overflow-hidden bg-background">
    <button
      v-if="incomingNotice && incomingNotice.chatId !== chatId"
      type="button"
      class="fixed left-3 right-3 top-3 z-50 mx-auto max-w-lg rounded-xl border border-border bg-background/95 p-3 text-left shadow-lg backdrop-blur md:hidden"
      @click="router.push(`/c/${incomingNotice.chatId}`); incomingNotice = null"
    >
      <span class="block text-xs font-semibold text-muted-foreground">New message</span>
      <span class="block truncate text-sm">{{ incomingNotice.text }}</span>
    </button>
    <!-- Список: на мобилке виден только когда чат не открыт -->
    <ChatList
      class="w-full shrink-0 border-r md:w-80 lg:w-96"
      :class="chatId ? 'hidden md:flex' : 'flex'"
      ref="chatList"
      @incoming-message="showIncomingNotice"
    />

    <!-- Чат: на мобилке виден только когда чат открыт -->
    <main
      class="min-w-0 flex-1 flex-col"
      :class="chatId ? 'flex' : 'hidden md:flex'"
    >
      <ChatEmptyState v-if="!chatId" />
      <ChatConversation v-else :key="chatId" :user="user" :loading="loading" @message-sent="chatList?.updateLastMessage($event)" />
    </main>
  </section>
</template>

<style scoped>
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 0.25s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  /* filter: blur(2px); */
}
</style>
