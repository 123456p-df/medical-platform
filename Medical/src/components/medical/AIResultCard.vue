<script setup lang="ts">
import { BrainCircuit, Check, CircleDot, RotateCcw, X } from 'lucide-vue-next'
import type { Finding } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge.vue'

defineProps<{
  finding: Finding
  compact?: boolean
}>()

const emit = defineEmits<{
  updateStatus: [status: Finding['status']]
}>()
</script>

<template>
  <article :class="['finding-card', { compact }]">
    <div class="finding-top">
      <span class="finding-icon"><BrainCircuit :size="18" /></span>
      <div class="finding-title">
        <strong>{{ finding.label }}</strong>
        <span>{{ finding.side }} {{ finding.location.replaceAll('_', ' ') }}</span>
      </div>
      <RiskBadge :level="finding.severity" />
    </div>
    <p class="finding-description">{{ finding.description }}</p>
    <div v-if="!compact" class="finding-meta">
      <span>
        <CircleDot :size="14" />
        Confidence {{ Math.round(finding.confidence * 100) }}%
      </span>
      <span>Status: {{ finding.status }}</span>
    </div>
    <div v-if="!compact" class="finding-actions">
      <button type="button" class="btn btn-sm btn-secondary" @click="emit('updateStatus', 'confirmed')">
        <Check :size="14" /> Confirm
      </button>
      <button type="button" class="btn btn-sm btn-secondary" @click="emit('updateStatus', 'modified')">
        <RotateCcw :size="14" /> Modify
      </button>
      <button type="button" class="btn btn-sm btn-danger" @click="emit('updateStatus', 'dismissed')">
        <X :size="14" /> Dismiss
      </button>
    </div>
  </article>
</template>

<style scoped>
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
