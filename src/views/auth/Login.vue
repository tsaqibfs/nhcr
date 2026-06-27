<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900">
    <div class="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
      <!-- Header -->
      <div class="text-center mb-8">
        <span class="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-2xl mb-3 text-3xl">🕌</span>
        <h2 class="text-2xl font-bold text-slate-800">Sistem Masjid Nurul Huda</h2>
        <p class="text-slate-500 mt-1.5 text-sm">Masuk untuk mengakses portal masjid</p>
      </div>

      <!-- Error Alert -->
      <div 
        v-if="errorMsg" 
        class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2.5"
      >
        <AlertCircleIcon class="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
        <div>
          <span class="font-bold">Gagal Masuk:</span> {{ errorMsg }}
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Alamat Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="nama@email.com" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Kata Sandi</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        <Button type="submit" variant="primary" block :loading="loading" class="py-3 font-bold rounded-xl">
          Masuk Sekarang
        </Button>
      </form>

      <!-- Bottom link -->
      <div class="mt-6 text-center text-sm text-slate-500">
        Belum memiliki akun? 
        <router-link to="/register" class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
          Daftar di sini
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/common/Button.vue'
import { AlertCircle as AlertCircleIcon } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const user = await authStore.signIn(email.value, password.value)
    if (user.role === 'admin') {
      router.push('/admin/overview')
    } else {
      router.push('/jamaah/portal')
    }
  } catch (err) {
    errorMsg.value = err.message || 'Kredensial tidak valid'
  } finally {
    loading.value = false
  }
}
</script>
