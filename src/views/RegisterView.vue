<script setup lang="ts">
import '@/assets/css/views/auth.css'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'

import { authGetCurrentUser, authRegister } from '@/api/auth'
import { Toaster } from '@/components/ui/sonner'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInfoDialog from '@/components/auth/AuthInfoDialog.vue'

const name = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const registrationCompleted = ref(false)

async function submit() {
  try {
    await authRegister({
      displayName: name.value,
      username: username.value,
      password: password.value,
    })
    registrationCompleted.value = true
  } catch (error) {
    console.error('Registration failed:', error)
    toast.error('Unable to create account')
  }
}

function continueToApp() {
  window.location.href = '/c'
}

onMounted(async () => {
  document.title = 'Tecta | Create account'
  try {
    const user = await authGetCurrentUser()
    if (user) window.location.href = '/c'
  } catch (error) {
    console.error('Error fetching current user:', error)
  }
})
</script>

<template>

    <main class="relative flex min-h-screen items-center justify-center">
    <Toaster />
    <!-- <header class="header bg">
      <div class="header__content">
        <h1>Tecta</h1>
        <p>A private place to comunicate</p>
      </div>
    </header> -->
    <div class="flex flex-col gap-4">
      <Transition name="card" appear>

        <AuthCard
          :is-register="true"
          :name="name"
          :username="username"
          :password="password"
          :confirm-password="confirmPassword"
          :registration-completed="registrationCompleted"
          @update:name="name = $event"
          @update:username="username = $event"
          @update:password="password = $event"
          @update:confirm-password="confirmPassword = $event"
          @submit="submit"
          @continue="continueToApp"
        />

      </Transition>
    </div>
    <AuthInfoDialog />
  </main>
</template>
