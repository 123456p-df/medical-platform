<script setup lang="ts">
import { ref, watch } from 'vue'
import { organCatalog } from '@/api/models'
import { api } from '@/api/client'
import DigitalHumanViewer from './DigitalHumanViewer.vue'
import OrganModelViewer from './OrganModelViewer.vue'
const props=defineProps<{patientId:string}>()
const organ=ref('lung'), error=ref('')
const detail=ref<{name:string;records:{record_id:number;date:string;diagnosis:string;description:string;doctor_name:string}[];records_total:number}|null>(null)
watch(() => [props.patientId,organ.value], async (_,__,onCleanup) => {
  let stale=false; onCleanup(() => { stale=true }); error.value=''; detail.value=null
  try { const data=await api<NonNullable<typeof detail.value>>('/patients/'+props.patientId+'/organs/'+organ.value); if(!stale) detail.value=data }
  catch(reason) { if(!stale) error.value=reason instanceof Error?reason.message:'加载失败' }
},{immediate:true})
</script>
<template>
  <div class="organ-workspace">
    <aside class="card">
      <div class="card-header"><div><h3>Organ navigator</h3><p class="muted">Schematic body illustration</p></div></div>
      <DigitalHumanViewer :selected-organ-id="organ" compact @select="organ=$event" />
      <div class="organ-buttons"><button v-for="item in organCatalog" :key="item.id" class="btn btn-secondary btn-sm" :class="{selected:organ===item.id}" @click="organ=item.id">{{ item.label }}</button></div>
    </aside>
    <section class="stack">
      <div class="card"><div class="card-header"><h3>{{ detail?.name || organ }} · Organ model</h3></div>
        <OrganModelViewer :patient-id="patientId" :organ-id="organ" />
      </div>
      <section class="card"><div class="card-header"><h3>Organ medical history</h3><span class="muted">{{ detail?.records_total || 0 }} records</span></div>
        <div class="card-body">
          <p v-if="error" role="alert">{{ error }}</p>
          <article v-for="r in detail?.records || []" :key="r.record_id" class="history-record"><span>{{ r.date }} · {{ r.doctor_name }}</span><h4>{{ r.diagnosis }}</h4><p>{{ r.description }}</p></article>
          <div v-if="detail && !detail.records.length" class="empty-state">No records for this organ.</div>
          <p v-if="detail && detail.records_total > detail.records.length" class="muted">Showing the latest {{ detail.records.length }} records.</p>
        </div>
      </section>
    </section>
  </div>
</template>
<style scoped>
.organ-workspace{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;align-items:start}.organ-buttons{display:flex;gap:8px;flex-wrap:wrap;padding:16px}.organ-buttons .selected{background:#d8ece9;border-color:#7fb5af;color:#236b66}
.history-record{padding:14px 0;border-bottom:1px solid var(--border)}.history-record:last-child{border:0}.history-record>span{font-size:11px;color:var(--text-muted)}.history-record h4{margin:10px 0 6px}.history-record p{white-space:pre-wrap;font-size:13px;line-height:1.7}
@media(max-width:1050px){.organ-workspace{grid-template-columns:1fr}}
</style>
