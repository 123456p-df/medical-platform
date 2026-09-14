<script setup lang="ts">
import { ref } from 'vue'
import { KeyRound, Copy, Check } from 'lucide-vue-next'
import { patientApi } from '@/api/patients'
import { localPreview } from '@/utils/runtime'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { t } from '@/i18n'

const props = withDefaults(
  defineProps<{ id: string; name: string; idNumber?: string; compact?: boolean }>(),
  { idNumber: '', compact: false },
)

const dialog = ref<InstanceType<typeof AppDialog>>()
const busy = ref(false)
const error = ref('')
const code = ref('')
const copied = ref(false)

function previewCode() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
}

async function create() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  code.value = ''
  try {
    if (localPreview) {
      if (!props.idNumber) throw new Error(t('ui.invitation.missingIdentity'))
      code.value = previewCode()
      const key = 'pulmolink-preview-invitations'
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as Array<{
        code: string; patientId: string; name: string; idNumber: string; expiresAt: string
      }>
      existing.push({
        code: code.value,
        patientId: props.id,
        name: props.name,
        idNumber: props.idNumber,
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      })
      localStorage.setItem(key, JSON.stringify(existing))
    } else {
      const result = await patientApi.createInvitation(props.id)
      code.value = result.code
    }
    dialog.value?.open()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.invitation.createFailed')
  } finally {
    busy.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(code.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}
</script>

<template>
  <button
    type="button"
    :class="['btn', 'btn-secondary', 'btn-sm', { 'is-compact': compact }]"
    :aria-label="$t('ui.invitation.generate', { name })"
    :title="compact ? $t('ui.invitation.generate', { name }) : undefined"
    :disabled="busy"
    @click.stop="create"
  >
    <KeyRound :size="14" />
    <span v-if="!compact">{{ busy ? $t('ui.invitation.generating') : $t('ui.invitation.generateShort') }}</span>
  </button>
  <AppDialog ref="dialog" :title="$t('ui.invitation.title')">
    <p>{{ $t('ui.invitation.body', { name }) }}</p>
    <div v-if="code" class="invite-code">
      <code>{{ code }}</code>
      <button type="button" class="btn btn-secondary btn-sm" :aria-label="$t(copied ? 'ui.invitation.copied' : 'ui.invitation.copy')" @click="copyCode">
        <Check v-if="copied" :size="14" /><Copy v-else :size="14" />
      </button>
    </div>
    <p class="muted">{{ $t('ui.invitation.expiry') }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <footer><AppButton kind="primary" @click="dialog?.close()">{{ $t('ui.invitation.close') }}</AppButton></footer>
  </AppDialog>
</template>

<style scoped>
.app-dialog :deep(p) {
  font-size: 13px;
  line-height: 1.7;
}

footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.invite-code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f7fbfb;
}

.invite-code code {
  overflow-wrap: anywhere;
  color: #1f5d60;
  font-size: 12px;
}

.is-compact {
  width: 32px;
  min-width: 32px;
  padding: 0;
}
</style>
