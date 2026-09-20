<script setup lang="ts">
import type { StructuredTreatmentPlan } from '@/api/agent'

defineProps<{
  plan: StructuredTreatmentPlan
}>()

const sections: Array<{ key: keyof StructuredTreatmentPlan; label: string }> = [
  { key: 'symptom_analysis', label: '【症状与证据对照】' },
  { key: 'working_diagnosis', label: '【工作诊断与分层】' },
  { key: 'differential', label: '【鉴别诊断】' },
  { key: 'workup', label: '【进一步检查】' },
  { key: 'pharmacologic', label: '【药物治疗】' },
  { key: 'nonpharmacologic', label: '【非药物干预】' },
  { key: 'followup', label: '【随访计划】' },
  { key: 'red_flags', label: '【危险信号】' },
]
</script>

<template>
  <div class="plan-card">
    <div class="plan-header">
      <div class="plan-title">
        <span class="badge-icon">🩺</span>
        <span class="title-text">{{ $t('ui.copilot.plan.title') }}</span>
      </div>
      <span class="badge-status">{{ $t('ui.copilot.plan.review') }}</span>
    </div>

    <div class="plan-body">
      <div v-for="section in sections" :key="section.key" class="section-item">
        <template v-if="plan[section.key]">
          <div class="section-label">{{ section.label }}</div>
          <div class="section-content">{{ plan[section.key] }}</div>
        </template>
      </div>
      <div v-if="plan.disclaimer" class="disclaimer">{{ plan.disclaimer }}</div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  margin: 12px 0;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #99f6e4;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  font-size: 13px;
  line-height: 1.55;
  color: #1e293b;
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: #ecfdf5;
  border-bottom: 1px solid #ccfbf1;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #134e4a;
}

.badge-status {
  background: #fef3c7;
  color: #92400e;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.plan-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-weight: 600;
  color: #334155;
  margin-bottom: 2px;
}

.section-content {
  color: #475569;
  white-space: pre-wrap;
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.disclaimer {
  font-size: 11px;
  color: #64748b;
  padding: 4px 2px 0;
}
</style>
