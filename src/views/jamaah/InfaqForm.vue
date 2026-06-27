<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-xl w-full mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          @click="goBack" 
          class="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-bold transition-all text-sm"
        >
          <ChevronLeftIcon class="w-5 h-5" />
          {{ authStore.isAuthenticated ? 'Kembali' : 'Login' }}
        </button>
        <span class="text-base font-bold text-slate-800">Form Sedekah Infaq</span>
        <span class="w-8"></span> <!-- spacer -->
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-grow max-w-xl w-full mx-auto px-4 py-8">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <!-- Intro Message -->
        <div class="text-center pb-4 border-b border-slate-100">
          <span class="text-3xl">💝</span>
          <h2 class="text-lg font-bold text-slate-800 mt-2">Salurkan Infaq Terbaik Anda</h2>
          <p class="text-xs text-slate-400 mt-1">Infaq Anda akan disalurkan secara amanah untuk kemaslahatan umat</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Nominal -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Nominal Infaq (Rp)</label>
            <div class="relative">
              <span class="absolute left-4 top-4 text-slate-400 font-bold text-sm">Rp</span>
              <input 
                v-model.number="form.amount"
                type="number" 
                required 
                min="1000"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 text-lg transition-all"
              />
            </div>
            <!-- Quick preset amounts -->
            <div class="grid grid-cols-4 gap-2 mt-3">
              <button 
                v-for="amt in presets" 
                :key="amt"
                type="button"
                @click="form.amount = amt"
                class="py-2 text-[10px] sm:text-xs font-bold rounded-lg border transition-all text-center"
                :class="form.amount === amt ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-600/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
              >
                {{ formatPreset(amt) }}
              </button>
            </div>
          </div>

          <!-- Metode Pembayaran -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Metode Pembayaran</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="m in methods"
                :key="m.value"
                type="button"
                @click="form.payment_method = m.value"
                class="flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center gap-1.5"
                :class="form.payment_method === m.value ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
              >
                <span class="text-base">{{ m.emoji }}</span>
                <span class="font-bold text-xs uppercase">{{ m.value }}</span>
              </button>
            </div>
          </div>

          <!-- Instructions dynamic box -->
          <div class="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs space-y-3">
            <!-- QRIS Instruction -->
            <div v-if="form.payment_method === 'qris'" class="flex flex-col items-center gap-3">
              <p class="font-bold text-slate-700 text-center">Scan QRIS SiMajid di bawah ini:</p>
              <div class="p-2 bg-white rounded-xl border border-slate-200 shadow-sm w-auto h-auto flex items-center justify-center">
                <!-- QR Placeholder inside standard layout -->
                <div class="flex flex-col items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 font-bold">
                  <img src="../../assets/image.png" alt="QRIS SIMAJID" class="h-1280 w-908">
                </div>
              </div>
            </div>

            <!-- Transfer Instruction -->
            <div v-else-if="form.payment_method === 'transfer'" class="space-y-2">
              <p class="font-bold text-slate-700">Kirim transfer ke Rekening DKM:</p>
              <div class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <p class="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Bank Syariah Indonesia (BSI)</p>
                  <p class="font-mono font-bold text-slate-700 text-sm mt-0.5">713 6972 396</p>
                  <p class="text-slate-500 text-[10px]">a.n. MASJID NURUL HUDA CITRA R</p>
                </div>
                <button 
                  type="button" 
                  @click="copyToClipboard('7136972396')"
                  class="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                >
                  Salin
                </button>
              </div>
            </div>

            <p class="text-[10px] text-slate-400 text-center leading-relaxed">
              Silakan kirim nominal persis ke rekening/QRIS di atas, lalu lampirkan gambar bukti transfer Anda pada kolom di bawah.
            </p>
          </div>

          <!-- Attachment Proof -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Unggah Bukti Transfer</label>
            <div 
              class="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center relative min-h-[120px]"
              @click="$refs.fileInput.click()"
            >
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />

              <!-- Preview -->
              <div v-if="previewUrl" class="w-full flex flex-col items-center gap-2">
                <img :src="previewUrl" class="object-cover h-20 rounded-lg border border-slate-200" />
                <span class="text-xs font-bold text-slate-500 truncate max-w-[200px]">{{ fileName }}</span>
                <button 
                  type="button" 
                  @click.stop="clearFile" 
                  class="text-xs font-semibold text-red-600 hover:text-red-700 mt-1"
                >
                  Hapus File
                </button>
              </div>

              <!-- Empty state upload -->
              <div v-else class="flex flex-col items-center gap-1 text-slate-500">
                <UploadIcon class="w-8 h-8 text-slate-400 mb-1" />
                <p class="text-xs font-bold">Pilih Gambar Bukti Bayar</p>
                <p class="text-[10px] text-slate-400">PNG, JPG, JPEG (Maks. 5MB)</p>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" block :loading="loading" class="py-3.5 font-bold rounded-xl text-sm">
            Kirim Donasi Infaq
          </Button>
        </form>
      </div>
    </main>

    <!-- Success Modal -->
    <Modal :show="showSuccessModal" title="Terima Kasih!" @close="handleSuccessClose">
      <div class="text-center space-y-4">
        <span class="text-5xl">🎉</span>
        <h4 class="text-lg font-bold text-slate-800">Infaq Berhasil Dikirim</h4>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Alhamdulillah, donasi infaq Anda sebesar <span class="font-extrabold text-emerald-600">{{ formatRupiah(form.amount) }}</span> telah masuk ke sistem antrean verifikasi masjid. Semoga menjadi amal jariyah yang berlipat ganda. Aamiin.
        </p>
      </div>
      <template #footer>
        <Button variant="primary" block size="md" @click="handleSuccessClose" class="rounded-xl font-bold">
          Selesai
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useInfaqStore } from '../../stores/infaq'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'
import { ChevronLeft as ChevronLeftIcon, Upload as UploadIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const infaqStore = useInfaqStore()
const router = useRouter()

const loading = ref(false)
const showSuccessModal = ref(false)

const presets = [5000, 10000, 20000, 50000]
const methods = [
  { value: 'qris', emoji: '📱' },
  { value: 'transfer', emoji: '💳' }
]

const form = reactive({
  amount: 10000,
  payment_method: 'qris'
})

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const fileName = ref('')

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    fileName.value = file.name
    previewUrl.value = URL.createObjectURL(file)
  }
}

const clearFile = () => {
  selectedFile.value = null
  fileName.value = ''
  previewUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = async () => {
  if (form.amount < 1000) {
    alert('Infaq minimal adalah Rp 1.000')
    return
  }

  if (!selectedFile.value) {
    alert('Mohon unggah bukti pembayaran infaq.')
    return
  }

  loading.value = true
  try {
    await infaqStore.submitInfaq(form, selectedFile.value)
    showSuccessModal.value = true
  } catch (err) {
    alert('Gagal mengirim infaq: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleSuccessClose = () => {
  showSuccessModal.value = false
  if (authStore.isAuthenticated) {
    router.push('/jamaah/portal')
  } else {
    router.push('/login')
  }
}

const goBack = () => {
  if (authStore.isAuthenticated) {
    router.push('/jamaah/portal')
  } else {
    router.push('/login')
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Nomor rekening disalin!')
}

const formatPreset = (val) => {
  if (val >= 1000000) return (val / 1000000) + ' Juta'
  if (val >= 1000) return (val / 1000) + ' Ribu'
  return val
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}
</script>
