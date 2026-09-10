<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Bell, Menu, Search, CheckCheck, X, Languages } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { readLocal, writeLocal } from '@/api/localData'
import { locale, setLocale } from '@/i18n'

const emit = defineEmits<{
  openSidebar: []
}>()

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const store = usePatientStore()
const notificationsOpen = ref(false)
const notificationRoot = ref<HTMLElement | null>(null)
const readIds = ref<string[]>(readLocal('notification-read', []))
const notifications = computed(() => {
  const reviews = auth.portal === 'doctor' ? store.patients.filter((patient) => patient.status === 'Pending Review' || patient.status === 'Abnormal').map((patient) => ({
    id: `review-${patient.id}-${patient.lastExamDate}`,
    title: 'Examination awaiting review',
    detail: `${patient.name} · ${patient.modality}`,
    to: `/doctor/patients/${patient.id}/report`,
  })) : []
  const reports = (auth.portal === 'patient' ? store.reviewedReports : store.reports.filter((report) => report.reviewed)).filter((report) => auth.portal === 'doctor' || report.patientId === auth.session?.id).map((report) => ({
    id: `signed-${report.id}-${report.date}-${report.description}`,
    title: 'Report signed',
    detail: `${report.examinationId} · ${report.date}`,
    to: auth.portal === 'doctor' ? `/doctor/patients/${report.patientId}/report?exam=${report.examinationId}` : '/patient/reports',
  }))
  return [...reviews, ...reports]
})
const unreadCount = computed(() => notifications.value.filter((item) => !readIds.value.includes(item.id)).length)
function markRead(ids: string[]) {
  readIds.value = [...new Set([...readIds.value, ...ids])]
  writeLocal('notification-read', readIds.value)
}
function openNotification(item: typeof notifications.value[number]) {
  markRead([item.id])
  notificationsOpen.value = false
  void router.push(item.to)
}
function closeOutside(event: PointerEvent) {
  if (!notificationRoot.value?.contains(event.target as Node)) notificationsOpen.value = false
}
function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') notificationsOpen.value = false
}
onMounted(() => { document.addEventListener('pointerdown', closeOutside); document.addEventListener('keydown', closeOnEscape) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape) })

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
      <button class="mobile-menu" type="button" :aria-label="$t('Open navigation')" @click="emit('openSidebar')">
        <Menu :size="20" />
      </button>
      <div class="title-wrap">
        <span class="eyebrow">{{ $t(auth.portal === 'doctor' ? 'Clinical Workspace' : 'Personal Health') }}</span>
        <strong>{{ $t(title) }}</strong>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="greeting">{{ $t(greeting) }}</div>
      <label class="topbar-search">
        <Search :size="16" />
        <input type="search" :placeholder="$t('Search')" :aria-label="$t('Search')" />
      </label>
      <button class="language-switch" type="button" :aria-label="$t('Switch language')" @click="setLocale(locale === 'zh' ? 'en' : 'zh')"><Languages :size="16" /><span>{{ locale === 'zh' ? 'English' : '中文' }}</span></button>
      <div ref="notificationRoot" class="notification-root">
        <button class="icon-btn notification" type="button" :aria-label="$t('Notifications')" :aria-expanded="notificationsOpen" aria-controls="notification-panel" @click="notificationsOpen = !notificationsOpen">
          <Bell :size="18" />
          <span v-if="unreadCount" class="notification-dot" />
        </button>
        <section v-if="notificationsOpen" id="notification-panel" class="notification-panel" :aria-label="$t('Notifications')">
          <div class="notification-heading"><strong>{{ $t("Notifications") }}</strong><span>{{ $t(unreadCount) }} {{ $t("unread") }}</span><button class="icon-btn" type="button" :aria-label="$t('Close notifications')" @click="notificationsOpen = false"><X :size="16" /></button></div>
          <button v-if="unreadCount" type="button" class="mark-read" @click="markRead(notifications.map((item) => item.id))"><CheckCheck :size="15" /> {{ $t("Mark all as read") }}</button>
          <div class="notification-list">
            <button v-for="item in notifications" :key="item.id" type="button" :class="['notification-item', { unread: !readIds.includes(item.id) }]" @click="openNotification(item)"><Bell :size="17" /><span><strong>{{ $t(item.title) }}</strong><small>{{ $t(item.detail) }}</small></span></button>
            <div v-if="!notifications.length" class="empty-state">{{ $t("No notifications yet.") }}</div>
          </div>
        </section>
      </div>
      <div class="topbar-profile">
        <span class="profile-avatar">{{ $t(initials) }}</span>
        <span class="profile-copy">
          <strong>{{ $t(auth.session?.name) }}</strong>
          <small>{{ $t(auth.portal === 'doctor' ? 'Radiologist' : 'Patient') }}</small>
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.language-switch { display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px; border: 1px solid var(--border); border-radius: 7px; background: white; color: var(--text-soft); font-size: 12px; white-space: nowrap; }
.notification-root { position: relative; }
.notification-panel { position: absolute; right: 0; top: 46px; width: min(360px, calc(100vw - 32px)); border: 1px solid var(--border); border-radius: 14px; background: white; box-shadow: 0 14px 45px rgb(20 46 49 / 16%); overflow: hidden; }
.notification-heading { display: flex; align-items: center; gap: 12px; padding: 14px 16px 5px; }
.notification-heading > span { flex: 1; font-size: 11px; color: var(--text-muted); }
.mark-read { display: flex; align-items: center; gap: 6px; margin: 4px 16px 12px; padding: 0; border: 0; background: transparent; color: var(--accent-strong); font-size: 12px; }
.notification-list { max-height: 380px; overflow: auto; }
.notification-item { display: flex; width: 100%; gap: 10px; padding: 16px; text-align: left; border: 0; border-top: 1px solid var(--border); background: white; color: var(--text-soft); }
.notification-item.unread { background: #eff8f5; }
.notification-item:hover { background: var(--accent-soft); }
.notification-item > span { display: grid; gap: 5px; }
.notification-item strong { font-size: 12px; }.notification-item small { font-size: 11px; color: var(--text-muted); }
@media (max-width: 600px) { .notification-panel { right: -48px; } }
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
