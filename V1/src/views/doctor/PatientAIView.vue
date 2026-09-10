<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, CircleAlert, Clock3 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import AIResultCard from '@/components/medical/AIResultCard.vue'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const activeExamId = computed(() => store.activeExamId ?? store.examinations[0]?.id)
const activeFindings = computed(() =>
  store.findings.filter((finding) => finding.examinationId === activeExamId.value),
)
const pendingCount = computed(
  () => activeFindings.value.filter((finding) => finding.status === 'pending').length,
)
const confirmedCount = computed(
  () => activeFindings.value.filter((finding) => finding.status === 'confirmed').length,
)

</script>

<template>
  <div class="ai-layout">
    <section class="main-column">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("AI Finding Review") }}</h3>
            <p class="muted">{{ $t("Confirm, modify, or dismiss each model-generated finding.") }}</p>
          </div>
          <div class="review-summary">
            <span><Clock3 :size="14" /> {{ $t(pendingCount) }} {{ $t("pending") }}</span>
            <span><CheckCircle2 :size="14" /> {{ $t(confirmedCount) }} {{ $t("confirmed") }}</span>
          </div>
        </div>
        <div class="card-body stack">
          <AIResultCard
            v-for="finding in activeFindings"
            :key="finding.id"
            :finding="finding"
          />
          <div v-if="!activeFindings.length" class="empty-state"> {{ $t("No AI findings are available for this examination.") }} </div>
        </div>
      </div>
    </section>

    <aside class="side-column">
      <div class="card review-guide">
        <div class="card-header">
          <h3>{{ $t("Review Checklist") }}</h3>
        </div>
        <div class="card-body">
          <div class="check-item">
            <CircleAlert :size="17" />
            <span>{{ $t("Confirm findings that match the imaging evidence.") }}</span>
          </div>
          <div class="check-item">
            <CircleAlert :size="17" />
            <span>{{ $t("Modify any finding text before it reaches the final report.") }}</span>
          </div>
          <div class="check-item">
            <CircleAlert :size="17" />
            <span>{{ $t("Dismiss findings that are not clinically relevant.") }}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        @click="router.push({ name: 'doctor-patient-report', params: { id: patientId } })"
      > {{ $t("Continue to Report") }} </button>
    </aside>
  </div>
</template>

<style scoped>
.ai-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 18px;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--text-muted);
  font-size: 11px;
}

.review-summary span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.review-guide .card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: var(--text-soft);
  font-size: 12px;
}

.check-item svg {
  flex: 0 0 auto;
  color: var(--accent-strong);
}

@media (max-width: 900px) {
  .ai-layout {
    grid-template-columns: 1fr;
  }
}
</style>
