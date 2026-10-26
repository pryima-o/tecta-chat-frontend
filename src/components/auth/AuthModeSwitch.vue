<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  isRegister: boolean
}>()

const destination = computed(() => props.isRegister ? '/auth/login' : '/auth/register')

</script>

<template>

  <div class="divider">

    <span>
      {{
        isRegister
          ? 'Already have an account?'
          : "Don't have an account?"
      }}
    </span>

    <RouterLink
      :to="destination"
      class="switch-button"
    >

      <Transition
        name="fade"
        mode="out-in"
      >

        <span
          :key="
            isRegister
              ? 'signin'
              : 'signup'
          "
        >
          {{
            isRegister
              ? 'Sign in'
              : 'Sign up'
          }}
        </span>

      </Transition>
    </RouterLink>

  </div>

</template>
