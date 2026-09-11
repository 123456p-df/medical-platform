<script setup lang="ts">
import { CalendarDays, Droplets, Phone, ShieldAlert } from 'lucide-vue-next'
import type { Patient } from '@/types'

defineProps<{
  patient: Patient
}>()
</script>

<template>
  <article class="record-card">
    <div class="record-row">
      <CalendarDays :size="16" />
      <span>{{ $t("Age") }}</span>
      <strong>{{ patient.age ?? '—' }} {{ $t("years ·") }} {{ $t(patient.gender) }}</strong>
    </div>
    <div class="record-row">
      <Droplets :size="16" />
      <span>{{ $t("ABO blood type") }}</span>
      <strong>{{ $t(patient.bloodType) }}</strong>
    </div>
    <div class="record-row">
      <Droplets :size="16" /><span>{{ $t("Rh(D)") }}</span><strong>{{ $t(patient.rhType ?? 'Unknown') }}</strong>
    </div>
    <div class="record-row">
      <Phone :size="16" />
      <span>{{ $t("Contact") }}</span>
      <strong>{{ $t(patient.phone) }}</strong>
    </div>
    <div class="record-row">
      <ShieldAlert :size="16" />
      <span>{{ $t("Allergies") }}</span>
      <strong>{{ $t(patient.allergies.length ? patient.allergies.join(', ') : 'None recorded') }}</strong>
    </div>
  </article>
</template>

<style scoped>
.record-card {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.record-row {
  display: grid;
  grid-template-columns: 22px 96px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.record-row strong {
  overflow: hidden;
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 620;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
