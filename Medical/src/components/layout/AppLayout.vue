<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from './Sidebar.vue'
import AppTopbar from './Topbar.vue'

const auth = useAuthStore()
const sidebarOpen = ref(false)
const shellClass = computed(() => `portal-${auth.portal ?? 'doctor'}`)
</script>

<template>
  <div :class="['app-shell', shellClass]">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <AppTopbar @open-sidebar="sidebarOpen = true" />
      <main class="app-content">
        <RouterView />
      </main>
    </div>
    <button
      v-if="sidebarOpen"
      class="sidebar-backdrop"
      type="button"
      aria-label="Close navigation"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  transition: margin-left 180ms ease;
}

.app-content {
  width: min(1480px, 100%);
  margin: 0 auto;
  padding: 28px 30px 48px;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 760px) {
  .app-main {
    margin-left: 0;
  }

  .app-content {
    padding: 20px 16px 36px;
  }

  .sidebar-backdrop {
    position: fixed;
    z-index: 30;
    inset: 0;
    display: block;
    border: 0;
    background: rgb(17 32 36 / 38%);
  }
}
</style>
