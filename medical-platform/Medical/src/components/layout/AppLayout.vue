<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import AppSidebar from './Sidebar.vue'
import AppTopbar from './Topbar.vue'

const auth = useAuthStore()
const patients = usePatientStore()
const sidebarOpen = ref(false)
const shellClass = computed(() => `portal-${auth.portal ?? 'doctor'}`)
const preview = import.meta.env.VITE_PREVIEW === 'true'
</script>

<template>
  <div :class="['app-shell', shellClass]">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <AppTopbar @open-sidebar="sidebarOpen = true" />
      <main class="app-content">
        <div v-if="preview" class="preview-banner">本地联调演示 · 患者、病历与影像均为合成样例 · 不是临床检查结果</div>
        <div v-if="patients.error" class="data-error" role="alert">{{ patients.error }}</div>
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
.data-error { background: #fbeded; color: #a24e50; padding: 14px; border-radius: 8px; margin-bottom: 18px; }
.preview-banner { background: #e4f2ee; color: #246d61; padding: 10px 15px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; }
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
