import { ref } from 'vue'
import { defineStore } from 'pinia'

export type StudyViewerMode = 'compare' | 'mpr' | 'projection' | '3d'

export interface StudyWorkspaceContext {
  patientId: string | null
  examinationId: string | null
  seriesId: string | null
  mode: StudyViewerMode | null
  comparisonIds: string[]
  contextRevision: number
}

const emptyContext = (): StudyWorkspaceContext => ({
  patientId: null,
  examinationId: null,
  seriesId: null,
  mode: null,
  comparisonIds: [],
  contextRevision: 0,
})

export const useStudyWorkspaceStore = defineStore('study-workspace', () => {
  const context = ref<StudyWorkspaceContext>(emptyContext())

  function bindContext(next: Partial<StudyWorkspaceContext>) {
    context.value = {
      ...emptyContext(),
      ...context.value,
      ...next,
      comparisonIds: next.comparisonIds ?? context.value.comparisonIds,
      contextRevision: context.value.contextRevision + 1,
    }
  }

  function selectExamination(examinationId: string | null) {
    bindContext({ examinationId, seriesId: null, comparisonIds: [] })
  }

  function selectSeries(seriesId: string | null) {
    bindContext({ seriesId })
  }

  function setMode(mode: StudyViewerMode | null) {
    bindContext({ mode })
  }

  function setComparisonIds(comparisonIds: string[]) {
    bindContext({ comparisonIds })
  }

  function clearContext() {
    bindContext({ ...emptyContext(), contextRevision: context.value.contextRevision })
  }

  return {
    context,
    bindContext,
    selectExamination,
    selectSeries,
    setMode,
    setComparisonIds,
    clearContext,
  }
})
