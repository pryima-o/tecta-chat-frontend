<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"

import type { Message } from "@/api/messages"

import { Check, CheckCheck } from "@lucide/vue";
const props = defineProps<{
  messages: Message[]
  currentUserId: string
  buserId: string
}>()

const messagesContainer = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (!messagesContainer.value) return
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}
onMounted(scrollToBottom)
watch(() => props.messages.length, scrollToBottom, { immediate: true })

// --- форматирование ---
const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

function formatTime(value: string | Date) {
  return timeFormatter.format(new Date(value))
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatDayLabel(date: Date) {
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  if (dayKey(date) === dayKey(now)) return "Today"
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday"

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    // год показываем, только если он не текущий
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  }).format(date)
}

// --- группировка по дням ---
type Group = { key: string; label: string; messages: Message[] }

const groups = computed<Group[]>(() => {
  // на случай, если сообщения пришли не по порядку
  const sorted = [...props.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const result: Group[] = []

  for (const message of sorted) {
    const date = new Date(message.createdAt)
    const key = dayKey(date)
    const last = result[result.length - 1]

    if (last && last.key === key) {
      last.messages.push(message)
    } else {
      result.push({ key, label: formatDayLabel(date), messages: [message] })
    }
  }

  return result
})
</script>

<template>
  <div
    ref="messagesContainer"
    class="min-h-0 flex-1 overflow-y-auto px-4 py-4"
  >
    <div
      v-if="messages.length === 0"
      class="flex h-full items-center justify-center text-sm text-muted-foreground"
    >
      No messages yet
    </div>

    <div v-else class="flex min-h-full flex-col gap-4 p-2">
      <section
        v-for="group in groups"
        :key="group.key"
        class="flex flex-col gap-2"
      >
        <!-- Дата по центру -->
        <div class="sticky top-0 z-10 flex justify-center py-1">
          <span
            class="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
          >
            {{ group.label }}
          </span>
        </div>

        <!-- Сообщения за эту дату -->
        <div
          v-for="message in group.messages"
          :key="message.id"
          class="flex"
          :class="
            message.senderId === currentUserId
              ? 'justify-end'
              : 'justify-start'
          "
        >
          <div
            class="max-w-[70%] rounded-2xl px-3 py-2 text-sm glass-shadow"
            :class="
              message.senderId !== buserId
                ? 'bg-foreground text-background ms-auto'
                : 'bg-muted'
            "
          >
            <p class="whitespace-pre-wrap break-words">
              {{ message.content }}
            </p>

            <div class="mt-1 block text-end text-[10px] opacity-60 flex itrems-center gap-1 justify-end">
              {{ formatTime(message.createdAt) }}  
              <div class="status" v-if="message.senderId !== buserId">
                   <Check size="14px"></Check> 
              <CheckCheck size="14px"></CheckCheck>
              <CheckCheck size="14px" class="text-emerald-500"></CheckCheck>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
