<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2 } from 'lucide-vue-next'
import { api } from '@/api/client'
import { usePatientStore } from '@/stores/patients'
import { useWorkflowStore } from '@/stores/workflow'
const props = defineProps<{ id: string; name: string }>()
const router = useRouter(), store = usePatientStore(), workflow = useWorkflowStore()
const dialog = ref<HTMLDialogElement>(), busy = ref(false), error = ref('')
async function remove() {
  busy.value = true; error.value = ''
  try {
    await api('/patients/' + props.id, { method: 'DELETE' })
    dialog.value?.close(); store.reset(); await store.loadPatients(); await workflow.load()
    await router.push('/doctor/patients')
  } catch (e) { error.value = e instanceof Error ? e.message : '删除失败' }
  finally { busy.value = false }
}
</script>
<template>
  <button class="btn btn-secondary btn-sm" @click="error = ''; dialog?.showModal()"><Trash2 :size="14" /> 删除患者</button>
  <dialog ref="dialog" class="delete-dialog" aria-labelledby="delete-title" @cancel="busy && $event.preventDefault()">
    <h2 id="delete-title">删除患者档案？</h2><p>将从患者列表移除 <strong>{{ name }}</strong>（ID {{ id }}），并停止通过本平台访问其病历和影像。</p><p class="muted">病历、原始影像和操作历史保留在归档中。如需恢复，请联系档案管理员。</p>
    <p v-if="error" role="alert">{{ error }}</p><footer><button class="btn btn-secondary" :disabled="busy" @click="dialog?.close()">取消</button><button class="btn danger" :disabled="busy" @click="remove">{{ busy ? '删除中…' : '确认删除' }}</button></footer>
  </dialog>
</template>
<style scoped>
.delete-dialog{border:1px solid var(--border);border-radius:14px;padding:28px;width:min(480px,calc(100vw - 32px));color:var(--text)}.delete-dialog::backdrop{background:#10283270}.delete-dialog p{font-size:13px;line-height:1.8}footer{display:flex;gap:12px;justify-content:flex-end;margin-top:22px}.danger{background:#a3444b;color:white}
</style>
