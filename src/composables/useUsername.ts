import {
  computed,
  ref,
  watch,
  type Ref,
} from 'vue'

import { checkUsername } from '@/api/users'

const usernameRegex = /^[a-z0-9_]{3,32}$/

export function useUsername(username: Ref<string>) {
  const checking = ref(false)
  const available = ref<boolean | null>(null)

  let timeout: ReturnType<typeof setTimeout> | undefined

  const error = computed(() => {
    if (!username.value) {
      return 'Username is required'
    }

    if (username.value.length < 3) {
      return 'Username must be at least 3 characters'
    }

    if (username.value.length > 32) {
      return 'Username must be at most 32 characters'
    }

    if (!usernameRegex.test(username.value)) {
      return 'Only lowercase letters, numbers and _ are allowed'
    }

    if (available.value === false) {
      return 'This username is already taken'
    }

    return ''
  })

  watch(username, (value) => {
    clearTimeout(timeout)

    available.value = null

    if (!usernameRegex.test(value)) {
      checking.value = false
      return
    }

    checking.value = true

    timeout = setTimeout(async () => {
      try {
        const res: { available: boolean } = await checkUsername(value)
        available.value = res.available
      } catch {
        available.value = null
      } finally {
        checking.value = false
      }
    }, 500)
  })

  return {
    error,
    checking,
    available,
  }
}