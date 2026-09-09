<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { organCatalog } from '@/api/models'
import { api } from '@/api/client'
import DigitalHumanViewer from './DigitalHumanViewer.vue'
import OrganModelViewer from './OrganModelViewer.vue'
const props=defineProps<{patientId:string}>()
const organ=ref('lung'), error=ref('')
const workspace=ref<HTMLElement | null>(null)
const storedPaneWidth=Number(localStorage.getItem('pulmolink-organ-pane-width'))
const paneWidth=ref(Number.isFinite(storedPaneWidth) && storedPaneWidth >= 300 ? storedPaneWidth : 360)
const resizing=ref(false)
let resizeStartX=0, resizeStartWidth=0
const detail=ref<{name:string;records:{record_id:number;date:string;diagnosis:string;description:string;doctor_name:string}[];records_total:number}|null>(null)
const workspaceStyle=computed(() => ({'--organ-nav-width': `${paneWidth.value}px`}))

function clampPaneWidth(width:number) {
  const available=workspace.value?.clientWidth ?? 1100
  return Math.round(Math.max(300,Math.min(width,Math.min(650,available-430))))
}
function finishResize() {
  if(!resizing.value)return
  resizing.value=false
  document.body.style.cursor=''
  document.body.style.userSelect=''
  window.removeEventListener('pointermove',resizePane)
  window.removeEventListener('pointerup',finishResize)
  window.removeEventListener('pointercancel',finishResize)
  localStorage.setItem('pulmolink-organ-pane-width',String(paneWidth.value))
}
function resizePane(event:PointerEvent) {
  paneWidth.value=clampPaneWidth(resizeStartWidth+event.clientX-resizeStartX)
}
function startResize(event:PointerEvent) {
  if((workspace.value?.clientWidth ?? 0)<900)return
  resizing.value=true;resizeStartX=event.clientX;resizeStartWidth=paneWidth.value
  document.body.style.cursor='col-resize';document.body.style.userSelect='none'
  window.addEventListener('pointermove',resizePane)
  window.addEventListener('pointerup',finishResize)
  window.addEventListener('pointercancel',finishResize)
}
function resizeWithKeyboard(event:KeyboardEvent) {
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return
  event.preventDefault();paneWidth.value=clampPaneWidth(paneWidth.value+(event.key==='ArrowRight'?20:-20))
  localStorage.setItem('pulmolink-organ-pane-width',String(paneWidth.value))
}
function resetPaneWidth(){paneWidth.value=clampPaneWidth(360);localStorage.setItem('pulmolink-organ-pane-width',String(paneWidth.value))}

onBeforeUnmount(finishResize)
watch(() => [props.patientId,organ.value], async (_,__,onCleanup) => {
  let stale=false; onCleanup(() => { stale=true }); error.value=''; detail.value=null
  try { const data=await api<NonNullable<typeof detail.value>>('/patients/'+props.patientId+'/organs/'+organ.value); if(!stale) detail.value=data }
  catch(reason) { if(!stale) error.value=reason instanceof Error?reason.message:'加载失败' }
},{immediate:true})
</script>
<template>
  <div ref="workspace" class="organ-workspace" :class="{resizing}" :style="workspaceStyle">
    <aside class="card">
      <div class="card-header"><div><h3>器官导航</h3><p class="muted">选择器官以查看模型与病历</p></div></div>
      <DigitalHumanViewer :selected-organ-id="organ" compact @select="organ=$event" />
      <div class="organ-buttons"><button v-for="item in organCatalog" :key="item.id" class="btn btn-secondary btn-sm" :class="{selected:organ===item.id}" @click="organ=item.id">{{ $t(item.label) }}</button></div>
    </aside>
    <div
      class="pane-resizer"
      role="separator"
      aria-label="拖动调整三维人体窗口宽度"
      aria-orientation="vertical"
      :aria-valuenow="paneWidth"
      aria-valuemin="300"
      aria-valuemax="650"
      tabindex="0"
      title="拖动调整宽度，双击恢复默认"
      @pointerdown.prevent="startResize"
      @keydown="resizeWithKeyboard"
      @dblclick="resetPaneWidth"
    ><span /></div>
    <section class="stack">
      <div class="card"><div class="card-header"><h3>{{ detail?.name || organ }} · Organ model</h3></div>
        <div v-if="organ === 'other'" class="empty-state">其他分类用于未建模器官、全身性或尚未归类的问题。相关病历显示在下方。</div><OrganModelViewer v-else :patient-id="patientId" :organ-id="organ" />
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
.organ-workspace{display:grid;grid-template-columns:clamp(300px,var(--organ-nav-width),calc(100% - 430px)) 10px minmax(400px,1fr);gap:9px;align-items:start}.organ-buttons{display:flex;gap:8px;flex-wrap:wrap;padding:16px}.organ-buttons .selected{background:#d8ece9;border-color:#7fb5af;color:#236b66}
.pane-resizer{align-self:stretch;min-height:570px;position:relative;cursor:col-resize;touch-action:none;border-radius:7px}.pane-resizer::before{content:"";position:absolute;inset:0 3px;border-radius:6px;background:transparent;transition:background 150ms ease}.pane-resizer span{position:sticky;top:calc(var(--topbar-height) + 24px);display:block;width:4px;height:48px;margin:260px auto 0;border-radius:99px;background:var(--border-strong);transition:background 150ms ease,transform 150ms ease}.pane-resizer:hover::before,.pane-resizer:focus-visible::before,.resizing .pane-resizer::before{background:var(--accent-soft)}.pane-resizer:hover span,.pane-resizer:focus-visible span,.resizing .pane-resizer span{background:var(--accent);transform:scaleX(1.35)}
.history-record{padding:14px 0;border-bottom:1px solid var(--border)}.history-record:last-child{border:0}.history-record>span{font-size:11px;color:var(--text-muted)}.history-record h4{margin:10px 0 6px}.history-record p{white-space:pre-wrap;font-size:13px;line-height:1.7}
@media(max-width:900px){.organ-workspace{grid-template-columns:1fr;gap:18px}.pane-resizer{display:none}}
</style>
