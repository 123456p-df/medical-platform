<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import ExaminationCard from '@/components/medical/ExaminationCard.vue'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()
const patientId = computed(() => auth.session?.id ?? 'P20260021')

function openExam(examId: string) {
  router.push({ name: 'patient-examination-detail', params: { id: examId } })
}

onMounted(async () => {
  if (!store.examinations.length) {
    await store.loadPatientContext(patientId.value)
  }
})
</script>

<template>
  <div class="page">
    <PageHeader :title="$t('My Examinations')" :subtitle="$t('Your complete imaging history, shown in plain language.')" />

    <section class="exams-grid">
      <ExaminationCard
        v-for="exam in store.examinations"
        :key="exam.id"
        :examination="exam"
        @select="openExam(exam.id)"
      />
    </section>

    <div v-if="!store.examinations.length && !store.loading" class="card empty-state"> {{ $t("No examinations are available.") }} </div>
  </div>
</template>

<style scoped>
.exams-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 760px) {
  .exams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
