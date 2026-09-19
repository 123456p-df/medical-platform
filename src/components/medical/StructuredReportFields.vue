<script setup lang="ts">
import { computed } from 'vue'
import type { ReportTemplateField } from '@/types'

const props = defineProps<{
  fields: ReportTemplateField[]
  disabled?: boolean
}>()

const model = defineModel<Record<string, unknown>>({ default: () => ({}) })

const sections = computed(() => {
  const grouped = new Map<string, { label: string; fields: ReportTemplateField[] }>()
  for (const field of props.fields) {
    const section = field.section || 'ui.reportTemplate.section.findings'
    if (!grouped.has(section)) grouped.set(section, { label: section, fields: [] })
    grouped.get(section)?.fields.push(field)
  }
  return [...grouped.entries()].map(([key, value]) => ({ key, ...value }))
})

function valueFor(key: string): string {
  const value = model.value[key]
  return value === null || value === undefined ? '' : String(value)
}

function setText(key: string, event: Event) {
  model.value = { ...model.value, [key]: (event.target as HTMLInputElement | HTMLTextAreaElement).value }
}

function setNumber(key: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  model.value = { ...model.value, [key]: value === '' ? null : Number(value) }
}

function setBoolean(key: string, event: Event) {
  model.value = { ...model.value, [key]: (event.target as HTMLInputElement).checked }
}
</script>

<template>
  <div class="structured-fields">
    <section v-for="section in sections" :key="section.key" class="structured-section">
      <h4>{{ $t(section.label) }}</h4>
      <label v-for="field in section.fields" :key="field.key" class="structured-field">
        <span>
          {{ $t(field.label) }}
          <em v-if="field.required">*</em>
          <small v-if="field.unit">{{ field.unit }}</small>
        </span>
        <textarea
          v-if="field.type === 'textarea'"
          class="textarea"
          rows="3"
          :disabled="disabled"
          :value="valueFor(field.key)"
          @input="setText(field.key, $event)"
        />
        <select
          v-else-if="field.type === 'select'"
          class="select"
          :disabled="disabled"
          :value="valueFor(field.key)"
          @change="setText(field.key, $event)"
        >
          <option value="">{{ $t('ui.reportTemplate.selectOption') }}</option>
          <option v-for="option in field.options || []" :key="option" :value="option">{{ $t(option) }}</option>
        </select>
        <input
          v-else-if="field.type === 'number'"
          class="input"
          type="number"
          step="any"
          :disabled="disabled"
          :value="valueFor(field.key)"
          @input="setNumber(field.key, $event)"
        />
        <input
          v-else-if="field.type === 'date'"
          class="input"
          type="date"
          :disabled="disabled"
          :value="valueFor(field.key)"
          @input="setText(field.key, $event)"
        />
        <input
          v-else-if="field.type === 'boolean'"
          class="input checkbox"
          type="checkbox"
          :disabled="disabled"
          :checked="Boolean(model[field.key])"
          @change="setBoolean(field.key, $event)"
        />
        <input
          v-else
          class="input"
          type="text"
          :disabled="disabled"
          :value="valueFor(field.key)"
          @input="setText(field.key, $event)"
        />
      </label>
    </section>
  </div>
</template>

<style scoped>
.structured-fields {
  display: grid;
  gap: 18px;
}

.structured-section {
  display: grid;
  gap: 12px;
}

.structured-section h4 {
  margin: 0 0 2px;
  color: var(--accent-strong);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.structured-field {
  display: grid;
  gap: 7px;
}

.structured-field > span {
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 650;
}

.structured-field em {
  color: var(--red);
  font-style: normal;
}

.structured-field small {
  margin-left: 6px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
}

.checkbox {
  width: 18px;
  height: 18px;
  padding: 0;
}
</style>
