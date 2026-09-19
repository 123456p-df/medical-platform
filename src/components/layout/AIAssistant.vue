<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Sparkles, X, Send, ArrowUpRight, RotateCcw } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useAIChatStore } from '@/stores/aiChat'
import { useStudyWorkspaceStore } from '@/stores/studyWorkspace'
import { organNames } from '@/api/mappers'
import { capabilityForStudy } from '@/utils/capabilities'

const auth = useAuthStore(), patients = usePatientStore(), ai = useAIChatStore(), route = useRoute(), router = useRouter()
const workspace = useStudyWorkspaceStore()
const open = ref(false), question = ref(''), organ = ref('lung')
const input = ref<HTMLTextAreaElement>(), log = ref<HTMLDivElement>(), launcher = ref<HTMLButtonElement>()
const patientId = computed(() => auth.portal === 'patient' ? auth.session?.id || '' : typeof route.params.id === 'string' ? route.params.id : '')
const patient = computed(() => patients.patients.find(p => p.id === patientId.value))
const selectedExamination = computed(() => patients.examinations.find(item => item.id === String(workspace.context.examinationId || route.query.exam || patients.activeExamId || '')) || patients.examinations[0])
const aiCapability = computed(() => capabilityForStudy(selectedExamination.value, auth.portal).aiAssistant)
const scopeKey = computed(() => `${auth.session?.username || 'anonymous'}:${patientId.value}:${organ.value}:${selectedExamination.value?.id || 'all'}`)
const chat = computed(() => ai.thread(scopeKey.value))
const configured = computed(() => aiCapability.value.enabled ? ai.configured : false)
const busy = computed(() => chat.value.busy)
const error = computed(() => chat.value.error)
const messages = computed(() => chat.value.messages)
const reference = computed(() => chat.value.reference)

watch(selectedExamination, examination => {
  if (examination?.organId) organ.value = examination.organId
})

function openFromEvent() {
  open.value = true
}

onMounted(() => window.addEventListener('pulmolink-open-ai', openFromEvent))
onBeforeUnmount(() => window.removeEventListener('pulmolink-open-ai', openFromEvent))

watch(open, async value => {
  if (!value) { launcher.value?.focus(); return }
  await nextTick(); input.value?.focus()
  if (aiCapability.value.enabled) {
    await ai.refreshConfiguration()
    await ai.loadCapabilities(organ.value, selectedExamination.value?.id || '')
  }
})

async function ask() {
  const text = question.value.trim()
  if (!text || busy.value) return
  question.value = ''
  const sent = await ai.ask(
    scopeKey.value,
    patientId.value,
    organ.value,
    text,
    aiCapability.value.enabled ? '' : aiCapability.value.reason,
    selectedExamination.value?.id || '',
  )
  if (!sent && chat.value.error) question.value = text
  await nextTick(); log.value?.scrollTo({ top: log.value.scrollHeight, behavior: 'smooth' })
}

function navigate(suffix: string) { router.push(patientId.value ? '/doctor/patients/' + patientId.value + suffix : '/doctor/patients') }
function openReference(id: number) { return ai.openReference(scopeKey.value, id) }
function enter(event: KeyboardEvent) { if (!event.isComposing) { event.preventDefault(); ask() } }
</script>
<template>
  <div class="assistant-anchor" @keydown.esc.stop="open = false">
    <section v-if="open" class="assistant-panel" role="dialog" :aria-label="$t('ui.ai.dialog')">
      <header><span class="assistant-symbol"><Sparkles :size="22" /></span><div><h2>{{ $t('ui.ai.title') }}</h2><small><i :class="{ connected: configured }" />{{ $t(configured === null ? 'ui.ai.checking' : configured ? 'ui.ai.connected' : 'ui.ai.disconnected') }}</small></div><button class="icon-btn" :aria-label="$t('ui.ai.close')" @click="open = false"><X :size="18" /></button></header>
      <div class="assistant-context"><span>{{ patient?.name || (patientId ? $t('ui.ai.currentPatient') : $t('ui.ai.noPatient')) }}<small v-if="patientId"> · ID {{ patientId }}</small></span><select v-model="organ" class="select" :aria-label="$t('ui.ai.organ')"><option v-for="(name, id) in organNames" :key="id" :value="id">{{ $t(name) }}</option></select></div>
      <div ref="log" class="assistant-log" aria-live="polite">
        <div v-if="!messages.length" class="assistant-welcome"><Sparkles :size="28" /><h3>{{ $t('ui.ai.welcome') }}</h3><p>{{ $t('ui.ai.welcomeBody') }}</p><button @click="question = $t('ui.ai.summaryPrompt'); input?.focus()">{{ $t('ui.ai.summarize') }} <ArrowUpRight :size="14" /></button><button @click="question = $t('ui.ai.reviewPrompt'); input?.focus()">{{ $t('ui.ai.reviewQuestions') }} <ArrowUpRight :size="14" /></button><template v-if="auth.portal === 'doctor'"><button @click="navigate('/imaging')">{{ $t('ui.ai.openImaging') }} <ArrowUpRight :size="14" /></button><button @click="navigate('/report')">{{ $t('ui.ai.openRecords') }} <ArrowUpRight :size="14" /></button></template><p v-if="configured === false" class="connection-note">{{ aiCapability.enabled ? $t('ui.ai.connectNote') : $t(aiCapability.reason) }}</p></div>
        <article v-for="(message, index) in messages" :key="index" :class="['chat-message', message.role]"><small>{{ $t(message.role === 'user' ? 'ui.ai.you' : 'ui.ai.assistant') }}</small><p>{{ message.text }}</p><button v-for="item in message.references" :key="item.record_id" type="button" class="reference" @click="openReference(item.record_id)">{{ $t('ui.ai.record', { id: item.record_id }) }} · {{ item.date }}</button></article>
        <article v-if="reference" class="reference-detail"><strong>{{ reference.diagnosis }}</strong><small>{{ reference.record_date }}</small><p>{{ reference.description }}</p></article>
        <p v-if="busy" class="muted">{{ $t('ui.ai.reading') }}</p>
      </div>
      <form class="assistant-compose" @submit.prevent="ask"><p v-if="error" class="assistant-error" role="alert">{{ error }}</p><textarea ref="input" v-model="question" maxlength="4000" rows="2" :placeholder="$t('ui.ai.placeholder')" :aria-label="$t('ui.ai.questionLabel')" @keydown.enter.exact="enter" /><div><small>{{ $t('ui.ai.scope') }}</small><button type="button" class="icon-btn" :disabled="busy" :aria-label="$t('ui.ai.clear')" @click="ai.clear(scopeKey)"><RotateCcw :size="15" /></button><button class="send-btn" :disabled="busy || !question.trim()" :aria-label="$t('ui.ai.send')"><Send :size="16" /></button></div></form>
    </section>
    <button ref="launcher" :class="['assistant-ball', { active: open }]" :aria-label="$t('ui.ai.launch')" :aria-expanded="open" @click="open = !open"><X v-if="open" :size="23" /><Sparkles v-else :size="25" /><span v-if="!open" class="ball-label">{{ $t('ui.ai.shortLabel') }}</span></button>
  </div>
</template>
<style scoped>
.assistant-anchor{position:fixed;right:28px;bottom:24px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:15px}.assistant-ball{position:relative;display:grid;place-items:center;width:58px;height:58px;border:1px solid #ffffff50;border-radius:50%;background:linear-gradient(140deg,#3e9990,#176766);box-shadow:0 8px 28px #1b6d6750,inset 0 1px 2px #ffffff50;color:white;transition:transform .2s}.assistant-ball:hover{transform:translateY(-3px)}.ball-label{position:absolute;right:70px;background:#234e4b;color:white;padding:7px 11px;border-radius:7px;font-size:11px;white-space:nowrap}.assistant-panel{width:390px;max-width:calc(100vw - 32px);height:min(650px,calc(100dvh - 115px));background:#fff;border:1px solid #d9e6e2;box-shadow:0 22px 90px #173a3a33;border-radius:18px;overflow:hidden;display:flex;flex-direction:column}.assistant-panel header{display:flex;align-items:center;gap:11px;padding:19px;border-bottom:1px solid var(--border);background:linear-gradient(130deg,#f0f8f5,#fff)}.assistant-panel header>div{flex:1}.assistant-panel h2{font-size:15px;margin:0 0 5px}.assistant-panel header small{display:flex;gap:5px;align-items:center;color:var(--text-muted);font-size:10px}.assistant-panel i{width:6px;height:6px;background:#c9a76b;border-radius:50%}.assistant-panel i.connected{background:#4d9f83}.assistant-symbol{background:#dcefe7;color:#267268;padding:10px;border-radius:12px;display:flex}.assistant-context{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;font-size:11px;border-bottom:1px solid var(--border);gap:10px}.assistant-context .select{min-height:28px;padding:4px 8px;font-size:11px;max-width:120px}.assistant-context small{color:var(--text-muted)}.assistant-log{overflow-y:auto;padding:20px;flex:1;min-height:0}.assistant-welcome{color:var(--accent);padding-top:4px}.assistant-welcome h3{margin-top:12px;font-size:17px}.assistant-welcome p{color:var(--text-muted);font-size:12px;line-height:1.7}.assistant-welcome button{width:100%;display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border:1px solid var(--border);background:white;border-radius:8px;margin-top:8px;color:var(--text-soft);font-size:12px}.assistant-welcome button:hover{background:#f0f7f4}.connection-note{padding:10px 12px;border-radius:8px;background:#f4f6f5}.assistant-compose{padding:12px 16px;border-top:1px solid var(--border)}.assistant-compose textarea{width:100%;resize:none;border:0;outline:0;font:inherit;font-size:13px;line-height:1.6}.assistant-compose>div{display:flex;align-items:center;gap:6px}.assistant-compose small{flex:1;color:var(--text-muted);font-size:9px}.send-btn{display:grid;place-items:center;width:33px;height:33px;border:0;border-radius:8px;background:var(--accent);color:white}.send-btn:disabled{opacity:.4}.assistant-error{font-size:12px;color:#a24e50;line-height:1.6;margin:0 0 10px}.chat-message{border-radius:12px;padding:12px 14px;margin-bottom:12px;background:#f3f7f5}.chat-message.user{background:#e6f1ed;margin-left:26px}.chat-message small{font-size:10px;color:var(--accent)}.chat-message p{font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0}.reference{display:inline-block;font-size:10px;color:var(--accent);padding:5px;background:white;margin:5px 5px 0 0;border-radius:4px}@media(max-width:500px){.assistant-anchor{right:16px;bottom:16px}.assistant-panel{width:calc(100vw - 32px)}.ball-label{display:none}}
.reference{border:1px solid var(--border);cursor:pointer}
.reference-detail{display:grid;gap:5px;margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:8px;background:#fff}
.reference-detail small{color:var(--text-muted)}
.reference-detail p{margin:0;font-size:12px;line-height:1.6}
</style>
