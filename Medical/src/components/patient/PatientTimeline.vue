<script setup lang="ts">
import { ScanLine } from 'lucide-vue-next'
import type { Examination } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  examinations: Examination[]
}>()

const emit = defineEmits<{
  select: [examination: Examination]
}>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}
</script>

<template>
  <div class="timeline">
    <button
      v-for="(examination, index) in examinations"
      :key="examination.id"
      class="timeline-item"
      type="button"
      @click="emit('select', examination)"
    >
      <span class="timeline-rail">
        <span class="timeline-dot"><ScanLine :size="13" /></span>
        <span v-if="index < examinations.length - 1" class="timeline-line" />
      </span>
      <span class="timeline-content">
        <strong>{{ examination.type }} · {{ examination.organ }}</strong>
        <span>{{ formatDate(examination.date) }}</span>
        <StatusBadge :status="examination.status" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 14px;
  padding: 0 0 18px;
  border: 0;
  background: transparent;
  text-align: left;
}

.timeline-rail {
  display: flex;
  width: 24px;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  display: grid;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.timeline-line {
  width: 2px;
  min-height: 30px;
  flex: 1;
  margin-top: 5px;
  background: var(--border);
}

.timeline-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
}

.timeline-content strong {
  color: var(--text);
  font-size: 13px;
}

.timeline-content > span:not(:last-child) {
  color: var(--text-muted);
  font-size: 12px;
}
</style>
