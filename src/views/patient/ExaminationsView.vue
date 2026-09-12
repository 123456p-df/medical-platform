<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import ExaminationCard from '@/components/medical/ExaminationCard.vue'
import StudyComparisonViewer from '@/components/medical/StudyComparisonViewer.vue'
import MultiStudyUpload from '@/components/medical/MultiStudyUpload.vue'
import type { Examination } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()
const patientId = computed(() => auth.session?.id ?? '')
const comparisonId = ref('')

function openExam(examId: string) {
  router.push({ name: 'patient-examination-detail', params: { id: examId } })
}

onMounted(async () => {
  if (!store.examinations.length) {
    await store.loadPatientContext(patientId.value)
  }
  comparisonId.value ||= store.examinations.find(item => item.type === 'CT')?.id || ''
})

async function handleUploaded(studies: Examination[]) {
  await store.loadPatientContext(patientId.value)
  comparisonId.value = studies.at(-1)?.id || comparisonId.value
}
</script>

<template>
  <div class="page">
    <PageHeader title="My Examinations" subtitle="上传并比较多个时期的 CT 检查。" />

    <section class="comparison-layout">
      <StudyComparisonViewer
        :examinations="store.examinations"
        :findings="store.findings"
        :initial-id="comparisonId"
        @select-study="comparisonId = $event"
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

    <div v-if="!store.examinations.length && !store.loading" class="card empty-state">
      No examinations are available.
    </div>
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
