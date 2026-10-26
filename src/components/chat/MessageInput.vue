<script setup lang="ts">
import { ref } from "vue"
import Button from "../ui/button/Button.vue";
import { Send } from "lucide-vue-next";
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const content = ref("")

function send() {
  const value = content.value.trim()

  if (!value || props.disabled) {
    return
  }

  emit("send", value)

  content.value = ""
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter") {
    return
  }

  if (event.shiftKey) {
    return
  }

  event.preventDefault()

  send()
}
</script>

<template>
  <div class="shrink-0 p-3 absolute bottom-0 left-0 right-0 z-10 flex w-full flex-row gap-1 bg-background/80 backdrop-blur-md">
    <textarea
      v-model="content"
      rows="1"
      placeholder="Message..."
      :disabled="disabled"
      class="max-h-32 min-h-10 w-full resize-none rounded-xl bg-muted/40 px-3 py-2 text-sm outline-none transition focus:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
      @keydown="handleKeydown"
    />
    <Button  @click="send">
      <Send class="w-fit size-4"/>
    </Button>
  </div>
</template>
