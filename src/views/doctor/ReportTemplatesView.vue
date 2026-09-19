<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FileText, Plus, Save, RotateCcw } from 'lucide-vue-next'
import { reportTemplatesApi } from '@/api/reportTemplates'
import { DEFAULT_REPORT_TEMPLATES } from '@/data/reportTemplates'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import type { ReportTemplate, ReportTemplateField } from '@/types'

const STORAGE_KEY = 'pulmolink-report-templates-v1'
const templates = ref<ReportTemplate[]>([])
const selectedId = ref('')
const busy = ref(false)
const error = ref('')
const message = ref('')
const name = ref('')
const modality = ref<'CT' | 'MRI' | 'X-Ray' | ''>('')
const organId = ref('')
const fieldsJson = ref('[]')

const selected = computed(() => templates.value.find(item => item.id === selectedId.value) || null)

function readLocalTemplates() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return Array.isArray(parsed) && parsed.length ? parsed as ReportTemplate[] : structuredClone(DEFAULT_REPORT_TEMPLATES)
  } catch {
    return structuredClone(DEFAULT_REPORT_TEMPLATES)
  }
}

function persistLocalTemplates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
}

function fillEditor(template: ReportTemplate | null) {
  name.value = template?.name || ''
  modality.value = template?.modality || ''
  organId.value = template?.organId || ''
  fieldsJson.value = JSON.stringify(template?.fields || [], null, 2)
}

function selectTemplate(id: string) {
  selectedId.value = id
  fillEditor(templates.value.find(item => item.id === id) || null)
  error.value = ''
  message.value = ''
}

function createNewTemplate() {
  const id = `template_local_${Date.now()}`
  const item: ReportTemplate = {
    id,
    name: t('ui.reportTemplates.newTemplateName'),
    modality: 'CT',
    organId: 'lung',
    version: 1,
    isActive: true,
    fields: [],
  }
  templates.value.unshift(item)
  if (localPreview) persistLocalTemplates()
  selectTemplate(id)
}

function parseFields(): ReportTemplateField[] {
  const parsed = JSON.parse(fieldsJson.value)
  if (!Array.isArray(parsed)) throw new Error(t('ui.reportTemplates.invalidJson'))
  return parsed as ReportTemplateField[]
}

async function saveTemplate() {
  if (!name.value.trim() || !fieldsJson.value.trim()) {
    error.value = t('ui.reportTemplates.required')
    return
  }
  let fields: ReportTemplateField[]
  try {
    fields = parseFields()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.invalidFieldsJson')
    return
  }
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const payload = {
      name: name.value.trim(),
      modality: modality.value || null,
      organId: organId.value || null,
      fields,
    }
    if (localPreview) {
      const existing = templates.value.find(item => item.id === selectedId.value)
      if (existing) {
        existing.name = payload.name
        existing.modality = payload.modality
        existing.organId = payload.organId
        existing.fields = fields
        existing.version += 1
      } else {
        const id = `template_local_${Date.now()}`
        templates.value.unshift({ id, ...payload, version: 1, isActive: true })
        selectedId.value = id
      }
      persistLocalTemplates()
    } else if (selectedId.value && templates.value.some(item => item.id === selectedId.value)) {
      const updated = await reportTemplatesApi.update(selectedId.value, payload)
      const index = templates.value.findIndex(item => item.id === updated.id)
      if (index >= 0) templates.value[index] = updated
      fillEditor(updated)
    } else {
      const created = await reportTemplatesApi.create(payload)
      templates.value.unshift(created)
      selectedId.value = created.id
      fillEditor(created)
    }
    message.value = t('ui.reportTemplates.saved')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.saveFailed')
  } finally {
    busy.value = false
  }
}

async function loadTemplates() {
  busy.value = true
  error.value = ''
  try {
    templates.value = localPreview ? readLocalTemplates() : await reportTemplatesApi.list()
    if (templates.value.length) selectTemplate(templates.value[0].id)
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.loadFailed')
  } finally {
    busy.value = false
  }
}

onMounted(loadTemplates)
</script>

<template>
  <div class="template-page">
    <section class="page-header">
      <div>
        <span class="eyebrow">{{ $t('ui.reportTemplates.eyebrow') }}</span>
        <h2><FileText :size="24" /> {{ $t('ui.reportTemplates.title') }}</h2>
        <p>{{ $t('ui.reportTemplates.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" type="button" :disabled="busy" @click="createNewTemplate"><Plus :size="16" /> {{ $t('ui.reportTemplates.newTemplate') }}</button>
    </section>

    <div class="template-layout">
      <aside class="template-list card">
        <button v-for="template in templates" :key="template.id" type="button" class="template-list-item" :class="{ active: template.id === selectedId }" @click="selectTemplate(template.id)">
          <strong>{{ template.name }}</strong>
          <small>{{ template.modality || $t('ui.reportTemplates.anyModality') }} · {{ template.organId || $t('ui.reportTemplates.anyOrgan') }} · v{{ template.version }}</small>
        </button>
        <p v-if="!templates.length">{{ $t('ui.reportTemplates.empty') }}</p>
      </aside>

      <section class="template-editor card">
        <div class="editor-grid">
          <label class="label">{{ $t('ui.reportTemplates.name') }}<input v-model="name" class="input" maxlength="160" :disabled="busy" /></label>
          <label class="label">{{ $t('ui.reportTemplates.modality') }}<select v-model="modality" class="select" :disabled="busy"><option value="">{{ $t('ui.reportTemplates.anyModality') }}</option><option value="CT">CT</option><option value="MRI">MRI</option><option value="X-Ray">X-Ray</option></select></label>
          <label class="label">{{ $t('ui.reportTemplates.organ') }}<input v-model="organId" class="input" maxlength="64" :disabled="busy" :placeholder="$t('ui.reportTemplates.organPlaceholder')" /></label>
        </div>
        <label class="label">{{ $t('ui.reportTemplates.fieldsJson') }}<textarea v-model="fieldsJson" class="textarea mono" rows="18" :disabled="busy" /></label>
        <div class="actions">
          <button class="btn btn-primary" type="button" :disabled="busy" @click="saveTemplate"><Save :size="16" /> {{ $t(busy ? 'ui.reportTemplates.saving' : 'ui.reportTemplates.save') }}</button>
          <button class="btn btn-secondary" type="button" :disabled="busy || !selected" @click="fillEditor(selected)"><RotateCcw :size="16" /> {{ $t('ui.reportTemplates.reset') }}</button>
        </div>
        <p v-if="message" class="success" role="status">{{ message }}</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.template-page{display:grid;gap:18px}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.page-header h2{display:flex;align-items:center;gap:9px;margin:7px 0 4px}.page-header p{margin:0;color:var(--text-muted);font-size:12px}.eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.template-layout{display:grid;grid-template-columns:290px minmax(0,1fr);gap:18px;align-items:start}.template-list{display:grid;gap:6px;padding:10px}.template-list-item{display:grid;gap:5px;padding:12px;border:1px solid transparent;border-radius:8px;background:transparent;text-align:left}.template-list-item.active{background:var(--accent-soft);border-color:#cfe4e0}.template-list-item strong{font-size:13px}.template-list-item small{color:var(--text-muted);font-size:10px}.template-editor{display:grid;gap:18px;padding:22px}.editor-grid{display:grid;grid-template-columns:1fr 150px 180px;gap:14px}.label{display:grid;gap:7px;color:var(--text-soft);font-size:12px}.actions{display:flex;gap:10px}.success{color:var(--green);font-size:12px}.error{color:var(--red);font-size:12px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.55}@media(max-width:900px){.template-layout,.editor-grid{grid-template-columns:1fr}.page-header{align-items:stretch;flex-direction:column}.page-header .btn{width:100%}}
</style>
