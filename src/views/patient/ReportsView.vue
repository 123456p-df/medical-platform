<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FileCheck2, Search } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import ReportCard from '@/components/medical/ReportCard.vue'
import { organNames } from '@/api/mappers'
import StatePanel from '@/components/ui/StatePanel.vue'

const auth = useAuthStore()
const store = usePatientStore()
const patientId = computed(() => auth.session?.id ?? '')
const query = ref('')
const organ = ref('all')
const fromDate = ref('')
const toDate = ref('')
const availableOrgans = computed(() => [...new Set(store.reviewedReports.flatMap(report => report.organIds || [report.organId || 'other']))])
const filteredReports = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return store.reviewedReports.filter(report => {
    const organs = report.organIds || [report.organId || 'other']
    const text = [report.id, report.examinationId, report.diagnosis, report.description, report.recommendation, report.doctor].join(' ').toLocaleLowerCase()
    return (!needle || text.includes(needle))
      && (organ.value === 'all' || organs.includes(organ.value))
      && (!fromDate.value || report.date >= fromDate.value)
      && (!toDate.value || report.date <= toDate.value)
  })
})

onMounted(async () => {
  await store.loadPatientContext(patientId.value)
})
</script>

<template>
  <div class="page">
    <PageHeader title="My Reports" subtitle="ui.reports.subtitle">
      <template #actions>
        <span class="report-count"><FileCheck2 :size="15" /> {{ $t('ui.reports.count', { count: store.reviewedReports.length }) }}</span>
      </template>
    </PageHeader>

    <section class="card report-filters" :aria-label="$t('ui.reports.filters')">
      <label class="search-field"><Search :size="15" /><span class="sr-only">{{ $t('ui.reports.search') }}</span><input v-model="query" type="search" :placeholder="$t('ui.reports.searchPlaceholder')" /></label>
      <label><span>{{ $t('ui.reports.organ') }}</span><select v-model="organ"><option value="all">{{ $t('ui.reports.allOrgans') }}</option><option v-for="id in availableOrgans" :key="id" :value="id">{{ $t(organNames[id] || id) }}</option></select></label>
      <label><span>{{ $t('ui.reports.startDate') }}</span><input v-model="fromDate" type="date" :max="toDate || undefined" /></label>
      <label><span>{{ $t('ui.reports.endDate') }}</span><input v-model="toDate" type="date" :min="fromDate || undefined" /></label>
      <button v-if="query || organ !== 'all' || fromDate || toDate" type="button" class="btn btn-secondary btn-sm" @click="query = ''; organ = 'all'; fromDate = ''; toDate = ''">{{ $t('ui.reports.clear') }}</button>
    </section>

    <section class="reports-grid">
      <ReportCard
        v-for="report in filteredReports"
        :key="report.id"
        :report="report"
        patient-facing
        :patient-name="auth.session?.name"
      />
    </section>

    <StatePanel v-if="store.loading" kind="loading" :message="$t('Loading patient record...')" />
    <StatePanel v-else-if="store.error" kind="error" :message="store.error">
      <template #actions><button type="button" class="btn btn-secondary btn-sm" @click="store.loadPatientContext(patientId)">{{ $t('Retry') }}</button></template>
    </StatePanel>
    <StatePanel v-else-if="!filteredReports.length" kind="empty" :message="$t(store.reviewedReports.length ? 'ui.reports.noMatch' : 'ui.reports.empty')" />
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
.report-filters{display:flex;align-items:end;gap:10px;margin-bottom:14px;padding:12px;flex-wrap:wrap}.report-filters label{display:grid;gap:5px;color:var(--text-muted);font-size:10px}.report-filters input,.report-filters select{min-height:36px;padding:0 9px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text)}.search-field{position:relative;display:flex!important;min-width:250px;flex:1;align-items:center}.search-field>svg{position:absolute;left:10px}.search-field input{width:100%;padding-left:32px}

@media (max-width: 800px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
