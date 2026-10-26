<script setup lang="ts">
import { ArrowLeft, MoreHorizontal } from "lucide-vue-next"

defineProps<{
  name: string
  username: string
  online?: boolean
}>()

defineEmits<{
  back: []
  showInfo: []
}>()
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-3 border-b px-4">
    <button
      class="flex size-9 items-center justify-center rounded-lg hover:bg-muted md:hidden"
      @click="$emit('back')"
    >
      <ArrowLeft class="size-5" />
    </button>

    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium"
    >
      {{ name.charAt(0) }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">
        {{ name }}
      </p>

      <p class="truncate text-xs text-muted-foreground">
        <span v-if="online" class="text-emerald-500">
          online
        </span>

        <span v-else>
          {{ username }}
        </span>
      </p>
    </div>

    <button
      class="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
      @click="$emit('showInfo')"
    >
      <MoreHorizontal class="size-5" />
    </button>
  </header>
</template>
