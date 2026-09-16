<script setup lang="ts">
import { ArrowRight, HeartPulse, ShieldCheck, Stethoscope, Activity, UserPlus } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { localPreview } from '@/utils/runtime'
import type { PortalRole } from '@/types'
import { ApiError } from '@/api/client'
import { t } from '@/i18n'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const REMEMBERED_USERNAME_KEY = 'pulmolink-remembered-username'
const mode = ref<'login' | 'signup'>('login')
const username = ref(localStorage.getItem(REMEMBERED_USERNAME_KEY) || '')
const password = ref('')
const confirmPassword = ref('')
const role = ref<PortalRole>('patient')
const remember = ref(true)
const busy = ref(false)
const error = ref('')
const fieldErrors = reactive({ username: '', password: '', confirmPassword: '' })
const preview = localPreview || import.meta.env.VITE_PREVIEW === 'true'
type PreviewAccount = 'admin' | 'doctor' | 'patient'

function switchMode(next: 'login' | 'signup') {
  mode.value = next
  password.value = ''
  confirmPassword.value = ''
  error.value = ''
  Object.assign(fieldErrors, { username: '', password: '', confirmPassword: '' })
}

async function submit(previewAccount?: PreviewAccount) {
  if (busy.value) return
  if (previewAccount) {
    mode.value = 'login'
    const credentials = {
      admin: ['admin', '123456'],
      doctor: ['demo_doctor', '123456'],
      patient: ['demo_patient', '123456'],
    } as const
    ;[username.value, password.value] = credentials[previewAccount]
  }
  busy.value = true
  error.value = ''
  Object.assign(fieldErrors, { username: '', password: '', confirmPassword: '' })
  try {
    if (!/^[\w.-]{3,64}$/.test(username.value.trim())) fieldErrors.username = t('ui.login.error.username')
    const minimumPasswordLength = mode.value === 'signup' ? 8 : 6
    if (password.value.length < minimumPasswordLength || password.value.length > 128) fieldErrors.password = t('ui.login.error.password')
    if (mode.value === 'signup' && password.value !== confirmPassword.value) {
      fieldErrors.confirmPassword = t('ui.login.error.confirm')
    }
    if (Object.values(fieldErrors).some(Boolean)) return
    const destinationRole = mode.value === 'signup'
      ? await auth.register(username.value, password.value, role.value, remember.value)
      : await auth.login(username.value, password.value, remember.value)
    if (remember.value) localStorage.setItem(REMEMBERED_USERNAME_KEY, username.value.trim())
    else localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const portalPrefix = destinationRole === 'doctor' ? '/doctor/' : '/patient/'
    const destination = redirect.startsWith(portalPrefix) && !redirect.startsWith('//')
      ? redirect
      : destinationRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
    await router.push(destination)
  } catch (reason) {
    if (reason instanceof ApiError && reason.details.fieldErrors) {
      fieldErrors.username = reason.details.fieldErrors.username || ''
      fieldErrors.password = reason.details.fieldErrors.password || ''
      fieldErrors.confirmPassword = reason.details.fieldErrors.confirm_password || ''
    }
    error.value = reason instanceof Error ? reason.message : t('ui.login.error.failed')
  }
  finally { busy.value = false }
}
</script>

<template>
  <main class="login-page">
    <section class="login-brand">
      <div class="brand-lockup">
        <span class="brand-symbol"><Activity :size="23" /></span>
        <span>
          <strong>PulmoLink</strong>
          <small>{{ $t('Medical AI Platform') }}</small>
        </span>
      </div>
      <div class="brand-message">
        <span class="kicker">{{ $t('AI Medical Imaging & Digital Human') }}</span>
        <h1>{{ $t('Connecting imaging, AI findings, and clinical review.') }}</h1>
        <p>
          {{ $t('A clinical workspace for doctors and a calm digital health portal for patients, starting with the lung workflow.') }}
        </p>
      </div>
      <div class="brand-notes">
        <span><HeartPulse :size="17" /> {{ $t('Doctor-reviewed workflow') }}</span>
        <span><Stethoscope :size="17" /> {{ $t('Lung-first clinical module') }}</span>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-heading">
        <span class="kicker">{{ $t('ui.login.account') }}</span>
        <h2>{{ $t(mode === 'login' ? 'ui.login.title.signin' : 'ui.login.title.signup') }}</h2>
        <p>{{ $t(mode === 'login' ? 'ui.login.subtitle.signin' : 'ui.login.subtitle.signup') }}</p>
      </div>

      <div class="auth-switch" :aria-label="$t('ui.login.action')">
        <button type="button" :class="{ active: mode === 'login' }" @click="switchMode('login')">{{ $t('ui.login.signin') }}</button>
        <button type="button" :class="{ active: mode === 'signup' }" @click="switchMode('signup')">{{ $t('ui.login.signup') }}</button>
      </div>

      <form class="login-form" @submit.prevent="submit()">
        <label class="label" for="username">{{ $t('ui.login.username') }}</label>
        <input id="username" v-model="username" class="input" autocomplete="username" :aria-invalid="Boolean(fieldErrors.username)" aria-describedby="username-error" required />
        <small v-if="fieldErrors.username" id="username-error" class="field-error">{{ fieldErrors.username }}</small>
        <p v-if="mode === 'signup'" class="signup-role"><strong>{{ $t('ui.login.patientAccount') }}</strong><span>{{ $t('ui.login.doctorProvisioning') }}</span></p>
        <label class="label" for="password">{{ $t('ui.login.password') }}</label>
        <input id="password" v-model="password" class="input" type="password" :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'" :aria-invalid="Boolean(fieldErrors.password)" aria-describedby="password-error" :minlength="mode === 'signup' ? 8 : 6" required />
        <small v-if="fieldErrors.password" id="password-error" class="field-error">{{ fieldErrors.password }}</small>
        <template v-if="mode === 'signup'">
          <label class="label" for="confirm-password">{{ $t('ui.login.confirmPassword') }}</label>
          <input id="confirm-password" v-model="confirmPassword" class="input" type="password" autocomplete="new-password" :aria-invalid="Boolean(fieldErrors.confirmPassword)" aria-describedby="confirm-password-error" minlength="8" required />
          <small v-if="fieldErrors.confirmPassword" id="confirm-password-error" class="field-error">{{ fieldErrors.confirmPassword }}</small>
        </template>
        <label class="remember-row">
          <input v-model="remember" type="checkbox" />
          <span>{{ $t('ui.login.remember') }}</span>
        </label>
        <p v-if="error" role="alert" class="login-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="busy">
          <UserPlus v-if="mode === 'signup'" :size="16" />
          {{ $t(busy ? 'ui.login.wait' : mode === 'login' ? 'ui.login.signin' : 'ui.login.create') }}
        </button>
      </form>
      <div v-if="preview && mode === 'login'" class="role-options">
        <button class="role-card admin" type="button" @click="submit('admin')">
          <span class="role-icon"><ShieldCheck :size="24" /></span>
          <span class="role-copy">
            <strong>{{ $t('ui.login.admin') }}</strong>
            <small>{{ $t('ui.login.previewAdmin') }}</small>
          </span>
          <ArrowRight :size="19" />
        </button>
        <button class="role-card doctor" type="button" @click="submit('doctor')">
          <span class="role-icon"><Stethoscope :size="24" /></span>
          <span class="role-copy">
            <strong>{{ $t('Doctor Portal') }}</strong>
            <small>{{ $t('Clinical review, imaging, AI findings, and reporting.') }}</small>
          </span>
          <ArrowRight :size="19" />
        </button>
        <button class="role-card patient" type="button" @click="submit('patient')">
          <span class="role-icon"><HeartPulse :size="24" /></span>
          <span class="role-copy">
            <strong>{{ $t('Patient Portal') }}</strong>
            <small>{{ $t('Your health, examinations, reports, and body.') }}</small>
          </span>
          <ArrowRight :size="19" />
        </button>
      </div>

      <div class="login-footnote">
        {{ $t(preview && mode === 'login' ? 'ui.login.previewFootnote' : 'ui.login.serverFootnote') }}
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-form { display: grid; gap: 10px; margin-bottom: 24px; }
.login-error { color: #aa4f55; font-size: 13px; }
.field-error { margin-top: -5px; color: #aa4f55; font-size: 11px; }
.signup-role { display: grid; gap: 4px; margin: 2px 0; padding: 10px 12px; border-radius: 8px; background: #edf5f3; color: var(--accent-strong); font-size: 12px; }
.signup-role span { color: var(--text-muted); font-size: 11px; }
.auth-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 22px;
  padding: 4px;
  border-radius: 9px;
  background: #f1f6f5;
}
.auth-switch button {
  padding: 10px 14px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  font-weight: 700;
}
.auth-switch button.active {
  background: #ffffff;
  color: var(--accent-strong);
  box-shadow: 0 2px 8px rgb(31 67 69 / 10%);
}
.remember-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 3px 0 2px;
  color: var(--text-soft);
  font-size: 13px;
}
.remember-row input { width: 15px; height: 15px; accent-color: var(--accent); }
.login-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.7fr);
  background: #f6faf9;
}

.login-brand {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 46px 8vw;
  background:
    linear-gradient(145deg, rgb(31 93 96 / 96%), rgb(37 115 118 / 90%)),
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 14%), transparent 28rem);
  color: #ffffff;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-symbol {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 9px;
  background: rgb(255 255 255 / 10%);
}

.brand-lockup span:last-child {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-lockup strong {
  font-size: 17px;
}

.brand-lockup small {
  color: rgb(255 255 255 / 68%);
  font-size: 11px;
}

.brand-message {
  max-width: 630px;
}

.kicker {
  color: #d8f2f0;
  font-size: 11px;
  font-weight: 760;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.brand-message h1 {
  max-width: 600px;
  margin: 16px 0 18px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.02;
  letter-spacing: 0;
}

.brand-message p {
  max-width: 530px;
  margin: 0;
  color: rgb(255 255 255 / 76%);
  font-size: 16px;
}

.brand-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  color: rgb(255 255 255 / 78%);
  font-size: 13px;
}

.brand-notes span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px clamp(28px, 6vw, 86px);
  background: #ffffff;
}

.login-heading {
  margin-bottom: 30px;
}

.login-heading .kicker {
  color: var(--accent-strong);
}

.login-heading h2 {
  margin: 10px 0 7px;
  color: var(--text);
  font-size: 28px;
  letter-spacing: 0;
}

.login-heading p {
  margin: 0;
  color: var(--text-muted);
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-card {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
  color: var(--text);
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.role-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.role-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 9px;
}

.role-card.doctor .role-icon {
  background: #e3f3f3;
  color: #277b7f;
}

.role-card.admin .role-icon {
  background: #e8eef9;
  color: #315d9b;
}

.role-card.patient .role-icon {
  background: #e8eef9;
  color: #4c72ae;
}

.role-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.35;
}

.role-copy strong {
  font-size: 15px;
}

.role-copy small {
  color: var(--text-muted);
  font-size: 12px;
}

.role-card > svg {
  color: var(--text-muted);
}

.login-footnote {
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 11px;
}

@media (max-width: 880px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-brand {
    min-height: 340px;
    padding: 32px 24px;
  }

  .brand-notes {
    margin-top: 30px;
  }

  .login-panel {
    min-height: 520px;
    padding: 38px 24px;
  }
}
</style>
