<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import {
  UserRound,
  ShieldCheck,
  Bell,
  Palette,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Settings2,
  CircleHelp,
  Smartphone,
} from "lucide-vue-next"

import { useAuthStore } from "@/stores/auth"
import { disablePushNotifications, enablePushNotifications } from "@/api/notifications"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const router = useRouter()
const authStore = useAuthStore()

const user = ref(authStore.user)
const pushBusy = ref(false)
const pushEnabled = ref(false)
const pushError = ref("")

async function enableNotifications() {
  pushBusy.value = true
  pushError.value = ""
  try {
    await enablePushNotifications()
    pushEnabled.value = true
  } catch (error) {
    pushError.value = error instanceof Error ? error.message : "Could not enable notifications"
  } finally {
    pushBusy.value = false
  }
}

async function disableNotifications() {
  pushBusy.value = true
  pushError.value = ""
  try {
    await disablePushNotifications()
    pushEnabled.value = false
  } catch (error) {
    pushError.value = error instanceof Error ? error.message : "Could not disable notifications"
  } finally {
    pushBusy.value = false
  }
}

const settingsGroups = [
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        description: "Name, username and birthday",
        icon: UserRound,
        route: "/settings/profile",
      },
      {
        title: "Security",
        description: "Password, sessions and devices",
        icon: ShieldCheck,
        route: "/settings/security",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        title: "Notifications",
        description: "Messages and alerts",
        icon: Bell,
        route: "/settings/notifications",
      },
      {
        title: "Appearance",
        description: "Theme and interface",
        icon: Palette,
        route: "/settings/appearance",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Help",
        description: "Information and assistance",
        icon: CircleHelp,
        route: "/settings/help",
      },
    ],
  },
]

function open(route: string) {
  router.push(route)
}

async function loadUser() {
  try {
    user.value = await authStore.fetchUser()
  } catch (error) {
    console.error("Failed to fetch user:", error)
  }
}

function logout() {
  router.push("/auth/logout")
}

onMounted(loadUser)
onMounted(async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
  try {
    pushEnabled.value = !!(await (await navigator.serviceWorker.ready).pushManager.getSubscription())
  } catch (error) {
    console.error("Could not check push subscription", error)
  }
})
</script>

<template>
  <main class="min-h-dvh bg-background px-4 py-6 sm:px-6 sm:py-10 h-[10dvh] overflow-y-auto">
    <div class="mx-auto w-full max-w-2xl space-y-8">

      <!-- Header -->
      <header class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0 rounded-full"
          aria-label="Go back"
          @click="router.back()"
        >
          <ArrowLeft class="size-5" />
        </Button>

        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p class="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </header>

      <!-- Profile card -->
      <Card
        class="overflow-hidden rounded-2xl border-border/70 shadow-sm"
      >
        <CardContent class="p-0">
          <button
            class="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40 sm:p-6"
            @click="open('/settings/profile')"
          >
            <Avatar class="size-16 shrink-0 rounded-full">
              <AvatarFallback
                class="rounded-full bg-primary text-xl font-semibold text-primary-foreground"
              >
                {{ user?.username?.charAt(0).toUpperCase() || "?" }}
              </AvatarFallback>
            </Avatar>

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-lg font-semibold">
                {{ user?.displayName || "Your profile" }}
              </h2>

              <p class="mt-0.5 truncate text-sm text-muted-foreground">
                @{{ user?.username || "username" }}
              </p>

              <p class="mt-2 text-xs font-medium text-primary">
                Edit profile
              </p>
            </div>

            <ChevronRight class="size-5 shrink-0 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <section class="space-y-3">
        <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h2>
        <Card class="rounded-2xl border-border/70 shadow-sm">
          <CardContent class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-medium">Web push notifications</p>
              <p class="mt-1 text-xs text-muted-foreground">Get new message alerts when Tecta is closed or your device is locked.</p>
              <p v-if="pushError" class="mt-2 text-xs text-destructive">{{ pushError }}</p>
            </div>
            <Button :disabled="pushBusy" @click="pushEnabled ? disableNotifications() : enableNotifications()">
              {{ pushBusy ? "Saving…" : pushEnabled ? "Disable notifications" : "Enable notifications" }}
            </Button>
          </CardContent>
        </Card>
      </section>

      <!-- Settings groups -->
      <section
        v-for="group in settingsGroups"
        :key="group.title"
        class="space-y-3"
      >
        <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {{ group.title }}
        </h2>

        <Card class="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent class="p-0">
            <template
              v-for="(item, index) in group.items"
              :key="item.route"
            >
              <button
                class="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                @click="open(item.route)"
              >
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 transition-colors group-hover:bg-background"
                >
                  <component
                    :is="item.icon"
                    class="size-5 text-foreground/80"
                    :stroke-width="1.8"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium">
                    {{ item.title }}
                  </p>

                  <p class="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {{ item.description }}
                  </p>
                </div>

                <ChevronRight
                  class="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
                />
              </button>

              <Separator
                v-if="index < group.items.length - 1"
                class="ml-[4.5rem] w-auto"
              />
            </template>
          </CardContent>
        </Card>
      </section>

      <!-- Session -->
      <section class="space-y-3">
        <h2 class="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Session
        </h2>

        <Card class="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent class="p-0">
            <button
              class="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-destructive/5"
              @click="logout"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <LogOut class="size-5 text-destructive" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-destructive">
                  Log out
                </p>
                <p class="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Sign out of your account
                </p>
              </div>

              <ChevronRight class="size-4 shrink-0 text-muted-foreground/60" />
            </button>
          </CardContent>
        </Card>
      </section>

      <!-- App information -->
      <footer class="flex flex-col items-center gap-2 pb-4 pt-2 text-center">
        <div class="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground">
          <Smartphone class="size-4" />
          Tecta
        </div>

        <p class="text-xs text-muted-foreground">
          Version 1.0.0
        </p>

        <p class="text-xs text-muted-foreground/70">
          Your conversations, your space.
        </p>
      </footer>

    </div>
  </main>
</template>
