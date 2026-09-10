<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    note?: string
    icon: Component
    tone?: 'teal' | 'blue' | 'amber' | 'red' | 'green' | 'violet'
  }>(),
  {
    tone: 'teal',
    note: 'vs last week',
  },
)
</script>

<template>
  <article :class="['stats-card', `tone-${tone}`]">
    <div class="stats-icon">
      <component :is="icon" :size="19" />
    </div>
    <div class="stats-copy">
      <span class="stats-label">{{ $t(label) }}</span>
      <strong>{{ $t(value) }}</strong>
      <small>{{ $t(note) }}</small>
    </div>
  </article>
</template>

<style scoped>
.stats-card {
  display: flex;
  min-height: 112px;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.stats-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
}

.stats-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.stats-label {
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 640;
}

.stats-copy strong {
  margin-top: 5px;
  color: var(--text);
  font-size: 27px;
  line-height: 1.1;
}

.stats-copy small {
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 11px;
}

.tone-teal .stats-icon {
  background: #e3f3f3;
  color: #277b7f;
}

.tone-blue .stats-icon {
  background: #e8eef9;
  color: #4c72ae;
}

.tone-amber .stats-icon {
  background: #f8efe4;
  color: #aa6d28;
}

.tone-red .stats-icon {
  background: #f9e9ea;
  color: #ac5156;
}

.tone-green .stats-icon {
  background: #e6f1eb;
  color: #3f7d5d;
}

.tone-violet .stats-icon {
  background: #efeaf7;
  color: #6f5f9c;
}
</style>
