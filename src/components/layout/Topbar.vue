<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useWorkflowStore } from '@/stores/workflow'
import { locale, setLocale } from '@/i18n'
import { Bell, Menu } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  openSidebar: []
}>()

const auth = useAuthStore()
const route = useRoute()
const profile = useProfileStore(), workflow = useWorkflowStore(), notices = ref(false), profileError = ref('')
const displayName = computed(() => profile.data?.display_name || auth.session?.name || '')
onMounted(async () => {
  try { await profile.load() } catch (e) { profileError.value = e instanceof Error ? e.message : '资料加载失败' }
  if (auth.portal === 'doctor') await workflow.load()
})

const pageTitles: Record<string, string> = {
  'doctor-dashboard': 'Patient Workspace',
  'doctor-patients': 'Patient Workspace',
  'doctor-patient-overview': 'Patient Record',
  'doctor-patient-imaging': 'Medical Imaging',
  'doctor-patient-ai': 'AI Assistant',
  'doctor-patient-report': 'Doctor Report',
  'doctor-patient-3d': 'Digital Human',
  'patient-dashboard': 'My Health',
  'patient-examinations': 'My Examinations',
  'patient-examination-detail': 'Examination Detail',
  'patient-reports': 'My Reports',
  'patient-body': 'My Body',
  'patient-ai': 'AI Assistant',
}

const title = computed(() => route.path.endsWith('/profile') ? '个人资料' : pageTitles[String(route.name)] ?? 'PulmoLink')
const greeting = computed(() => {
  if (auth.portal === 'patient') {
    return `Good morning, ${displayName.value || 'Patient'}`
  }
  return `Good morning, ${displayName.value || 'Doctor'}`
})

const initials = computed(() =>
  displayName.value
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
        <strong>{{ $t(title) }}</strong>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="greeting">{{ $t(greeting) }}</div>
      <button class="btn btn-secondary btn-sm" aria-label="切换界面语言" @click="setLocale(locale === 'zh' ? 'en' : 'zh')">{{ locale === 'zh' ? '中文 / EN' : 'EN / 中文' }}</button>
      <div class="notification-wrap" @keydown.esc="notices = false">
        <button class="icon-btn notification" type="button" aria-label="通知" :aria-expanded="notices" @click="notices = !notices; notices && auth.portal === 'doctor' && workflow.load()">
          <Bell :size="18" /><span v-if="auth.portal === 'doctor' && workflow.pending.length" class="notification-dot" />
        </button>
        <div v-if="notices" class="notice-panel">
          <div class="notice-heading"><strong>通知与待办</strong><button class="btn btn-secondary btn-sm" @click="notices = false">关闭</button></div>
          <p v-if="workflow.error" role="alert">{{ workflow.error }}</p>
          <template v-if="auth.portal === 'doctor' && workflow.pending.length">
            <RouterLink v-for="item in workflow.pending.slice(0, 5)" :key="item.image_id" :to="{path:'/doctor/patients/' + item.patient_id + '/imaging',query:{exam:item.image_id}}" @click="notices = false"><strong>{{ item.patient_name }} · {{ item.image_type }}</strong><small>影像待确认 · {{ item.created_at.slice(0,10) }}</small></RouterLink>
            <RouterLink to="/doctor/dashboard" @click="notices = false">查看全部 {{ workflow.pending.length }} 项待办</RouterLink>
          </template>
          <p v-else>当前没有待处理通知</p>
        </div>
      </div>
      <RouterLink class="topbar-profile" :to="'/' + auth.portal + '/profile'" aria-label="打开个人资料">
        <span class="profile-avatar"><img v-if="profile.data?.avatar_url" :src="profile.data.avatar_url" alt="头像" /><template v-else>{{ initials }}</template></span>
        <span class="profile-copy">
          <strong>{{ displayName }}</strong>
          <small>{{ auth.portal === 'doctor' ? 'Doctor' : 'Patient' }}</small>
        </span>
      </RouterLink>
    </div>
  </header>
  <p v-if="profileError" role="alert">{{ profileError }}</p>
</template>

<style scoped>
.profile-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover}.notification-wrap{position:relative}.notice-panel{position:absolute;right:0;top:46px;width:330px;padding:18px;background:white;border:1px solid var(--border);border-radius:12px;box-shadow:0 18px 50px #12332f25}.notice-panel>a{display:grid;gap:6px;padding:12px 0;border-bottom:1px solid var(--border);font-size:12px}.notice-panel small,.notice-panel p{color:var(--text-muted);font-size:11px}.notice-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:6px;font-size:13px}@media(max-width:600px){.notice-panel{position:fixed;right:16px;top:72px;width:calc(100vw - 32px)}}

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
