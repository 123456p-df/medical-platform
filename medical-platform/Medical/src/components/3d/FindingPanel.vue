<script setup lang="ts">
import { Crosshair, FileText } from 'lucide-vue-next'
import type { Finding } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge.vue'

defineProps<{
  finding: Finding
  hasReport?: boolean
}>()

const emit = defineEmits<{
  viewCt: []
  viewReport: []
}>()
</script>

<template>
  <aside class="finding-panel">
    <div class="panel-kicker">AI Finding Marker</div>
    <div class="panel-heading">
      <div>
        <h3>{{ finding.label }}</h3>
        <p>{{ finding.side }} {{ finding.location.replaceAll('_', ' ') }}</p>
      </div>
      <RiskBadge :level="finding.severity" />
    </div>
    <p class="panel-description">{{ finding.description }}</p>
    <div class="panel-actions">
      <button type="button" class="btn btn-primary" @click="emit('viewCt')">
        <Crosshair :size="16" /> View CT
      </button>
      <button v-if="hasReport" type="button" class="btn btn-secondary" @click="emit('viewReport')">
        <FileText :size="16" /> View Report
      </button>
    </div>
  </aside>
</template>

<style scoped>
.finding-panel {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.panel-kicker {
  margin-bottom: 11px;
  color: var(--accent-strong);
  font-size: 11px;
  font-weight: 760;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.panel-heading h3 {
  margin: 0;
  color: var(--text);
  font-size: 17px;
}

.panel-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: capitalize;
}

.panel-description {
  margin: 14px 0;
  color: var(--text-soft);
  font-size: 13px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
