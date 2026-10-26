<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  open: boolean
  user: {
    id: string
    displayName: string
    username: string
  }
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
}>()

type Tab = "info" | "actions" | "gallery"
const activeTab = ref<Tab>("info")

function close() {
  emit("update:open", false)
}
</script>

<template>
  <Transition name="panel-slide">
    <div
      v-if="open"
      class="absolute inset-y-0 right-0 w-80 max-w-full bg-background border-l flex flex-col z-20 w-full h-full"
    >
      <div class="flex items-center justify-between p-4 border-b">
        <span class="font-medium">{{ user.displayName }}</span>
        <button @click="close">✕</button>
      </div>

      <div class="flex border-b">
        <button
          v-for="tab in (['info', 'actions', 'gallery'] as Tab[])"
          :key="tab"
          class="flex-1 py-2 text-sm capitalize"
          :class="activeTab === tab ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="activeTab === 'info'">
          <!-- имя, юзернейм, статус, дата регистрации и т.д. -->
        </div>
        <div v-else-if="activeTab === 'actions'">
          <!-- заблокировать, пожаловаться, очистить историю и т.д. -->
        </div>
        <div v-else>
          <!-- сетка медиа из чата -->
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.25s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>