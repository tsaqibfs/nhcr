<template>
  <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
    <!-- Left: Menu Trigger (Mobile) -->
    <div class="flex items-center gap-4">
      <button 
        v-if="showMenuButton"
        @click="$emit('toggle-sidebar')" 
        class="p-2 rounded-lg md:hidden hover:bg-slate-100 text-slate-600 focus:outline-none"
      >
        <MenuIcon class="w-6 h-6" />
      </button>
      <h1 class="text-lg font-bold text-slate-800 md:text-xl">{{ title }}</h1>
    </div>

    <!-- Right: Badges & Profile -->
    <div class="flex items-center gap-4">
      <!-- Mock Mode Badge -->
      <span 
        v-if="authStore.isMockMode"
        class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 rounded-full border border-amber-200"
      >
        <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
        Demo Mode (Offline Fallback)
      </span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Menu as MenuIcon } from 'lucide-vue-next'

defineProps({
  showMenuButton: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const route = useRoute()

const title = computed(() => {
  switch (route.name) {
    case 'AdminOverview': return 'Overview Dashboard'
    case 'AdminInfaq': return 'Manajemen Infaq'
    case 'AdminZakat': return 'Manajemen Zakat'
    case 'AdminKurban': return 'Manajemen Kurban'
    case 'JamaahPortal': return 'Portal Jamaah'
    case 'JamaahInfaq': return 'Bayar Infaq'
    case 'JamaahZakat': return 'Hitung & Bayar Zakat'
    case 'JamaahKurban': return 'Daftar Kurban'
    default: return 'SiMajid'
  }
})
</script>
