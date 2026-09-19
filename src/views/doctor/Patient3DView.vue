<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Box, Layers, ScanLine } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { capabilityForStudy } from '@/utils/capabilities'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()
const auth = useAuthStore()
const patientId = computed(() => String(route.params.id))
const volumeStudies = computed(() => store.examinations.filter((item) => ['CT', 'MRI'].includes(item.type)))
const reconstructableStudies = computed(() => volumeStudies.value.filter(study => capabilityForStudy(study, auth.portal).reconstruction3d.enabled))
const unavailableReason = computed(() => volumeStudies.value.length
  ? capabilityForStudy(volumeStudies.value[0], auth.portal).reconstruction3d.reason
  : t('ui.patient3d.noCt'))

async function openViewer() {
  const exam = reconstructableStudies.value[0]
  await router.push({
    name: 'study-viewer',
    params: { patientId: patientId.value },
    query: exam ? { image: exam.id } : {},
  })
}
</script>

<template>
  <section class="card viewer-launch">
    <div class="launch-icon">
      <Box :size="36" />
    </div>
    <div class="launch-content">
      <h3>{{ $t('ui.patient3d.title') }}</h3>
      <p>
        {{ $t('ui.patient3d.body') }}
      </p>
      <div v-if="reconstructableStudies.length" class="study-badge">
        <Layers :size="14" />
        <span>{{ $t('ui.patient3d.studyCount', { count: reconstructableStudies.length }) }}</span>
      </div>
      <div v-else class="study-badge warning">
        <span>{{ unavailableReason }}</span>
      </div>
    </div>
    <div class="launch-action">
      <button v-if="reconstructableStudies.length" type="button" class="btn btn-primary launch-btn" @click="openViewer">
        <span>{{ $t('ui.patient3d.openInTab') }}</span>
        <ScanLine :size="16" />
      </button>
      <button v-else type="button" class="btn btn-secondary launch-btn" disabled>{{ unavailableReason }}</button>
    </div>
  </section>
</template>

<style scoped>
.viewer-launch {
  display: flex;
  min-height: 220px;
  align-items: center;
  gap: 24px;
  padding: 36px;
  background: var(--surface, #ffffff);
  border-radius: 12px;
}

.launch-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 16px;
  background: var(--accent-soft, #e6f6f4);
  color: var(--accent, #149486);
  flex-shrink: 0;
}

.launch-content {
  flex: 1;
}

.launch-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text, #1e293b);
}

.launch-content p {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted, #64748b);
  max-width: 620px;
}

.study-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--surface-3, #f1f5f9);
  color: var(--text-soft, #475569);
  font-size: 12px;
  font-weight: 500;
}

.study-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.launch-action {
  flex-shrink: 0;
}

.launch-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
</style>
