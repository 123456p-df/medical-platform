<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Activity, Box } from 'lucide-vue-next'
import { mockOrganModels } from '@/data/mockData'
import { usePatientStore } from '@/stores/patients'
import DigitalHumanViewer from '@/components/3d/DigitalHumanViewer.vue'
import LungViewer from '@/components/3d/LungViewer.vue'
import FindingPanel from '@/components/3d/FindingPanel.vue'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const selectedOrganId = ref<string>('lung')
const activeFindingId = ref<string | null>(null)

const lungFindings = computed(() =>
  store.findings.filter((finding) => finding.organ === 'Lung'),
)
const activeFinding = computed(
  () => lungFindings.value.find((finding) => finding.id === activeFindingId.value) ?? null,
)
const selectedOrgan = computed(
  () => mockOrganModels.find((organ) => organ.id === selectedOrganId.value),
)

watch(
  lungFindings,
  (findings) => {
    if (!findings.some((finding) => finding.id === activeFindingId.value)) {
      activeFindingId.value = findings[0]?.id ?? null
    }
  },
  { immediate: true },
)

function onOrganSelect(organId: string) {
  selectedOrganId.value = organId
  if (organId === 'lung' && lungFindings.value.length) {
    activeFindingId.value = lungFindings.value[0].id
  }
}
</script>

<template>
  <div class="three-layout">
    <section class="human-card card">
      <div class="card-header">
        <div>
          <h3>Digital Human</h3>
          <p class="muted">Select an organ to open its visualization.</p>
        </div>
      </div>
      <div class="card-body">
        <DigitalHumanViewer
          :selected-organ-id="selectedOrganId"
          @select="onOrganSelect"
        />
      </div>
    </section>

    <section class="organ-view">
      <template v-if="selectedOrganId === 'lung'">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>Lung 3D Model</h3>
              <p class="muted">Standard anatomical model with AI finding marker.</p>
            </div>
            <span class="organ-chip"><Activity :size="14" /> Lung</span>
          </div>
          <div class="card-body">
            <LungViewer
              :findings="lungFindings"
              :active-finding-id="activeFindingId"
              @select-finding="activeFindingId = $event"
            />
          </div>
        </div>
        <div v-if="activeFinding" class="marker-panel">
          <FindingPanel
            :finding="activeFinding"
            :has-report="Boolean(store.reports.find((report) => report.examinationId === store.examinations[0]?.id))"
            @view-ct="router.push({ name: 'doctor-patient-imaging', params: { id: patientId } })"
            @view-report="router.push({ name: 'doctor-patient-report', params: { id: patientId } })"
          />
        </div>
      </template>

      <div v-else class="card future-organ">
        <div class="future-icon"><Box :size="26" /></div>
        <h3>{{ selectedOrgan?.label }}</h3>
        <p>{{ selectedOrgan?.description }}</p>
        <p class="muted">The clinical module for this organ is available in a future release.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.three-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.78fr) minmax(0, 1.22fr);
  align-items: start;
  gap: 18px;
}

.organ-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.organ-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 11px;
  font-weight: 720;
}

.marker-panel {
  max-width: 420px;
}

.future-organ {
  min-height: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.future-icon {
  display: grid;
  width: 60px;
  height: 60px;
  place-items: center;
  border-radius: 14px;
  background: var(--surface-3);
  color: var(--text-soft);
}

.future-organ h3 {
  margin: 16px 0 7px;
}

.future-organ p {
  max-width: 340px;
  margin: 0;
  color: var(--text-soft);
}

@media (max-width: 980px) {
  .three-layout {
    grid-template-columns: 1fr;
  }
}
</style>
