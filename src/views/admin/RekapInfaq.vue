<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Rekap Infaq Masjid</h2>
        <p class="text-xs text-slate-500 mt-1">Laporan transparan penerimaan donasi dan pengeluaran operasional masjid</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="primary" size="md" class="font-bold flex items-center gap-1.5 rounded-xl" @click="openIncomeModal">
          <PlusIcon class="w-4 h-4" />
          Catat Pemasukan
        </Button>
        <Button variant="danger" size="md" class="font-bold flex items-center gap-1.5 rounded-xl" @click="openExpenseModal">
          <PlusIcon class="w-4 h-4" />
          Catat Pengeluaran
        </Button>
      </div>
    </div>

    <!-- Stat Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Income Card -->
      <Card class="relative overflow-hidden group border-l-4 border-l-emerald-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Pendapatan Infaq</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(totalIncome) }}</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <TrendingUpIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Dari {{ successInfaqCount }} transaksi berhasil
        </div>
      </Card>

      <!-- Expense Card -->
      <Card class="relative overflow-hidden group border-l-4 border-l-rose-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Pengeluaran Infaq</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(totalExpense) }}</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
            <TrendingDownIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Operasional & kemaslahatan masjid
        </div>
      </Card>

      <!-- Balance Card -->
      <Card class="relative overflow-hidden group border-l-4 border-l-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Saldo Kas Infaq</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(balance) }}</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <WalletIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Sisa dana siap disalurkan
        </div>
      </Card>
    </div>

    <!-- Double Tables Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Income Table (Log Pendapatan) -->
      <Card title="Log Pendapatan (Donasi Masuk)">
        <div class="space-y-4">
          <Table :columns="incomeColumns" :items="successInfaq" :loading="infaqStore.loading">
            <template #created_at="{ item }">
              <span class="text-slate-600 text-xs sm:text-sm font-medium">{{ formatDate(item.created_at) }}</span>
            </template>
            <template #amount="{ item }">
              <span class="font-bold text-emerald-600">{{ formatRupiah(item.amount) }}</span>
            </template>
            <template #donatur>
              <span class="font-semibold text-slate-700">Hamba Allah</span>
            </template>
          </Table>
        </div>
      </Card>

      <!-- Expense Table (Log Pengeluaran) -->
      <Card title="Log Pengeluaran (Dana Keluar)">
        <div class="space-y-4">
          <Table :columns="expenseColumns" :items="expenses" :loading="false">
            <template #created_at="{ item }">
              <span class="text-slate-600 text-xs sm:text-sm font-medium">{{ formatDate(item.created_at) }}</span>
            </template>
            <template #amount="{ item }">
              <span class="font-bold text-rose-600">{{ formatRupiah(item.amount) }}</span>
            </template>
            <template #description="{ item }">
              <span class="font-semibold text-slate-700 text-xs sm:text-sm">{{ item.description }}</span>
            </template>
            <template #actions="{ item }">
              <button 
                class="p-1 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                @click="deleteExpense(item.id)"
                title="Hapus Pengeluaran"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </template>
          </Table>
        </div>
      </Card>
    </div>

    <!-- Log Expense Modal -->
    <Modal :show="showModal" title="Catat Pengeluaran Baru" @close="showModal = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Deskripsi Pengeluaran</label>
          <input 
            v-model="form.description" 
            type="text" 
            required 
            placeholder="Contoh: Pembelian Karpet Masjid Baru"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Nominal Pengeluaran (Rp)</label>
          <input 
            v-model.number="form.amount" 
            type="number" 
            required 
            min="1000" 
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Tanggal Pengeluaran</label>
          <input 
            v-model="form.created_at" 
            type="date" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="white" size="sm" @click="showModal = false">Batal</Button>
          <Button type="submit" variant="primary" size="sm">Simpan Pengeluaran</Button>
        </div>
      </form>
    </Modal>

    <!-- Log Income Modal -->
    <Modal :show="showIncomeModal" title="Catat Pemasukan Baru" @close="showIncomeModal = false">
      <form @submit.prevent="handleIncomeSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Kategori Infaq</label>
          <select 
            v-model="incomeForm.type" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm bg-white"
          >
            <option value="jumat">Jumat Berkah</option>
            <option value="anak_yatim">Anak Yatim</option>
            <option value="operasional">Operasional</option>
            <option value="pembangunan">Pembangunan</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Nominal Pemasukan (Rp)</label>
          <input 
            v-model.number="incomeForm.amount" 
            type="number" 
            required 
            min="1000" 
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Metode Pembayaran</label>
          <select 
            v-model="incomeForm.payment_method" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm bg-white"
          >
            <option value="cash">Tunai / Cash</option>
            <option value="transfer">Transfer Bank</option>
            <option value="qris">QRIS</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Tanggal Pemasukan</label>
          <input 
            v-model="incomeForm.created_at" 
            type="date" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="white" size="sm" @click="showIncomeModal = false">Batal</Button>
          <Button type="submit" variant="primary" size="sm" :loading="submittingIncome">Simpan Pemasukan</Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useInfaqStore } from '../../stores/infaq'
import Card from '../../components/common/Card.vue'
import Table from '../../components/common/Table.vue'
import Button from '../../components/common/Button.vue'
import Modal from '../../components/common/Modal.vue'
import { 
  Plus as PlusIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Wallet as WalletIcon,
  Trash2 as TrashIcon
} from 'lucide-vue-next'

const infaqStore = useInfaqStore()
const showModal = ref(false)
const expenses = ref([])

const form = reactive({
  description: '',
  amount: 0,
  created_at: new Date().toISOString().split('T')[0]
})

const showIncomeModal = ref(false)
const submittingIncome = ref(false)
const incomeForm = reactive({
  type: 'jumat',
  amount: 0,
  payment_method: 'cash',
  created_at: new Date().toISOString().split('T')[0]
})

const incomeColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'donatur', label: 'Penerima' },
  { key: 'amount', label: 'Jumlah' }
]

const expenseColumns = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'description', label: 'Keterangan' },
  { key: 'amount', label: 'Jumlah' },
  { key: 'actions', label: 'Aksi' }
]

const defaultExpenses = [
  {
    id: 'exp-1',
    description: 'Santunan Anak Yatim Bulanan',
    amount: 2500000,
    created_at: '2026-06-24T15:30:00Z'
  },
  {
    id: 'exp-2',
    description: 'Biaya Kebersihan & Listrik Masjid',
    amount: 1200000,
    created_at: '2026-06-20T11:00:00Z'
  },
  {
    id: 'exp-3',
    description: 'Pembelian Kipas Angin Dinding',
    amount: 750000,
    created_at: '2026-06-15T09:00:00Z'
  }
]

onMounted(async () => {
  await infaqStore.fetchInfaq()
  loadExpenses()
})

const loadExpenses = () => {
  const saved = localStorage.getItem('simajid_infaq_expenses')
  if (saved) {
    expenses.value = JSON.parse(saved).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else {
    expenses.value = [...defaultExpenses]
    saveExpenses()
  }
}

const saveExpenses = () => {
  localStorage.setItem('simajid_infaq_expenses', JSON.stringify(expenses.value))
}

const openExpenseModal = () => {
  form.description = ''
  form.amount = 0
  form.created_at = new Date().toISOString().split('T')[0]
  showModal.value = true
}

const openIncomeModal = () => {
  incomeForm.type = 'jumat'
  incomeForm.amount = 0
  incomeForm.payment_method = 'cash'
  incomeForm.created_at = new Date().toISOString().split('T')[0]
  showIncomeModal.value = true
}

const handleIncomeSubmit = async () => {
  if (incomeForm.amount < 1000) {
    alert('Nominal minimal adalah Rp 1.000')
    return
  }

  submittingIncome.value = true
  try {
    await infaqStore.submitInfaq({
      user_id: null,
      amount: incomeForm.amount,
      type: incomeForm.type,
      payment_method: incomeForm.payment_method,
      status: 'success',
      created_at: incomeForm.created_at
    })
    showIncomeModal.value = false
    alert('Pemasukan infaq offline berhasil dicatat!')
  } catch (err) {
    alert('Gagal menyimpan pemasukan: ' + err.message)
  } finally {
    submittingIncome.value = false
  }
}

const handleSubmit = () => {
  if (form.amount < 1000) {
    alert('Nominal minimal adalah Rp 1.000')
    return
  }

  const newExpense = {
    id: 'exp-' + Math.random().toString(36).substr(2, 9),
    description: form.description,
    amount: form.amount,
    created_at: new Date(form.created_at).toISOString()
  }

  expenses.value.unshift(newExpense)
  saveExpenses()
  showModal.value = false
}

const deleteExpense = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus catatan pengeluaran ini?')) {
    expenses.value = expenses.value.filter(exp => exp.id !== id)
    saveExpenses()
  }
}

// Computeds
const successInfaq = computed(() => {
  return infaqStore.items
    .filter(i => i.status === 'success')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const successInfaqCount = computed(() => successInfaq.value.length)

const totalIncome = computed(() => {
  return successInfaq.value.reduce((acc, item) => acc + Number(item.amount), 0)
})

const totalExpense = computed(() => {
  return expenses.value.reduce((acc, item) => acc + Number(item.amount), 0)
})

const balance = computed(() => {
  return totalIncome.value - totalExpense.value
})

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
</script>
