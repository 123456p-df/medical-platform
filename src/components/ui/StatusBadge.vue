<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewStatus } from '@/types'

const props = defineProps<{
  status: ReviewStatus
}>()

const normalized = computed(() => props.status.toLowerCase().replace(/\s+/g, '-'))
</script>

<template>
  <span :class="['status-badge', normalized]">
    <span class="dot" />
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.pending-review {
  background: #f8efe4;
  color: #a56b25;
}

.ai-completed {
  background: #e8eef9;
  color: #4a6fa6;
}

.reviewed,
.completed {
  background: #e6f1eb;
  color: #3f7d5d;
}

.abnormal {
  background: #f9e9ea;
  color: #aa4f55;
}
</style>
