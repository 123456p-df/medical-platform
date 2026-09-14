<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabs'
import { useReportDraftStore } from '@/stores/reportDrafts'
import { t } from '@/i18n'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceTabsStore()
const drafts = useReportDraftStore()
const visibleTabs = computed(() => workspace.tabs.filter(tab => tab.portal === auth.portal))
const tabButtons = ref<HTMLButtonElement[]>([])
const legacyTitles: Record<string, string> = {
  '患者工作台': 'Patient Workspace',
  '患者概览': 'Overview',
  '医学影像': 'Medical Imaging',
  'AI 辅助诊断': 'AI Findings',
  '临床报告': 'Doctor Report',
  '3D 影像': '3D Viewer',
  '我的健康': 'My Health',
  '我的检查': 'My Examinations',
  '检查详情': 'Examination Detail',
  '我的报告': 'My Reports',
  '我的身体': 'My Body',
  'AI 助手': 'AI Assistant',
  '个人资料': 'ui.topbar.profile',
}

function displayTitle(title: string) {
  const separator = title.lastIndexOf(' · ')
  const prefix = separator >= 0 ? title.slice(0, separator + 3) : ''
  const base = separator >= 0 ? title.slice(separator + 3) : title
  return prefix + t(legacyTitles[base] || base)
}

function setTabButton(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) tabButtons.value[index] = element
}

function focusTab(index: number) {
  const count = visibleTabs.value.length
  if (!count) return
  tabButtons.value[(index + count) % count]?.focus()
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowRight') focusTab(index + 1)
  else if (event.key === 'ArrowLeft') focusTab(index - 1)
  else if (event.key === 'Home') focusTab(0)
  else if (event.key === 'End') focusTab(visibleTabs.value.length - 1)
  else return
  event.preventDefault()
}

async function closeTab(id: string) {
  const active = route.fullPath === id
  const index = workspace.closeTab(id)
  if (!active) return
  const remaining = visibleTabs.value
  const next = remaining[Math.min(Math.max(index, 0), remaining.length - 1)]
  await router.push(next?.path || (auth.portal === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'))
  await nextTick()
  focusTab(Math.min(Math.max(index, 0), remaining.length - 1))
}
</script>

<template>
  <div class="workspace-tabs" role="group" :aria-label="$t('ui.shell.openTabs')">
    <div
      v-for="tab in visibleTabs"
      :key="tab.id"
      class="workspace-tab"
      :class="{ active: route.fullPath === tab.id, dirty: drafts.hasDirtyPath(tab.path) }"
      :title="displayTitle(tab.title)"
    >
      <button :ref="element => setTabButton(element, visibleTabs.findIndex(item => item.id === tab.id))" class="tab-main" type="button" :tabindex="route.fullPath === tab.id ? 0 : -1" :aria-current="route.fullPath === tab.id ? 'page' : undefined" @keydown="onTabKeydown($event, visibleTabs.findIndex(item => item.id === tab.id))" @click="router.push(tab.path)">
        <span>{{ displayTitle(tab.title) }}<i v-if="drafts.hasDirtyPath(tab.path)" :aria-label="$t('ui.shell.unsavedDraft')">●</i></span>
      </button>
      <button class="tab-close" type="button" :aria-label="$t('ui.shell.closeTab', { title: displayTitle(tab.title) })" @click="closeTab(tab.id)">
        <X :size="13" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.workspace-tabs {
  position: sticky;
  z-index: 19;
  top: var(--topbar-height);
  display: flex;
  min-height: 42px;
  align-items: flex-end;
  gap: 3px;
  overflow-x: auto;
  padding: 7px 18px 0;
  border-bottom: 1px solid var(--border);
  background: rgb(245 248 249 / 94%);
  backdrop-filter: blur(10px);
  scrollbar-width: thin;
}

.workspace-tab {
  display: flex;
  min-width: 136px;
  max-width: 230px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 0 8px 0 12px;
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  text-align: left;
}

.tab-main {
  display: flex;
  min-width: 0;
  height: 100%;
  flex: 1;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}

.tab-main > span {
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tab-main i { margin-left: 6px; color: var(--amber); font-size: 9px; font-style: normal; }

.workspace-tab:hover {
  background: var(--surface-3);
  color: var(--text);
}

.workspace-tab.active {
  border-color: var(--border);
  background: var(--surface);
  color: var(--accent-strong);
  font-weight: 680;
}

.tab-close {
  display: grid;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
}

.tab-close:hover {
  background: var(--border);
  color: var(--text);
}

@media (max-width: 760px) {
  .workspace-tabs { padding-left: 10px; }
  .workspace-tab { min-width: 124px; }
}
</style>
