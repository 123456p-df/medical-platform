<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Send, BookOpen, Sparkles } from 'lucide-vue-next'
import { api } from '@/api/client'
import { organNames } from '@/api/mappers'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const route = useRoute(), organ = ref('lung'), question = ref('请根据已有病历总结最近的情况，并指出资料不足之处。')
const patientId = computed(() => Number(auth.portal === 'patient' ? auth.session?.id : route.params.id))
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
</script>
<template>
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
      <p class="muted">Organ segmentation does not generate lesion diagnoses or confidence scores.</p>
      <p class="muted">用于辅助整理资料，回答需要医生结合原始记录核实。</p>
      <div v-if="reference"><h4>{{ reference.diagnosis }}</h4><small>{{ reference.record_date }}</small><p>{{ reference.description }}</p></div>
    </div></aside>
  </div>
</template>
<style scoped>
.ai-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}.chat-form{display:grid;gap:12px}.chat-form .label{display:grid;gap:8px}.chat-form .textarea{min-height:140px}.chat-form .btn{justify-self:start}
h3{display:flex;align-items:center;gap:8px}.error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}.answer{padding:0 22px 22px;white-space:pre-wrap}.references{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}aside p{line-height:1.8;font-size:13px}
@media(max-width:1000px){.ai-grid{grid-template-columns:1fr}}
</style>
