
<script setup lang="ts">
import { Search, X, MessageCircle, LoaderCircle } from "lucide-vue-next"
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"

import ChatListItem from "./ChatListItem.vue"
import { searchUsers } from "@/api/users"
import { createChat, getChats } from "@/api/chats"
import type { ChatListItemData } from "@/types/chat"
import type { Message } from "@/api/messages"
import { useAuthStore } from "@/stores/auth"
import { connectChatSocket, type RealtimeEvent } from "@/api/realtime"

const router = useRouter()
const emit = defineEmits<{ incomingMessage: [message: Message] }>()
const authStore = useAuthStore()
const { user: currentUser } = storeToRefs(authStore)

const search = ref("")
const searchInput = ref<HTMLInputElement | null>(null)

const chats = ref<ChatListItemData[]>([])
const searchResults = ref<ChatListItemData[]>([])

const loadingChats = ref(false)
const loadingSearch = ref(false)
const searchFocused = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0
const chatSockets = new Map<string, WebSocket>()

function syncChatSockets(items: ChatListItemData[]) {
  const chatIds = new Set(items.map((item) => item.chatId).filter((id): id is string => !!id))
  for (const [id, socket] of chatSockets) {
    if (!chatIds.has(id)) {
      socket.close()
      chatSockets.delete(id)
    }
  }
  for (const id of chatIds) {
    if (chatSockets.has(id)) continue
    const socket = connectChatSocket(id, (event: RealtimeEvent) => {
      if (event.type === "message:new" && event.message.chatId === id) {
        updateLastMessage(event.message)
        if (event.message.senderId !== currentUser.value?.id && router.currentRoute.value.path !== `/c/${id}`) {
          emit("incomingMessage", event.message)
        }
      }
    })
    chatSockets.set(id, socket)
  }
}

const isSearching = computed(() => search.value.trim().length > 0)

const displayedItems = computed(() =>
  isSearching.value ? searchResults.value : chats.value,
)

const avatarLetter = computed(
  () => currentUser.value?.displayName?.charAt(0).toUpperCase() || "?",
)

function openSearch() {
  searchFocused.value = true
  nextTick(() => searchInput.value?.focus())
}

function closeSearch() {
  searchFocused.value = false
  search.value = ""
  searchResults.value = []
  loadingSearch.value = false
  searchRequestId++

  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
}

function chatToListItem(chat: any): ChatListItemData {
  return {
    chatId: chat.id,
    userId: chat.user.id,
    displayName: chat.user.displayName,
    username: chat.user.username,
    lastMessage: chat.lastMessage,
  }
}

function userToListItem(user: any): ChatListItemData {
  return {
    userId: user.id,
    displayName: user.displayName,
    username: user.username,
  }
}

async function loadChats() {
  loadingChats.value = true

  try {
    const response = await getChats()
    chats.value = response.chats
  .map(chatToListItem)
  .sort((a, b) => {
    const dateA = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0

    const dateB = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0

    return dateB - dateA
  })
    syncChatSockets(chats.value)
  } catch (error) {
    console.error("Failed to load chats:", error)
  } finally {
    loadingChats.value = false
  }
}


function updateLastMessage(message: Message) {
  const index = chats.value.findIndex(
    (chat) => chat.chatId === message.chatId,
  )

  if (index === -1) {
    void loadChats()
    return
  }

  const [chat] = chats.value.splice(index, 1)

  chats.value.unshift({
    ...chat,
    lastMessage: message,
  })
}

defineExpose({ updateLastMessage })

watch(search, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  const query = newValue.trim()
  const requestId = ++searchRequestId

  if (!query) {
    searchResults.value = []
    loadingSearch.value = false
    return
  }

  loadingSearch.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const response = await searchUsers(query)

      // Ignore stale responses from earlier searches.
      if (requestId !== searchRequestId) return

      searchResults.value = response.users.map(userToListItem)
    } catch (error) {
      if (requestId !== searchRequestId) return

      console.error("Failed to search users:", error)
      searchResults.value = []
    } finally {
      if (requestId === searchRequestId) {
        loadingSearch.value = false
      }
    }
  }, 300)
})

async function getOrCreate(item: ChatListItemData) {
  try {
    if (item.chatId) {
      await router.push(`/c/${item.chatId}`)
      return
    }

    if (!item.userId) return

    const response = await createChat(item.userId)
    const chatId = response.chat.id

    search.value = ""
    searchResults.value = []
    searchFocused.value = false

    await loadChats()
    await router.push(`/c/${chatId}`)
  } catch (error) {
    console.error("Failed to open/create chat:", error)
  }
}

onMounted(() => {
  void loadChats()

  if (!authStore.initialized) {
    void authStore.fetchUser().catch((error) => {
      console.error("Failed to load current user:", error)
    })
  }
})

onBeforeUnmount(() => {
  for (const socket of chatSockets.values()) socket.close()
  chatSockets.clear()
  if (searchTimeout) clearTimeout(searchTimeout)
  searchRequestId++
})
</script>

<template>
  <aside
    class="flex h-full w-full flex-col overflow-hidden border-r border-border/70 bg-background"
  >
    <!-- Header -->
    <header class="px-5 pb-5 pt-6">
      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="group flex min-w-0 items-center gap-3 text-left"
          @click="router.push('/')"
        >
        

          <div class="min-w-0">
            <h1 class="text-lg font-bold tracking-[0.16em] font-primary">
              TECTA
            </h1>
            <p class="text-xs text-muted-foreground">
              @{{ currentUser?.username || "unknown" }}
            </p>
          </div>
        </button>

        <button
          type="button"
          aria-label="Open settings"
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-sm font-semibold transition-colors hover:bg-muted"
          @click="router.push('/settings')"
        >
          {{ avatarLetter }}
        </button>
      </div>

      <div class="my-5 h-px bg-border/70" />

      <!-- Search -->
<div class="relative ">
  <Search
    :size="17"
    class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
  />

  <input
    v-model="search"
    placeholder="Search people..."
    aria-label="Search users"
    class="h-11 w-full rounded-4xl  pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-border focus:border-ring/50 focus:bg-background focus:ring-2 focus:ring-ring/10 glass-shadow"
  />

  <button
    v-if="search"
    type="button"
    aria-label="Clear search"
    class="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    @click="search = ''"
  >
    <X :size="15" />
  </button>
</div>
    </header>

    <!-- List heading -->
    <div class="flex items-center justify-between px-5 pb-3">
      <h2
        class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {{ isSearching ? "People" : "Chats" }}
      </h2>

      <span
        v-if="!isSearching && chats.length"
        class="text-xs tabular-nums text-muted-foreground"
      >
        {{ chats.length }}
      </span>
    </div>

    <!-- Scrollable list -->
    <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      <!-- Loading chats -->
      <div
        v-if="loadingChats && !isSearching"
        class="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground"
      >
        <LoaderCircle :size="20" class="animate-spin" />
        <span>Loading conversations...</span>
      </div>

      <!-- Loading search -->
      <div
        v-else-if="loadingSearch && isSearching"
        class="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground"
      >
        <LoaderCircle :size="20" class="animate-spin" />
        <span>Searching people...</span>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="displayedItems.length === 0"
        class="flex flex-col items-center px-6 py-12 text-center"
      >
        <div
          class="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/30 text-muted-foreground"
        >
          <Search v-if="isSearching" :size="20" />
          <MessageCircle v-else :size="20" />
        </div>

        <p class="text-sm font-medium">
          {{ isSearching ? "No people found" : "No conversations yet" }}
        </p>

        <p class="mt-1.5 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          {{
            isSearching
              ? "Try another name or username."
              : "Search for someone to start your first conversation."
          }}
        </p>

        <button
          v-if="!isSearching"
          type="button"
          class="mt-4 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
          @click="openSearch"
        >
          Find people
        </button>
      </div>

      <!-- Items -->
      <div v-else class="flex flex-col">
        <ChatListItem
          v-for="item in displayedItems"
          :key="item.chatId ?? item.userId"
          v-bind="item"
          :active="false"
          @get-or-create="getOrCreate"
        />
      </div>
    </div>

    <!-- Footer -->

  </aside>
</template>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.search-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

.search-leave-to {
  opacity: 0;
  transform: translateX(6px);
}

@media (prefers-reduced-motion: reduce) {
  .search-enter-active,
  .search-leave-active {
    transition: none;
  }
}
</style>
