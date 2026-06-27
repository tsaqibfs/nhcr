<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-6xl w-full mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-slate-800">🕌 Portal Jamaah</span>
          <span 
            v-if="authStore.isMockMode"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
          >
            Demo
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-slate-700">{{ authStore.user?.full_name }}</p>
            <p class="text-xs text-slate-400 font-medium capitalize">{{ authStore.user?.phone || 'Tanpa No. Telp' }}</p>
          </div>
          <button 
            @click="handleLogout" 
            class="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
            title="Keluar dari portal"
          >
            <LogOutIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
      <!-- Greeting Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 sm:p-8 text-white shadow-lg">
        <div class="relative z-10 max-w-lg">
          <h2 class="text-xl sm:text-2xl font-extrabold">Assalamu'alaikum, {{ authStore.user?.full_name }}!</h2>
          <p class="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Selamat datang di Portal Jamaah SiMajid. Salurkan infaq, tunaikan kewajiban zakat, dan daftarkan booking kurban Anda secara terintegrasi dan aman.
          </p>
        </div>
        <!-- Abstract masjid elements in background using CSS shapes or emojis -->
        <span class="absolute right-6 bottom-[-10px] opacity-10 text-9xl pointer-events-none">🕌</span>
      </div>

      <!-- Interactive Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top Row Left: Infaq Income Interactive Metric Button -->
        <button 
          @click="openIncomeReportModal"
          class="text-left w-full bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Pendapatan Infaq Masjid</p>
              <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(globalIncome) }}</h3>
              <p class="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1 group-hover:underline">
                Lihat Laporan Transparansi Donasi &rarr;
              </p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <TrendingUpIcon class="w-6 h-6" />
            </div>
          </div>
        </button>

        <!-- Top Row Right: Infaq Expense Interactive Metric Button -->
        <button 
          @click="openExpenseReportModal"
          class="text-left w-full bg-white border border-slate-200 hover:border-rose-500 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Pengeluaran Infaq Masjid</p>
              <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(globalExpense) }}</h3>
              <p class="text-[10px] text-rose-600 font-semibold mt-2 flex items-center gap-1 group-hover:underline">
                Lihat Laporan Penyaluran Kas &rarr;
              </p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <TrendingDownIcon class="w-6 h-6" />
            </div>
          </div>
        </button>
      </div>

      <!-- Unified Action Portal Module -->
      <Card title="Layanan Portal Jamaah">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Sub-card 1: Bayar Infaq & Sedekah -->
          <div 
            @click="router.push('/jamaah/infaq')"
            class="flex flex-col justify-between p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
          >
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <InfaqIcon class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  Paling Populer
                </span>
              </div>
              <h4 class="font-extrabold text-slate-800 text-base mt-4 group-hover:text-emerald-700 transition-colors">
                Bayar Infaq & Sedekah
              </h4>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                Salurkan donasi terbaik Anda untuk pembangunan fasilitas, santunan anak yatim, kegiatan operasional, dan program sosial masjid lainnya.
              </p>
            </div>
            <div class="mt-6">
              <div class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center shadow-sm transition-colors flex items-center justify-center gap-1">
                Salurkan Infaq &rarr;
              </div>
            </div>
          </div>

          <!-- Sub-card 2: Bayar Zakat -->
          <div 
            @click="router.push('/jamaah/zakat')"
            class="flex flex-col justify-between p-6 rounded-2xl border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
          >
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ZakatIcon class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full">
                  Kewajiban
                </span>
              </div>
              <h4 class="font-extrabold text-slate-800 text-base mt-4 group-hover:text-indigo-700 transition-colors">
                Bayar Zakat
              </h4>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                Tunaikan kewajiban rukun Islam dengan Zakat Fitrah secara online. Tersedia opsi pembayaran berupa uang tunai maupun penyerahan beras.
              </p>
            </div>
            <div class="mt-6">
              <div class="w-full py-2.5 border border-indigo-200 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent rounded-xl text-xs font-bold text-center transition-all duration-300">
                Tunaikan Zakat
              </div>
            </div>
          </div>

          <!-- Sub-card 3: Daftar Kurban -->
          <div 
            @click="router.push('/jamaah/kurban')"
            class="flex flex-col justify-between p-6 rounded-2xl border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 hover:border-rose-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
          >
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-center w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <KurbanIcon class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full">
                  Idul Adha
                </span>
              </div>
              <h4 class="font-extrabold text-slate-800 text-base mt-4 group-hover:text-rose-700 transition-colors">
                Daftar Kurban
              </h4>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                Pilih dan pesan hewan kurban Anda secara online. Tersedia opsi patungan sapi (1 dari 7 slot) atau pemesanan kambing mandiri.
              </p>
            </div>
            <div class="mt-6">
              <div class="w-full py-2.5 border border-rose-200 text-rose-700 group-hover:bg-rose-600 group-hover:text-white group-hover:border-transparent rounded-xl text-xs font-bold text-center transition-all duration-300">
                Daftar Kurban
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Transaction History section -->
      <Card title="Riwayat Donasi & Transaksi Anda">
        <!-- Tabs -->
        <div class="flex border-b border-slate-100 mb-6">
          <button 
            v-for="t in tabs" 
            :key="t.value"
            @click="activeTab = t.value"
            class="px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all"
            :class="activeTab === t.value ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-700'"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Infaq Tab Content -->
        <div v-if="activeTab === 'infaq'" class="space-y-4">
          <Table :columns="infaqColumns" :items="infaqStore.items" :loading="infaqStore.loading">
            <template #created_at="{ item }">
              <span class="text-slate-600 text-xs sm:text-sm">{{ formatDate(item.created_at) }}</span>
            </template>
            <template #amount="{ item }">
              <span class="font-bold text-slate-800">{{ formatRupiah(item.amount) }}</span>
            </template>

            <template #status="{ item }">
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="{
                  'bg-yellow-50 text-yellow-700 border border-yellow-200': item.status === 'pending',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'success',
                  'bg-red-50 text-red-700 border border-red-200': item.status === 'failed'
                }"
              >
                {{ item.status === 'pending' ? 'Diproses' : item.status === 'success' ? 'Sukses' : 'Gagal' }}
              </span>
            </template>
          </Table>
        </div>

        <!-- Zakat Tab Content -->
        <div v-if="activeTab === 'zakat'" class="space-y-4">
          <Table :columns="zakatColumns" :items="zakatStore.items" :loading="zakatStore.loading">
            <template #created_at="{ item }">
              <span class="text-slate-600 text-xs sm:text-sm">{{ formatDate(item.created_at) }}</span>
            </template>
            <template #amount="{ item }">
              <span class="font-bold text-slate-800">{{ formatRupiah(item.amount) }}</span>
            </template>
            <template #rice_weight_kg="{ item }">
              <span class="text-slate-700 font-semibold">{{ item.rice_weight_kg ? `${item.rice_weight_kg} kg` : '-' }}</span>
            </template>
            <template #status="{ item }">
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="{
                  'bg-yellow-50 text-yellow-700 border border-yellow-200': item.status === 'pending',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'success',
                  'bg-red-50 text-red-700 border border-red-200': item.status === 'failed'
                }"
              >
                {{ item.status === 'pending' ? 'Diproses' : item.status === 'success' ? 'Sukses' : 'Gagal' }}
              </span>
            </template>
          </Table>
        </div>

        <!-- Kurban Tab Content -->
        <div v-if="activeTab === 'kurban'" class="space-y-4">
          <Table :columns="kurbanColumns" :items="kurbanStore.items" :loading="kurbanStore.loading">
            <template #created_at="{ item }">
              <span class="text-slate-600 text-xs sm:text-sm">{{ formatDate(item.created_at) }}</span>
            </template>
            <template #price="{ item }">
              <span class="font-bold text-slate-800">{{ formatRupiah(item.price) }}</span>
            </template>
            <template #animal_type="{ item }">
              <span class="capitalize text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-100">
                {{ item.animal_type }}
              </span>
            </template>
            <template #joint_slot="{ item }">
              <span class="text-xs font-medium text-slate-600">
                {{ item.animal_type === 'sapi' ? `Slot ${item.joint_slot || '-'}/7` : 'Kambing Mandiri' }}
              </span>
            </template>
            <template #status="{ item }">
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="{
                  'bg-yellow-50 text-yellow-700 border border-yellow-200': item.status === 'pending',
                  'bg-blue-50 text-blue-700 border border-blue-200': item.status === 'paid',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'distributed',
                  'bg-red-50 text-red-700 border border-red-200': item.status === 'cancelled'
                }"
              >
                {{ formatKurbanStatus(item.status) }}
              </span>
            </template>
          </Table>
        </div>
      </Card>
    </main>

    <!-- Modal Detail Pendapatan Infaq (Laporan Donasi Masuk) -->
    <Modal :show="showIncomeReportModal" title="Laporan Donasi Masuk (Infaq)" @close="showIncomeReportModal = false">
      <div class="space-y-4">
        <p class="text-xs text-slate-500">Berikut adalah rekap donasi masuk yang telah sukses diverifikasi oleh pengurus masjid.</p>
        <Table :columns="globalIncomeColumns" :items="incomeReportItems" :loading="loadingReports">
          <template #created_at="{ item }">
            <span class="text-slate-600 text-xs font-medium">{{ formatDate(item.created_at) }}</span>
          </template>
          <template #amount="{ item }">
            <span class="font-bold text-emerald-600">{{ formatRupiah(item.amount) }}</span>
          </template>
          <template #type="{ item }">
            <span class="text-xs font-semibold text-slate-600 capitalize bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {{ formatInfaqType(item.type) }}
            </span>
          </template>
          <template #donatur>
            <span class="font-bold text-slate-700 text-xs">Hamba Allah</span>
          </template>
        </Table>
      </div>
      <template #footer>
        <Button variant="white" size="sm" @click="showIncomeReportModal = false">Tutup</Button>
      </template>
    </Modal>

    <!-- Modal Detail Pengeluaran Infaq (Laporan Penyaluran Kas) -->
    <Modal :show="showExpenseReportModal" title="Laporan Penyaluran & Pengeluaran Kas" @close="showExpenseReportModal = false">
      <div class="space-y-4">
        <p class="text-xs text-slate-500">Berikut adalah detail pengeluaran kas infaq masjid untuk keperluan operasional dan kemaslahatan jamaah.</p>
        <Table :columns="globalExpenseColumns" :items="expenseReportItems" :loading="loadingReports">
          <template #created_at="{ item }">
            <span class="text-slate-600 text-xs font-medium">{{ formatDate(item.created_at) }}</span>
          </template>
          <template #amount="{ item }">
            <span class="font-bold text-rose-600">{{ formatRupiah(item.amount) }}</span>
          </template>
          <template #description="{ item }">
            <span class="font-semibold text-slate-700 text-xs sm:text-sm">{{ item.description }}</span>
          </template>
        </Table>
      </div>
      <template #footer>
        <Button variant="white" size="sm" @click="showExpenseReportModal = false">Tutup</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useInfaqStore } from '../../stores/infaq'
import { useZakatStore } from '../../stores/zakat'
import { useKurbanStore } from '../../stores/kurban'
import Card from '../../components/common/Card.vue'
import Table from '../../components/common/Table.vue'
import Modal from '../../components/common/Modal.vue'
import Button from '../../components/common/Button.vue'
import { 
  HeartHandshake as InfaqIcon, 
  Scale as ZakatIcon, 
  Gift as KurbanIcon,
  LogOut as LogOutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const infaqStore = useInfaqStore()
const zakatStore = useZakatStore()
const kurbanStore = useKurbanStore()
const router = useRouter()

const activeTab = ref('infaq')

const tabs = [
  { label: 'Riwayat Infaq', value: 'infaq' },
  { label: 'Riwayat Zakat', value: 'zakat' },
  { label: 'Riwayat Kurban', value: 'kurban' }
]

const infaqColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'amount', label: 'Nominal' },
  { key: 'payment_method', label: 'Metode' },
  { key: 'status', label: 'Status' }
]

const zakatColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'amount', label: 'Nominal Uang' },
  { key: 'rice_weight_kg', label: 'Beras (kg)' },
  { key: 'status', label: 'Status' }
]

const kurbanColumns = [
  { key: 'created_at', label: 'Tanggal Booking' },
  { key: 'animal_type', label: 'Hewan' },
  { key: 'joint_slot', label: 'Info Kelompok' },
  { key: 'price', label: 'Biaya' },
  { key: 'status', label: 'Status' }
]

const globalIncome = ref(0)
const globalExpense = ref(0)


// Modal reports
const showIncomeReportModal = ref(false)
const showExpenseReportModal = ref(false)
const loadingReports = ref(false)
const incomeReportItems = ref([])
const expenseReportItems = ref([])

const globalIncomeColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'donatur', label: 'Donatur' },
  { key: 'type', label: 'Kategori' },
  { key: 'amount', label: 'Jumlah' }
]

const globalExpenseColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'description', label: 'Keterangan' },
  { key: 'amount', label: 'Jumlah' }
]

const openIncomeReportModal = async () => {
  loadingReports.value = true
  showIncomeReportModal.value = true
  try {
    const globalInfaqs = await infaqStore.fetchGlobalInfaq()
    incomeReportItems.value = globalInfaqs
      .filter(item => item.status === 'success')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (err) {
    console.error('Failed to load income reports:', err)
  } finally {
    loadingReports.value = false
  }
}

const openExpenseReportModal = () => {
  loadingReports.value = true
  showExpenseReportModal.value = true
  try {
    const savedExpenses = localStorage.getItem('simajid_infaq_expenses')
    if (savedExpenses) {
      expenseReportItems.value = JSON.parse(savedExpenses).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else {
      expenseReportItems.value = []
    }
  } catch (err) {
    console.error('Failed to load expense reports:', err)
  } finally {
    loadingReports.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    infaqStore.fetchInfaq(),
    zakatStore.fetchZakat(),
    kurbanStore.fetchKurban()
  ])

  // Fetch global infaq for transparency stats
  const globalInfaqs = await infaqStore.fetchGlobalInfaq()
  globalIncome.value = globalInfaqs
    .filter(item => item.status === 'success')
    .reduce((acc, item) => acc + Number(item.amount), 0)

  // Fetch global expenses from local storage
  const savedExpenses = localStorage.getItem('simajid_infaq_expenses')
  if (savedExpenses) {
    const expensesList = JSON.parse(savedExpenses)
    globalExpense.value = expensesList.reduce((acc, item) => acc + Number(item.amount), 0)
  } else {
    // default expenses fallback sum
    globalExpense.value = 0
  }
})

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

// Formatters
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatInfaqType = (t) => {
  switch (t) {
    case 'jumat': return 'Jumat Berkah'
    case 'anak_yatim': return 'Anak Yatim'
    case 'operasional': return 'Operasional'
    case 'pembangunan': return 'Pembangunan'
    default: return 'Lainnya'
  }
}

const formatKurbanStatus = (s) => {
  switch (s) {
    case 'pending': return 'Diproses'
    case 'paid': return 'Lunas'
    case 'distributed': return 'Disalurkan'
    case 'cancelled': return 'Batal'
    default: return s
  }
}
</script>
