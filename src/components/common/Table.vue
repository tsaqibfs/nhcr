<template>
  <div class="overflow-x-auto w-full rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
      <!-- Headers -->
      <thead class="bg-slate-50/70 text-xs font-semibold text-slate-700 uppercase tracking-wider">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key" 
            class="px-6 py-4"
            :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="divide-y divide-slate-100 bg-white">
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-6 py-12 text-center">
            <div class="flex flex-col items-center justify-center gap-3">
              <svg class="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium text-slate-500">Memuat data...</span>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="items.length === 0">
          <td :colspan="columns.length" class="px-6 py-16 text-center">
            <div class="flex flex-col items-center justify-center gap-2">
              <InboxIcon class="w-12 h-12 text-slate-300" />
              <span class="text-base font-semibold text-slate-500">Tidak ada data ditemukan</span>
              <span class="text-xs text-slate-400">Silakan tambahkan data baru atau sesuaikan filter Anda.</span>
            </div>
          </td>
        </tr>

        <!-- Rows -->
        <tr 
          v-else 
          v-for="(item, idx) in items" 
          :key="item.id || idx"
          class="hover:bg-slate-50/50 transition-colors duration-150"
        >
          <td 
            v-for="col in columns" 
            :key="col.key" 
            class="px-6 py-4.5 whitespace-nowrap"
            :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
          >
            <!-- Slot for customization, e.g., v-slot:amount -->
            <slot :name="col.key" :item="item" :index="idx">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Inbox as InboxIcon } from 'lucide-vue-next'

defineProps({
  columns: {
    type: Array,
    required: true
    // Array of objects like: { key: 'name', label: 'Nama', align: 'left' }
  },
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>
