<script setup>
import { useAuthStore } from "@/stores/auth"
import { onMounted } from "vue";
import router from "@/router";
const authStore = useAuthStore()

onMounted(() => {
  authStore.logout()

})
</script>
<template>

</template>