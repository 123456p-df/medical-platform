<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Link2, UserPlus } from 'lucide-vue-next'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { localPreview } from '@/utils/runtime'
import { ApiError } from '@/api/client'
import { t } from '@/i18n'

type Mode = 'create' | 'link'

interface PreviewInvitation {
  code: string
  patientId: string
  name: string
  idNumber: string
  expiresAt: string
}

const router = useRouter()
const auth = useAuthStore()
const patients = usePatientStore()
const mode = ref<Mode>('create')
const busy = ref(false)
const error = ref('')
const fieldError = ref('')
const form = reactive({
  name: '',
  id_number: '',
  birth_date: '',
  gender: 'unknown',
  height: '',
  weight: '',
  abo: '',
  rh: '',
  token: '',
})

const ready = computed(() => {
  if (mode.value === 'link') {
    return form.token.trim().length >= 32 && form.name.trim().length > 0 && form.id_number.trim().length >= 6
  }
  return form.name.trim().length > 0 && form.id_number.trim().length >= 6
})

function scopeKey() {
  return 'pulmolink-preview-invitations'
}

function linkInPreview() {
  let invitations: PreviewInvitation[] = []
  try {
    invitations = JSON.parse(localStorage.getItem(scopeKey()) || '[]')
  } catch {
    invitations = []
  }
  const invitation = invitations.find(item => item.code === form.token.trim())
  if (!invitation) throw new Error(t('ui.onboarding.invalidInvite'))
  if (new Date(invitation.expiresAt).getTime() <= Date.now()) throw new Error(t('ui.onboarding.expiredInvite'))
  if (
    invitation.name !== form.name.trim()
    || invitation.idNumber.toUpperCase() !== form.id_number.trim().toUpperCase()
  ) {
    throw new Error(t('ui.onboarding.identityMismatch'))
  }
  localStorage.setItem(scopeKey(), JSON.stringify(invitations.filter(item => item.code !== invitation.code)))
  return invitation.patientId
}

async function submit() {
  if (busy.value || !ready.value) return
  busy.value = true
  error.value = ''
  fieldError.value = ''
  try {
    if (mode.value === 'create') {
      const draft = {
        name: form.name.trim(),
        id_number: form.id_number.trim(),
        birth_date: form.birth_date || null,
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        blood_type: form.abo ? form.abo + form.rh : null,
      }
      if (localPreview) {
        const patientId = await patients.createPatient(draft)
        auth.markProfileComplete(patientId)
      } else {
        const result = await api<{ patient_id: number }>('/patient/onboarding', {
          method: 'PATCH',
          body: JSON.stringify(draft),
        })
        auth.markProfileComplete(String(result.patient_id))
      }
    } else {
      if (localPreview) {
        const patientId = linkInPreview()
        auth.markProfileComplete(patientId)
      } else {
        const result = await api<{ patient_id: number }>('/patient/link', {
          method: 'POST',
          body: JSON.stringify({
            token: form.token.trim(),
            name: form.name.trim(),
            id_number: form.id_number.trim(),
          }),
        })
        auth.markProfileComplete(String(result.patient_id))
      }
    }
    await router.replace({ name: 'patient-dashboard' })
  } catch (reason) {
    if (reason instanceof ApiError && reason.details.fieldErrors) {
      fieldError.value = Object.values(reason.details.fieldErrors)[0] || ''
    }
    error.value = reason instanceof Error ? reason.message : t('ui.onboarding.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="onboarding-page">
    <section class="onboarding-intro">
      <span class="kicker">{{ $t('ui.onboarding.eyebrow') }}</span>
      <h1>{{ $t('ui.onboarding.title') }}</h1>
      <p>{{ $t('ui.onboarding.subtitle') }}</p>
      <div class="onboarding-modes" role="tablist" :aria-label="$t('ui.onboarding.modeLabel')">
        <button type="button" role="tab" :aria-selected="mode === 'create'" :class="{ active: mode === 'create' }" @click="mode = 'create'">
          <UserPlus :size="18" /><span>{{ $t('ui.onboarding.createTab') }}</span>
        </button>
        <button type="button" role="tab" :aria-selected="mode === 'link'" :class="{ active: mode === 'link' }" @click="mode = 'link'">
          <Link2 :size="18" /><span>{{ $t('ui.onboarding.linkTab') }}</span>
        </button>
      </div>
    </section>

    <form class="onboarding-form" @submit.prevent="submit">
      <template v-if="mode === 'create'">
        <p class="muted">{{ $t('ui.onboarding.createHelp') }}</p>
        <div class="fields">
          <label><span>{{ $t('Name') }} *</span><input v-model="form.name" data-testid="onboarding-name" class="input" autofocus maxlength="100" required /></label>
          <label><span>{{ $t('ui.onboarding.identity') }} *</span><input v-model="form.id_number" data-testid="onboarding-id" class="input" minlength="6" maxlength="32" autocomplete="off" required /></label>
          <label><span>{{ $t('ui.onboarding.birthDate') }}</span><input v-model="form.birth_date" class="input" type="date" min="1850-01-01" :max="new Date().toLocaleDateString('sv-SE')" /></label>
          <label><span>{{ $t('Gender') }}</span><select v-model="form.gender" class="select"><option value="unknown">{{ $t('Unknown') }}</option><option value="male">{{ $t('Male') }}</option><option value="female">{{ $t('Female') }}</option></select></label>
          <label><span>{{ $t('ui.onboarding.height') }}</span><input v-model="form.height" class="input" type="number" min="1" max="300" step="0.1" /></label>
          <label><span>{{ $t('ui.onboarding.weight') }}</span><input v-model="form.weight" class="input" type="number" min="0.1" max="700" step="0.1" /></label>
          <label><span>{{ $t('ABO blood type') }}</span><select v-model="form.abo" class="select"><option value="">{{ $t('Unknown') }}</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></label>
          <label><span>Rh(D)</span><select v-model="form.rh" class="select" :disabled="!form.abo"><option value="">{{ $t('Unknown') }}</option><option value="+">{{ $t('Positive') }}</option><option value="-">{{ $t('Negative') }}</option></select></label>
        </div>
      </template>
      <template v-else>
        <p class="muted">{{ $t('ui.onboarding.linkHelp') }}</p>
        <label><span>{{ $t('ui.onboarding.inviteCode') }} *</span><input v-model="form.token" data-testid="onboarding-token" class="input mono" autocomplete="off" minlength="32" maxlength="128" required /></label>
        <label><span>{{ $t('Name') }} *</span><input v-model="form.name" data-testid="onboarding-link-name" class="input" maxlength="100" required /></label>
        <label><span>{{ $t('ui.onboarding.identity') }} *</span><input v-model="form.id_number" data-testid="onboarding-link-id" class="input" minlength="6" maxlength="32" autocomplete="off" required /></label>
      </template>
      <p v-if="fieldError" class="field-error" role="alert">{{ fieldError }}</p>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <footer>
        <button type="submit" class="btn btn-primary" :disabled="busy || !ready">
          <UserPlus v-if="mode === 'create'" :size="16" /><Link2 v-else :size="16" />
          {{ $t(busy ? 'ui.onboarding.processing' : mode === 'create' ? 'ui.onboarding.complete' : 'ui.onboarding.connect') }}
        </button>
      </footer>
    </form>
  </main>
</template>

<style scoped>
.onboarding-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(320px, 0.8fr) minmax(420px, 0.7fr);
  background: #f6faf9;
}

.onboarding-intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 8vw;
  background: linear-gradient(145deg, #1f5d60, #257376);
  color: #fff;
}

.onboarding-intro h1 {
  margin: 12px 0;
  font-size: clamp(32px, 4vw, 50px);
  letter-spacing: 0;
}

.onboarding-intro p {
  max-width: 520px;
  color: rgb(255 255 255 / 78%);
  font-size: 15px;
  line-height: 1.7;
}

.kicker {
  color: #d8f2f0;
  font-size: 11px;
  font-weight: 760;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.onboarding-modes {
  display: grid;
  max-width: 520px;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 28px;
}

.onboarding-modes button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 14px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 8px;
  background: rgb(255 255 255 / 8%);
  color: #fff;
}

.onboarding-modes button.active {
  background: #fff;
  color: #1f5d60;
}

.onboarding-form {
  align-self: center;
  display: grid;
  gap: 20px;
  margin: 48px;
  padding: 34px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 24px 70px #102d3420;
}

.onboarding-form label {
  display: grid;
  gap: 8px;
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 680;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.onboarding-form footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.error-message {
  margin: 0;
  color: #a24e50;
}

.field-error {
  margin: -10px 0 0;
  color: #a24e50;
}

@media (max-width: 820px) {
  .onboarding-page {
    grid-template-columns: 1fr;
  }
  .onboarding-intro {
    min-height: 320px;
  }
  .onboarding-form {
    margin: 22px;
  }
}

@media (max-width: 500px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
