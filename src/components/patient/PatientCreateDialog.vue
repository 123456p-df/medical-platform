<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { X, UserPlus } from 'lucide-vue-next'
import { api } from '@/api/client'
import { usePatientStore } from '@/stores/patients'
const emit = defineEmits<{ created: [id: string] }>()
const dialog = ref<HTMLDialogElement>(), busy = ref(false), error = ref('')
const initial = () => ({ name: '', id_number: '', birth_date: '', gender: 'unknown', height: '', weight: '', abo: '', rh: '' })
const form = reactive(initial()), store = usePatientStore()
async function open() { Object.assign(form, initial()); error.value = ''; await nextTick(); dialog.value?.showModal() }
function close() { if (!busy.value) dialog.value?.close() }
async function save() {
  if (busy.value) return
  busy.value = true; error.value = ''
  try {
    const result = await api<{ patient_id: number }>('/patients', { method: 'POST', body: JSON.stringify({
      name: form.name.trim(), id_number: form.id_number.trim(), birth_date: form.birth_date || null, gender: form.gender,
      height: form.height ? Number(form.height) : null, weight: form.weight ? Number(form.weight) : null,
      blood_type: form.abo ? form.abo + form.rh : null,
    }) })
    await store.loadPatients(); dialog.value?.close(); emit('created', String(result.patient_id))
  } catch (e) { error.value = e instanceof Error ? e.message : '录入失败' }
  finally { busy.value = false }
}
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="patient-dialog" aria-labelledby="new-patient-title" @cancel="busy && $event.preventDefault()">
    <div class="dialog-heading"><div><span>NEW PATIENT</span><h2 id="new-patient-title">录入患者</h2></div><button class="icon-btn" aria-label="关闭录入窗口" :disabled="busy" @click="close"><X :size="20" /></button></div>
    <form @submit.prevent="save">
      <p class="muted">建立患者档案后，即可添加病历与上传影像。</p>
      <div class="fields">
        <label>姓名 *<input v-model="form.name" class="input" autofocus required maxlength="100" /></label>
        <label>身份证 / 身份标识 *<input v-model="form.id_number" class="input" required minlength="6" maxlength="32" autocomplete="off" /></label>
        <label>出生日期<input v-model="form.birth_date" class="input" type="date" min="1850-01-01" :max="new Date().toLocaleDateString('sv-SE')" /></label>
        <label>性别<select v-model="form.gender" class="select"><option value="unknown">未填写</option><option value="male">男</option><option value="female">女</option></select></label>
        <label>身高（cm）<input v-model="form.height" class="input" type="number" min="1" max="300" step="0.1" /></label>
        <label>体重（kg）<input v-model="form.weight" class="input" type="number" min="0.1" max="700" step="0.1" /></label>
        <label>ABO 血型<select v-model="form.abo" class="select"><option value="">未知</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></label>
        <label>Rh(D)<select v-model="form.rh" class="select" :disabled="!form.abo"><option value="">未知</option><option value="+">阳性 (+)</option><option value="-">阴性 (−)</option></select></label>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <footer><button class="btn btn-secondary" type="button" :disabled="busy" @click="close">取消</button><button class="btn btn-primary" :disabled="busy || !form.name.trim()"><UserPlus :size="16" />{{ busy ? '录入中…' : '创建患者档案' }}</button></footer>
    </form>
  </dialog>
</template>
<style scoped>
.patient-dialog{width:min(600px,calc(100vw - 32px));border:1px solid var(--border);border-radius:16px;padding:28px;color:var(--text);box-shadow:0 28px 90px #102d3440;max-height:90vh;overflow:auto}.patient-dialog::backdrop{background:#10283270;backdrop-filter:blur(3px)}.dialog-heading{display:flex;justify-content:space-between;align-items:center}.dialog-heading span{font-size:10px;letter-spacing:.14em;color:var(--accent)}.dialog-heading h2{margin:5px 0 0}.patient-dialog form{display:grid;gap:20px}.patient-dialog p{font-size:13px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:18px}.fields label{display:grid;gap:8px;font-size:12px}footer{display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--border);padding-top:20px}.error{color:#b04e51}@media(max-width:500px){.fields{grid-template-columns:1fr}}
</style>
