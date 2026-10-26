<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next"

defineProps<{
  title: string
  updated: string
}>()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="mx-auto flex h-16 max-w-5xl items-center px-6">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="size-4" />
        Back
      </RouterLink>
    </header>

    <main class="mx-auto max-w-3xl px-6 py-16">
      <div class="mb-12">
        <h1 class="text-3xl font-semibold tracking-tight">
          {{ title }}
        </h1>

        <p class="mt-3 text-sm text-muted-foreground">
          Last updated {{ updated }}
        </p>
      </div>

      <article
        class="
          space-y-10
          text-sm
          leading-7
          text-muted-foreground
          [&_h2]:mb-3
          [&_h2]:text-lg
          [&_h2]:font-semibold
          [&_h2]:tracking-tight
          [&_h2]:text-foreground
          [&_p]:mb-3
          [&_ul]:ml-5
          [&_ul]:list-disc
          [&_li]:pl-1
        "
      >
        <slot />
      </article>
    </main>
  </div>
</template>