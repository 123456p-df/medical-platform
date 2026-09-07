<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Patient } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  patients: Patient[]
  selectedId?: string | null
}>()

const emit = defineEmits<{
  select: [patient: Patient]
}>()

function formatDate(date: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en', {
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
          <th>Patient</th>
          <th>ID</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Latest Examination</th>
          <th>Modality</th>
          <th>Organ</th>
          <th>AI Status</th>
          <th>Risk</th>
          <th class="action-col"><span class="sr-only">Action</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="patient in patients"
          :key="patient.id"
          :class="{ 'is-selected': patient.id === selectedId }"
          tabindex="0"
          @click="emit('select', patient)"
          @keydown.enter="emit('select', patient)"
        >
          <td>
            <div class="patient-cell">
              <span class="patient-avatar" :style="{ background: patient.avatarColor }">
                {{ patient.name.split(' ').map((part) => part[0]).join('') }}
              </span>
              <strong>{{ patient.name }}</strong>
            </div>
          </td>
          <td class="mono">{{ patient.id }}</td>
          <td>{{ patient.age ?? '—' }}</td>
          <td>{{ patient.gender }}</td>
          <td>{{ formatDate(patient.lastExamDate) }}</td>
          <td><span class="modality">{{ patient.modality }}</span></td>
          <td>{{ patient.organ }}</td>
          <td><StatusBadge :status="patient.aiStatus" /></td>
          <td><RiskBadge :level="patient.risk" /></td>
          <td class="action-col">
            <ChevronRight :size="17" />
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
  min-width: 920px;
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
  width: 38px;
  color: var(--text-muted);
}
</style>
