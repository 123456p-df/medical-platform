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

const props = withDefaults(
  defineProps<{
    groups: OrganGroup[]
    selected: string[]
    theme?: 'light' | 'dark'
    findingsCount?: number
    findingsVisible?: boolean
  }>(),
  {
    theme: 'dark',
    findingsCount: 0,
    findingsVisible: true,
  },
)

const emit = defineEmits<{
  toggle: [groupId: string, visible: boolean]
  setAll: [visible: boolean]
  toggleFindings: [visible: boolean]
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
  <section :class="['organ-list', { 'theme-light': theme === 'light' }]">
    <header>
      <strong>{{ $t('ui.model.visibleOrgans') }}</strong>
      <span>{{ groups.length + (findingsCount > 0 ? 1 : 0) }}</span>
    </header>
    <div class="list-tools">
      <input v-model="query" type="search" :placeholder="$t('ui.model.searchOrgans')" />
      <button type="button" @click="emit('setAll', true)">{{ $t('ui.model.selectAll') }}</button>
      <button type="button" @click="emit('setAll', false)">{{ $t('ui.model.selectNone') }}</button>
    </div>
    <ul>
      <!-- AI 检出肿瘤/病灶特殊图层项 -->
      <li v-if="findingsCount > 0" class="finding-layer-item">
        <label>
          <input
            type="checkbox"
            :checked="findingsVisible"
            @change="emit('toggleFindings', ($event.target as HTMLInputElement).checked)"
          />
          <span class="finding-swatch" />
          <span class="name finding-label">
            <span class="ai-badge">AI</span>
            肿瘤 / 结节病灶
          </span>
          <span class="count finding-count-badge">{{ findingsCount }} 个</span>
        </label>
      </li>

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
      <li v-if="!filtered.length && findingsCount === 0" class="empty">{{ $t('ui.model.noVisibleOrgans') }}</li>
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

/* AI 肿瘤特殊图层项样式 */
.finding-layer-item {
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
}
.finding-swatch {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}
.finding-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #fca5a5;
}
.ai-badge {
  display: inline-block;
  padding: 0 4px;
  border-radius: 3px;
  background: #ef4444;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.finding-count-badge {
  padding: 1px 6px;
  border-radius: 99px;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  font-size: 10px;
  font-weight: 600;
}

/* Light Theme */
.organ-list.theme-light {
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  color: #1e293b;
}
.organ-list.theme-light header {
  color: #0f172a;
}
.organ-list.theme-light .list-tools input,
.organ-list.theme-light .list-tools button {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
}
.organ-list.theme-light .list-tools button:hover {
  background: #f1f5f9;
}
.organ-list.theme-light li label:hover {
  background: #f8fafc;
  border-radius: 4px;
}
.organ-list.theme-light .count {
  color: #64748b;
}
.organ-list.theme-light .empty {
  color: #94a3b8;
}
.organ-list.theme-light .finding-layer-item {
  background: rgba(239, 68, 68, 0.05);
  border-bottom: 1px dashed rgba(239, 68, 68, 0.2);
}
.organ-list.theme-light .finding-label {
  color: #dc2626;
}
.organ-list.theme-light .finding-count-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}
</style>
