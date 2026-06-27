<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-xl w-full mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          @click="router.push('/jamaah/portal')" 
          class="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-bold transition-all text-sm"
        >
          <ChevronLeftIcon class="w-5 h-5" />
          Kembali
        </button>
        <span class="text-base font-bold text-slate-800">Bayar Zakat Fitrah</span>
        <span class="w-8"></span>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-grow max-w-xl w-full mx-auto px-4 py-8">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <!-- Info Card -->
        <div class="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl text-xs text-emerald-800 space-y-1">
          <p class="font-bold">Info Zakat Fitrah:</p>
          <p class="leading-relaxed">Zakat fitrah wajib ditunaikan setiap jiwa sebesar 2.5 kg beras, atau diganti dengan uang tunai senilai harga beras yang dikonsumsi harian.</p>
        </div>

        <!-- Calculations -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Jumlah Jiwa (Anggota)</label>
              <input 
                v-model.number="fitrah.souls"
                type="number" 
                min="1"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Harga Beras (Rp/kg)</label>
            <input 
              v-model.number="fitrah.ricePrice"
              type="number" 
              min="1000"
              required
              disabled
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed font-bold text-slate-500 text-sm focus:outline-none"
            />
            </div>
          </div>

          <!-- Dynamic Family Members Input fields -->
          <div v-if="fitrah.souls > 0" class="space-y-4 pt-2 border-t border-slate-100">
            <p class="text-xs font-bold uppercase text-slate-500 tracking-wider">Detail Anggota Keluarga (Muzakki)</p>
            <div v-for="(member, idx) in fitrah.members" :key="idx" class="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
              <p class="text-xs font-bold text-emerald-800">Jiwa #{{ idx + 1 }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nama Lengkap</label>
                  <input 
                    v-model="member.name" 
                    type="text" 
                    required 
                    placeholder="Nama Anggota Keluarga"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Alamat Tinggal</label>
                  <input 
                    v-model="member.address" 
                    type="text" 
                    required 
                    placeholder="Contoh: Blok A-02"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Calculation Result Summary -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex flex-col gap-2">
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Hasil Perhitungan:</p>
            <div class="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p class="text-[10px] text-slate-400">Total Berat Beras</p>
                <p class="text-lg font-extrabold text-slate-700">{{ fitrahBeras }} kg</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400">Konversi Uang Tunai</p>
                <p class="text-lg font-extrabold text-emerald-700">{{ formatRupiah(fitrahUang) }}</p>
              </div>
            </div>
          </div>

          <!-- Forms Payment options -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Bentuk Bayar Fitrah</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                @click="fitrah.payWith = 'money'"
                class="py-3 rounded-xl font-bold text-xs border text-center transition-all"
                :class="fitrah.payWith === 'money' ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
              >
                💵 Uang Tunai
              </button>
              <button 
                type="button" 
                @click="fitrah.payWith = 'rice'"
                class="py-3 rounded-xl font-bold text-xs border text-center transition-all"
                :class="fitrah.payWith === 'rice' ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
              >
                🌾 Beras Fisik
              </button>
            </div>
          </div>
        </div>

        <!-- Submit form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 pt-4 border-t border-slate-100">
          <div v-if="fitrah.payWith === 'rice'" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <p class="font-bold flex items-center gap-1">
              <span class="text-sm">⚠️</span> Penyaluran Zakat Beras Fisik
            </p>
            <p class="mt-1 leading-relaxed">
              Silakan bawa beras zakat Anda sebesar <span class="font-bold">{{ fitrahBeras }} kg</span> langsung ke sekretariat DKM Masjid Jami SiMajid untuk diverifikasi secara manual oleh panitia.
            </p>
          </div>

          <div v-else class="space-y-6">
            <!-- Payment Method options -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Metode Transfer Uang</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  v-for="m in methods"
                  :key="m.value"
                  type="button"
                  @click="paymentMethod = m.value"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5"
                  :class="paymentMethod === m.value ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-550'"
                >
                  <span class="text-base">{{ m.emoji }}</span>
                  <span class="font-bold text-xs uppercase">{{ m.value }}</span>
                </button>
              </div>
            </div>

            <!-- Transfer details -->
            <div class="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs space-y-3">
              <!-- QRIS -->
              <div v-if="paymentMethod === 'qris'" class="flex flex-col items-center gap-3">
                <p class="font-bold text-slate-700 text-center">Scan QRIS Zakat SiMajid:</p>
                <div class="p-2 bg-white rounded-xl border border-slate-200 shadow-sm w-auto h-auto flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 font-bold">
                    <img src="../../assets/image.png" alt="QRIS Zakat SiMajid" class="w-full h-full" />
                  </div>
                </div>
              </div>

              <!-- Transfer -->
              <div v-else-if="paymentMethod === 'transfer'" class="space-y-2">
                <p class="font-bold text-slate-700">Kirim transfer ke Rekening Zakat DKM:</p>
                <div class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <p class="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Bank Syariah Indonesia (BSI)</p>
                    <p class="font-mono font-bold text-slate-700 text-sm mt-0.5">733 4444 888</p>
                    <p class="text-slate-500 text-[10px]">a.n. ZAKAT DKM Masjid Jami SiMajid</p>
                  </div>
                  <button 
                    type="button" 
                    @click="copyToClipboard('7334444888')"
                    class="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                  >
                    Salin
                  </button>
                </div>
              </div>
            </div>

            <!-- Receipt attachment -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Unggah Bukti Transfer Zakat</label>
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

                <div v-else class="flex flex-col items-center gap-1 text-slate-500">
                  <UploadIcon class="w-8 h-8 text-slate-400 mb-1" />
                  <p class="text-xs font-bold">Pilih Bukti Slip</p>
                  <p class="text-[10px] text-slate-400">PNG, JPG, JPEG</p>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" block :loading="loading" class="py-3.5 font-bold rounded-xl text-sm">
            {{ fitrah.payWith === 'rice' ? 'Daftar Zakat Beras' : 'Bayar Zakat Sekarang' }}
          </Button>
        </form>
      </div>
    </main>

    <!-- Success Modal -->
    <Modal :show="showSuccessModal" title="Alhamdulillah!" @close="handleSuccessClose">
      <div class="text-center space-y-4">
        <span class="text-5xl">🌾</span>
        <h4 class="text-lg font-bold text-slate-800">Transaksi Zakat Tercatat</h4>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Zakat Fitrah Anda telah dicatat di antrean audit. 
          <span v-if="fitrah.payWith === 'rice'">
            Silakan antarkan beras fisik sejumlah <span class="font-bold text-emerald-600">{{ fitrahBeras }} kg</span> ke sekretariat masjid.
          </span>
          <span v-else>
            Nominal transfer sebesar <span class="font-bold text-emerald-600">{{ formatRupiah(submitAmount) }}</span> akan segera divalidasi oleh panitia zakat.
          </span>
        </p>
      </div>
      <template #footer>
        <Button variant="primary" block size="md" @click="handleSuccessClose" class="rounded-xl font-bold">
          Ke Dashboard
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useZakatStore } from '../../stores/zakat'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'
import { ChevronLeft as ChevronLeftIcon, Upload as UploadIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const zakatStore = useZakatStore()
const router = useRouter()

const loading = ref(false)
const showSuccessModal = ref(false)

const paymentMethod = ref('qris')
const methods = [
  { value: 'qris', emoji: '📱' },
  { value: 'transfer', emoji: '💳' }
]

// Fitrah calculations and members array
const fitrah = reactive({
  souls: 1,
  ricePrice: 15000, // loaded dynamically from DB
  payWith: 'money', // money, rice
  members: [{ name: '', address: '' }]
})

// Dynamically generate family members input fields when souls changes
watch(() => fitrah.souls, (newVal) => {
  const currentLength = fitrah.members.length
  const targetLength = Math.max(1, newVal || 1)
  if (targetLength > currentLength) {
    for (let i = currentLength; i < targetLength; i++) {
      fitrah.members.push({ name: '', address: '' })
    }
  } else if (targetLength < currentLength) {
    fitrah.members.splice(targetLength)
  }
}, { immediate: true })

onMounted(async () => {
  await zakatStore.fetchRicePrice()
  fitrah.ricePrice = zakatStore.ricePrice || 15000
})

const fitrahBeras = computed(() => fitrah.souls * 2.5)
const fitrahUang = computed(() => fitrahBeras.value * fitrah.ricePrice)

// File handlers
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

const submitAmount = computed(() => {
  return fitrah.payWith === 'rice' ? 0 : fitrahUang.value
})

const handleSubmit = async () => {
  const isRicePay = fitrah.payWith === 'rice'
  const payAmt = submitAmount.value

  if (!isRicePay && payAmt <= 0) {
    alert('Nominal zakat tidak valid.')
    return
  }

  // Validate family members details
  for (let i = 0; i < fitrah.members.length; i++) {
    if (!fitrah.members[i].name || !fitrah.members[i].address) {
      alert(`Mohon lengkapi nama dan alamat untuk anggota keluarga jiwa #${i + 1}.`)
      return
    }
  }

  // Validate that receipt file is uploaded for money payments
  if (!isRicePay && !selectedFile.value) {
    alert('Mohon unggah bukti pembayaran transfer uang zakat.')
    return
  }

  loading.value = true
  try {
    const payload = {
      zakat_type: 'fitrah',
      amount: payAmt,
      rice_weight_kg: isRicePay ? fitrahBeras.value : null,
      payment_method: isRicePay ? 'rice' : paymentMethod.value,
      family_members: fitrah.members
    }
    
    await zakatStore.submitZakat(payload, isRicePay ? null : selectedFile.value)
    showSuccessModal.value = true
  } catch (err) {
    alert('Gagal membayar zakat: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleSuccessClose = () => {
  showSuccessModal.value = false
  router.push('/jamaah/portal')
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Nomor rekening zakat disalin!')
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}
</script>
