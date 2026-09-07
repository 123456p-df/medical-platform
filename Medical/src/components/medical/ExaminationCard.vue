<script setup lang="ts">
import { ChevronRight, ScanLine } from 'lucide-vue-next'
import type { Examination } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  examination: Examination
}>()

const emit = defineEmits<{
  select: [examination: Examination]
}>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}
</script>

<template>
  <button class="exam-card" type="button" @click="emit('select', examination)">
    <span class="exam-icon"><ScanLine :size="20" /></span>
    <span class="exam-main">
      <strong>{{ examination.type }} · {{ examination.bodyPart }}</strong>
      <span>{{ examination.organ }} · {{ formatDate(examination.date) }}</span>
    </span>
    <StatusBadge :status="examination.status" />
    <ChevronRight :size="18" class="exam-chevron" />
  </button>
</template>

<style scoped>
.exam-card {
  display: grid;
  width: 100%;
  grid-template-columns: 42px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  text-align: left;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.exam-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.exam-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.exam-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.35;
}

.exam-main strong {
  color: var(--text);
  font-size: 14px;
}

.exam-main span {
  color: var(--text-muted);
  font-size: 12px;
}

.exam-chevron {
  color: var(--text-muted);
}

@media (max-width: 520px) {
  .exam-card {
    grid-template-columns: 38px minmax(0, 1fr) 18px;
  }

  .exam-card :deep(.status-badge) {
    display: none;
  }
}
</style>
