<template>
  <div class="space-y-6">
    <!-- Header Summary -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Daftar Audit Transaksi Zakat Fitrah</h2>
        <p class="text-xs text-slate-500 mt-1">Verifikasi pembayaran zakat fitrah jamaah</p>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <button 
          v-for="f in filters" 
          :key="f.value"
          @click="activeFilter = f.value"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeFilter === f.value ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Rice Price Config Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🌾</span>
        <div>
          <h4 class="font-bold text-slate-800 text-sm">Konfigurasi Harga Beras Fitrah</h4>
          <p class="text-xs text-slate-400 mt-0.5">Atur harga beras default per kg untuk kalkulator zakat fitrah jamaah</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold text-slate-500">Rp</span>
        <input 
          v-model.number="ricePriceInput" 
          type="number" 
          class="w-32 px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <Button variant="primary" size="sm" :loading="updatingConfig" @click="saveRicePrice" class="rounded-xl font-bold px-4">
          Simpan
        </Button>
      </div>
    </div>

    <!-- Table -->
    <Table :columns="columns" :items="filteredItems" :loading="zakatStore.loading">
      <!-- Custom Date -->
      <template #created_at="{ item }">
        <span class="font-medium text-slate-700">{{ formatDateTime(item.created_at) }}</span>
      </template>

      <!-- Custom Amount Column -->
      <template #amount="{ item }">
        <span class="font-bold text-slate-800">{{ formatRupiah(item.amount) }}</span>
      </template>

      <!-- Rice Weight Column -->
      <template #rice_weight_kg="{ item }">
        <span class="font-semibold text-slate-700">
          {{ item.rice_weight_kg ? `${item.rice_weight_kg} kg` : '-' }}
        </span>
      </template>

      <!-- Custom Method -->
      <template #payment_method="{ item }">
        <span class="font-semibold text-slate-600 uppercase text-xs">
          {{ item.payment_method === 'rice' ? 'Beras Fisik' : item.payment_method }}
        </span>
      </template>

      <!-- Custom Status -->
      <template #status="{ item }">
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
          :class="{
            'bg-yellow-50 text-yellow-700 border border-yellow-200': item.status === 'pending',
            'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'success',
            'bg-red-50 text-red-700 border border-red-200': item.status === 'failed'
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="{
            'bg-yellow-500': item.status === 'pending',
            'bg-emerald-500': item.status === 'success',
            'bg-red-500': item.status === 'failed'
          }"></span>
          {{ item.status === 'pending' ? 'Menunggu' : item.status === 'success' ? 'Sukses' : 'Gagal' }}
        </span>
      </template>

      <!-- Custom Action -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <!-- View Details -->
          <Button 
            variant="secondary" 
            size="sm"
            @click="openReceiptModal(item)"
          >
            Detail
          </Button>

          <!-- Audit Approve -->
          <Button 
            v-if="item.status === 'pending'"
            variant="primary" 
            size="sm"
            @click="handleAudit(item.id, 'success')"
          >
            Setuju
          </Button>

          <!-- Audit Reject -->
          <Button 
            v-if="item.status === 'pending'"
            variant="danger" 
            size="sm"
            @click="handleAudit(item.id, 'failed')"
          >
            Tolak
          </Button>
        </div>
      </template>
    </Table>

    <!-- Receipt Modal -->
    <Modal :show="showModal" title="Detail Transaksi Zakat" @close="showModal = false">
      <div v-if="selectedItem" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-slate-100">
          <div>
            <p class="text-xs text-slate-400 font-medium">Status Verifikasi</p>
            <p class="font-bold text-slate-700 mt-0.5 capitalize">{{ selectedItem.status }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Nominal Uang</p>
            <p class="font-extrabold text-emerald-700 mt-0.5">{{ formatRupiah(selectedItem.amount) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Beras (kg)</p>
            <p class="font-extrabold text-indigo-700 mt-0.5">{{ selectedItem.rice_weight_kg ? `${selectedItem.rice_weight_kg} kg` : '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Metode Pembayaran</p>
            <p class="font-semibold text-slate-600 mt-0.5 uppercase">
              {{ selectedItem.payment_method === 'rice' ? 'Beras Fisik' : selectedItem.payment_method }}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Tanggal</p>
            <p class="font-semibold text-slate-600 mt-0.5">{{ formatDateTime(selectedItem.created_at) }}</p>
          </div>
        </div>

        <!-- Family Members Details in Modal -->
        <div v-if="selectedItem.family_members && selectedItem.family_members.length" class="pt-2">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Daftar Anggota Keluarga ({{ selectedItem.family_members.length }} Jiwa):</p>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 max-h-48 overflow-y-auto space-y-3">
            <div v-for="(m, idx) in selectedItem.family_members" :key="idx" class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs py-1 border-b border-slate-200/40 last:border-0 gap-1">
              <span class="font-bold text-slate-700">{{ idx + 1 }}. {{ m.name }}</span>
              <span class="text-slate-400 font-medium sm:text-right">{{ m.address }}</span>
            </div>
          </div>
        </div>

        <!-- Receipt Image -->
        <div v-if="selectedItem.attachment_url" class="pt-2">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Lampiran Bukti Transaksi:</p>
          <div class="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 max-h-[300px] flex items-center justify-center">
            <img 
              :src="selectedItem.attachment_url" 
              alt="Receipt Attachment" 
              class="object-contain max-h-[300px] w-full"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button variant="white" size="sm" @click="showModal = false">
          Tutup
        </Button>
        <Button 
          v-if="selectedItem?.status === 'pending'"
          variant="danger" 
          size="sm" 
          @click="handleAudit(selectedItem.id, 'failed'); showModal = false"
        >
          Tolak Zakat
        </Button>
        <Button 
          v-if="selectedItem?.status === 'pending'"
          variant="primary" 
          size="sm" 
          @click="handleAudit(selectedItem.id, 'success'); showModal = false"
        >
          Konfirmasi Sukses
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useZakatStore } from '../../stores/zakat'
import Table from '../../components/common/Table.vue'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'

const zakatStore = useZakatStore()
const activeFilter = ref('all')
const showModal = ref(false)
const selectedItem = ref(null)

const ricePriceInput = ref(15000)
const updatingConfig = ref(false)

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Sukses', value: 'success' },
  { label: 'Gagal', value: 'failed' }
]

const columns = [
  { key: 'created_at', label: 'Tanggal Masuk' },
  { key: 'amount', label: 'Nominal Uang' },
  { key: 'rice_weight_kg', label: 'Beras (kg)' },
  { key: 'payment_method', label: 'Metode' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Verifikasi' }
]

onMounted(async () => {
  await Promise.all([
    zakatStore.fetchZakat(),
    zakatStore.fetchRicePrice()
  ])
  ricePriceInput.value = zakatStore.ricePrice
})

const saveRicePrice = async () => {
  if (ricePriceInput.value < 1000) {
    alert('Harga beras per kg harus minimal Rp 1.000')
    return
  }

  updatingConfig.value = true
  try {
    await zakatStore.updateRicePrice(ricePriceInput.value)
    alert('Harga beras default berhasil diperbarui!')
  } catch (err) {
    alert('Gagal menyimpan harga beras: ' + err.message)
  } finally {
    updatingConfig.value = false
  }
}

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return zakatStore.items
  return zakatStore.items.filter(item => item.status === activeFilter.value)
})

const handleAudit = async (id, status) => {
  if (confirm(`Apakah Anda yakin ingin memverifikasi transaksi zakat ini sebagai ${status === 'success' ? 'Sukses' : 'Gagal'}?`)) {
    try {
      await zakatStore.updateStatus(id, status)
    } catch (err) {
      alert('Gagal mengupdate status transaksi: ' + err.message)
    }
  }
}

const openReceiptModal = (item) => {
  selectedItem.value = item
  showModal.value = true
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}

const formatDateTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
