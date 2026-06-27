<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900">
    <div class="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
      <!-- Header -->
      <div class="text-center mb-8">
        <span class="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-2xl mb-3 text-3xl">🕌</span>
        <h2 class="text-2xl font-bold text-slate-800">Daftar Akun Baru</h2>
        <p class="text-slate-500 mt-1.5 text-sm">Buat akun untuk melakukan pencatatan</p>
      </div>

      <!-- Error Alert -->
      <div 
        v-if="errorMsg" 
        class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2.5"
      >
        <AlertCircleIcon class="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
        <div>
          <span class="font-bold">Gagal Daftar:</span> {{ errorMsg }}
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Nama Lengkap</label>
          <input 
            v-model="fullName" 
            type="text" 
            required 
            placeholder="Ahmad Abdullah" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Nomor Telepon / WhatsApp</label>
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="0812XXXXXXXX" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

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
            placeholder="Min. 6 karakter" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        <Button type="submit" variant="primary" block :loading="loading" class="py-3 font-bold rounded-xl mt-2">
          Daftar Akun
        </Button>
      </form>

      <!-- Bottom link -->
      <div class="mt-6 text-center text-sm text-slate-500">
        Sudah memiliki akun? 
        <router-link to="/login" class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
          Masuk di sini
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

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  if (password.value.length < 6) {
    errorMsg.value = 'Kata sandi minimal harus 6 karakter.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.signUp(email.value, password.value, fullName.value, phone.value)
    // Automatically redirect on successful sign up
    router.push('/jamaah/portal')
  } catch (err) {
    errorMsg.value = err.message || 'Registrasi gagal'
  } finally {
    loading.value = false
  }
}
</script>
