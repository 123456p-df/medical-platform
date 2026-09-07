<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity,
  Box,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Stethoscope,
  Users,
  X,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const auth = useAuthStore()
const router = useRouter()

const primaryPatientId = 'P20260021'

const doctorNav = computed(() => [
  { label: 'Dashboard', to: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Patients', to: '/doctor/patients', icon: Users },
  { label: 'Imaging', to: `/doctor/patients/${primaryPatientId}/imaging`, icon: ScanLine },
  { label: 'Reports', to: `/doctor/patients/${primaryPatientId}/report`, icon: FileText },
  { label: 'Medical Records', to: `/doctor/patients/${primaryPatientId}/overview`, icon: ClipboardList },
  { label: 'Digital Human', to: `/doctor/patients/${primaryPatientId}/3d`, icon: Box },
])

const patientNav = computed(() => [
  { label: 'Home', to: '/patient/dashboard', icon: Home },
  { label: 'My Health', to: '/patient/dashboard', icon: HeartPulse },
  { label: 'My Examinations', to: '/patient/examinations', icon: Stethoscope },
  { label: 'My Reports', to: '/patient/reports', icon: FileText },
  { label: 'My Body', to: '/patient/body', icon: Box },
])

const navItems = computed(() => (auth.portal === 'doctor' ? doctorNav.value : patientNav.value))

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside :class="['sidebar', { 'is-open': props.open }]">
    <div class="brand">
      <span class="brand-mark"><Activity :size="20" /></span>
      <span class="brand-copy">
        <strong>PulmoLink</strong>
        <small>Medical AI Platform</small>
      </span>
      <button class="sidebar-close" type="button" aria-label="Close navigation" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <div class="sidebar-label">{{ auth.portal === 'doctor' ? 'Clinical Workspace' : 'Personal Health' }}</div>

    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="session-person">
        <span class="avatar">{{ auth.session?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) }}</span>
        <span class="session-copy">
          <strong>{{ auth.session?.name }}</strong>
          <small>{{ auth.portal === 'doctor' ? 'Radiology' : 'Patient Portal' }}</small>
        </span>
      </div>
      <button class="logout-btn" type="button" title="Sign out" @click="logout">
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

@media (max-width: 760px) {
  .sidebar {
    width: min(84vw, 280px);
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: inline-flex;
  }
}
</style>
