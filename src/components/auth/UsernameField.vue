<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

import { checkUsername } from '@/api/users'

const props = defineProps<{
  modelValue?: string
  isRegister?: boolean
}>()

const username = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value.toLowerCase())
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:valid': [value: boolean]
}>()

const usernameRegex = /^(?=.*[a-z])[a-z0-9_]{3,16}$/i

const touched = ref(false)
const checking = ref(false)
const available = ref<boolean | null>(null)

let timeout: ReturnType<typeof setTimeout> | undefined
let requestId = 0 // счётчик запросов — отбрасываем устаревшие ответы


const error = computed(() => {
  const value = props.modelValue

  if (!value) {
    return 'Username is required'
  }

  if (value.length < 3) {
    return 'Username must be at least 3 characters'
  }

  if (value.length > 32) {
    return 'Username must be at most 32 characters'
  }

  if (!usernameRegex.test(value)) {
    return 'Only lowercase letters, numbers and _ are allowed'
  }

  if (props.isRegister && available.value === false) {
    return 'This username is already taken'
  }

  return ''
})

watch(
  () => props.modelValue,
  (value) => {
    clearTimeout(timeout)

    available.value = null
    checking.value = false
    requestId++ // помечаем все запросы в полёте как устаревшие

    // Login — username availability не проверяем
    if (!props.isRegister) {
      emit('update:valid', true)
      return
    }

    emit('update:valid', false)

    // Невалидный username
    if (!usernameRegex.test(value)) {
      return
    }

    checking.value = true

    const currentId = requestId

    timeout = setTimeout(async () => {
      try {
        const result = await checkUsername(value)

        console.log('Username check result:', result)

        // ответ пришёл не на последний запрос — игнорируем
        if (currentId !== requestId) {
          return
        }
       
        available.value = result

        emit(
          'update:valid',
          result
        )
      } catch {
        if (currentId !== requestId) {
          return
        }

        available.value = null

        emit(
          'update:valid',
          false
        )
      } finally {
        if (currentId === requestId) {
          checking.value = false
        }
      }
    }, 500)
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  clearTimeout(timeout)
  requestId++ // на случай, если запрос ещё летит после размонтирования
})
</script>

<template>
  <div class="space-y-2">

    <label
      class="field-label"
      for="username"
    >
      Username <span>*</span>
    </label>

    <InputGroup
      :class="{
        'error-border':
          error &&
          touched &&
          isRegister,

        'valid-border':
          available === true &&
          isRegister,
      }"
      @click="touched = true"
      @focusin="touched = true"
    >
      <InputGroupInput
        id="username"
        v-model="username"
        type="text"
        placeholder="username"
        autocomplete="username"
        minlength="3"
        maxlength="16"
        required
        autocapitalize="none"
        spellcheck="false"
      />

      <InputGroupAddon>
        <InputGroupText>@</InputGroupText>
      </InputGroupAddon>
    </InputGroup>

    <div
      v-if="touched && isRegister"
      class="text-sm"
    >
      <span
        v-if="checking"
        class="username-status"
      >
        Checking...
      </span>

      <span
        v-else-if="error"
        class="field-error"
      >
        {{ error }}
      </span>

      <span
        v-else-if="available === true"
        class="username-status"
      >
        Available
      </span>
    </div>

  </div>
</template>