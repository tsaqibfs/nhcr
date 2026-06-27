<template>
  <div class="space-y-8">
    <!-- Stat Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Infaq Card -->
      <Card class="relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Infaq Terkumpul</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(totalInfaq) }}</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <InfaqIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4 flex items-center gap-1">
          <span class="font-semibold text-emerald-600">{{ successInfaqCount }}</span> infaq sukses diverifikasi
        </div>
      </Card>

      <!-- Zakat Rupiah Card -->
      <Card class="relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Zakat Uang</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ formatRupiah(totalZakatUang) }}</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <ZakatIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Zakat Fitrah uang tunai
        </div>
      </Card>

      <!-- Zakat Beras Card -->
      <Card class="relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Zakat Beras</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ totalZakatBeras }} kg</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
            <ScaleIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Zakat Fitrah beras
        </div>
      </Card>

      <!-- Kurban Card -->
      <Card class="relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Hewan Kurban Terdaftar</p>
            <h3 class="text-2xl font-extrabold text-slate-800 mt-2">{{ kurbanSapi }} Sapi / {{ kurbanKambing }} Kambing</h3>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
            <KurbanIcon class="w-6 h-6" />
          </div>
        </div>
        <div class="text-xs text-slate-400 mt-4">
          Total: <span class="font-bold text-rose-600">{{ totalKurbanCount }}</span> hewan terdaftar
        </div>
      </Card>
    </div>

    <!-- Cow Joint Slot Grid & Pending Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sapi Slot Allocation Card -->
      <Card title="Slot Patungan Kurban Sapi" class="lg:col-span-2">
        <div class="space-y-6">
          <p class="text-xs text-slate-500">
            Kurban Sapi patungan maksimal diisi 7 jamaah. Di bawah ini adalah visualisasi kelompok patungan sapi yang terdaftar saat ini.
          </p>

          <div v-if="sapiGroups.length === 0" class="text-center py-8 text-slate-400 text-sm">
            Belum ada jamaah yang mendaftar kurban sapi.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(group, idx) in sapiGroups" :key="idx" class="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold text-emerald-800">Kelompok Sapi #{{ idx + 1 }}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-bold" :class="group.filter(Boolean).length === 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                  {{ group.filter(Boolean).length }}/7 Slot Terisi
                </span>
              </div>
              <!-- Slot circles -->
              <div class="grid grid-cols-7 gap-2">
                <div 
                  v-for="slot in 7" 
                  :key="slot"
                  class="h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors border"
                  :class="[
                    group[slot-1] 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400 border-dashed'
                  ]"
                  :title="group[slot-1]?.full_name || 'Slot Kosong'"
                >
                  {{ group[slot-1] ? group[slot-1].full_name.split(' ')[0] : 'Kosong' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Pending Verifications -->
      <Card title="Verifikasi Tertunda">
        <div class="space-y-4">
          <div v-if="pendingItems.length === 0" class="text-center py-12 text-slate-400 text-sm">
            <CheckCircleIcon class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Semua transaksi sudah diverifikasi!
          </div>

          <div v-else class="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
            <div v-for="item in pendingItems" :key="item.uniqueId" class="py-3 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-0.5 rounded-md font-semibold text-slate-700 bg-slate-100 uppercase">
                    {{ item.module }}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">
                    {{ formatDate(item.created_at) }}
                  </span>
                </div>
                <h5 class="text-sm font-semibold text-slate-800 truncate mt-1">{{ item.full_name }}</h5>
                <p class="text-xs text-slate-500 mt-0.5">{{ formatRupiah(item.amount) }}</p>
              </div>
              <router-link 
                :to="`/admin/${item.module}`"
                class="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
              >
                <ArrowRightIcon class="w-4 h-4" />
              </router-link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useInfaqStore } from '../../stores/infaq'
import { useZakatStore } from '../../stores/zakat'
import { useKurbanStore } from '../../stores/kurban'
import Card from '../../components/common/Card.vue'
import { 
  HeartHandshake as InfaqIcon, 
  Scale as ZakatIcon, 
  Gift as KurbanIcon,
  Scale as ScaleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-vue-next'

const infaqStore = useInfaqStore()
const zakatStore = useZakatStore()
const kurbanStore = useKurbanStore()

onMounted(async () => {
  await Promise.all([
    infaqStore.fetchInfaq(),
    zakatStore.fetchZakat(),
    kurbanStore.fetchKurban()
  ])
})

// Formatting Helpers
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0)
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Infaq aggregates
const successInfaq = computed(() => infaqStore.items.filter(i => i.status === 'success'))
const totalInfaq = computed(() => successInfaq.value.reduce((acc, i) => acc + Number(i.amount), 0))
const successInfaqCount = computed(() => successInfaq.value.length)

// Zakat aggregates
const successZakat = computed(() => zakatStore.items.filter(z => z.status === 'success'))
const totalZakatUang = computed(() => successZakat.value.reduce((acc, z) => acc + Number(z.amount), 0))
const totalZakatBeras = computed(() => successZakat.value.reduce((acc, z) => acc + Number(z.rice_weight_kg || 0), 0))

// Kurban aggregates
const successKurban = computed(() => kurbanStore.items.filter(k => k.status === 'paid' || k.status === 'distributed'))
const kurbanSapi = computed(() => successKurban.value.filter(k => k.animal_type === 'sapi').length)
const kurbanKambing = computed(() => successKurban.value.filter(k => k.animal_type === 'kambing').length)
const totalKurbanCount = computed(() => successKurban.value.length)

// Sapi Joint Patungan Groups (group 7 bookings together based on chosen slots)
const sapiGroups = computed(() => {
  const sapiBookings = successKurban.value.filter(k => k.animal_type === 'sapi')
  sapiBookings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  
  const groups = []
  
  sapiBookings.forEach(booking => {
    const slotIndex = (booking.joint_slot || 1) - 1
    let added = false
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      if (!group[slotIndex] && group.filter(Boolean).length < 7) {
        group[slotIndex] = booking
        added = true
        break
      }
    }
    if (!added) {
      const newGroup = Array(7).fill(null)
      newGroup[slotIndex] = booking
      groups.push(newGroup)
    }
  })
  
  return groups
})

// Pending Items aggregate for verification section
const pendingItems = computed(() => {
  const items = []
  
  infaqStore.items.forEach(i => {
    if (i.status === 'pending') {
      items.push({
        uniqueId: `infaq-${i.id}`,
        module: 'infaq',
        created_at: i.created_at,
        full_name: 'Hamba Allah',
        amount: i.amount
      })
    }
  })

  zakatStore.items.forEach(z => {
    if (z.status === 'pending') {
      items.push({
        uniqueId: `zakat-${z.id}`,
        module: 'zakat',
        created_at: z.created_at,
        full_name: 'Hamba Allah',
        amount: z.amount
      })
    }
  })

  kurbanStore.items.forEach(k => {
    if (k.status === 'pending') {
      items.push({
        uniqueId: `kurban-${k.id}`,
        module: 'kurban',
        created_at: k.created_at,
        full_name: k.full_name || 'Jamaah',
        amount: k.price
      })
    }
  })

  // Sort by date (oldest first, so we process first-in first-verified)
  return items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
})
</script>
