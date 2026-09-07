<script setup lang="ts">
import { computed } from 'vue'
import { Bell, Menu, Search } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  openSidebar: []
}>()

const auth = useAuthStore()
const route = useRoute()

const pageTitles: Record<string, string> = {
  'doctor-dashboard': 'Doctor Dashboard',
  'doctor-patients': 'Patient List',
  'doctor-patient-overview': 'Patient Record',
  'doctor-patient-imaging': 'Medical Imaging',
  'doctor-patient-ai': 'AI Findings',
  'doctor-patient-report': 'Doctor Report',
  'doctor-patient-3d': 'Digital Human',
  'patient-dashboard': 'My Health',
  'patient-examinations': 'My Examinations',
  'patient-examination-detail': 'Examination Detail',
  'patient-reports': 'My Reports',
  'patient-body': 'My Body',
}

const title = computed(() => pageTitles[String(route.name)] ?? 'PulmoLink')
const greeting = computed(() => {
  if (auth.portal === 'patient') {
    return `Good morning, ${auth.session?.name ?? 'Patient'}`
  }
  return `Good morning, ${auth.session?.name ?? 'Doctor'}`
})

const initials = computed(() =>
  auth.session?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2),
)
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="mobile-menu" type="button" aria-label="Open navigation" @click="emit('openSidebar')">
        <Menu :size="20" />
      </button>
      <div class="title-wrap">
        <span class="eyebrow">{{ auth.portal === 'doctor' ? 'Clinical Workspace' : 'Personal Health' }}</span>
        <strong>{{ title }}</strong>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="greeting">{{ greeting }}</div>
      <label class="topbar-search">
        <Search :size="16" />
        <input type="search" placeholder="Search" aria-label="Search" />
      </label>
      <button class="icon-btn notification" type="button" aria-label="Notifications">
        <Bell :size="18" />
        <span class="notification-dot" />
      </button>
      <div class="topbar-profile">
        <span class="profile-avatar">{{ initials }}</span>
        <span class="profile-copy">
          <strong>{{ auth.session?.name }}</strong>
          <small>{{ auth.portal === 'doctor' ? 'Radiologist' : 'Patient' }}</small>
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  height: var(--topbar-height);
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 30px;
  border-bottom: 1px solid var(--border);
  background: rgb(255 255 255 / 88%);
  backdrop-filter: blur(12px);
}

.topbar-left,
.topbar-actions,
.topbar-profile {
  display: flex;
  align-items: center;
}

.topbar-left {
  gap: 12px;
}

.mobile-menu {
  display: none;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.title-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.title-wrap strong {
  color: var(--text);
  font-size: 15px;
}

.eyebrow {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.topbar-actions {
  gap: 12px;
}

.greeting {
  color: var(--text-soft);
  font-size: 13px;
}

.topbar-search {
  display: flex;
  width: 180px;
  height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
  color: var(--text-muted);
}

.topbar-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 13px;
}

.notification {
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border: 2px solid var(--surface);
  border-radius: 50%;
  background: var(--red);
}

.topbar-profile {
  gap: 9px;
  padding-left: 4px;
}

.profile-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: #dcecec;
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 760;
}

.profile-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.profile-copy strong {
  color: var(--text);
  font-size: 12px;
}

.profile-copy small {
  color: var(--text-muted);
  font-size: 10px;
}

@media (max-width: 980px) {
  .greeting,
  .topbar-search,
  .profile-copy {
    display: none;
  }
}

@media (max-width: 760px) {
  .topbar {
    padding: 0 16px;
  }

  .mobile-menu {
    display: grid;
  }
}
</style>
