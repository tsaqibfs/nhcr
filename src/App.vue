<template>
  <div v-if="authStore.loading && !isInitialized" class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="flex flex-col items-center gap-4">
      <span class="text-5xl animate-bounce">🕌</span>
      <h3 class="text-lg font-semibold tracking-wider">Memuat SiMajid...</h3>
    </div>
  </div>
  <router-view v-else />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const isInitialized = ref(false)

onMounted(async () => {
  await authStore.initialize()
  isInitialized.value = true
})
</script>
