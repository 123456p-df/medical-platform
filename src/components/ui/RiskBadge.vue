<script setup lang="ts">
import { computed } from 'vue'
import type { RiskLevel } from '@/types'

const props = defineProps<{
  level: RiskLevel
}>()

const tone = computed(() => props.level.toLowerCase())
</script>

<template>
  <span :class="['risk-badge', tone]">{{ $t(level) }}</span>
</template>

<style scoped>
.unknown { background: #edf1f3; color: #71818a; }
.risk-badge {
  display: inline-flex;
  min-width: 50px;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 750;
}

.low {
  background: #e6f1eb;
  color: #3f7d5d;
}

.medium {
  background: #f8efe4;
  color: #a56b25;
}

.high {
  background: #f9e9ea;
  color: #a94c52;
}
</style>
