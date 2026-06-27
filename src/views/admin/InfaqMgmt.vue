<template>
  <div class="space-y-6">
    <!-- Header Summary -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Daftar Audit Transaksi Infaq</h2>
        <p class="text-xs text-slate-500 mt-1">Verifikasi bukti transfer infaq dari jamaah dan donatur luar</p>
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

    <!-- Table -->
    <Table :columns="columns" :items="filteredItems" :loading="infaqStore.loading">
      <!-- Custom Date Column -->
      <template #created_at="{ item }">
        <span class="font-medium text-slate-700">{{ formatDateTime(item.created_at) }}</span>
      </template>

      <!-- Custom Amount Column -->
      <template #amount="{ item }">
        <span class="font-bold text-slate-800">{{ formatRupiah(item.amount) }}</span>
      </template>


      <!-- Custom Method Column -->
      <template #payment_method="{ item }">
        <span class="font-semibold text-slate-600 uppercase text-xs">{{ item.payment_method }}</span>
      </template>

      <!-- Custom Status Column -->
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

      <!-- Custom Action Column -->
      <template #actions="{ item }">
        <div class="flex items-center gap-2">
          <!-- View Proof -->
          <Button 
            v-if="item.attachment_url"
            variant="secondary" 
            size="sm"
            @click="openReceiptModal(item)"
          >
            Bukti
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

    <!-- Receipt Details Modal -->
    <Modal :show="showModal" title="Detail Bukti Pembayaran" @close="showModal = false">
      <div v-if="selectedItem" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-slate-100">
          <div>
            <p class="text-xs text-slate-400 font-medium">Donatur</p>
            <p class="font-bold text-slate-700 mt-0.5">Hamba Allah</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Nominal</p>
            <p class="font-extrabold text-emerald-700 mt-0.5">{{ formatRupiah(selectedItem.amount) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Metode</p>
            <p class="font-semibold text-slate-600 mt-0.5 uppercase">{{ selectedItem.payment_method }}</p>
          </div>
        </div>

        <div class="pt-2">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Lampiran Gambar:</p>
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
          Tolak Donasi
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
import { useInfaqStore } from '../../stores/infaq'
import Table from '../../components/common/Table.vue'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'

const infaqStore = useInfaqStore()
const activeFilter = ref('all')
const showModal = ref(false)
const selectedItem = ref(null)

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Sukses', value: 'success' },
  { label: 'Gagal', value: 'failed' }
]

const columns = [
  { key: 'created_at', label: 'Tanggal Masuk' },
  { key: 'amount', label: 'Nominal' },
  { key: 'payment_method', label: 'Metode' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Audit Verifikasi' }
]

onMounted(async () => {
  await infaqStore.fetchInfaq()
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return infaqStore.items
  return infaqStore.items.filter(item => item.status === activeFilter.value)
})

const handleAudit = async (id, status) => {
  if (confirm(`Apakah Anda yakin ingin memverifikasi transaksi ini sebagai ${status === 'success' ? 'Sukses' : 'Gagal'}?`)) {
    try {
      await infaqStore.updateStatus(id, status)
    } catch (err) {
      alert('Gagal mengupdate status transaksi: ' + err.message)
    }
  }
}

const openReceiptModal = (item) => {
  selectedItem.value = item
  showModal.value = true
}

// Formatters
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
