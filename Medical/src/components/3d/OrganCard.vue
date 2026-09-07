<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { OrganModel } from '@/types'

defineProps<{
  organ: OrganModel
  active?: boolean
}>()

const emit = defineEmits<{
  select: [organ: OrganModel]
}>()
</script>

<template>
  <button :class="['organ-card', { active }]" type="button" @click="emit('select', organ)">
    <span class="organ-dot" :style="{ background: organ.color }" />
    <span class="organ-copy">
      <strong>{{ organ.label }}</strong>
      <small>{{ organ.description }}</small>
    </span>
    <ChevronRight :size="17" />
  </button>
</template>

<style scoped>
.organ-card {
  display: grid;
  width: 100%;
  grid-template-columns: 12px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  text-align: left;
}

.organ-card:hover,
.organ-card.active {
  border-color: var(--accent);
  background: #f7fbfb;
}

.organ-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgb(47 143 146 / 10%);
}

.organ-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.3;
}

.organ-copy strong {
  color: var(--text);
  font-size: 13px;
}

.organ-copy small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
