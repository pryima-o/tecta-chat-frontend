<script setup lang="ts">
import {
    Card,
    CardContent,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getOrCreateKeyPair } from '@/crypto/keys.ts'
import AuthHeader from './AuthHeader.vue'
import UsernameField from './UsernameField.vue'
import PasswordField from './PasswordField.vue'
import ConfirmPasswordField from './ConfirmPasswordField.vue'
import AuthModeSwitch from './AuthModeSwitch.vue'

import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
    isRegister: boolean
    name: string
    username: string
    password: string
    confirmPassword: string,
    registrationCompleted: boolean
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:username': [value: string]
  'update:password': [value: string]
  'update:confirmPassword': [value: string]
  submit: []
  continue: []
}>()

const step = ref(1)

const usernameAvailable = ref(false)
const isPasswordValid = ref(false)
const totalSteps = 3

const isLastStep = computed(
    () => step.value === totalSteps
)



const canContinue = computed(() => {
    if (step.value === 1) {
        return (
            props.name.trim().length > 0 &&
            usernameAvailable.value
        )
    }

    if (step.value === 2) {
        return isPasswordValid.value
    }

    if (step.value === 3) {
        return (
            props.confirmPassword.length > 0 &&
            props.confirmPassword === props.password
        )
    }

    return false
})

function nextStep() {
    if (!canContinue.value) {
        return
    }

    if (step.value < totalSteps) {
        step.value++
        return
    }

    emit('submit')
}

function previousStep() {
    if (step.value > 1) {
        step.value--
    }
}

function isPasswordValidToggle(isValid: boolean) {
    isPasswordValid.value = isValid
}
function validateUsername(isValid: boolean) {
    usernameAvailable.value = isValid
}

onMounted(async () => {
    getOrCreateKeyPair()
        .then((keyPair) => {
            console.log('Key pair generated or retrieved:', keyPair)
        })
        .catch((error) => {
            console.error('Error generating or retrieving key pair:', error)
        })
})
</script>

<template>
    <Card class="!p-5 border-none rounded-[2rem] bg-transparent w-[25rem] max-w-[90vw]">
        <AuthHeader :is-register="isRegister" />

        <CardContent class="card-content">

            <!-- LOGIN -->

            <form v-if="!isRegister" class="space-y-4" @submit.prevent="emit('submit')">
                <UsernameField :model-value="username" @update:model-value="
                    emit('update:username', $event)
                    " />

                <PasswordField :model-value="password" :is-register="false" @update:model-value="
                    emit('update:password', $event)
                    " />

                <Button type="submit" class="submit-button w-full">
                    Sign in
                </Button>
            </form>

            <!-- REGISTRATION COMPLETE -->

<div
  v-else-if="props.registrationCompleted"
  class="space-y-6"
>

  <!-- Progress -->

  <div class="space-y-2">

    <div class="flex justify-between">

      <span class="text-xs text-muted-foreground">
        Complete
      </span>

      <span class="text-xs text-muted-foreground">
        100%
      </span>

    </div>

    <div
      class="h-1 w-full overflow-hidden rounded-full bg-white/10"
    >

      <div
        class="h-full w-full rounded-full bg-white"
      />

    </div>

  </div>

  <!-- Avatar -->

  <div class="flex justify-center">

    <div
      class="
        flex
        h-24
        w-24
        items-center
        justify-center
        rounded-full
        bg-white/10
        text-4xl
        font-medium
        font-primary
      "
    >
      {{ name.charAt(0).toUpperCase() }}
    </div>

  </div>

  <!-- User -->

  <div class="space-y-1 text-center">

    <h2 class="text-xl font-semibold">
      {{ name }}
    </h2>

    <p class="text-sm text-muted-foreground">
      @{{ username }}
    </p>

  </div>

  <!-- Continue -->

  <Button
    type="button"
    class="submit-button w-full"
    @click="emit('continue')"
  >
    Continue
  </Button>

</div>

            <!-- REGISTER -->

            <div v-else class="space-y-6">

                <!-- Progress -->

                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-xs text-muted-foreground">
                            Step {{ step }} of {{ totalSteps }}
                        </span>

                        <span class="text-xs text-muted-foreground">
                            {{ Math.round((step / totalSteps) * 99) }}%
                        </span>
                    </div>

                    <div class="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div class="h-full rounded-full bg-white transition-all duration-300" :style="{
                            width: `${(step / totalSteps) * 100}%`,
                        }" />
                    </div>
                </div>

                <!-- STEP CONTENT -->

                <Transition name="field" mode="out-in">

                    
                    <!-- STEP 1 -->

                    <div v-if="step === 1" key="step-1" class="space-y-4">
                        <div class="space-y-2">
                            <label class="field-label" for="name">
                                Display Name <span>*</span>
                            </label>

                            <Input id="name" :model-value="name" type="text" placeholder="User Name" autocomplete="name"
                                required @update:model-value="
                                    emit(
                                        'update:name',
                                        $event as string
                                    )
                                    " />
                        </div>

                        <UsernameField :model-value="username" :is-register="true" @update:model-value="
                            emit(
                                'update:username',
                                $event
                            )
                            " @update:valid="validateUsername($event)" />
                    </div>

                    <!-- STEP 2 -->

                    <div v-else-if="step === 2" key="step-2" class="space-y-4">
                        <PasswordField :model-value="password" :is-register="true" @update:model-value="
                            emit(
                                'update:password',
                                $event
                            )
                            " @update:valid="

                isPasswordValidToggle($event)

                " />
                    </div>

                    <!-- STEP 3 -->

                    <div v-else key="step-3" class="space-y-4">
                        <ConfirmPasswordField :model-value="confirmPassword" :password="password" @update:model-value="
                            emit(
                                'update:confirmPassword',
                                $event
                            )
                            " />
                    </div>
                   

                </Transition>

                <!-- NAVIGATION -->

                <div class="flex gap-2">

                    <Button v-if="step > 1" type="button" variant="outline" class="flex-1" @click="previousStep">
                        Back
                    </Button>

                    <Button type="button" class="submit-button flex-1" :disabled="!canContinue" @click="nextStep">
                        {{
                            isLastStep
                                ? 'Create account'
                                : 'Continue'
                        }}
                    </Button>

                </div>
            </div>

            <!-- MODE SWITCH -->

            <AuthModeSwitch v-if="!registrationCompleted" :is-register="isRegister" />

        </CardContent>
    </Card>
</template>
