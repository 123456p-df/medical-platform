<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity,
  Box,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  open: boolean
  collapsed: boolean
}>()

const emit = defineEmits<{
  close: []
  toggle: []
}>()

const auth = useAuthStore()
const router = useRouter()

const doctorNav = computed(() => [
  { label: 'Patient Workspace', to: '/doctor/dashboard', icon: LayoutDashboard },
  { label: '个人资料', to: '/doctor/profile', icon: UserRound },
])

const patientNav = computed(() => [
  { label: '个人资料', to: '/patient/profile', icon: UserRound },
  { label: 'Home', to: '/patient/dashboard', icon: Home },
  { label: 'My Health', to: '/patient/dashboard', icon: HeartPulse },
  { label: 'My Examinations', to: '/patient/examinations', icon: Stethoscope },
  { label: 'My Reports', to: '/patient/reports', icon: FileText },
  { label: 'My Body', to: '/patient/body', icon: Box },
  { label: 'AI Assistant', to: '/patient/assistant', icon: Sparkles },
])

const navItems = computed(() => (auth.portal === 'doctor' ? doctorNav.value : patientNav.value))

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
        <small>Medical AI Platform</small>
      </span>
      <button class="sidebar-close" type="button" aria-label="Close navigation" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <button
      class="desktop-collapse"
      type="button"
      :aria-label="props.collapsed ? '展开侧边栏' : '收起侧边栏'"
      :title="props.collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="emit('toggle')"
    >
      <PanelLeftOpen v-if="props.collapsed" :size="15" />
      <PanelLeftClose v-else :size="15" />
    </button>

    <div class="sidebar-label">{{ auth.portal === 'doctor' ? 'Clinical Workspace' : 'Personal Health' }}</div>

    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        active-class="is-active"
        :title="props.collapsed ? $t(item.label) : undefined"
        @click="emit('close')"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ $t(item.label) }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="session-person">
        <span class="avatar">{{ auth.session?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) }}</span>
        <span class="session-copy">
          <strong>{{ auth.session?.name }}</strong>
          <small>{{ auth.portal === 'doctor' ? 'Doctor Portal' : 'Patient Portal' }}</small>
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
