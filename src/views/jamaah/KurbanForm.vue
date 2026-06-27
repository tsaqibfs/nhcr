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
        <span class="text-base font-bold text-slate-800">Booking Hewan Kurban</span>
        <span class="w-8"></span>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-grow max-w-xl w-full mx-auto px-4 py-8">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <!-- Intro -->
        <div class="text-center pb-4 border-b border-slate-100">
          <span class="text-3xl">🐂</span>
          <h2 class="text-lg font-bold text-slate-800 mt-2">Pendaftaran Ibadah Kurban</h2>
          <p class="text-xs text-slate-400 mt-1">Sempurnakan ibadah kurban Anda bersama DKM Masjid Jami SiMajid</p>
        </div>

        <!-- Product Cards (Cow vs Goat) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Sapi -->
          <div 
            @click="selectAnimal('sapi')"
            class="p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
            :class="form.animal_type === 'sapi' ? 'border-emerald-600 bg-emerald-50/20 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-3xl">🐂</span>
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Patungan</span>
              </div>
              <h4 class="font-extrabold text-slate-800 text-base mt-4">Sapi (Patungan 1/7)</h4>
              <p class="text-xs text-slate-400 mt-1">Bobot: ± 280-320 kg<br>Tipe patungan berkelompok 7 orang.</p>
            </div>
            <p class="font-black text-emerald-700 text-lg mt-4">{{ formatRupiah(3500000) }}</p>
          </div>

          <!-- Kambing -->
          <div 
            @click="selectAnimal('kambing')"
            class="p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
            :class="form.animal_type === 'kambing' ? 'border-emerald-600 bg-emerald-50/20 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-3xl">🐐</span>
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Mandiri</span>
              </div>
              <h4 class="font-extrabold text-slate-800 text-base mt-4">Kambing (Mandiri)</h4>
              <p class="text-xs text-slate-400 mt-1">Bobot: ± 25-30 kg<br>Penyembelihan mandiri satu pekurban.</p>
            </div>
            <p class="font-black text-emerald-700 text-lg mt-4">{{ formatRupiah(2800000) }}</p>
          </div>
        </div>

        <!-- Slot dropdown for Cow -->
        <div v-if="form.animal_type === 'sapi'" class="space-y-2">
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider">
            Pilih Slot Kelompok (Kelompok Sapi #{{ kurbanStore.activeCow?.number || 1 }})
          </label>
          <select 
            v-model.number="form.joint_slot"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-700"
          >
            <option 
              v-for="slot in 7" 
              :key="slot" 
              :value="slot"
              :disabled="isSlotBooked(slot)"
            >
              Slot #{{ slot }} {{ getSlotStatusText(slot) }}
            </option>
          </select>
          <p class="text-[10px] text-slate-400 italic">
            * Anda dapat memilih slot patungan yang disukai, DKM akan menggabungkan Anda dengan jamaah lain.
          </p>
        </div>

        <!-- Payment and proof upload form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 pt-4 border-t border-slate-100">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Metode Pembayaran</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="m in methods"
                :key="m.value"
                type="button"
                @click="form.payment_method = m.value"
                class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5"
                :class="form.payment_method === m.value ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-550'"
              >
                <span class="text-base">{{ m.emoji }}</span>
                <span class="font-bold text-xs uppercase">{{ m.value }}</span>
              </button>
            </div>
          </div>

          <!-- Instructions -->
          <div class="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs space-y-3">
            <!-- QRIS -->
            <div v-if="form.payment_method === 'qris'" class="flex flex-col items-center gap-3">
              <p class="font-bold text-slate-700 text-center">Scan QRIS Kurban DKM:</p>
              <div class="p-2 bg-white rounded-xl border border-slate-200 shadow-sm w-auto h-auto flex items-center justify-center">
                <div class="flex flex-col items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 font-bold">
                  <img src="../../assets/image.png" alt="QRIS SIMAJID" class="h-1280 w-908">
                </div>
              </div>
            </div>

            <!-- Bank transfer -->
            <div v-else-if="form.payment_method === 'transfer'" class="space-y-2">
              <p class="font-bold text-slate-700">Kirim transfer ke Rekening Kurban DKM:</p>
              <div class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <p class="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Bank Syariah Indonesia (BSI)</p>
                  <p class="font-mono font-bold text-slate-700 text-sm mt-0.5">755 8888 999</p>
                  <p class="text-slate-500 text-[10px]">a.n. KURBAN DKM Masjid Jami SiMajid</p>
                </div>
                <button 
                  type="button" 
                  @click="copyToClipboard('7558888999')"
                  class="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>

          <!-- Attachment proof -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Unggah Bukti Pembayaran Kurban</label>
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
                <p class="text-xs font-bold">Pilih File Slip</p>
                <p class="text-[10px] text-slate-400">PNG, JPG, JPEG</p>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" block :loading="loading" class="py-3.5 font-bold rounded-xl text-sm">
            Kirim Booking Kurban
          </Button>
        </form>
      </div>
    </main>

    <!-- Success Modal -->
    <Modal :show="showSuccessModal" title="Barakallahu Fiik!" @close="handleSuccessClose">
      <div class="text-center space-y-4">
        <span class="text-5xl">🐂</span>
        <h4 class="text-lg font-bold text-slate-800">Pendaftaran Kurban Diterima</h4>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Pendaftaran ibadah kurban untuk hewan <span class="font-extrabold text-emerald-600 uppercase">{{ form.animal_type }}</span> senilai <span class="font-extrabold text-emerald-600">{{ formatRupiah(form.price) }}</span> telah berhasil disimpan. Status pemesanan Anda dalam antrean verifikasi lunas.
        </p>
      </div>
      <template #footer>
        <Button variant="primary" block size="md" @click="handleSuccessClose" class="rounded-xl font-bold">
          Kembali ke Dashboard
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useKurbanStore } from '../../stores/kurban'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'
import { ChevronLeft as ChevronLeftIcon, Upload as UploadIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const kurbanStore = useKurbanStore()
const router = useRouter()

const loading = ref(false)
const showSuccessModal = ref(false)

const methods = [
  { value: 'qris', emoji: '📱' },
  { value: 'transfer', emoji: '💳' }
]

const form = reactive({
  animal_type: 'sapi',
  joint_slot: 1,
  price: 3500000,
  payment_method: 'qris'
})

const isSlotBooked = (slot) => {
  if (!kurbanStore.activeCow || !kurbanStore.activeCow.bookedSlots) return false
  return kurbanStore.activeCow.bookedSlots.some(s => s?.slot === slot)
}

const getSlotStatusText = (slot) => {
  if (!kurbanStore.activeCow || !kurbanStore.activeCow.bookedSlots) return '(Tersedia)'
  const booking = kurbanStore.activeCow.bookedSlots.find(s => s?.slot === slot)
  return booking ? `(Terisi - ${booking.full_name || 'Hamba Allah'})` : '(Tersedia)'
}

const selectFirstAvailableSlot = () => {
  for (let slot = 1; slot <= 7; slot++) {
    if (!isSlotBooked(slot)) {
      form.joint_slot = slot
      break
    }
  }
}

const selectAnimal = (type) => {
  form.animal_type = type
  if (type === 'sapi') {
    form.price = 3500000
    selectFirstAvailableSlot()
  } else {
    form.price = 2800000
    form.joint_slot = null
  }
}

// File uploads
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
  if (!selectedFile.value) {
    alert('Mohon unggah bukti pembayaran kurban.')
    return
  }

  loading.value = true
  try {
    await kurbanStore.submitKurban(form, selectedFile.value)
    showSuccessModal.value = true
  } catch (err) {
    alert('Gagal memboking kurban: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleSuccessClose = async () => {
  showSuccessModal.value = false
  router.push('/jamaah/portal')
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Nomor rekening kurban disalin!')
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}

onMounted(async () => {
  await kurbanStore.fetchActiveCowSlots()
  selectFirstAvailableSlot()
})
</script>
