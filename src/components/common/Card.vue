<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
      <slot name="header">
        <h3 class="font-bold text-slate-800">{{ title }}</h3>
      </slot>
    </div>
    <div class="p-6">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>
