<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabs'
import { t } from '@/i18n'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceTabsStore()
const visibleTabs = computed(() => workspace.tabs.filter(tab => tab.portal === auth.portal))

function translatedTitle(title: string) {
  const separator = title.lastIndexOf(' · ')
  return separator < 0 ? t(title) : `${title.slice(0, separator)} · ${t(title.slice(separator + 3))}`
}

function closeTab(id: string) {
  const active = route.fullPath === id
  const index = workspace.closeTab(id)
  if (!active) return
  const remaining = visibleTabs.value
  const next = remaining[Math.min(Math.max(index, 0), remaining.length - 1)]
  router.push(next?.path || (auth.portal === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'))
}
</script>

<template>
  <div class="workspace-tabs" role="tablist" :aria-label="$t('Opened work pages')">
    <div
      v-for="tab in visibleTabs"
      :key="tab.id"
      class="workspace-tab"
      :class="{ active: route.fullPath === tab.id }"
      :title="translatedTitle(tab.title)"
    >
      <button class="tab-main" type="button" role="tab" :aria-selected="route.fullPath === tab.id" @click="router.push(tab.path)">
        <span>{{ translatedTitle(tab.title) }}</span>
      </button>
      <button class="tab-close" type="button" :aria-label="$t('Close {title}', { title: translatedTitle(tab.title) })" @click="closeTab(tab.id)">
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
