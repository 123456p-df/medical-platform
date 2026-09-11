<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabs'
import AppSidebar from './Sidebar.vue'
import AppTopbar from './Topbar.vue'
import AIAssistant from './AIAssistant.vue'
import WorkspaceTabs from './WorkspaceTabs.vue'
import { localPreview } from '@/utils/runtime'
import { routeTitleKey } from '@/i18n/routes'

const auth = useAuthStore()
const patients = usePatientStore()
const workspaceTabs = useWorkspaceTabsStore()
const route = useRoute()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(localStorage.getItem('pulmolink-sidebar-collapsed') === 'true')
const shellClass = computed(() => `portal-${auth.portal ?? 'doctor'}`)
const preview = localPreview || import.meta.env.VITE_PREVIEW === 'true'
const currentPatientName = computed(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  return patients.patients.find(patient => patient.id === id)?.name || id
})
const currentTabTitle = computed(() => {
  const base = routeTitleKey(route.name, route.path)
  return currentPatientName.value && String(route.name).startsWith('doctor-patient-')
    ? `${currentPatientName.value} · ${base}`
    : base
})

watch(sidebarCollapsed, (collapsed) => {
  localStorage.setItem('pulmolink-sidebar-collapsed', String(collapsed))
})

watch(
  [() => route.fullPath, currentTabTitle, () => auth.portal],
  () => {
    if (!auth.portal || route.path === '/login') return
    workspaceTabs.openTab({
      id: route.fullPath,
      path: route.fullPath,
      title: currentTabTitle.value,
      portal: auth.portal,
    })
  },
  { immediate: true },
)
</script>

<template>
  <div :class="['app-shell', shellClass, { 'sidebar-collapsed': sidebarCollapsed }]">
    <AIAssistant />
    <AppSidebar
      :open="sidebarOpen"
      :collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="app-main">
      <AppTopbar @open-sidebar="sidebarOpen = true" />
      <WorkspaceTabs />
      <main class="app-content">
        <div v-if="preview" class="preview-banner">{{ $t('Local test environment · Public de-identified CT example and demo records') }}</div>
        <div v-if="patients.error" class="data-error" role="alert">{{ $t(patients.error) }}</div>
        <RouterView v-slot="{ Component, route: currentRoute }">
          <KeepAlive :max="12">
            <component :is="Component" :key="currentRoute.fullPath" />
          </KeepAlive>
        </RouterView>
      </main>
    </div>
    <button
      v-if="sidebarOpen"
      class="sidebar-backdrop"
      type="button"
      :aria-label="$t('Close navigation')"
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

.sidebar-collapsed .app-main {
  margin-left: var(--sidebar-collapsed-width);
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
