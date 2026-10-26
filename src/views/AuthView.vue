<script setup lang="ts">

import '@/assets/css/views/auth.css'
import 'vue-sonner/style.css'
import { toast } from 'vue-sonner'
import {
  ref,
  onMounted,
} from 'vue'

import { authLogin, authGetCurrentUser } from '@/api/auth'

import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInfoDialog from '@/components/auth/AuthInfoDialog.vue'

const username = ref('')
const password = ref('')
async function submit() {
  await authLogin({
    username: username.value,
    password: password.value,
  }).then((res) => {
    console.log('Login successful', res)
    window.location.href = '/c'
  }).catch((error) => {
    console.error('Login failed:', error)
    toast.error("Invalid credentials")
  })
}

onMounted(async () => {

  document.title = 'Tecta | Auth'
  await authGetCurrentUser().then((user) => {
    console.log('Current user:', user)
    if (user) {
      window.location.href = '/c'
    }
  }).catch((error) => {
    console.error('Error fetching current user:', error)
  })

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
          :is-register="false"
          name=""
          :username="username"
          :password="password"
          confirm-password=""
        

          @update:username="
            username = $event
          "

          @update:password="
            password = $event
          "

          @submit="submit"

          :registration-completed="false"
        />

      </Transition>
    </div>
    <AuthInfoDialog />
  </main>

</template>
