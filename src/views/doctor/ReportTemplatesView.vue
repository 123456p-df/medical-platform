<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowDown, ArrowUp, FileText, Plus, RotateCcw, Save, Trash2 } from 'lucide-vue-next'
import { reportTemplatesApi } from '@/api/reportTemplates'
import { DEFAULT_REPORT_TEMPLATES } from '@/data/reportTemplates'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import type { ReportTemplate, ReportTemplateField, ReportTemplateFieldType } from '@/types'

const STORAGE_KEY = 'pulmolink-report-templates-v1'
const auth = useAuthStore()
const templates = ref<ReportTemplate[]>([])
const selectedId = ref('')
const busy = ref(false)
const error = ref('')
const message = ref('')
const name = ref('')
const modality = ref<'CT' | 'MRI' | 'X-Ray' | ''>('')
const organId = ref('')
const fields = ref<ReportTemplateField[]>([])
const versions = ref<Array<{ version_id: number; version: number; name: string; created_at: string }>>([])
const showVersions = ref(false)

const selected = computed(() => templates.value.find(item => item.id === selectedId.value) || null)
const isAdmin = computed(() => auth.session?.accountRole === 'admin')
const fieldTypes: ReportTemplateFieldType[] = ['text', 'textarea', 'number', 'date', 'select', 'boolean']
const reportItemCatalog = Array.from(
  new Map(
    DEFAULT_REPORT_TEMPLATES
      .flatMap(template => template.fields)
      .map(field => [field.key, field]),
  ).values(),
)

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

function cloneFields(items: ReportTemplateField[]) {
  return items.map(field => ({
    ...field,
    options: field.options ? [...field.options] : [],
  }))
}

function fillEditor(template: ReportTemplate | null) {
  name.value = template?.name || ''
  modality.value = template?.modality || ''
  organId.value = template?.organId || ''
  fields.value = cloneFields(template?.fields || [])
}

function selectTemplate(id: string) {
  selectedId.value = id
  fillEditor(templates.value.find(item => item.id === id) || null)
  error.value = ''
  message.value = ''
  versions.value = []
  showVersions.value = false
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
    fields: [{
      key: 'impression',
      label: 'ui.reportTemplate.impression',
      section: 'ui.reportTemplate.section.impression',
      type: 'textarea',
      required: true,
      options: [],
    }],
  }
  templates.value.unshift(item)
  if (localPreview) persistLocalTemplates()
  selectTemplate(id)
}

function addField() {
  const next = reportItemCatalog.find(item => !fields.value.some(field => field.key === item.key))
    || reportItemCatalog[0]
  fields.value.push(cloneFields([next])[0])
}

function removeField(index: number) {
  fields.value.splice(index, 1)
}

function moveField(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= fields.value.length) return
  const [item] = fields.value.splice(index, 1)
  fields.value.splice(target, 0, item)
}

function applyReportItem(index: number, event: Event) {
  const key = (event.target as HTMLSelectElement).value
  const item = reportItemCatalog.find(candidate => candidate.key === key)
  if (item) fields.value[index] = cloneFields([item])[0]
}

function optionsText(field: ReportTemplateField) {
  return (field.options || [])
    .map(option => option.startsWith('ui.') ? t(option) : option)
    .join('\n')
}

function setOptions(index: number, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  const currentOptions = fields.value[index].options || []
  const currentLabels = new Map(
    currentOptions
      .filter(option => option.startsWith('ui.'))
      .map(option => [t(option), option]),
  )
  fields.value[index].options = value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => currentLabels.get(item) || item)
}

function validateFields() {
  if (!name.value.trim() || !fields.value.length) {
    error.value = t('ui.reportTemplates.required')
    return false
  }
  const keys = fields.value.map(field => field.key.trim())
  if (keys.some(key => !key) || new Set(keys).size !== keys.length) {
    error.value = t('ui.reportTemplates.duplicateKey')
    return false
  }
  if (fields.value.some(field => !field.label.trim())) {
    error.value = t('ui.reportTemplates.labelRequired')
    return false
  }
  return true
}

async function saveTemplate() {
  if (!isAdmin.value) return
  if (!validateFields()) return
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const payload = {
      name: name.value.trim(),
      modality: modality.value || null,
      organId: organId.value || null,
      fields: fields.value.map(field => ({
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
        section: field.section.trim() || 'ui.reportTemplate.section.findings',
        options: field.type === 'select' ? (field.options || []) : [],
        unit: field.unit?.trim() || null,
      })),
    }
    if (localPreview) {
      const existing = templates.value.find(item => item.id === selectedId.value)
      if (existing) {
        existing.name = payload.name
        existing.modality = payload.modality
        existing.organId = payload.organId
        existing.fields = cloneFields(payload.fields)
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

async function toggleActive() {
  if (!selected.value || !isAdmin.value) return
  busy.value = true
  try {
    const updated = await reportTemplatesApi.update(selected.value.id, { isActive: !selected.value.isActive })
    Object.assign(selected.value, updated)
    message.value = t(updated.isActive ? 'ui.reportTemplates.published' : 'ui.reportTemplates.unpublished')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.saveFailed')
  } finally {
    busy.value = false
  }
}

async function makeDefault() {
  if (!selected.value || !isAdmin.value) return
  busy.value = true
  try {
    const updated = await reportTemplatesApi.update(selected.value.id, { isDefault: true })
    Object.assign(selected.value, updated)
    message.value = t('ui.reportTemplates.defaultSaved')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.saveFailed')
  } finally {
    busy.value = false
  }
}

async function loadVersions() {
  if (!selected.value || localPreview) return
  try {
    versions.value = await reportTemplatesApi.versions(selected.value.id)
    showVersions.value = true
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.reportTemplates.loadFailed')
  }
}

async function restoreVersion(version: number) {
  if (!selected.value || !isAdmin.value) return
  busy.value = true
  try {
    const updated = await reportTemplatesApi.restoreVersion(selected.value.id, version)
    const index = templates.value.findIndex(item => item.id === updated.id)
    if (index >= 0) templates.value[index] = updated
    fillEditor(updated)
    showVersions.value = false
    message.value = t('ui.reportTemplates.versionRestored')
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
      <button v-if="isAdmin" class="btn btn-primary" type="button" :disabled="busy" @click="createNewTemplate">
        <Plus :size="16" /> {{ $t('ui.reportTemplates.newTemplate') }}
      </button>
    </section>

    <div class="template-layout">
      <aside class="template-list card">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="template-list-item"
          :class="{ active: template.id === selectedId }"
          @click="selectTemplate(template.id)"
        >
          <strong>{{ template.name }}</strong>
          <small>{{ template.modality || $t('ui.reportTemplates.anyModality') }} · {{ template.organId || $t('ui.reportTemplates.anyOrgan') }} · v{{ template.version }}</small>
          <span class="template-badges"><em v-if="template.isDefault">{{ $t('ui.reportTemplates.default') }}</em><em :class="{ inactive: !template.isActive }">{{ $t(template.isActive ? 'ui.reportTemplates.published' : 'ui.reportTemplates.unpublished') }}</em></span>
        </button>
        <p v-if="!templates.length">{{ $t('ui.reportTemplates.empty') }}</p>
      </aside>

      <section class="template-editor card">
        <div class="editor-grid">
          <label class="label">{{ $t('ui.reportTemplates.name') }}<input v-model="name" class="input" maxlength="160" :disabled="busy" /></label>
          <label class="label">
            {{ $t('ui.reportTemplates.modality') }}
            <select v-model="modality" class="select" :disabled="busy">
              <option value="">{{ $t('ui.reportTemplates.anyModality') }}</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
            </select>
          </label>
          <label class="label">{{ $t('ui.reportTemplates.organ') }}<input v-model="organId" class="input" maxlength="64" :disabled="busy" :placeholder="$t('ui.reportTemplates.organPlaceholder')" /></label>
        </div>

        <div class="template-actions">
          <button class="btn btn-secondary btn-sm" type="button" :disabled="busy || !selected" @click="toggleActive"><FileText :size="15" /> {{ $t(selected?.isActive ? 'ui.reportTemplates.unpublish' : 'ui.reportTemplates.publish') }}</button>
          <button class="btn btn-secondary btn-sm" type="button" :disabled="busy || !selected" @click="makeDefault"><FileText :size="15" /> {{ $t('ui.reportTemplates.setDefault') }}</button>
          <button v-if="!localPreview" class="btn btn-secondary btn-sm" type="button" :disabled="!selected" @click="loadVersions"><FileText :size="15" /> {{ $t('ui.reportTemplates.versions') }}</button>
        </div>

        <section v-if="showVersions" class="version-list">
          <header><strong>{{ $t('ui.reportTemplates.versions') }}</strong><button type="button" @click="showVersions = false">×</button></header>
          <button v-for="version in versions" :key="version.version_id" type="button" class="version-row" :disabled="busy" @click="restoreVersion(version.version)">
            <span>v{{ version.version }} · {{ version.name }}</span>
            <small>{{ new Date(version.created_at).toLocaleString() }}</small>
          </button>
        </section>

        <div class="builder-heading">
          <div>
            <h3>{{ $t('ui.reportTemplates.fields') }}</h3>
            <p>{{ $t('ui.reportTemplates.fieldsHelp') }}</p>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" :disabled="busy" @click="addField">
            <Plus :size="15" /> {{ $t('ui.reportTemplates.addField') }}
          </button>
        </div>

        <div v-if="fields.length" class="field-list">
          <article v-for="(field, index) in fields" :key="index" class="field-card">
            <header>
              <strong>{{ field.label ? $t(field.label) : $t('ui.reportTemplates.untitledField') }}</strong>
              <div class="field-actions">
                <button type="button" :title="$t('ui.reportTemplates.moveUp')" :aria-label="$t('ui.reportTemplates.moveUp')" :disabled="index === 0 || busy" @click="moveField(index, -1)"><ArrowUp :size="15" /></button>
                <button type="button" :title="$t('ui.reportTemplates.moveDown')" :aria-label="$t('ui.reportTemplates.moveDown')" :disabled="index === fields.length - 1 || busy" @click="moveField(index, 1)"><ArrowDown :size="15" /></button>
                <button type="button" :title="$t('ui.reportTemplates.removeField')" :aria-label="$t('ui.reportTemplates.removeField')" :disabled="busy" @click="removeField(index)"><Trash2 :size="15" /></button>
              </div>
            </header>

            <div class="field-grid">
              <label class="label">{{ $t('ui.reportTemplates.reportItem') }}<select class="select" :value="field.key" :disabled="busy" @change="applyReportItem(index, $event)"><option v-for="item in reportItemCatalog" :key="item.key" :value="item.key">{{ $t(item.label) }}</option></select></label>
              <label class="label">{{ $t('ui.reportTemplates.fieldType') }}<select v-model="field.type" class="select" :disabled="busy"><option v-for="type in fieldTypes" :key="type" :value="type">{{ $t(`ui.reportTemplates.type.${type}`) }}</option></select></label>
              <label class="required-toggle"><input v-model="field.required" type="checkbox" :disabled="busy" /><span>{{ $t('ui.reportTemplates.requiredField') }}</span></label>
            </div>

            <label v-if="field.type === 'select'" class="label">
              {{ $t('ui.reportTemplates.options') }}
              <textarea class="textarea options-input" rows="4" :disabled="busy" :value="optionsText(field)" @input="setOptions(index, $event)" />
              <small>{{ $t('ui.reportTemplates.optionsHelp') }}</small>
            </label>
          </article>
        </div>
        <p v-else class="empty-fields">{{ $t('ui.reportTemplates.noFields') }}</p>

        <div v-if="isAdmin" class="actions">
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
.template-page{display:grid;gap:18px}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.page-header h2{display:flex;align-items:center;gap:9px;margin:7px 0 4px}.page-header p{margin:0;color:var(--text-muted);font-size:12px}.eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.template-layout{display:grid;grid-template-columns:290px minmax(0,1fr);gap:18px;align-items:start}.template-list{display:grid;gap:6px;padding:10px}.template-list-item{display:grid;gap:5px;padding:12px;border:1px solid transparent;border-radius:8px;background:transparent;text-align:left}.template-list-item.active{background:var(--accent-soft);border-color:#cfe4e0}.template-list-item strong{font-size:13px}.template-list-item small{color:var(--text-muted);font-size:10px}.template-badges{display:flex;gap:5px}.template-badges em{padding:2px 5px;border-radius:4px;background:#e6f1eb;color:#2f6a4c;font-size:9px;font-style:normal}.template-badges em.inactive{background:#f5e9e9;color:#9a4d52}.template-editor{display:grid;gap:18px;padding:22px}.editor-grid{display:grid;grid-template-columns:1fr 150px 180px;gap:14px}.template-actions{display:flex;gap:8px;flex-wrap:wrap}.label{display:grid;gap:7px;color:var(--text-soft);font-size:12px}.builder-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding-top:4px;border-top:1px solid var(--border)}.builder-heading h3{margin:16px 0 4px;font-size:15px}.builder-heading p{margin:0;color:var(--text-muted);font-size:11px}.field-list{display:grid;gap:12px}.field-card{display:grid;gap:14px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2)}.field-card header{display:flex;align-items:center;justify-content:space-between;gap:12px}.field-card header strong{font-size:12px}.field-actions{display:flex;gap:4px}.field-actions button{display:grid;width:28px;height:28px;place-items:center;border:0;border-radius:6px;background:var(--surface);color:var(--text-muted)}.field-actions button:hover:not(:disabled){color:var(--accent-strong);background:var(--accent-soft)}.field-grid{display:grid;grid-template-columns:1fr 170px auto;gap:12px;align-items:end}.required-toggle{display:flex;align-items:center;gap:7px;min-height:34px;color:var(--text-soft);font-size:12px}.options-input{min-height:86px}.options-input+small{color:var(--text-muted);font-size:10px}.version-list{display:grid;gap:6px;padding:12px;border:1px solid var(--border);border-radius:8px}.version-list header{display:flex;justify-content:space-between;align-items:center}.version-list header button{border:0;background:transparent;color:var(--text-muted)}.version-row{display:flex;justify-content:space-between;gap:12px;padding:9px;border:0;border-radius:6px;background:var(--surface-2);text-align:left}.version-row small{color:var(--text-muted)}.empty-fields{margin:0;padding:22px;border:1px dashed var(--border-strong);border-radius:8px;color:var(--text-muted);font-size:12px;text-align:center}.actions{display:flex;gap:10px}.success{color:var(--green);font-size:12px}.error{color:var(--red);font-size:12px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}@media(max-width:900px){.template-layout,.editor-grid{grid-template-columns:1fr}.page-header{align-items:stretch;flex-direction:column}.page-header .btn{width:100%}}@media(max-width:650px){.field-grid{grid-template-columns:1fr}.required-toggle{grid-column:auto}.builder-heading{align-items:stretch;flex-direction:column}.builder-heading .btn{width:100%}}
</style>
