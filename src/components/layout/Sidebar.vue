<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Activity,
  Box,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Sparkles,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'

const props = defineProps<{
  open: boolean
  collapsed: boolean
}>()

const emit = defineEmits<{
  close: []
  toggle: []
}>()

const auth = useAuthStore()
const patients = usePatientStore()
const route = useRoute()
const router = useRouter()
const managementExpanded = ref(localStorage.getItem('pulmolink-nav-patients') !== 'false')
const clinicalExpanded = ref(localStorage.getItem('pulmolink-nav-clinical') !== 'false')
const routePatientId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const currentPatientId = computed(() => routePatientId.value || patients.selectedPatientId || '')
const currentPatient = computed(() => patients.patients.find(patient => patient.id === currentPatientId.value))
const clinicalItems = computed(() => currentPatientId.value ? [
  { label: 'Patient overview', name: 'doctor-patient-overview', icon: ClipboardList },
  { label: 'Medical Imaging', name: 'doctor-patient-imaging', icon: ScanLine },
  { label: 'AI Assistant', name: 'doctor-patient-ai', icon: Sparkles },
  { label: 'Clinical report', name: 'doctor-patient-report', icon: FileText },
  { label: '3D / 2D segmentation viewport', name: 'doctor-patient-study-viewer', icon: ScanLine },
  { label: '3D organ model', name: 'doctor-patient-3d', icon: Box },
] : [])

const patientNav = computed(() => [
  { label: 'Home', to: '/patient/dashboard', icon: Home },
  { label: 'My Health', to: '/patient/dashboard', icon: HeartPulse },
  { label: 'My Examinations', to: '/patient/examinations', icon: Stethoscope },
  { label: 'My Reports', to: '/patient/reports', icon: FileText },
  { label: 'My Body', to: '/patient/body', icon: Box },
  { label: 'AI Assistant', to: '/patient/assistant', icon: Sparkles },
])

watch(managementExpanded, value => localStorage.setItem('pulmolink-nav-patients', String(value)))
watch(clinicalExpanded, value => localStorage.setItem('pulmolink-nav-clinical', String(value)))
watch(routePatientId, id => { if (id) clinicalExpanded.value = true })

function toggleGroup(group: 'management' | 'clinical') {
  if (props.collapsed) emit('toggle')
  if (group === 'management') managementExpanded.value = !managementExpanded.value
  else if (currentPatientId.value) clinicalExpanded.value = !clinicalExpanded.value
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside :class="['sidebar', { 'is-open': props.open, 'is-collapsed': props.collapsed }]">
    <div class="brand">
      <span class="brand-mark"><Activity :size="20" /></span>
      <span class="brand-copy">
        <strong>PulmoLink</strong>
        <small>{{ $t('Medical AI Platform') }}</small>
      </span>
      <button class="sidebar-close" type="button" :aria-label="$t('Close navigation')" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <button
      class="desktop-collapse"
      type="button"
      :aria-label="$t(props.collapsed ? 'Expand sidebar' : 'Collapse sidebar')"
      :title="$t(props.collapsed ? 'Expand sidebar' : 'Collapse sidebar')"
      @click="emit('toggle')"
    >
      <PanelLeftOpen v-if="props.collapsed" :size="15" />
      <PanelLeftClose v-else :size="15" />
    </button>

    <div class="sidebar-label">{{ $t(auth.portal === 'doctor' ? 'Clinical Workspace' : 'Personal Health') }}</div>

    <nav v-if="auth.portal === 'doctor'" class="nav doctor-tree" :aria-label="$t('Doctor workspace navigation')">
      <section class="tree-group">
        <button class="tree-toggle" type="button" :aria-expanded="managementExpanded" :title="$t('Patient management')" @click="toggleGroup('management')">
          <UsersRound :size="18" />
          <span>{{ $t('Patient management') }}</span>
          <ChevronDown v-if="managementExpanded" class="tree-chevron" :size="15" />
          <ChevronRight v-else class="tree-chevron" :size="15" />
        </button>
        <div v-if="managementExpanded" class="tree-children">
          <RouterLink to="/doctor/dashboard" class="tree-item" active-class="is-active" @click="emit('close')">
            <LayoutDashboard :size="16" /><span>{{ $t('Patient Workspace') }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="tree-group">
        <button
          class="tree-toggle"
          :class="{ disabled: !currentPatientId }"
          type="button"
          :aria-expanded="clinicalExpanded && Boolean(currentPatientId)"
          :title="$t(currentPatientId ? 'Current patient clinical workflow' : 'Open a patient first')"
          @click="toggleGroup('clinical')"
        >
          <Stethoscope :size="18" />
          <span class="tree-label">
            <strong>{{ $t('Clinical workflow') }}</strong>
            <small>{{ currentPatient?.name || (currentPatientId ? currentPatientId : $t('Open a patient first')) }}</small>
          </span>
          <ChevronDown v-if="clinicalExpanded && currentPatientId" class="tree-chevron" :size="15" />
          <ChevronRight v-else class="tree-chevron" :size="15" />
        </button>
        <div v-if="clinicalExpanded && currentPatientId" class="tree-children clinical-children">
          <RouterLink
            v-for="item in clinicalItems"
            :key="item.name"
            :to="{ name: item.name, params: { id: currentPatientId } }"
            class="tree-item"
            active-class="is-active"
            @click="emit('close')"
          >
            <component :is="item.icon" :size="16" />
            <span>{{ $t(item.label) }}</span>
          </RouterLink>
        </div>
      </section>
    </nav>

    <nav v-else class="nav" :aria-label="$t('Patient portal navigation')">
      <RouterLink v-for="item in patientNav" :key="item.label" :to="item.to" class="nav-item" active-class="is-active" @click="emit('close')">
        <component :is="item.icon" :size="18" />
        <span>{{ $t(item.label) }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="session-person">
        <span class="avatar">{{ auth.session?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) }}</span>
        <span class="session-copy">
          <strong>{{ auth.session?.name }}</strong>
          <small>{{ $t(auth.portal === 'doctor' ? 'Doctor Portal' : 'Patient Portal') }}</small>
        </span>
      </div>
      <button class="logout-btn" type="button" :title="$t('Sign out')" @click="logout">
        <LogOut :size="18" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  z-index: 40;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  width: var(--sidebar-width);
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: #fbfdfd;
  transition: width 180ms ease, transform 180ms ease;
}

.sidebar.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.brand {
  display: flex;
  height: var(--topbar-height);
  align-items: center;
  gap: 11px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
}

.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.15;
}

.brand-copy strong {
  color: var(--text);
  font-size: 15px;
  letter-spacing: 0;
}

.brand-copy small {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.sidebar-close {
  display: none;
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--text-soft);
}

.desktop-collapse {
  position: absolute;
  z-index: 2;
  top: 76px;
  right: -13px;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  color: var(--text-soft);
}

.desktop-collapse:hover {
  border-color: var(--accent);
  color: var(--accent-strong);
}

.sidebar-label {
  padding: 22px 20px 9px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 10px;
}

.doctor-tree {
  gap: 10px;
}

.tree-group {
  display: grid;
  gap: 4px;
}

.tree-toggle,
.tree-item {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  gap: 11px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  text-align: left;
}

.tree-toggle {
  color: var(--text);
  font-size: 13px;
  font-weight: 680;
}

.tree-toggle:hover,
.tree-item:hover {
  background: var(--surface-3);
}

.tree-toggle.disabled {
  color: var(--text-muted);
}

.tree-label {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.25;
}

.tree-label strong {
  font-size: 13px;
}

.tree-label small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-chevron {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--text-muted);
}

.tree-children {
  position: relative;
  display: grid;
  gap: 2px;
  margin-left: 19px;
  padding-left: 12px;
}

.tree-children::before {
  position: absolute;
  top: 1px;
  bottom: 7px;
  left: 0;
  width: 1px;
  background: var(--border-strong);
  content: '';
}

.tree-item {
  position: relative;
  min-height: 38px;
  padding-left: 10px;
  font-size: 12px;
  font-weight: 580;
}

.tree-item::before {
  position: absolute;
  top: 50%;
  left: -12px;
  width: 10px;
  height: 1px;
  background: var(--border-strong);
  content: '';
}

.tree-item.is-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.nav-item {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 7px;
  color: var(--text-soft);
  font-weight: 580;
  transition:
    background 150ms ease,
    color 150ms ease;
}

.nav-item:hover {
  background: var(--surface-3);
  color: var(--text);
}

.nav-item.is-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 14px 16px;
  border-top: 1px solid var(--border);
}

.session-person {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 10px;
}

.avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 750;
}

.session-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.25;
}

.session-copy strong {
  overflow: hidden;
  color: var(--text);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-copy small {
  color: var(--text-muted);
  font-size: 11px;
}

.logout-btn {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
}

.logout-btn:hover {
  background: var(--surface-3);
  color: var(--text);
}

.sidebar.is-collapsed .brand {
  justify-content: center;
  padding-inline: 0;
}

.sidebar.is-collapsed .brand-copy,
.sidebar.is-collapsed .sidebar-label,
.sidebar.is-collapsed .nav-item span,
.sidebar.is-collapsed .tree-toggle span,
.sidebar.is-collapsed .tree-chevron,
.sidebar.is-collapsed .tree-children,
.sidebar.is-collapsed .session-copy {
  display: none;
}

.sidebar.is-collapsed .nav {
  gap: 6px;
  padding: 20px 8px 0;
}

.sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 0;
}

.sidebar.is-collapsed .tree-toggle {
  justify-content: center;
  padding: 0;
}

.sidebar.is-collapsed .sidebar-footer {
  flex-direction: column;
  padding: 12px 8px;
}

.sidebar.is-collapsed .session-person {
  flex: 0 0 auto;
}

@media (max-width: 760px) {
  .sidebar {
    width: min(84vw, 280px);
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .sidebar.is-collapsed {
    width: min(84vw, 280px);
  }

  .sidebar.is-collapsed .brand {
    justify-content: flex-start;
    padding: 0 18px;
  }

  .sidebar.is-collapsed .brand-copy,
  .sidebar.is-collapsed .sidebar-label,
  .sidebar.is-collapsed .nav-item span,
  .sidebar.is-collapsed .tree-toggle span,
  .sidebar.is-collapsed .tree-chevron,
  .sidebar.is-collapsed .tree-children,
  .sidebar.is-collapsed .session-copy {
    display: flex;
  }

  .sidebar.is-collapsed .sidebar-label {
    display: block;
  }

  .sidebar.is-collapsed .nav {
    gap: 3px;
    padding: 0 10px;
  }

  .sidebar.is-collapsed .nav-item {
    justify-content: flex-start;
    padding: 0 12px;
  }

  .sidebar.is-collapsed .tree-toggle {
    justify-content: flex-start;
    padding: 0 11px;
  }

  .sidebar.is-collapsed .tree-children {
    display: grid;
  }

  .sidebar.is-collapsed .sidebar-footer {
    flex-direction: row;
    padding: 14px 16px;
  }

  .sidebar.is-collapsed .session-person {
    flex: 1;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: inline-flex;
  }

  .desktop-collapse {
    display: none;
  }
}
</style>
