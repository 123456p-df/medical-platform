<script setup lang="ts">
import { locale } from '@/i18n'
import { ChevronRight, ScanLine } from 'lucide-vue-next'
import type { Examination } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  examinations: Examination[]
}>()

const emit = defineEmits<{
  select: [examination: Examination]
}>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
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
        <strong>{{ $t(examination.type) }} · {{ $t(examination.organ) }}</strong>
        <span>{{ $t(formatDate(examination.date)) }}</span>
        <StatusBadge :status="examination.status" />
      </span>
      <span class="timeline-action">{{ examination.status === 'Pending Review' ? '开始审核' : '查看影像' }}<ChevronRight :size="15" /></span>
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

.timeline-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-top: 4px;
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.timeline-item:hover .timeline-action {
  text-decoration: underline;
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
