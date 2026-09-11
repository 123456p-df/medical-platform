<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ViewerOrgan } from '@/api/viewer'

const props = defineProps<{
  organs: ViewerOrgan[]
  selected: number[]
}>()

const emit = defineEmits<{
  toggle: [labelId: number, visible: boolean]
  setAll: [visible: boolean]
}>()

const query = ref('')
const selectedSet = computed(() => new Set(props.selected))
const completed = computed(() =>
  props.organs.filter((item) => item.status === 'completed' && item.label_id != null),
)
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return completed.value
  return completed.value.filter((item) =>
    [item.display_name, item.name, String(item.label_id)].join(' ').toLowerCase().includes(needle),
  )
})

function color(item: ViewerOrgan) {
  const [r, g, b] = item.color || [160, 160, 160]
  return `rgb(${r}, ${g}, ${b})`
}
</script>

<template>
  <section class="organ-list">
    <header>
      <strong>本检查出现的器官</strong>
      <span>{{ completed.length }}</span>
    </header>
    <div class="list-tools">
      <input v-model="query" type="search" placeholder="搜索器官" />
      <button type="button" @click="emit('setAll', true)">全选</button>
      <button type="button" @click="emit('setAll', false)">全不选</button>
    </div>
    <ul>
      <li v-for="item in filtered" :key="item.task_id">
        <label>
          <input
            type="checkbox"
            :checked="selectedSet.has(item.label_id!)"
            @change="emit('toggle', item.label_id!, ($event.target as HTMLInputElement).checked)"
          />
          <span class="swatch" :style="{ background: color(item) }" />
          <span>{{ item.display_name || item.name }}</span>
        </label>
      </li>
      <li v-if="!filtered.length" class="empty">当前检查没有可显示的器官</li>
    </ul>
  </section>
</template>

<style scoped>
.organ-list {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  border-top: 1px solid var(--border);
  background: #f7fbfb;
}
.organ-list header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px 6px;
  font-size: 12px;
}
.list-tools {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 6px;
  padding: 0 12px 8px;
}
.list-tools input,
.list-tools button {
  min-height: 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
}
.list-tools button {
  padding: 0 8px;
}
ul {
  overflow: auto;
  max-height: 220px;
  margin: 0;
  padding: 0 8px 10px;
  list-style: none;
}
li label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 2px 4px;
  font-size: 12px;
}
.swatch {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 12%);
}
.empty {
  padding: 16px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
