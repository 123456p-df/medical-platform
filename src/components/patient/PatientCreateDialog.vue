<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { X, UserPlus, Link2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { t } from '@/i18n'
const emit = defineEmits<{ created: [id: string] }>()
const dialog = ref<HTMLDialogElement>(), busy = ref(false), error = ref('')
const mode = ref<'create' | 'link'>('create')
const initial = () => ({ name: '', id_number: '', birth_date: '', gender: 'unknown', height: '', weight: '', abo: '', rh: '' })
const form = reactive(initial()), store = usePatientStore()
const linkForm = reactive({ name: '', id_number: '', birth_date: '' })
async function open() { Object.assign(form, initial()); Object.assign(linkForm, { name: '', id_number: '', birth_date: '' }); mode.value = 'create'; error.value = ''; await nextTick(); dialog.value?.showModal() }
function close() { if (!busy.value) dialog.value?.close() }
async function save() {
  if (busy.value) return
  busy.value = true; error.value = ''
  try {
    const patientId = mode.value === 'create'
      ? await store.createPatient({
        name: form.name.trim(), id_number: form.id_number.trim(), birth_date: form.birth_date || null, gender: form.gender,
        height: form.height ? Number(form.height) : null, weight: form.weight ? Number(form.weight) : null,
        blood_type: form.abo ? form.abo + form.rh : null,
      })
      : await store.linkExistingPatient({
        name: linkForm.name.trim(),
        id_number: linkForm.id_number.trim(),
        birth_date: linkForm.birth_date || null,
      })
    dialog.value?.close(); emit('created', patientId)
  } catch (e) { error.value = e instanceof Error ? e.message : t('ui.patientDialog.saveFailed') }
  finally { busy.value = false }
}
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="patient-dialog" aria-labelledby="new-patient-title" @cancel="busy && $event.preventDefault()">
    <div class="dialog-heading"><div><span>{{ $t('ui.patientDialog.eyebrow') }}</span><h2 id="new-patient-title">{{ $t('ui.patientDialog.title') }}</h2></div><button class="icon-btn" :aria-label="$t('ui.patientDialog.close')" :disabled="busy" @click="close"><X :size="20" /></button></div>
    <div class="dialog-modes" role="tablist" :aria-label="$t('ui.patientDialog.modeLabel')">
      <button type="button" role="tab" :aria-selected="mode === 'create'" :class="{ active: mode === 'create' }" @click="mode = 'create'"><UserPlus :size="15" />{{ $t('ui.patientDialog.createTab') }}</button>
      <button type="button" role="tab" :aria-selected="mode === 'link'" :class="{ active: mode === 'link' }" @click="mode = 'link'"><Link2 :size="15" />{{ $t('ui.patientDialog.linkTab') }}</button>
    </div>
    <form @submit.prevent="save">
      <p class="muted">{{ $t(mode === 'create' ? 'ui.patientDialog.createHelp' : 'ui.patientDialog.linkHelp') }}</p>
      <div v-if="mode === 'create'" class="fields">
        <label>{{ $t('Name') }} *<input v-model="form.name" data-testid="patient-create-name" class="input" autofocus required maxlength="100" /></label>
        <label>{{ $t('ui.patientDialog.identity') }} *<input v-model="form.id_number" data-testid="patient-create-id" class="input" required minlength="6" maxlength="32" autocomplete="off" /></label>
        <label>{{ $t('ui.patientDialog.birthDate') }}<input v-model="form.birth_date" class="input" type="date" min="1850-01-01" :max="new Date().toLocaleDateString('sv-SE')" /></label>
        <label>{{ $t('Gender') }}<select v-model="form.gender" class="select"><option value="unknown">{{ $t('Unknown') }}</option><option value="male">{{ $t('Male') }}</option><option value="female">{{ $t('Female') }}</option></select></label>
        <label>{{ $t('ui.patientDialog.height') }}<input v-model="form.height" class="input" type="number" min="1" max="300" step="0.1" /></label>
        <label>{{ $t('ui.patientDialog.weight') }}<input v-model="form.weight" class="input" type="number" min="0.1" max="700" step="0.1" /></label>
        <label>{{ $t('ABO blood type') }}<select v-model="form.abo" class="select"><option value="">{{ $t('Unknown') }}</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></label>
        <label>Rh(D)<select v-model="form.rh" class="select" :disabled="!form.abo"><option value="">{{ $t('Unknown') }}</option><option value="+">{{ $t('Positive') }}</option><option value="-">{{ $t('Negative') }}</option></select></label>
      </div>
      <div v-else class="fields">
        <label>{{ $t('Name') }} *<input v-model="linkForm.name" data-testid="patient-link-name" class="input" autofocus required maxlength="100" /></label>
        <label>{{ $t('ui.patientDialog.identity') }} *<input v-model="linkForm.id_number" data-testid="patient-link-id" class="input" required minlength="6" maxlength="32" autocomplete="off" /></label>
        <label>{{ $t('ui.patientDialog.birthDate') }}<input v-model="linkForm.birth_date" class="input" type="date" min="1850-01-01" :max="new Date().toLocaleDateString('sv-SE')" /></label>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <footer><button class="btn btn-secondary" type="button" :disabled="busy" @click="close">{{ $t('Cancel') }}</button><button class="btn btn-primary" :disabled="busy || (mode === 'create' ? !form.name.trim() : !linkForm.name.trim())"><UserPlus v-if="mode === 'create'" :size="16" /><Link2 v-else :size="16" />{{ $t(busy ? 'ui.patientDialog.processing' : mode === 'create' ? 'ui.patientDialog.submitCreate' : 'ui.patientDialog.submitLink') }}</button></footer>
    </form>
  </dialog>
</template>
<style scoped>
.patient-dialog{width:min(600px,calc(100vw - 32px));border:1px solid var(--border);border-radius:16px;padding:28px;color:var(--text);box-shadow:0 28px 90px #102d3440;max-height:90vh;overflow:auto}.patient-dialog::backdrop{background:#10283270;backdrop-filter:blur(3px)}.dialog-heading{display:flex;justify-content:space-between;align-items:center}.dialog-heading span{font-size:10px;letter-spacing:.14em;color:var(--accent)}.dialog-heading h2{margin:5px 0 0}.dialog-modes{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:20px 0 0;padding:4px;border-radius:9px;background:#f1f6f5}.dialog-modes button{display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 10px;border:0;border-radius:7px;background:transparent;color:var(--text-muted);font-weight:700}.dialog-modes button.active{background:#fff;color:var(--accent-strong);box-shadow:0 2px 8px rgb(31 67 69 / 10%)}.patient-dialog form{display:grid;gap:20px}.patient-dialog p{font-size:13px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:18px}.fields label{display:grid;gap:8px;font-size:12px}footer{display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--border);padding-top:20px}.error{color:#b04e51}@media(max-width:500px){.fields{grid-template-columns:1fr}}
</style>
