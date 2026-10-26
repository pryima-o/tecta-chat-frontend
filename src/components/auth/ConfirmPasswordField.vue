<script setup lang="ts">

import { ref } from 'vue'

import {
  Eye,
  EyeOff,
} from 'lucide-vue-next'

import { Input } from '@/components/ui/input'

const props = defineProps<{
  modelValue: string
  password: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

</script>

<template>

  <div class="space-y-2">

    <label
      class="field-label"
      for="confirm-password"
    >
      Confirm password <span>*</span>
    </label>

    <div class="password-field">

      <Input
        id="confirm-password"
        :model-value="props.modelValue"
        :type="
          showPassword
            ? 'text'
            : 'password'
        "
        placeholder="••••••••"
        required
        autocomplete="new-password"
        @update:model-value="
          emit('update:modelValue', $event as string)
        "
      />

      <button
        type="button"
        class="password-toggle"
        @click="
          showPassword = !showPassword
        "
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

    <p
      v-if="
        modelValue &&
        modelValue !== password
      "
      class="password-rule"
    >
      Passwords do not match
    </p>

  </div>

</template>
