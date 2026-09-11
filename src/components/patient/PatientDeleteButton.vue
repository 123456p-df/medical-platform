<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { useWorkflowStore } from '@/stores/workflow'
const props = withDefaults(
  defineProps<{ id: string; name: string; stay?: boolean; compact?: boolean }>(),
  { stay: false, compact: false },
)
const emit = defineEmits<{ removed: [id: string] }>()
const router = useRouter(), store = usePatientStore(), workflow = useWorkflowStore()
const dialog = ref<HTMLDialogElement>(), busy = ref(false), error = ref('')
async function remove() {
  busy.value = true; error.value = ''
  try {
    await store.archivePatient(props.id)
    dialog.value?.close(); await workflow.load(); emit('removed', props.id)
    if (!props.stay) await router.push('/doctor/patients')
  } catch (e) { error.value = e instanceof Error ? e.message : 'Delete failed.' }
  finally { busy.value = false }
}
</script>
<template>
  <button
    type="button"
    :class="['btn', 'btn-secondary', 'btn-sm', 'patient-delete-trigger', { 'is-compact': compact }]"
    :aria-label="$t('Delete patient {name}', { name })"
    :title="compact ? $t('Delete patient {name}', { name }) : undefined"
    @click.stop="error = ''; dialog?.showModal()"
  >
    <Trash2 :size="14" />
    <span v-if="!compact">{{ $t('Delete patient') }}</span>
  </button>
  <dialog
    ref="dialog"
    class="delete-dialog"
    :aria-labelledby="`delete-title-${id}`"
    @click.stop
    @cancel="busy && $event.preventDefault()"
  >
    <h2 :id="`delete-title-${id}`">{{ $t('Delete patient record?') }}</h2><p>{{ $t('Remove {name} (ID {id}) from the patient list and stop access to their records and imaging through this platform.', { name, id }) }}</p><p class="muted">{{ $t('Records, original imaging, and audit history remain archived. Contact the records administrator to restore access.') }}</p>
    <p v-if="error" role="alert">{{ $t(error) }}</p><footer><button class="btn btn-secondary" :disabled="busy" @click="dialog?.close()">{{ $t('Cancel') }}</button><button class="btn danger" :disabled="busy" @click="remove">{{ $t(busy ? 'Deleting…' : 'Confirm delete') }}</button></footer>
  </dialog>
</template>
<style scoped>
.delete-dialog{border:1px solid var(--border);border-radius:14px;padding:28px;width:min(480px,calc(100vw - 32px));color:var(--text)}.delete-dialog::backdrop{background:#10283270}.delete-dialog p{font-size:13px;line-height:1.8}footer{display:flex;gap:12px;justify-content:flex-end;margin-top:22px}.danger{background:#a3444b;color:white}
.patient-delete-trigger.is-compact{width:32px;min-width:32px;padding:0;color:var(--text-muted)}
.patient-delete-trigger.is-compact:hover{border-color:#dfb7ba;background:#fff5f5;color:#a3444b}
</style>
