<script setup lang="ts">

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

defineProps<{
  isRegister: boolean
}>()

</script>

<template>
  <CardHeader style="padding: 0px !important">
    <Transition name="fade" mode="out-in">
      <div :key="isRegister ? 'register-header' : 'login-header'" >

        <CardTitle class="title">
          {{ isRegister ? 'Create account' : 'Welcome' }}
        </CardTitle>

        <CardDescription>
          {{
            isRegister
              ? 'Create your account to start chatting'
              : 'Sign in to continue'
          }}
        </CardDescription>

      </div>
    </Transition>
  </CardHeader>
</template>