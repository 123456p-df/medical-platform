<script setup lang="ts">
import { computed, ref } from 'vue'

export type OrganGroup = {
  id: string
  name: string
  color: [number, number, number]
  labelIds: number[]
  meshNames: string[]
  count: number
}

const props = defineProps<{
  groups: OrganGroup[]
  selected: string[]
}>()

const emit = defineEmits<{
  toggle: [groupId: string, visible: boolean]
  setAll: [visible: boolean]
}>()

const query = ref('')
const selectedSet = computed(() => new Set(props.selected))
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.groups
  return props.groups.filter((item) => item.name.toLowerCase().includes(needle))
})
</script>

<template>
  <section class="organ-list">
    <header>
      <strong>本检查出现的器官</strong>
      <span>{{ groups.length }}</span>
    </header>
    <div class="list-tools">
      <input v-model="query" type="search" placeholder="搜索器官" />
      <button type="button" @click="emit('setAll', true)">全选</button>
      <button type="button" @click="emit('setAll', false)">全不选</button>
    </div>
    <ul>
      <li v-for="item in filtered" :key="item.id">
        <label>
          <input
            type="checkbox"
            :checked="selectedSet.has(item.id)"
            @change="emit('toggle', item.id, ($event.target as HTMLInputElement).checked)"
          />
          <span class="swatch" :style="{ background: `rgb(${item.color.join(',')})` }" />
          <span class="name">{{ item.name }}</span>
          <span v-if="item.count > 1" class="count">{{ item.count }}</span>
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
  background: #101820;
  color: #d5e4e8;
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
  border: 1px solid #2c3f48;
  border-radius: 6px;
  background: #172229;
  color: #d5e4e8;
  font-size: 11px;
}
.list-tools button { padding: 0 8px; }
ul {
  overflow: auto;
  max-height: 240px;
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
.name { flex: 1; }
.count {
  color: #7f9aa3;
  font-size: 10px;
}
.swatch {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 18%);
}
.empty {
  padding: 16px;
  color: #7f9aa3;
  font-size: 12px;
}
</style>
