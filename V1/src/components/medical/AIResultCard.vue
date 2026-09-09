<script setup lang="ts">
import { BrainCircuit, Check, CircleDot, RotateCcw, X } from 'lucide-vue-next'
import type { Finding } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import { reactive, ref } from 'vue'
import { usePatientStore } from '@/stores/patients'
import { t } from '@/i18n'

const props = defineProps<{
  finding: Finding
  compact?: boolean
}>()

const store = usePatientStore()
const editing = ref(false)
const busy = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({ label: '', description: '', severity: 'Low' as Finding['severity'] })

function startEdit() {
  Object.assign(form, { label: t(props.finding.label), description: t(props.finding.description), severity: props.finding.severity })
  editing.value = true
  message.value = ''
  error.value = ''
}

async function update(status: Finding['status']) {
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    if (status === 'modified') {
      if (!form.label.trim() || !form.description.trim()) {
        error.value = 'Enter a finding title and description.'
        return
      }
      await store.modifyFinding(props.finding.id, { ...form, label: form.label.trim(), description: form.description.trim() })
      editing.value = false
    } else {
      await store.updateFindingStatus(props.finding.id, status)
    }
    message.value = status === 'confirmed' ? 'Finding confirmed.' : status === 'dismissed' ? 'Finding dismissed. It will not be included in the report.' : status === 'pending' ? 'Finding restored for review.' : 'Changes saved.'
  } catch {
    error.value = 'Save failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <article :class="['finding-card', finding.status, { compact }]">
    <div class="finding-top">
      <span class="finding-icon"><BrainCircuit :size="18" /></span>
      <div class="finding-title">
        <strong>{{ $t(finding.label) }}</strong>
        <span>{{ $t(finding.side) }} {{ $t(finding.location.replaceAll('_', ' ')) }}</span>
      </div>
      <RiskBadge :level="finding.severity" />
    </div>
    <p class="finding-description">{{ $t(finding.description) }}</p>
    <div v-if="!compact" class="finding-meta">
      <span>
        <CircleDot :size="14" /> {{ $t("Confidence") }} {{ $t(Math.round(finding.confidence * 100)) }}%
      </span>
      <span>{{ $t("Status:") }} {{ $t(finding.status) }}</span>
    </div>
    <form v-if="editing" class="finding-edit" @submit.prevent="update('modified')">
      <label class="label" :for="`${finding.id}-label`">{{ $t("Finding title") }}</label>
      <input :id="`${finding.id}-label`" v-model="form.label" class="input" required :disabled="busy" />
      <label class="label" :for="`${finding.id}-description`">{{ $t("Description") }}</label>
      <textarea :id="`${finding.id}-description`" v-model="form.description" class="textarea" required :disabled="busy" />
      <label class="label" :for="`${finding.id}-severity`">{{ $t("Risk level") }}</label>
      <select :id="`${finding.id}-severity`" v-model="form.severity" class="select" :disabled="busy">
        <option value="Low">{{ $t("Low") }}</option><option value="Medium">{{ $t("Medium") }}</option><option value="High">{{ $t("High") }}</option>
      </select>
      <div class="finding-actions">
        <button class="btn btn-sm btn-primary" :disabled="busy">{{ $t(busy ? 'Saving...' : 'Save changes') }}</button>
        <button type="button" class="btn btn-sm btn-secondary" :disabled="busy" @click="editing = false">{{ $t("Cancel") }}</button>
      </div>
    </form>
    <div v-if="!compact && !editing" class="finding-actions">
      <button type="button" class="btn btn-sm btn-secondary" :disabled="busy || finding.status === 'confirmed'" @click="update('confirmed')">
        <Check :size="14" /> {{ $t("Confirm") }} </button>
      <button type="button" class="btn btn-sm btn-secondary" :disabled="busy" @click="startEdit">
        <RotateCcw :size="14" /> {{ $t("Modify") }} </button>
      <button v-if="finding.status !== 'dismissed'" type="button" class="btn btn-sm btn-danger" :disabled="busy" @click="update('dismissed')">
        <X :size="14" /> {{ $t("Dismiss") }} </button>
      <button v-else type="button" class="btn btn-sm btn-secondary" :disabled="busy" @click="update('pending')">{{ $t("Undo dismiss") }}</button>
    </div>
    <p v-if="message" class="action-message" role="status">{{ $t(message) }}</p>
    <p v-if="error" class="action-error" role="alert">{{ $t(error) }}</p>
  </article>
</template>

<style scoped>
.finding-card.confirmed, .finding-card.modified { border-left: 3px solid var(--accent); }
.finding-card.dismissed { background: var(--surface-2); }
.finding-card.dismissed .finding-description { text-decoration: line-through; color: var(--text-muted); }
.finding-edit { display: grid; gap: 8px; margin-top: 18px; }
.finding-edit .label { margin: 0; }
.action-message { margin: 12px 0 0; color: var(--accent-strong); font-size: 12px; }
.action-error { color: var(--red); font-size: 12px; }
.finding-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.finding-card.compact {
  padding: 13px;
}

.finding-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.finding-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.finding-title {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.3;
}

.finding-title strong {
  color: var(--text);
  font-size: 14px;
}

.finding-title span {
  color: var(--text-muted);
  font-size: 12px;
  text-transform: capitalize;
}

.finding-description {
  margin: 12px 0 0;
  color: var(--text-soft);
  font-size: 13px;
}

.finding-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 11px;
}

.finding-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.finding-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
</style>
