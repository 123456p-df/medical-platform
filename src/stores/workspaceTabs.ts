import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PortalRole } from '@/types'

export interface WorkspaceTab {
  id: string
  path: string
  title: string
  portal: PortalRole
}

const STORAGE_KEY = 'pulmolink-workspace-tabs-v1'

function storedTabs(): WorkspaceTab[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.slice(0, 12) : []
  } catch {
    return []
  }
}

export const useWorkspaceTabsStore = defineStore('workspace-tabs', () => {
  const tabs = ref<WorkspaceTab[]>(storedTabs())

  function persist() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs.value))
  }

  function openTab(tab: WorkspaceTab) {
    const existing = tabs.value.find(item => item.id === tab.id)
    if (existing) Object.assign(existing, tab)
    else {
      tabs.value.push(tab)
      if (tabs.value.length > 12) tabs.value.shift()
    }
    persist()
  }

  function closeTab(id: string) {
    const index = tabs.value.findIndex(tab => tab.id === id)
    if (index >= 0) tabs.value.splice(index, 1)
    persist()
    return index
  }

  function reset() {
    tabs.value = []
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { tabs, openTab, closeTab, reset }
})
