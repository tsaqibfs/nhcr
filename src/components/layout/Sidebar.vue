<template>
  <aside 
    class="fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 transform md:translate-x-0"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full']"
  >
    <!-- Brand / Title -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-emerald-400">🕌 SiMajid</span>
      </div>
      <button @click="$emit('close')" class="p-1 rounded md:hidden hover:bg-slate-800 text-slate-400">
        <XIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group duration-200"
        :class="[
          $route.path === item.path
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
            : 'hover:bg-slate-800 hover:text-white'
        ]"
        @click="$emit('close')"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
          :class="[$route.path === item.path ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400']"
        />
        {{ item.name }}
      </router-link>
    </nav>

    <!-- User Section -->
    <div class="p-4 border-t border-slate-800 bg-slate-950/60">
      <button
        @click="handleLogout"
        class="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-red-900/40 hover:text-red-200 text-slate-300 rounded-lg transition-colors border border-slate-700"
      >
        <LogOutIcon class="w-4 h-4" />
        Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { 
  X as XIcon, 
  LayoutDashboard as DashboardIcon, 
  HeartHandshake as InfaqIcon, 
  Scale as ZakatIcon, 
  Gift as KurbanIcon,
  LogOut as LogOutIcon,
  FileText as FileTextIcon
} from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
  { name: 'Overview', path: '/admin/overview', icon: DashboardIcon },
  { name: 'Data Infaq', path: '/admin/infaq', icon: InfaqIcon },
  { name: 'Data Zakat', path: '/admin/zakat', icon: ZakatIcon },
  { name: 'Data Kurban', path: '/admin/kurban', icon: KurbanIcon },
  { name: 'Rekap Infaq Masjid', path: '/admin/rekap-infaq', icon: FileTextIcon }
]

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>
