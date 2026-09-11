<script setup lang="ts">
import { locale } from '@/i18n'
import { ChevronRight } from 'lucide-vue-next'
import type { Patient } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import PatientDeleteButton from '@/components/patient/PatientDeleteButton.vue'

defineProps<{
  patients: Patient[]
  selectedId?: string | null
}>()

const emit = defineEmits<{
  open: [patient: Patient]
  removed: [id: string]
}>()

function formatDate(date: string) {
  if (!date || Number.isNaN(Date.parse(date))) return '—'
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}
</script>

<template>
  <div class="table-wrap">
    <table class="patient-table">
      <thead>
        <tr>
          <th>{{ $t("Patient") }}</th>
          <th>{{ $t("ID") }}</th>
          <th>{{ $t("Age") }}</th>
          <th>{{ $t("Gender") }}</th>
          <th>{{ $t("Latest Examination") }}</th>
          <th>{{ $t("Modality") }}</th>
          <th>{{ $t("Organ") }}</th>
          <th>{{ $t("AI Status") }}</th>
          <th>{{ $t("Risk") }}</th>
          <th class="action-col"><span class="sr-only">{{ $t("Action") }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="patient in patients"
          :key="patient.id"
          :class="{ 'is-selected': patient.id === selectedId }"
          tabindex="0"
          @click="emit('open', patient)"
          @keydown.enter="emit('open', patient)"
        >
          <td>
            <div class="patient-cell">
              <span class="patient-avatar" :style="{ background: patient.avatarColor }">
                {{ $t(patient.name.split(' ').map((part) => part[0]).join('')) }}
              </span>
              <strong>{{ patient.name }}</strong>
            </div>
          </td>
          <td class="mono">{{ $t(patient.id) }}</td>
          <td>{{ patient.age ?? '—' }}</td>
          <td>{{ $t(patient.gender) }}</td>
          <td>{{ $t(formatDate(patient.lastExamDate)) }}</td>
          <td><span class="modality">{{ $t(patient.modality) }}</span></td>
          <td>{{ $t(patient.organ) }}</td>
          <td><StatusBadge :status="patient.aiStatus" /></td>
          <td><RiskBadge :level="patient.risk" /></td>
          <td class="action-col">
            <div class="row-actions">
              <button
                type="button"
                class="row-open-button"
                :aria-label="`${$t('Open patient record')}: ${patient.name}`"
                :title="`${$t('Open patient record')}: ${patient.name}`"
                @click.stop="emit('open', patient)"
              >
                <ChevronRight :size="17" />
              </button>
              <PatientDeleteButton
                :id="patient.id"
                :name="patient.name"
                compact
                stay
                @removed="emit('removed', $event)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.patient-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.patient-table th {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 720;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.patient-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 13px;
  vertical-align: middle;
}

.patient-table tbody tr {
  cursor: pointer;
  transition: background 140ms ease;
}

.patient-table tbody tr:hover,
.patient-table tbody tr.is-selected {
  background: #f7fbfb;
}

.patient-table tbody tr:last-child td {
  border-bottom: 0;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-cell strong {
  color: var(--text);
  font-size: 13px;
  white-space: nowrap;
}

.patient-avatar {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 11px;
  font-weight: 760;
}

.mono {
  color: var(--text-soft);
  font-variant-numeric: tabular-nums;
}

.modality {
  display: inline-flex;
  padding: 3px 7px;
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
}

.action-col {
  width: 82px;
  color: var(--text-muted);
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.row-open-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
}

.row-open-button:hover,
.row-open-button:focus-visible {
  border-color: var(--border);
  background: var(--surface);
  color: var(--accent);
}
</style>
