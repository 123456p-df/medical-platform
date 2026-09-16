import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { readSession } from '@/api/client'

export interface ReportDraftFields {
  diagnosis: string
  description: string
  recommendation: string
}

export interface StoredReportDraft {
  patientId: string
  examinationId: string
  reportId: string
  fields: ReportDraftFields
  updatedAt: string
}

const STORAGE_PREFIX = 'pulmolink-report-drafts-v1:'

function accountScope(): string {
  try {
    const session = JSON.parse(readSession() || 'null')
    return session?.id && session?.role ? `${session.role}:${session.id}` : 'anonymous'
  } catch {
    return 'anonymous'
  }
}

function storageKey(scope: string) {
  return STORAGE_PREFIX + scope
}

function draftKey(patientId: string, examinationId: string) {
  return `${patientId}::${examinationId}`
}

export const useReportDraftStore = defineStore('report-drafts', () => {
  const scope = ref('')
  const drafts = ref<Record<string, StoredReportDraft>>({})

  function ensureLoaded() {
    const nextScope = accountScope()
    if (scope.value === nextScope) return
    scope.value = nextScope
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey(nextScope)) || '{}')
      drafts.value = parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      drafts.value = {}
    }
  }

  function persist() {
    ensureLoaded()
    localStorage.setItem(storageKey(scope.value), JSON.stringify(drafts.value))
  }

  function get(patientId: string, examinationId: string) {
    ensureLoaded()
    return drafts.value[draftKey(patientId, examinationId)]
  }

  function save(draft: StoredReportDraft) {
    ensureLoaded()
    drafts.value[draftKey(draft.patientId, draft.examinationId)] = structuredClone(draft)
    persist()
  }

  function clear(patientId: string, examinationId: string) {
    ensureLoaded()
    delete drafts.value[draftKey(patientId, examinationId)]
    persist()
  }

  function hasDirtyForPatient(patientId: string) {
    ensureLoaded()
    return Object.values(drafts.value).some(draft => draft.patientId === patientId)
  }

  function hasDirtyPath(path: string) {
    const match = /^\/doctor\/patients\/([^/]+)\/report(?:[/?#]|$)/.exec(path)
    return Boolean(match && hasDirtyForPatient(decodeURIComponent(match[1])))
  }

  function reset() {
    scope.value = ''
    drafts.value = {}
  }

  const count = computed(() => {
    ensureLoaded()
    return Object.keys(drafts.value).length
  })

  return { drafts, count, get, save, clear, hasDirtyForPatient, hasDirtyPath, reset }
})
