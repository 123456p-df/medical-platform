<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Check, FileLock2, Plus, Trash2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api/client'
import { organNames } from '@/api/mappers'
import ReportCard from '@/components/medical/ReportCard.vue'
import type { Report } from '@/types'
import { t } from '@/i18n'

const store = usePatientStore()
const auth = useAuthStore()
const selected = ref(store.reports[0]?.id || '')
const current = computed(() => store.reports.find(report => report.id === selected.value))
const today = () => new Date().toISOString().slice(0, 10)
const form = reactive({
  organs: ['other'] as string[],
  examinationId: '',
  diagnosis: '',
  description: '',
  recommendation: '',
  date: today(),
  reviewed: true,
})
const error = ref('')
const savedMessage = ref('')
const busy = ref(false)

function hydrate(report?: Report) {
  form.organs = report?.organIds?.length ? [...report.organIds] : [report?.organId || 'other']
  form.examinationId = report?.examinationId || store.activeExamId || store.examinations[0]?.id || ''
  form.diagnosis = report?.diagnosis || ''
  form.description = report?.description || ''
  form.recommendation = report?.recommendation || ''
  form.date = report?.date || today()
  form.reviewed = report?.reviewed ?? true
  savedMessage.value = ''
  error.value = ''
}

watch(current, report => hydrate(report), { immediate: true })

const previewReport = computed<Report>(() => ({
  id: selected.value,
  patientId: store.selectedPatientId || '',
  organId: form.organs[0] || 'other',
  organIds: [...form.organs],
  examinationId: form.examinationId,
  diagnosis: form.diagnosis || '—',
  description: form.description || '—',
  recommendation: form.recommendation,
  doctor: current.value?.doctor || auth.session?.name || auth.session?.username || '',
  date: form.date,
  reviewed: form.reviewed,
}))

function newRecord() {
  selected.value = ''
  hydrate()
}

async function save(){
  if (!store.selectedPatientId || !form.organs.length) return
  busy.value = true
  error.value = ''
  savedMessage.value = ''
  try {
    const result = await store.saveReport({
      ...previewReport.value,
      id: selected.value,
      patientId: store.selectedPatientId,
    })
    await store.loadReports(store.selectedPatientId)
    selected.value = result.id
    await nextTick()
    savedMessage.value = result.reviewed
      ? 'The report was saved and is visible in the patient portal.'
      : 'The draft was saved. Patients cannot see it until it is signed.'
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Save failed.'
  } finally {
    busy.value = false
  }
}
async function remove(){
  if (!selected.value || !store.selectedPatientId) return
  if (!window.confirm(t('Delete this report? Its audit history and document revisions will be retained.'))) return
  try {
    await api('/medical-records/' + selected.value, { method: 'DELETE' })
    await store.loadReports(store.selectedPatientId)
    newRecord()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Delete failed.'
  }
}
</script>
<template>
  <div class="record-layout">
    <section class="card">
      <div class="card-header"><h3>{{ $t('Medical record') }}</h3><button class="btn btn-secondary btn-sm" @click="newRecord"><Plus :size="15"/> {{ $t('New record') }}</button></div>
      <form class="card-body record-form" @submit.prevent="save">
        <label class="label">{{ $t('History') }}<select v-model="selected" class="select"><option value="">{{ $t('New record') }}</option><option v-for="report in store.reports" :key="report.id" :value="report.id">{{ report.date }} · {{ $t(report.reviewed ? 'Signed' : 'Draft') }} · {{ report.diagnosis }}</option></select></label>
        <div class="record-row">
          <label class="label">{{ $t('Report examination') }}
            <select v-model="form.examinationId" class="select">
              <option value="">{{ $t('Unspecified') }}</option>
              <option v-for="exam in store.examinations" :key="exam.id" :value="exam.id">{{ exam.date }} · {{ exam.type }} · {{ $t(exam.organ) }}</option>
            </select>
          </label>
          <label class="label">{{ $t('Record date') }}<input v-model="form.date" class="input" type="date" required /></label>
        </div>
        <fieldset class="organ-picker"><legend>{{ $t('Related organs (select one or more)') }}</legend><label v-for="(name,id) in organNames" :key="id"><input v-model="form.organs" type="checkbox" :value="id" />{{ $t(name) }}</label><p>{{ $t('Select every related organ. Use Other for systemic or unclassified findings.') }}</p></fieldset>
        <label class="label" for="diagnosis">{{ $t('Diagnosis / summary') }}</label><textarea id="diagnosis" v-model="form.diagnosis" class="textarea" maxlength="10000" required />
        <label class="label" for="description">{{ $t('Description') }}</label><textarea id="description" v-model="form.description" class="textarea" maxlength="30000" required />
        <label class="label" for="recommendation">{{ $t('Recommendation') }}</label><textarea id="recommendation" v-model="form.recommendation" class="textarea" maxlength="10000" />
        <fieldset class="visibility-fieldset">
          <legend>{{ $t('Report visibility') }}</legend>
          <label><input v-model="form.reviewed" type="checkbox" /><FileLock2 :size="16" />{{ $t('Visible to patient after signing') }}</label>
          <small>{{ $t(form.reviewed ? 'The patient sees this report after you sign it.' : 'Keep as doctor draft') }}</small>
        </fieldset>
        <p v-if="error" class="error" role="alert">{{ $t(error) }}</p><p v-if="savedMessage" class="saved" role="status">{{ $t(savedMessage) }}</p>
        <div class="record-actions"><button class="btn btn-primary" :disabled="busy || !form.organs.length"><Check :size="16"/> {{ $t(busy ? 'Saving...' : 'Save medical record') }}</button><button v-if="selected" type="button" class="btn btn-secondary" @click="remove"><Trash2 :size="16"/> {{ $t('Soft delete') }}</button></div>
      </form>
    </section>
    <aside><h3>{{ $t('Saved record') }}</h3><ReportCard :report="previewReport"/><p class="muted note">{{ $t('Reports are indexed in the database and loaded from the patient report folder.') }}</p></aside>
  </div>
</template>
<style scoped>
.organ-picker{grid-column:1/-1;border:1px solid var(--border);border-radius:8px;padding:14px;display:flex;flex-wrap:wrap;gap:12px}.organ-picker legend{font-size:12px;padding:0 5px}.organ-picker label{display:flex;align-items:center;gap:5px;font-size:12px}.organ-picker input{accent-color:var(--accent)}.organ-picker p{font-size:11px;color:var(--text-muted);margin:0;width:100%}
.visibility-fieldset{border:1px solid var(--border);border-radius:8px;padding:12px 14px}.visibility-fieldset legend{padding:0 5px;font-size:12px}.visibility-fieldset label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700}.visibility-fieldset input{accent-color:var(--accent)}.visibility-fieldset small{display:block;margin:7px 0 0 24px;color:var(--text-muted)}

.record-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:20px;align-items:start}.record-form{display:grid;gap:12px}.record-form .label{display:grid;gap:8px}.record-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.record-actions{display:flex;gap:10px;flex-wrap:wrap}.error{color:#a24e50}.saved{color:#277b64}.note{font-size:12px;margin-top:18px}aside>h3{margin:0 0 14px}
@media(max-width:1000px){.record-layout{grid-template-columns:1fr}}
</style>
