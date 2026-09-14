<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Archive } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { useWorkflowStore } from '@/stores/workflow'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
const props = withDefaults(
  defineProps<{ id: string; name: string; stay?: boolean; compact?: boolean }>(),
  { stay: false, compact: false },
)
const emit = defineEmits<{ removed: [id: string] }>()
const router = useRouter(), store = usePatientStore(), workflow = useWorkflowStore(), auth = useAuthStore()
const dialog = ref<HTMLDialogElement>(), busy = ref(false), error = ref(''), reason = ref('')
const isAdmin = computed(() => auth.session?.accountRole === 'admin')
async function remove() {
  busy.value = true; error.value = ''
  try {
    if (isAdmin.value) await store.archivePatientGlobally(props.id, reason.value.trim())
    else await store.removePatientAccess(props.id)
    dialog.value?.close(); await workflow.load(); emit('removed', props.id)
    if (!props.stay) await router.push('/doctor/patients')
  } catch (e) { error.value = e instanceof Error ? e.message : t('ui.patientDialog.archiveFailed') }
  finally { busy.value = false }
}
</script>
<template>
  <button
    type="button"
    :class="['btn', 'btn-secondary', 'btn-sm', 'patient-delete-trigger', { 'is-compact': compact }]"
    :aria-label="$t(isAdmin ? 'ui.patientDialog.archivePatient' : 'ui.patientDialog.removePatient', { name })"
    :title="compact ? $t(isAdmin ? 'ui.patientDialog.archivePatient' : 'ui.patientDialog.removePatient', { name }) : undefined"
    @click.stop="error = ''; reason = ''; dialog?.showModal()"
  >
    <Archive :size="14" />
    <span v-if="!compact">{{ $t(isAdmin ? 'ui.patientDialog.archiveShort' : 'ui.patientDialog.removeShort') }}</span>
  </button>
  <dialog
    ref="dialog"
    class="delete-dialog"
    :aria-labelledby="`delete-title-${id}`"
    @click.stop
    @cancel="busy && $event.preventDefault()"
  >
    <h2 :id="`delete-title-${id}`">{{ $t(isAdmin ? 'ui.patientDialog.archiveConfirmTitle' : 'ui.patientDialog.removeConfirmTitle') }}</h2>
    <template v-if="isAdmin">
      <p>{{ $t('ui.patientDialog.archiveBody', { name, id }) }}</p>
      <label class="archive-reason"><span>{{ $t('ui.patientDialog.archiveReason') }}</span><textarea v-model="reason" data-testid="archive-reason" class="input" minlength="3" maxlength="500" rows="3" required /></label>
      <p class="muted">{{ $t('ui.patientDialog.archiveRetention') }}</p>
    </template>
    <p v-else>{{ $t('ui.patientDialog.removeBody', { name }) }}</p>
    <p v-if="error" role="alert">{{ error }}</p><footer><button class="btn btn-secondary" :disabled="busy" @click="dialog?.close()">{{ $t('Cancel') }}</button><button class="btn danger" :disabled="busy || (isAdmin && reason.trim().length < 3)" @click="remove">{{ $t(busy ? 'ui.patientDialog.processing' : isAdmin ? 'ui.patientDialog.confirmArchive' : 'ui.patientDialog.confirmRemove') }}</button></footer>
  </dialog>
</template>
<style scoped>
.delete-dialog{border:1px solid var(--border);border-radius:14px;padding:28px;width:min(480px,calc(100vw - 32px));color:var(--text)}.delete-dialog::backdrop{background:#10283270}.delete-dialog p{font-size:13px;line-height:1.8}.archive-reason{display:grid;gap:7px;margin:14px 0;color:var(--text-soft);font-size:12px;font-weight:680}.archive-reason textarea{min-height:88px;resize:vertical}footer{display:flex;gap:12px;justify-content:flex-end;margin-top:22px}.danger{background:#a3444b;color:white}
.patient-delete-trigger.is-compact{width:32px;min-width:32px;padding:0;color:var(--text-muted)}
.patient-delete-trigger.is-compact:hover{border-color:#dfb7ba;background:#fff5f5;color:#a3444b}
</style>
