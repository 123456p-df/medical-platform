<script setup lang="ts">
import { ref } from 'vue'
import type { StructuredReport } from '@/api/agent'

const props = defineProps<{
  report: StructuredReport
}>()

const emit = defineEmits<{
  (e: 'fill-report', report: StructuredReport): void
}>()

const filled = ref(false)

function handleFillReport() {
  filled.value = true
  emit('fill-report', props.report)

  // Dispatch global event for StudyViewerWindow and other report tabs
  window.dispatchEvent(
    new CustomEvent('vmrb-fill-radiology-report', {
      detail: props.report,
    })
  )

  setTimeout(() => {
    filled.value = false
  }, 3500)
}
</script>

<template>
  <div class="report-card">
    <div class="report-header">
      <div class="report-title">
        <span class="badge-icon">📋</span>
        <span class="title-text">{{ $t('ui.copilot.report.title') }}</span>
      </div>
      <span class="badge-status">{{ $t('ui.copilot.report.review') }}</span>
    </div>

    <div class="report-body">
      <div class="section-item">
        <div class="section-label">{{ $t('ui.copilot.report.technique') }}</div>
        <div class="section-content">{{ report.exam_technique }}</div>
      </div>

      <div class="section-item">
        <div class="section-label">{{ $t('ui.copilot.report.findings') }}</div>
        <div class="section-content findings-text">{{ report.findings }}</div>
      </div>

      <div class="section-item">
        <div class="section-label">{{ $t('ui.copilot.report.impression') }}</div>
        <div class="section-content impression-text">{{ report.impression }}</div>
      </div>

      <div v-if="report.recommendations" class="section-item">
        <div class="section-label">{{ $t('ui.copilot.report.recommendations') }}</div>
        <div class="section-content">{{ report.recommendations }}</div>
      </div>
    </div>

    <div class="report-footer">
      <button
        type="button"
        class="fill-btn"
        :class="{ success: filled }"
        @click="handleFillReport"
      >
        <span v-if="!filled">{{ $t('ui.copilot.report.fill') }}</span>
        <span v-else>{{ $t('ui.copilot.report.filled') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.report-card {
  margin: 12px 0;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: #1e293b;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #0f172a;
}

.badge-status {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
}

.report-body {
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

.findings-text {
  max-height: 140px;
  overflow-y: auto;
}

.impression-text {
  font-weight: 500;
  color: #0f172a;
}

.report-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.fill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fill-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.fill-btn.success {
  background: #16a34a;
}
</style>
