<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  MessageCircle,
  MoreHorizontal,
} from "lucide-vue-next"
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getUserByUsername } from "@/api/users"
import { useHead } from "@vueuse/head"

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const notFound = ref(false)

const user = ref({
  displayName: "",
  username: "",
  joinedDate: new Date(),
  status: "-",
})

onMounted(async () => {
  const username = route.params.username as string

  if (!username) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const response = await getUserByUsername(username)

    if (!response?.user) {
      notFound.value = true
      return
    }

    user.value = response.user

    useHead({
      title: `${user.value.displayName} (@${user.value.username}) - Tecta`,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
      <button
        class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="size-4" />
        Back
      </button>

      <span class="font-primary text-lg font-semibold tracking-tight">
        Tecta
      </span>

      <button
        class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal class="size-5" />
      </button>
    </header>

    <main class="mx-auto flex max-w-5xl justify-center px-6 py-16">

      <!-- Loading -->
      <section
        v-if="loading"
        class="w-full max-w-md text-center"
      >
        <div
          class="mx-auto size-28 animate-pulse rounded-full bg-muted"
        />

        <div class="mx-auto mt-6 h-7 w-32 animate-pulse rounded-lg bg-muted" />

        <div class="mx-auto mt-2 h-4 w-20 animate-pulse rounded-lg bg-muted" />
      </section>

      <!-- Not found -->
      <section
        v-else-if="notFound"
        class="flex w-full max-w-md flex-col items-center text-center"
      >
        <div
          class="flex size-28 items-center justify-center rounded-full bg-muted text-4xl font-semibold text-muted-foreground"
        >
          ?
        </div>

        <h1 class="mt-6 text-2xl font-semibold tracking-tight">
          User not found
        </h1>

        <p class="mt-2 text-sm text-muted-foreground">
          This user doesn't exist or may have been removed.
        </p>

        <button
          class="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          @click="goBack"
        >
          Go back
        </button>
      </section>

      <!-- Profile -->
      <section
        v-else
        class="w-full max-w-md text-center"
      >
        <!-- Avatar -->
        <div
          class="mx-auto flex size-28 items-center justify-center overflow-hidden rounded-full bg-muted font-primary text-6xl font-semibold"
        >
          {{ user.displayName.charAt(0).toUpperCase() }}
        </div>

        <!-- Identity -->
        <div class="mt-6">
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ user.displayName }}
          </h1>

          <p class="mt-1 text-sm text-muted-foreground">
            @{{ user.username }}
          </p>
        </div>

        <!-- Message -->
        <button
          class="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <MessageCircle class="size-4" />
          Message
        </button>

        <!-- Meta -->
        <div
          class="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <CalendarDays class="size-3.5" />

          <span>
            Joined
            {{
              new Date(user.joinedDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            }}
          </span>
        </div>
      </section>

    </main>
  </div>
</template>