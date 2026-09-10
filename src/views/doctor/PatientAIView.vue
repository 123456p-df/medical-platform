<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Send, BookOpen, Sparkles } from 'lucide-vue-next'
import { api } from '@/api/client'
import { organNames } from '@/api/mappers'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import AIResultCard from '@/components/medical/AIResultCard.vue'
import type { Finding } from '@/types'
const auth = useAuthStore()
const patientStore = usePatientStore()
const route = useRoute(), organ = ref('lung'), question = ref('请根据已有病历总结最近的情况，并指出资料不足之处。')
const patientId = computed(() => Number(auth.portal === 'patient' ? auth.session?.id : route.params.id))
const selectedExaminationId = ref(String(route.query.exam || ''))
const visibleFindings = computed(() => selectedExaminationId.value
  ? patientStore.findings.filter(item => item.examinationId === selectedExaminationId.value)
  : patientStore.findings)
const busy = ref(false), error = ref('')
const result = ref<{ answer: string; references: {record_id:number;date:string}[]; context_truncated:boolean } | null>(null)
const reference = ref<{diagnosis:string;description:string;record_date:string} | null>(null)
async function ask() {
  busy.value=true; error.value=''; result.value=null; reference.value=null
  try { result.value = await api('/ai/chat',{method:'POST',body:JSON.stringify({patient_id:patientId.value,organ_id:organ.value,question:question.value})}) }
  catch(reason) { error.value=reason instanceof Error ? reason.message : '请求失败' }
  finally { busy.value=false }
}
async function openReference(id:number) {
  try { reference.value=await api('/medical-records/'+id) }
  catch(reason) { error.value=reason instanceof Error ? reason.message : '读取引用失败' }
}
async function updateFinding(finding: Finding, status: Finding['status']) {
  try { await patientStore.updateFindingStatus(finding.id, status) }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '审核 finding 失败' }
}
onMounted(async () => {
  const id = String(patientId.value)
  if (id && patientStore.selectedPatientId !== id) await patientStore.selectPatient(id)
})
</script>
<template>
  <div class="diagnosis-stack">
    <section class="card findings-section">
      <div class="card-header findings-header">
        <div>
          <h3><Sparkles :size="18" /> 肺结节候选 Findings</h3>
          <p class="muted">模型候选结果不是诊断结论；医生可确认、修改或忽略。</p>
        </div>
        <label v-if="patientStore.examinations.length" class="study-filter">
          <span>影像</span>
          <select v-model="selectedExaminationId" class="select">
            <option value="">全部影像</option>
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
        <div v-else class="empty-state">所选影像还没有肺结节候选结果。请在影像页启动检测。</div>
      </div>
    </section>

    <div class="ai-grid">
      <section class="card">
      <div class="card-header"><div><h3><Sparkles :size="18" /> Medical AI Assistant</h3><p class="muted">Summarize the patient's documented history with record references.</p></div></div>
      <form class="card-body chat-form" @submit.prevent="ask">
        <label class="label">Organ<select v-model="organ" class="select"><option v-for="(name,id) in organNames" :key="id" :value="id">{{ name }}</option></select></label>
        <label for="question" class="label">Question</label>
        <textarea id="question" v-model="question" class="textarea" maxlength="4000" required />
        <button class="btn btn-primary" :disabled="busy || !question.trim()"><Send :size="16" /> {{ busy ? 'Reading records…' : 'Ask assistant' }}</button>
        <div v-if="error" role="alert" class="error">{{ error }}</div>
      </form>
      <div v-if="result" class="answer">
        <p>{{ result.answer }}</p>
        <small v-if="result.context_truncated">部分历史超出上下文限制，本次回答未覆盖全部资料。</small>
        <div class="references"><button v-for="r in result.references" :key="r.record_id" class="btn btn-secondary btn-sm" @click="openReference(r.record_id)"><BookOpen :size="14" /> {{ r.date }} · Record {{ r.record_id }}</button></div>
      </div>
      </section>
      <aside class="card"><div class="card-header"><h3>Evidence &amp; context</h3></div><div class="card-body">
        <p class="muted">Only authorized records for the selected organ are included. The assistant receives record text and imaging metadata.</p>
        <p class="muted">肺结节检测与器官分割是独立任务；候选框和置信度必须结合原始 CT 审核。</p>
        <p class="muted">用于辅助整理资料，回答需要医生结合原始记录核实。</p>
        <div v-if="reference"><h4>{{ reference.diagnosis }}</h4><small>{{ reference.record_date }}</small><p>{{ reference.description }}</p></div>
      </div></aside>
    </div>
  </div>
</template>
<style scoped>
.diagnosis-stack{display:grid;gap:18px}.findings-header{align-items:flex-end}.study-filter{display:grid;min-width:260px;gap:5px;color:var(--text-muted);font-size:11px}.finding-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ai-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}.chat-form{display:grid;gap:12px}.chat-form .label{display:grid;gap:8px}.chat-form .textarea{min-height:140px}.chat-form .btn{justify-self:start}
h3{display:flex;align-items:center;gap:8px}.error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}.answer{padding:0 22px 22px;white-space:pre-wrap}.references{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}aside p{line-height:1.8;font-size:13px}
@media(max-width:1000px){.ai-grid{grid-template-columns:1fr}}@media(max-width:720px){.findings-header{align-items:stretch;flex-direction:column}.study-filter{min-width:0}.finding-grid{grid-template-columns:1fr}}
</style>
