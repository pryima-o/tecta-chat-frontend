<script setup lang="ts">

import { computed, ref, watch } from 'vue'

import {
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-vue-next'

import { Input } from '@/components/ui/input'

const props = defineProps<{
  modelValue: string
  isRegister?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string],
  'update:valid': [value: boolean]
}>()

const showPassword = ref(false)

const password = computed(() => props.modelValue)

const rules = computed(() => ({
  minLength: password.value.length >= 8,

  letter: /[A-Za-z]/.test(password.value),

  number: /[0-9]/.test(password.value),

  special: /[^A-Za-z0-9\s]/.test(password.value),

  noSpaces: !/\s/.test(password.value),
}))

const isValid = computed(() => {
  return Object.values(rules.value).every(Boolean)
})

watch(isValid, (newValue) => {
    console.log('Password validity changed:', newValue)
  emit('update:valid', newValue)
})

</script>

<template>

  <div class="space-y-2">

    <label
      class="field-label"
      for="password"
    >
      Password <span>*</span>
    </label>

    <div class="password-field">

      <Input
        id="password"
        :model-value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••"
        required
        :autocomplete="
          isRegister
            ? 'new-password'
            : 'current-password'
        "
        :aria-invalid="
  isRegister && modelValue.length > 0 && !isValid
    ? 'true'
    : undefined
"
        @update:model-value="
          emit('update:modelValue', $event as string)
        "
      />

      <button
        type="button"
        class="password-toggle"
        @click="showPassword = !showPassword"
      >

        <Transition
          name="icon"
          mode="out-in"
        >

          <EyeOff
            v-if="showPassword"
            key="eye-off"
            :size="18"
          />

          <Eye
            v-else
            key="eye"
            :size="18"
          />

        </Transition>

      </button>

    </div>

    <!-- Password requirements -->

    <div
      v-if="modelValue && isRegister"
      class="password-requirements"
    >

      <div
        :class="[
          'password-rule',
          rules.minLength
            ? 'valid'
            : 'invalid'
        ]"
      >
        <Check
          v-if="rules.minLength"
          :size="14"
        />

        <X
          v-else
          :size="14"
        />

        <span>
          At least 8 characters
        </span>
      </div>

      <div
        :class="[
          'password-rule',
          rules.letter
            ? 'valid'
            : 'invalid'
        ]"
      >
        <Check
          v-if="rules.letter"
          :size="14"
        />

        <X
          v-else
          :size="14"
        />

        <span>
          Contains a letter
        </span>
      </div>

      <div
        :class="[
          'password-rule',
          rules.number
            ? 'valid'
            : 'invalid'
        ]"
      >
        <Check
          v-if="rules.number"
          :size="14"
        />

        <X
          v-else
          :size="14"
        />

        <span>
          Contains a number
        </span>
      </div>

      <div
        :class="[
          'password-rule',
          rules.special
            ? 'valid'
            : 'invalid'
        ]"
      >
        <Check
          v-if="rules.special"
          :size="14"
        />

        <X
          v-else
          :size="14"
        />

        <span>
          Contains a special character
        </span>
      </div>

      <div
        :class="[
          'password-rule',
          rules.noSpaces
            ? 'valid'
            : 'invalid'
        ]"
      >
        <Check
          v-if="rules.noSpaces"
          :size="14"
        />

        <X
          v-else
          :size="14"
        />

        <span>
          No spaces
        </span>
      </div>

    </div>

  </div>

</template>