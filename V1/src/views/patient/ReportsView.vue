<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { FileCheck2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import ReportCard from '@/components/medical/ReportCard.vue'

const auth = useAuthStore()
const store = usePatientStore()
const patientId = computed(() => auth.session?.id ?? 'P20260021')

onMounted(async () => {
  await store.loadPatientContext(patientId.value)
})
</script>

<template>
  <div class="page">
    <PageHeader :title="$t('My Reports')" :subtitle="$t('Doctor-reviewed results, written for you.')">
      <template #actions>
        <span class="report-count"><FileCheck2 :size="15" /> {{ $t(store.reviewedReports.length) }} {{ $t("reviewed") }}</span>
      </template>
    </PageHeader>

    <section class="reports-grid">
      <ReportCard
        v-for="report in store.reviewedReports"
        :key="report.id"
        :report="report"
        patient-facing
      />
    </section>

    <div v-if="!store.reviewedReports.length && !store.loading" class="card empty-state"> {{ $t("No reviewed reports are available yet.") }} </div>
  </div>
</template>

<style scoped>
.report-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 11px;
  font-weight: 700;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 800px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
