import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readSession } from '@/api/client'
import { stableWorkspaceTabId } from '@/utils/workspaceTabKeys'
import type { PortalRole } from '@/types'

export interface WorkspaceTab {
  id: string
  path: string
  title: string
  portal: PortalRole
}

const STORAGE_KEY = 'pulmolink-workspace-tabs-v1'

function accountScope(): string {
  try {
    const session = JSON.parse(readSession() || 'null')
    return session?.id && session?.role ? `${session.role}:${session.id}` : 'anonymous'
  } catch {
    return 'anonymous'
  }
}

function storedTabs(): WorkspaceTab[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    const unique = new Map<string, WorkspaceTab>()
    for (const raw of value.slice(0, 20)) {
      if (!raw || typeof raw !== 'object' || typeof raw.path !== 'string' || typeof raw.portal !== 'string') continue
      const portal: PortalRole = raw.portal === 'patient' ? 'patient' : 'doctor'
      const tab = {
        id: stableWorkspaceTabId(raw.path, portal, accountScope()),
        path: String(raw.path),
        title: typeof raw.title === 'string' ? raw.title : '',
        portal,
      }
      unique.set(tab.id, tab)
    }
    return [...unique.values()].slice(0, 12)
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
    const id = stableWorkspaceTabId(tab.path, tab.portal, accountScope())
    const normalized = { ...tab, id }
    const existing = tabs.value.find(item => item.id === id)
    if (existing) Object.assign(existing, normalized)
    else {
      tabs.value.push(normalized)
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
