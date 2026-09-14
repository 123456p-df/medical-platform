<script setup lang="ts">
import { ref, watch } from 'vue'
import { organCatalog } from '@/api/models'
import { api } from '@/api/client'
import DigitalHumanViewer from './DigitalHumanViewer.vue'
import OrganModelViewer from './OrganModelViewer.vue'
import { localPreview } from '@/utils/runtime'
import { usePatientStore } from '@/stores/patients'
import { t } from '@/i18n'
import StatePanel from '@/components/ui/StatePanel.vue'

const props = defineProps<{ patientId: string }>()
const patients = usePatientStore()
const organ = ref('lung')
const error = ref('')
const detail = ref<{
  name: string
  records: { record_id: number; date: string; diagnosis: string; description: string; doctor_name: string }[]
  records_total: number
  model: { model_id: string; source: string; available: boolean }
} | null>(null)

watch(
  () => [props.patientId, organ.value],
  async (_, __, onCleanup) => {
    let stale = false
    onCleanup(() => { stale = true })
    error.value = ''
    detail.value = null
    if (localPreview) {
      if (patients.selectedPatientId !== props.patientId) await patients.loadPatientContext(props.patientId)
      if (stale) return
      const records = patients.reviewedReports
        .filter(report => {
          if (report.patientId !== props.patientId) return false
          const examinationOrgan = patients.examinations.find(item => item.id === report.examinationId)?.organId
          const organIds = report.organIds?.length ? report.organIds : [report.organId || examinationOrgan || 'other']
          return organIds.includes(organ.value)
        })
        .map(report => ({ record_id: Number(report.id.replace(/\D/g, '')) || 0, date: report.date, diagnosis: report.diagnosis, description: report.description, doctor_name: report.doctor }))
      detail.value = { name: organCatalog.find(item => item.id === organ.value)?.label || organ.value, records, records_total: records.length, model: { model_id: '', source: 'preview', available: false } }
      return
    }
    try {
      const data = await api<NonNullable<typeof detail.value>>(
        '/patients/' + props.patientId + '/organs/' + organ.value
      )
      if (!stale) detail.value = data
    } catch (reason) {
      if (!stale) error.value = reason instanceof Error ? reason.message : t('ui.model.loadFailed')
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="organ-workspace">
    <aside class="card">
      <div class="card-header">
        <div>
          <h3>{{ $t('ui.model.navigation') }}</h3>
          <p class="muted">{{ $t('ui.model.navigationHelp') }}</p>
        </div>
      </div>
      <DigitalHumanViewer :selected-organ-id="organ" compact @select="organ = $event" />
      <div class="organ-buttons">
        <button
          v-for="item in organCatalog"
          :key="item.id"
          class="btn btn-secondary btn-sm"
          :class="{ selected: organ === item.id }"
          @click="organ = item.id"
        >
          {{ $t(item.label) }}
        </button>
      </div>
    </aside>
    <section class="stack">
      <div class="card">
        <div class="card-header">
          <h3>{{ detail?.name || organ }} · {{ $t('ui.model.anatomicalModel') }}</h3>
        </div>
        <StatePanel v-if="organ === 'other'" kind="empty" compact :message="$t('ui.model.otherHelp')" />
        <OrganModelViewer v-else :organ-id="organ" :model-info="detail?.model || null" />
      </div>
      <section class="card">
        <div class="card-header">
          <h3>{{ $t('ui.model.recordsTitle') }}</h3>
          <span class="muted">{{ $t('ui.model.recordCount', { count: detail?.records_total || 0 }) }}</span>
        </div>
        <div class="card-body">
          <p v-if="error" role="alert">{{ error }}</p>
          <article v-for="r in detail?.records || []" :key="r.record_id" class="history-record">
            <span>{{ r.date }} · {{ r.doctor_name }}</span>
            <h4>{{ r.diagnosis }}</h4>
            <p>{{ r.description }}</p>
          </article>
          <StatePanel v-if="detail && !detail.records.length" kind="empty" compact :message="$t('ui.model.noRecords')" />
          <p v-if="detail && detail.records_total > detail.records.length" class="muted">
            {{ $t('ui.model.latestRecords', { count: detail.records.length }) }}
          </p>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.organ-workspace {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.organ-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px;
}
.organ-buttons .selected {
  background: #d8ece9;
  border-color: #7fb5af;
  color: #236b66;
}
.history-record {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.history-record:last-child {
  border: 0;
}
.history-record > span {
  font-size: 11px;
  color: var(--text-muted);
}
.history-record h4 {
  margin: 10px 0 6px;
}
.history-record p {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 1050px) {
  .organ-workspace {
    grid-template-columns: 1fr;
  }
}
</style>
