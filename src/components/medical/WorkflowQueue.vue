<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCheck, RotateCcw, ArrowUpRight } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import { organNames } from '@/api/mappers'
const workflow = useWorkflowStore(), showCompleted = ref(false), busy = ref(''), error = ref('')
const visible = computed(() => workflow.items.filter(i => showCompleted.value ? i.completed_at : !i.completed_at))
async function toggle(id: string, complete: boolean) {
  busy.value = id; error.value = ''
  try { await workflow.complete(id, complete) } catch (e) { error.value = e instanceof Error ? e.message : 'Operation failed.' }
  finally { busy.value = '' }
}
</script>
<template>
  <section class="card workflow-card">
    <div class="card-header"><div><h2>{{ $t('My tasks') }} <span>{{ workflow.pending.length }}</span></h2><p class="muted">{{ $t('Completed tasks are hidden automatically and remain available in the completed list.') }}</p></div><div class="queue-tabs"><button :class="{ active: !showCompleted }" @click="showCompleted = false">{{ $t('To review') }}</button><button :class="{ active: showCompleted }" @click="showCompleted = true">{{ $t('Completed items') }}</button></div></div>
    <p v-if="workflow.error || error" role="alert" class="queue-error">{{ $t(error || workflow.error) }} <button class="btn btn-secondary btn-sm" @click="workflow.load()">{{ $t('Retry') }}</button></p>
    <div v-for="item in visible" :key="item.image_id" class="queue-row"><span class="queue-modality">{{ item.image_type }}</span><div class="queue-copy"><strong>{{ item.patient_name }} <small>· {{ $t(organNames[item.organ_id]) }}</small></strong><small>{{ item.created_at.slice(0, 10) }} · {{ $t(item.completed_at ? 'Confirmed' : 'Examination awaiting review') }}</small></div><RouterLink class="btn btn-secondary btn-sm" :to="{ path: '/doctor/patients/' + item.patient_id + '/imaging', query: { exam: item.image_id } }">{{ $t('Open') }}<ArrowUpRight :size="14" /></RouterLink><button class="btn btn-secondary btn-sm" :disabled="!!busy" @click="toggle(item.image_id, !item.completed_at)"><RotateCcw v-if="item.completed_at" :size="14" /><CheckCheck v-else :size="14" />{{ $t(item.completed_at ? 'Reopen' : 'Confirm complete') }}</button></div>
    <div v-if="!visible.length && !workflow.error" class="queue-empty"><CheckCheck :size="24" /><span>{{ $t(workflow.loading ? 'Loading tasks…' : showCompleted ? 'No completed items yet.' : 'No imaging studies need review.') }}</span></div>
  </section>
</template>
<style scoped>
.workflow-card{margin-bottom:24px}.workflow-card h2{display:flex;gap:9px;align-items:center}.workflow-card h2 span{background:#e0eeeb;color:var(--accent);border-radius:6px;padding:3px 7px;font-size:12px}.queue-tabs{display:flex;background:#eff4f3;padding:4px;border-radius:8px}.queue-tabs button{border:0;background:none;padding:7px 13px;border-radius:5px;font-size:12px;color:var(--text-soft)}.queue-tabs button.active{background:white;box-shadow:0 1px 4px #14322f12;color:var(--accent)}.queue-row{display:flex;align-items:center;gap:12px;padding:16px 22px;border-top:1px solid var(--border)}.queue-modality{background:#edf4f5;color:var(--accent);padding:10px 8px;border-radius:8px;min-width:44px;text-align:center;font-size:11px;font-weight:700}.queue-copy{display:grid;flex:1;gap:6px}.queue-copy strong{font-size:13px}.queue-copy small{color:var(--text-muted);font-size:11px;font-weight:400}.queue-empty{display:flex;align-items:center;justify-content:center;gap:12px;padding:26px;color:var(--text-muted);font-size:13px}.queue-error{padding:16px;color:#a24e50}@media(max-width:600px){.queue-row{flex-wrap:wrap}.queue-copy{min-width:55%}.card-header{flex-wrap:wrap}}
</style>
