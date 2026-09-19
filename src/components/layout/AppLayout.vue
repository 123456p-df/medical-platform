<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabs'
import { useStudyWorkspaceStore, type StudyViewerMode } from '@/stores/studyWorkspace'
import AppSidebar from './Sidebar.vue'
import AppTopbar from './Topbar.vue'
import AIAssistant from './AIAssistant.vue'
import WorkspaceTabs from './WorkspaceTabs.vue'
import { localPreview } from '@/utils/runtime'
import { buildId } from '@/utils/buildInfo'

const auth = useAuthStore()
const patients = usePatientStore()
const workspaceTabs = useWorkspaceTabsStore()
const studyWorkspace = useStudyWorkspaceStore()
const route = useRoute()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(localStorage.getItem('pulmolink-sidebar-collapsed') === 'true')
const shellClass = computed(() => `portal-${auth.portal ?? 'doctor'}`)
const preview = localPreview || import.meta.env.VITE_PREVIEW === 'true'
const tabTitles: Record<string, string> = {
  'doctor-dashboard': 'ui.sidebar.patientWorkspace',
  'doctor-patient-overview': 'ui.sidebar.patientOverview',
  'doctor-patient-imaging': 'Medical Imaging',
  'doctor-patient-report': 'ui.sidebar.clinicalReport',
  'doctor-patient-3d': 'ui.sidebar.organ3d',
  'patient-dashboard': 'My Health',
  'patient-examinations': 'My Examinations',
  'patient-examination-detail': 'Examination Detail',
  'patient-reports': 'My Reports',
  'patient-body': 'My Body',
}
const currentPatientName = computed(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  return patients.patients.find(patient => patient.id === id)?.name || id
})
const currentTabTitle = computed(() => {
  if (route.path.endsWith('/profile')) return 'ui.topbar.profile'
  const base = tabTitles[String(route.name)] || 'PulmoLink'
  return currentPatientName.value && String(route.name).startsWith('doctor-patient-')
    ? `${currentPatientName.value} · ${base}`
    : base
})

const contextPatientId = computed(() => {
  if (auth.portal === 'patient') return auth.session?.id || ''
  return typeof route.params.id === 'string' ? route.params.id : ''
})

const contextExaminationId = computed(() => {
  const fromQuery = typeof route.query.exam === 'string' && route.query.exam
  if (fromQuery) return fromQuery
  return route.name === 'patient-examination-detail' && typeof route.params.id === 'string'
    ? route.params.id
    : ''
})

const contextSeriesId = computed(() =>
  typeof route.query.series === 'string' ? route.query.series : '',
)

const contextMode = computed<StudyViewerMode | null>(() => {
  const value = route.query.mode
  return value === 'compare' || value === 'mpr' || value === 'projection' || value === '3d'
    ? value
    : null
})

function bindStudyContext() {
  const patientId = contextPatientId.value
  const examinationId = contextExaminationId.value
  const studyPage = [
    'doctor-patient-imaging',
    'doctor-patient-report',
    'doctor-patient-3d',
    'patient-examination-detail',
  ].includes(String(route.name))
  const current = studyWorkspace.context
  const preservedExamination = studyPage && !examinationId && current.patientId === patientId
    ? current.examinationId
    : examinationId

  studyWorkspace.bindContext({
    patientId: patientId || null,
    examinationId: preservedExamination || null,
    seriesId: contextSeriesId.value || null,
    mode: contextMode.value,
  })
}

watch(
  [() => route.fullPath, () => auth.session?.id],
  bindStudyContext,
  { immediate: true },
)

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
  <div
    :class="['app-shell', shellClass, { 'sidebar-collapsed': sidebarCollapsed }]"
    :data-build-id="buildId"
  >
    <a class="skip-link" href="#main-content">{{ $t('ui.a11y.skip') }}</a>
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
      <main id="main-content" tabindex="-1" class="app-content">
        <div v-if="preview" class="preview-banner">{{ $t('ui.shell.preview') }}</div>
        <div v-if="patients.error" class="data-error" role="alert">{{ patients.error }}</div>
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
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
