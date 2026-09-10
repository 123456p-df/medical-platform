<script setup lang="ts">
import { computed, reactive, ref, watch, nextTick } from 'vue'
import { Check, Plus, Trash2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { api } from '@/api/client'
import { organNames } from '@/api/mappers'
import ReportCard from '@/components/medical/ReportCard.vue'
const store=usePatientStore(), selected=ref(store.reports[0]?.id || '')
const current=computed(() => store.reports.find(r=>r.id===selected.value))
const form=reactive({organs:['other'] as string[],diagnosis:'',description:'',date:new Date().toISOString().slice(0,10)})
const error=ref(''), saved=ref(false), busy=ref(false)
watch(current,r=>{form.organs=r?.organIds?.length ? [...r.organIds] : [r?.organId || 'other'];form.diagnosis=r?.diagnosis||'';form.description=r?.description||'';form.date=r?.date||new Date().toISOString().slice(0,10);saved.value=false},{immediate:true})
function newRecord(){selected.value='';form.organs=['other'];form.diagnosis='';form.description='';saved.value=false}
async function save(){
  if(!store.selectedPatientId || !form.organs.length)return
  busy.value=true;error.value='';saved.value=false
  try{
    const result=await store.saveReport({id:selected.value,patientId:store.selectedPatientId,organId:form.organs[0],organIds:[...form.organs],
      examinationId:'',diagnosis:form.diagnosis,description:form.description,recommendation:'',doctor:'',date:form.date,reviewed:true})
    selected.value=result.id;await nextTick();saved.value=true
  }catch(reason){error.value=reason instanceof Error?reason.message:'保存失败'}finally{busy.value=false}
}
async function remove(){
  if(!selected.value)return
  if(!window.confirm('将这条病历标记为删除？审计历史会保留。'))return
  try{await api('/medical-records/'+selected.value,{method:'DELETE'});await store.loadPatientContext(store.selectedPatientId!);newRecord()}
  catch(reason){error.value=reason instanceof Error?reason.message:'删除失败'}
}
</script>
<template>
  <div class="record-layout">
    <section class="card">
      <div class="card-header"><h3>Medical record</h3><button class="btn btn-secondary btn-sm" @click="newRecord"><Plus :size="15"/> New record</button></div>
      <form class="card-body record-form" @submit.prevent="save">
        <label class="label">History<select v-model="selected" class="select"><option value="">New record</option><option v-for="r in store.reports" :key="r.id" :value="r.id">{{ r.date }} · {{ r.diagnosis }}</option></select></label>
        <div class="record-row"><fieldset class="organ-picker"><legend>关联器官（可多选）</legend><label v-for="(name,id) in organNames" :key="id"><input v-model="form.organs" type="checkbox" :value="id" />{{ $t(name) }}</label><p>涉及多个器官可同时勾选；未建模、全身性或尚未归类的问题可放入“其他”。</p></fieldset><label class="label">Record date<input v-model="form.date" class="input" type="date" required /></label></div>
        <label class="label" for="diagnosis">Diagnosis / summary</label><textarea id="diagnosis" v-model="form.diagnosis" class="textarea" maxlength="10000" required />
        <label class="label" for="description">Description</label><textarea id="description" v-model="form.description" class="textarea" maxlength="30000" required />
        <p v-if="error" class="error" role="alert">{{ error }}</p><p v-if="saved" class="saved" role="status">病历已保存到数据库。</p>
        <div class="record-actions"><button class="btn btn-primary" :disabled="busy || !form.organs.length"><Check :size="16"/> {{busy?'Saving…':'Save medical record'}}</button><button v-if="selected" type="button" class="btn btn-secondary" @click="remove"><Trash2 :size="16"/> Soft delete</button></div>
      </form>
    </section>
    <aside><h3>Saved record</h3><ReportCard v-if="current" :report="current"/><div v-else class="card empty-state">Create a medical record for this organ.</div><p class="muted note">Records are associated with the patient and organ. They do not require an imaging study.</p></aside>
  </div>
</template>
<style scoped>
.organ-picker{grid-column:1/-1;border:1px solid var(--border);border-radius:8px;padding:14px;display:flex;flex-wrap:wrap;gap:12px}.organ-picker legend{font-size:12px;padding:0 5px}.organ-picker label{display:flex;align-items:center;gap:5px;font-size:12px}.organ-picker input{accent-color:var(--accent)}.organ-picker p{font-size:11px;color:var(--text-muted);margin:0;width:100%}

.record-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:20px;align-items:start}.record-form{display:grid;gap:12px}.record-form .label{display:grid;gap:8px}.record-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.record-actions{display:flex;gap:10px;flex-wrap:wrap}.error{color:#a24e50}.saved{color:#277b64}.note{font-size:12px;margin-top:18px}aside>h3{margin:0 0 14px}
@media(max-width:1000px){.record-layout{grid-template-columns:1fr}}
</style>
