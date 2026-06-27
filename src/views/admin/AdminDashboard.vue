<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main Content Area -->
    <div class="md:pl-64 flex flex-col min-h-screen">
      <!-- Navbar -->
      <Navbar showMenuButton @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Content Page -->
      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../../components/layout/Sidebar.vue'
import Navbar from '../../components/layout/Navbar.vue'

const isSidebarOpen = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
