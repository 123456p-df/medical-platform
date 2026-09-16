<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Send, BookOpen, Sparkles } from 'lucide-vue-next'
import { organNames } from '@/api/mappers'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import AIResultCard from '@/components/medical/AIResultCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { normalizePatientId } from '@/utils/patientIds'
import type { Finding } from '@/types'
import { capabilityForStudy } from '@/utils/capabilities'
import { useAIChatStore } from '@/stores/aiChat'
import { t } from '@/i18n'
const auth = useAuthStore()
const patientStore = usePatientStore()
const ai = useAIChatStore()
const route = useRoute(), organ = ref('lung'), question = ref('')
const patientId = computed(() => normalizePatientId(auth.portal === 'patient' ? auth.session?.id : route.params.id))
const selectedExaminationId = ref(String(route.query.exam || ''))
const selectedExamination = computed(() => patientStore.examinations.find(item => item.id === selectedExaminationId.value)
  || patientStore.examinations[0])
const capabilities = computed(() => capabilityForStudy(selectedExamination.value, auth.portal))
const visibleFindings = computed(() => selectedExaminationId.value
  ? patientStore.findings.filter(item => item.examinationId === selectedExaminationId.value)
  : patientStore.findings)
const scopeKey = computed(() => `${auth.session?.username || 'anonymous'}:${patientId.value}:${organ.value}`)
const chat = computed(() => ai.thread(scopeKey.value))
const findingError = ref('')
const busy = computed(() => chat.value.busy)
const error = computed(() => findingError.value || chat.value.error)
const result = computed(() => chat.value.lastResponse)
const reference = computed(() => chat.value.reference)
async function ask() {
  findingError.value = ''
  const text = question.value.trim()
  if (!text) return
  const unavailable = capabilities.value.aiAssistant.enabled ? '' : capabilities.value.aiAssistant.reason
  const sent = await ai.ask(scopeKey.value, patientId.value, organ.value, text, unavailable)
  if (sent) question.value = ''
}
async function openReference(id:number) {
  await ai.openReference(scopeKey.value, id)
}
async function updateFinding(finding: Finding, status: Finding['status']) {
  try { await patientStore.updateFindingStatus(finding.id, status) }
  catch (reason) { findingError.value = reason instanceof Error ? reason.message : t('ui.ai.updateFindingFailed') }
}
onMounted(async () => {
  const id = patientId.value
  if (id && patientStore.selectedPatientId !== id) await patientStore.selectPatient(id)
  if (capabilities.value.aiAssistant.enabled) await ai.refreshConfiguration()
})
</script>
<template>
  <div class="diagnosis-stack">
    <section class="card findings-section">
      <div class="card-header findings-header">
        <div>
          <h3><Sparkles :size="18" /> {{ $t('ui.ai.findingsTitle') }}</h3>
          <p class="muted">{{ $t('ui.ai.findingsHelp') }}</p>
        </div>
        <label v-if="patientStore.examinations.length" class="study-filter">
          <span>{{ $t('ui.ai.study') }}</span>
          <select v-model="selectedExaminationId" class="select">
            <option value="">{{ $t('ui.ai.allStudies') }}</option>
            <option v-for="image in patientStore.examinations" :key="image.id" :value="image.id">
              {{ image.date }} · {{ image.type }} {{ image.organ }}
            </option>
          </select>
        </label>
      </div>
      <div class="card-body">
        <div v-if="visibleFindings.length" class="finding-grid">
          <AIResultCard
            v-for="finding in visibleFindings"
            :key="finding.id"
            :finding="finding"
            :compact="auth.portal !== 'doctor'"
            @update-status="updateFinding(finding, $event)"
          />
        </div>
        <StatePanel v-else kind="empty" :message="$t('ui.ai.noFindings')" />
      </div>
    </section>

    <div class="ai-grid">
      <section class="card">
      <div class="card-header"><div><h3><Sparkles :size="18" /> {{ $t('ui.ai.assistantTitle') }}</h3><p class="muted">{{ $t('ui.ai.assistantHelp') }}</p></div></div>
      <form class="card-body chat-form" @submit.prevent="ask">
        <label class="label">{{ $t('Organ') }}<select v-model="organ" class="select"><option v-for="(name,id) in organNames" :key="id" :value="id">{{ $t(name) }}</option></select></label>
        <label for="question" class="label">{{ $t('ui.ai.question') }}</label>
        <textarea id="question" v-model="question" class="textarea" maxlength="4000" required />
        <button class="btn btn-primary" :disabled="busy || !question.trim() || !capabilities.aiAssistant.enabled" :title="capabilities.aiAssistant.reason"><Send :size="16" /> {{ $t(busy ? 'ui.ai.readingRecords' : 'ui.ai.ask') }}</button>
        <p v-if="!capabilities.aiAssistant.enabled" class="capability-note">{{ capabilities.aiAssistant.reason }}</p>
        <StatePanel v-if="error" kind="error" :message="error" />
      </form>
      <div v-if="result" class="answer">
        <p>{{ result.answer }}</p>
        <small v-if="result.context_truncated">{{ $t('ui.ai.contextTruncated') }}</small>
        <div class="references"><button v-for="r in result.references" :key="r.record_id" class="btn btn-secondary btn-sm" @click="openReference(r.record_id)"><BookOpen :size="14" /> {{ r.date }} · Record {{ r.record_id }}</button></div>
      </div>
      </section>
      <aside class="card"><div class="card-header"><h3>{{ $t('ui.ai.evidence') }}</h3></div><div class="card-body">
        <p class="muted">{{ $t('ui.ai.evidenceHelp') }}</p>
        <p class="muted">{{ $t('ui.ai.separationNote') }}</p>
        <p class="muted">{{ $t('ui.ai.reviewNote') }}</p>
        <div v-if="reference"><h4>{{ reference.diagnosis }}</h4><small>{{ reference.record_date }}</small><p>{{ reference.description }}</p></div>
      </div></aside>
    </div>
  </div>
</template>
<style scoped>
.diagnosis-stack{display:grid;gap:18px}.findings-header{align-items:flex-end}.study-filter{display:grid;min-width:260px;gap:5px;color:var(--text-muted);font-size:11px}.finding-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ai-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}.chat-form{display:grid;gap:12px}.chat-form .label{display:grid;gap:8px}.chat-form .textarea{min-height:140px}.chat-form .btn{justify-self:start}
h3{display:flex;align-items:center;gap:8px}.error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}.answer{padding:0 22px 22px;white-space:pre-wrap}.references{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}aside p{line-height:1.8;font-size:13px}
.capability-note{margin:0;color:var(--text-muted);font-size:12px}
@media(max-width:1000px){.ai-grid{grid-template-columns:1fr}}@media(max-width:720px){.findings-header{align-items:stretch;flex-direction:column}.study-filter{min-width:0}.finding-grid{grid-template-columns:1fr}}
</style>
