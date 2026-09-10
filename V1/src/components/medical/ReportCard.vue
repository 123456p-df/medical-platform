<script setup lang="ts">
import { CheckCircle2, Clock3, FileText } from 'lucide-vue-next'
import type { Report } from '@/types'

defineProps<{
  report: Report
  patientFacing?: boolean
}>()
</script>

<template>
  <article class="report-card">
    <div class="report-header">
      <span class="report-icon"><FileText :size="18" /></span>
      <div class="report-heading">
        <strong>{{ $t("Final Diagnosis") }}</strong>
        <span>{{ $t(report.date) }}</span>
      </div>
      <span :class="['review-state', { reviewed: report.reviewed }]">
        <CheckCircle2 v-if="report.reviewed" :size="14" />
        <Clock3 v-else :size="14" />
        {{ $t(report.reviewed ? 'Doctor Reviewed' : 'Pending Review') }}
      </span>
    </div>
    <h4>{{ $t(report.diagnosis) }}</h4>
    <p>{{ $t(report.description) }}</p>
    <div class="report-content">
      <div class="report-section">
        <span>{{ $t("Recommendation") }}</span>
        <p>{{ $t(report.recommendation) }}</p>
      </div>
      <div class="report-footer">
        <span>{{ $t(report.reviewed ? 'Signed by' : 'Prepared by') }} {{ $t(report.doctor) }}</span>
        <span>{{ $t(report.date) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.report-card {
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: #edf2f8;
  color: var(--blue);
}

.report-heading {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.3;
}

.report-heading strong {
  color: var(--text);
  font-size: 13px;
}

.report-heading span {
  color: var(--text-muted);
  font-size: 11px;
}

.review-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f8efe4;
  color: #a56b25;
  font-size: 10px;
  font-weight: 700;
}

.review-state.reviewed {
  background: #e6f1eb;
  color: #3f7d5d;
}

.report-card h4 {
  margin: 14px 0 7px;
  color: var(--text);
  font-size: 15px;
}

.report-card p {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
}

.report-section {
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid var(--border);
}

.report-section span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 720;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.report-section p {
  margin-top: 5px;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 15px;
  color: var(--text-muted);
  font-size: 11px;
}
</style>
