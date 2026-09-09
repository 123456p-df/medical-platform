<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Sparkles, X, Send, ArrowUpRight, RotateCcw } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { organNames } from '@/api/mappers'
const auth = useAuthStore(), patients = usePatientStore(), route = useRoute(), router = useRouter()
const open = ref(false), question = ref(''), organ = ref('lung'), busy = ref(false), configured = ref<boolean | null>(null), error = ref('')
const input = ref<HTMLTextAreaElement>(), log = ref<HTMLDivElement>(), launcher = ref<HTMLButtonElement>()
const patientId = computed(() => auth.portal === 'patient' ? auth.session?.id : typeof route.params.id === 'string' ? route.params.id : '')
const patient = computed(() => patients.patients.find(p => p.id === patientId.value))
type Message = { role: 'user' | 'assistant'; text: string; references?: {record_id: number; date: string}[] }
const messages = ref<Message[]>([])
let generation = 0, controller: AbortController | undefined
watch(() => patientId.value + ':' + organ.value, () => { generation++; controller?.abort(); messages.value = []; error.value = ''; busy.value = false })
watch(open, async value => {
  if (!value) { launcher.value?.focus(); return }
  await nextTick(); input.value?.focus()
  try { configured.value = (await api<{configured: boolean}>('/ai/status')).configured }
  catch (e) { error.value = e instanceof Error ? e.message : '连接状态读取失败' }
})
async function ask() {
  if (!question.value.trim() || busy.value) return
  error.value = ''
  if (!patientId.value) { error.value = '请先打开一位患者的档案，以确定本次问答的资料范围。'; return }
  if (!configured.value) { error.value = 'AI 服务尚未连接。界面与接口已就绪，连接后即可根据当前患者的病历回答。'; return }
  const revision = generation, text = question.value.trim()
  messages.value.push({ role: 'user', text }); question.value = ''; busy.value = true
  controller = new AbortController()
  try {
    const response = await api<{answer: string; references: Message['references']; context_truncated: boolean}>('/ai/chat', {
      method: 'POST', body: JSON.stringify({ patient_id: Number(patientId.value), organ_id: organ.value, question: text }), signal: controller.signal,
    })
    if (revision !== generation) return
    messages.value.push({ role: 'assistant', text: response.answer + (response.context_truncated ? '\n\n本次未覆盖全部历史资料。' : ''), references: response.references })
    await nextTick(); log.value?.scrollTo({ top: log.value.scrollHeight, behavior: 'smooth' })
  } catch (e) { if (revision === generation) { error.value = e instanceof Error ? e.message : '请求失败'; question.value = text } }
  finally { if (revision === generation) busy.value = false }
}
function navigate(suffix: string) { router.push(patientId.value ? '/doctor/patients/' + patientId.value + suffix : '/doctor/patients') }
function enter(event: KeyboardEvent) { if (!event.isComposing) { event.preventDefault(); ask() } }
onBeforeUnmount(() => { generation++; controller?.abort() })
</script>
<template>
  <div class="assistant-anchor" @keydown.esc.stop="open = false">
    <section v-if="open" class="assistant-panel" role="dialog" aria-label="AI 工作助手">
      <header><span class="assistant-symbol"><Sparkles :size="22" /></span><div><h2>AI 工作助手</h2><small><i :class="{ connected: configured }" />{{ configured === null ? '检查连接…' : configured ? '已连接' : '待连接 AI 服务' }}</small></div><button class="icon-btn" aria-label="关闭 AI 助手" @click="open = false"><X :size="18" /></button></header>
      <div class="assistant-context"><span>{{ patient?.name || (patientId ? '当前患者' : '未选择患者') }}<small v-if="patientId"> · ID {{ patientId }}</small></span><select v-model="organ" class="select" aria-label="AI 问答器官"><option v-for="(name, id) in organNames" :key="id" :value="id">{{ $t(name) }}</option></select></div>
      <div ref="log" class="assistant-log" aria-live="polite">
        <div v-if="!messages.length" class="assistant-welcome"><Sparkles :size="28" /><h3>从整理资料开始</h3><p>查看病历、定位影像，或围绕当前患者提问。</p><button @click="question = '请总结当前器官的最近病历，并指出资料不足之处。'; input?.focus()">总结最近病历 <ArrowUpRight :size="14" /></button><button @click="question = '请列出已有记录中需要继续核实的问题。'; input?.focus()">整理待核实问题 <ArrowUpRight :size="14" /></button><template v-if="auth.portal === 'doctor'"><button @click="navigate('/imaging')">打开影像工作台 <ArrowUpRight :size="14" /></button><button @click="navigate('/report')">打开病历记录 <ArrowUpRight :size="14" /></button></template><p v-if="configured === false" class="connection-note">问答入口已准备好。连接 AI 后启用病历总结与问答。</p></div>
        <article v-for="(message, index) in messages" :key="index" :class="['chat-message', message.role]"><small>{{ message.role === 'user' ? '您' : 'AI 助手' }}</small><p>{{ message.text }}</p><span v-for="reference in message.references" :key="reference.record_id" class="reference">病历 #{{ reference.record_id }} · {{ reference.date }}</span></article>
        <p v-if="busy" class="muted">正在读取病历…</p>
      </div>
      <form class="assistant-compose" @submit.prevent="ask"><p v-if="error" class="assistant-error" role="alert">{{ error }}</p><textarea ref="input" v-model="question" maxlength="4000" rows="2" placeholder="输入问题，Enter 发送…" aria-label="给 AI 助手的问题" @keydown.enter.exact="enter" /><div><small>当前器官病历 · 每次独立提问</small><button type="button" class="icon-btn" :disabled="busy" aria-label="清空会话" @click="messages = []; error = ''"><RotateCcw :size="15" /></button><button class="send-btn" :disabled="busy || !question.trim()" aria-label="发送问题"><Send :size="16" /></button></div></form>
    </section>
    <button ref="launcher" :class="['assistant-ball', { active: open }]" aria-label="打开 AI 助手" :aria-expanded="open" @click="open = !open"><X v-if="open" :size="23" /><Sparkles v-else :size="25" /><span v-if="!open" class="ball-label">AI 助手</span></button>
  </div>
</template>
<style scoped>
.assistant-anchor{position:fixed;right:28px;bottom:24px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:15px}.assistant-ball{position:relative;display:grid;place-items:center;width:58px;height:58px;border:1px solid #ffffff50;border-radius:50%;background:linear-gradient(140deg,#3e9990,#176766);box-shadow:0 8px 28px #1b6d6750,inset 0 1px 2px #ffffff50;color:white;transition:transform .2s}.assistant-ball:hover{transform:translateY(-3px)}.ball-label{position:absolute;right:70px;background:#234e4b;color:white;padding:7px 11px;border-radius:7px;font-size:11px;white-space:nowrap}.assistant-panel{width:390px;max-width:calc(100vw - 32px);height:min(650px,calc(100dvh - 115px));background:#fff;border:1px solid #d9e6e2;box-shadow:0 22px 90px #173a3a33;border-radius:18px;overflow:hidden;display:flex;flex-direction:column}.assistant-panel header{display:flex;align-items:center;gap:11px;padding:19px;border-bottom:1px solid var(--border);background:linear-gradient(130deg,#f0f8f5,#fff)}.assistant-panel header>div{flex:1}.assistant-panel h2{font-size:15px;margin:0 0 5px}.assistant-panel header small{display:flex;gap:5px;align-items:center;color:var(--text-muted);font-size:10px}.assistant-panel i{width:6px;height:6px;background:#c9a76b;border-radius:50%}.assistant-panel i.connected{background:#4d9f83}.assistant-symbol{background:#dcefe7;color:#267268;padding:10px;border-radius:12px;display:flex}.assistant-context{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;font-size:11px;border-bottom:1px solid var(--border);gap:10px}.assistant-context .select{min-height:28px;padding:4px 8px;font-size:11px;max-width:120px}.assistant-context small{color:var(--text-muted)}.assistant-log{overflow-y:auto;padding:20px;flex:1;min-height:0}.assistant-welcome{color:var(--accent);padding-top:4px}.assistant-welcome h3{margin-top:12px;font-size:17px}.assistant-welcome p{color:var(--text-muted);font-size:12px;line-height:1.7}.assistant-welcome button{width:100%;display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border:1px solid var(--border);background:white;border-radius:8px;margin-top:8px;color:var(--text-soft);font-size:12px}.assistant-welcome button:hover{background:#f0f7f4}.connection-note{padding:10px 12px;border-radius:8px;background:#f4f6f5}.assistant-compose{padding:12px 16px;border-top:1px solid var(--border)}.assistant-compose textarea{width:100%;resize:none;border:0;outline:0;font:inherit;font-size:13px;line-height:1.6}.assistant-compose>div{display:flex;align-items:center;gap:6px}.assistant-compose small{flex:1;color:var(--text-muted);font-size:9px}.send-btn{display:grid;place-items:center;width:33px;height:33px;border:0;border-radius:8px;background:var(--accent);color:white}.send-btn:disabled{opacity:.4}.assistant-error{font-size:12px;color:#a24e50;line-height:1.6;margin:0 0 10px}.chat-message{border-radius:12px;padding:12px 14px;margin-bottom:12px;background:#f3f7f5}.chat-message.user{background:#e6f1ed;margin-left:26px}.chat-message small{font-size:10px;color:var(--accent)}.chat-message p{font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0}.reference{display:inline-block;font-size:10px;color:var(--accent);padding:5px;background:white;margin:5px 5px 0 0;border-radius:4px}@media(max-width:500px){.assistant-anchor{right:16px;bottom:16px}.assistant-panel{width:calc(100vw - 32px)}.ball-label{display:none}}
</style>
