<script setup lang="ts">
import type { ChatListItemData } from "@/types/chat"
import { computed } from "vue"
import { useRoute } from "vue-router";
const emit = defineEmits<{
  getOrCreate: [item: ChatListItemData]
}>()

const route = useRoute();
// --- форматирование ---
const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

function formatTime(value: string | Date) {
  const date = new Date(value)
  const now = new Date()

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const daysAgo = Math.floor(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  )

  if (daysAgo === 0) {
    return timeFormatter.format(date)
  }

  if (daysAgo === 1) {
    return "Вчера"
  }

  if (daysAgo >= 2 && daysAgo <= 6) {
    return new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
    })
      .format(date)
      .replace(".", "")
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date)
}

const props = defineProps<ChatListItemData>()
const lastMessagePreview = computed(() =>
  props.lastMessage?.content?.replace(/\s+/g, " ").trim() || "Attachment",
)
</script>

<template>
  <button
    @click="emit('getOrCreate', {
      chatId,
      userId,
      displayName,
      username,
      avatar,
      lastMessage,
      time,
      unread,
      active,
    })"
    :class="route.path === `/c/${chatId}` ? 'chat-item--active bg-muted/60 rounded-md' : 'hover:bg-muted/10'"
    class="chat-item flex w-full cursor-pointer items-center gap-3  border-b px-3 py-3 text-left transition-all"
  >
    <div
      class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-gray-700 to-zinc-600 font-medium"
    >
      <img
        v-if="avatar"
        :src="avatar"
        :alt="displayName"
        class="size-full object-cover"
      />

      <span v-else class="font-primary">
        {{ displayName?.charAt(0).toUpperCase() || "-" }}
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="truncate text-sm font-medium">
          {{ displayName }}
        </span>
      </div>

      <div
        v-if="lastMessage"
        class="mt-0.5 flex items-center justify-between gap-2"
      >
        <span class="min-w-0 truncate text-sm text-muted-foreground">
          {{ lastMessagePreview }}
        </span>
        <span class="shrink-0 text-xs text-muted-foreground/75">
          {{ formatTime(lastMessage.createdAt) }}
        </span>

        <span
          v-if="unread"
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background"
        >
          {{ unread > 9 ? "9+" : unread }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.chat-item {
  border-color: #4343431a !important;
}
.chat-item:has(+ .chat-item--active) {
  border-color: transparent !important;
}
</style>