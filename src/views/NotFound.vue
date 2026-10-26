<script setup lang="ts">
import { ArrowLeft, CalendarDays, MessageCircle, MoreHorizontal } from "lucide-vue-next"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
const user = ref({
  displayName: "Monk",
  username: "monk",
  bio: "Software developer. Building things that probably didn't need to be built.",
  joinedDate: new Date("2026-09-01"),
  status: "online",
})

</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
      <button
        class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="size-4" />
        Back
      </button>

      <span class="text-lg font-semibold tracking-tight font-primary">
        Tecta
      </span>

      <button
        class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal class="size-5" />
      </button>
    </header>

    <main class="mx-auto flex max-w-5xl justify-center px-6 py-16">
      <section class="w-full max-w-md text-center">
        <!-- Avatar -->
      
        <!-- Identity -->
        <div class="mt-6">
          <h1 class="text-2xl font-semibold tracking-tight font-primary">
            404
          </h1>

          <p class="mt-1 text-sm text-muted-foreground">
            Page not found
          </p>
        </div>

        <button
          class="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
       
          Go Home
        </button>

        <!-- Meta -->
    
      </section>
    </main>
  </div>
</template>