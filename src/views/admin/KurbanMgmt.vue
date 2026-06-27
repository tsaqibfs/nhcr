<template>
  <div class="space-y-6">
    <!-- Header Summary -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Daftar Audit Transaksi Kurban</h2>
        <p class="text-xs text-slate-500 mt-1">Verifikasi pembayaran kurban, patungan slot sapi, dan update distribusi daging</p>
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
    <Table :columns="columns" :items="filteredItems" :loading="kurbanStore.loading">
      <!-- Custom Date -->
      <template #created_at="{ item }">
        <span class="font-medium text-slate-700">{{ formatDateTime(item.created_at) }}</span>
      </template>

      <!-- Custom Animal Type -->
      <template #animal_type="{ item }">
        <span 
          class="px-2.5 py-1 text-xs rounded-lg font-bold capitalize"
          :class="item.animal_type === 'sapi' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'"
        >
          {{ item.animal_type }}
        </span>
      </template>

      <!-- Custom Slot Column -->
      <template #joint_slot="{ item }">
        <span class="text-xs font-semibold text-slate-600">
          {{ item.animal_type === 'sapi' ? `Slot ${item.joint_slot || '-'}/7` : 'Mandiri (Kambing)' }}
        </span>
      </template>

      <!-- Custom Price Column -->
      <template #price="{ item }">
        <span class="font-bold text-slate-800">{{ formatRupiah(item.price) }}</span>
      </template>

      <!-- Custom Method -->
      <template #payment_method="{ item }">
        <span class="font-semibold text-slate-600 uppercase text-xs">{{ item.payment_method }}</span>
      </template>

      <!-- Custom Status -->
      <template #status="{ item }">
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
          :class="{
            'bg-yellow-50 text-yellow-700 border border-yellow-200': item.status === 'pending',
            'bg-blue-50 text-blue-700 border border-blue-200': item.status === 'paid',
            'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'distributed',
            'bg-red-50 text-red-700 border border-red-200': item.status === 'cancelled'
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="{
            'bg-yellow-500': item.status === 'pending',
            'bg-blue-500': item.status === 'paid',
            'bg-emerald-500': item.status === 'distributed',
            'bg-red-500': item.status === 'cancelled'
          }"></span>
          {{ formatStatus(item.status) }}
        </span>
      </template>

      <!-- Custom Action -->
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

          <!-- Audit Mark Paid -->
          <Button 
            v-if="item.status === 'pending'"
            variant="primary" 
            size="sm"
            @click="handleAudit(item.id, 'paid')"
          >
            Konfirmasi Bayar
          </Button>

          <!-- Audit Mark Distributed -->
          <Button 
            v-if="item.status === 'paid'"
            variant="primary" 
            size="sm"
            @click="handleAudit(item.id, 'distributed')"
          >
            Daging Disalurkan
          </Button>

          <!-- Audit Cancel -->
          <Button 
            v-if="item.status === 'pending'"
            variant="danger" 
            size="sm"
            @click="handleAudit(item.id, 'cancelled')"
          >
            Batalkan
          </Button>
        </div>
      </template>
    </Table>

    <!-- Receipt Modal -->
    <Modal :show="showModal" title="Detail Bukti Booking Kurban" @close="showModal = false">
      <div v-if="selectedItem" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-slate-100">
          <div>
            <p class="text-xs text-slate-400 font-medium">Mudhohi (Pekurban)</p>
            <p class="font-bold text-slate-700 mt-0.5">{{ selectedItem.full_name }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Hewan Kurban</p>
            <p class="font-bold text-slate-700 mt-0.5 uppercase">{{ selectedItem.animal_type }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Nilai Patungan / Harga</p>
            <p class="font-extrabold text-emerald-700 mt-0.5">{{ formatRupiah(selectedItem.price) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Slot Patungan</p>
            <p class="font-bold text-slate-600 mt-0.5">
              {{ selectedItem.animal_type === 'sapi' ? `Slot ${selectedItem.joint_slot || '-'}/7` : 'Mandiri' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Metode Transfer</p>
            <p class="font-semibold text-slate-600 mt-0.5 uppercase">{{ selectedItem.payment_method }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Status Distribusi</p>
            <p class="font-semibold text-slate-600 mt-0.5 capitalize">{{ selectedItem.status }}</p>
          </div>
        </div>

        <div class="pt-2">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Lampiran Bukti Booking:</p>
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
          @click="handleAudit(selectedItem.id, 'cancelled'); showModal = false"
        >
          Batalkan Booking
        </Button>
        <Button 
          v-if="selectedItem?.status === 'pending'"
          variant="primary" 
          size="sm" 
          @click="handleAudit(selectedItem.id, 'paid'); showModal = false"
        >
          Konfirmasi Bayar
        </Button>
        <Button 
          v-if="selectedItem?.status === 'paid'"
          variant="primary" 
          size="sm" 
          @click="handleAudit(selectedItem.id, 'distributed'); showModal = false"
        >
          Daging Disalurkan
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKurbanStore } from '../../stores/kurban'
import Table from '../../components/common/Table.vue'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'

const kurbanStore = useKurbanStore()
const activeFilter = ref('all')
const showModal = ref(false)
const selectedItem = ref(null)

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Lunas', value: 'paid' },
  { label: 'Disalurkan', value: 'distributed' }
]

const columns = [
  { key: 'created_at', label: 'Tanggal Booking' },
  { key: 'full_name', label: 'Nama Pekurban' },
  { key: 'animal_type', label: 'Hewan' },
  { key: 'joint_slot', label: 'Kelompok Slot' },
  { key: 'price', label: 'Biaya' },
  { key: 'payment_method', label: 'Metode' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Audit / Eid Progress' }
]

onMounted(async () => {
  await kurbanStore.fetchKurban()
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return kurbanStore.items
  return kurbanStore.items.filter(item => item.status === activeFilter.value)
})

const handleAudit = async (id, status) => {
  let promptMsg = `Apakah Anda yakin ingin memverifikasi transaksi kurban ini?`
  if (status === 'paid') promptMsg = `Ubah status booking kurban menjadi: LUNAS?`
  if (status === 'distributed') promptMsg = `Update progress kurban: Daging hewan kurban sudah disembelih dan disalurkan?`
  if (status === 'cancelled') promptMsg = `Batalkan booking kurban ini?`

  if (confirm(promptMsg)) {
    try {
      await kurbanStore.updateStatus(id, status)
    } catch (err) {
      alert('Gagal mengupdate status kurban: ' + err.message)
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

const formatStatus = (s) => {
  switch (s) {
    case 'pending': return 'Menunggu'
    case 'paid': return 'Lunas'
    case 'distributed': return 'Disalurkan'
    case 'cancelled': return 'Batal'
    default: return s
  }
}
</script>
