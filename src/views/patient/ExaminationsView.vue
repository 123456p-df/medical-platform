<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useStudyWorkspaceStore } from '@/stores/studyWorkspace'
import PageHeader from '@/components/layout/PageHeader.vue'
import ExaminationCard from '@/components/medical/ExaminationCard.vue'
import StudyComparisonViewer from '@/components/medical/StudyComparisonViewer.vue'
import MultiStudyUpload from '@/components/medical/MultiStudyUpload.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Examination } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()
const workspace = useStudyWorkspaceStore()
const patientId = computed(() => auth.session?.id ?? '')
const comparisonId = ref(workspace.context.examinationId || '')

function openExam(examId: string) {
  router.push({ name: 'patient-examination-detail', params: { id: examId } })
}

onMounted(async () => {
  if (!store.examinations.length) {
    await store.loadPatientContext(patientId.value)
  }
  comparisonId.value ||= store.examinations.find(item => item.type === 'CT')?.id || ''
  if (comparisonId.value) workspace.selectExamination(comparisonId.value)
})

async function handleUploaded(studies: Examination[]) {
  await store.loadPatientContext(patientId.value)
  comparisonId.value = studies.at(-1)?.id || comparisonId.value
  workspace.selectExamination(comparisonId.value)
}

function selectStudy(id: string) {
  comparisonId.value = id
  workspace.selectExamination(id)
}
</script>

<template>
  <div class="page">
    <PageHeader :title="$t('ui.exams.title')" :subtitle="$t('ui.exams.subtitle')" />

    <section class="comparison-layout">
      <StudyComparisonViewer
        :examinations="store.examinations"
        :findings="store.findings"
        :initial-id="comparisonId"
        @select-study="selectStudy"
      />
      <MultiStudyUpload class="card" :patient-id="patientId" ct-only @complete="handleUploaded" />
    </section>

    <section class="exams-grid">
      <ExaminationCard
        v-for="exam in store.examinations"
        :key="exam.id"
        :examination="exam"
        @select="openExam(exam.id)"
      />
    </section>

    <StatePanel v-if="store.loading" kind="loading" :message="$t('Loading patient record...')" />
    <StatePanel v-else-if="store.error" kind="error" :message="store.error">
      <template #actions><button type="button" class="btn btn-secondary btn-sm" @click="store.loadPatientContext(patientId)">{{ $t('Retry') }}</button></template>
    </StatePanel>
    <StatePanel v-else-if="!store.examinations.length" kind="empty" :message="$t('No examinations are available.')" />
  </div>
</template>

<style scoped>
.exams-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.comparison-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start;margin-bottom:24px}

@media (max-width: 760px) {
  .comparison-layout,
  .exams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
