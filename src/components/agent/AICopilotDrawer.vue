<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { localPreview } from '@/utils/runtime'
import {
  getAgentStatus,
  listAgentConversations,
  createAgentConversation,
  getAgentMessages,
  streamAgentChat,
  type AgentStatus,
  type AgentMessageItem,
  type AgentConversationItem,
  type StructuredReport,
  type StructuredTreatmentPlan,
} from '@/api/agent'
import ReportCard from './ReportCard.vue'
import TreatmentPlanCard from './TreatmentPlanCard.vue'

const route = useRoute()
const auth = useAuthStore()
const patients = usePatientStore()
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; openRecords: [] }>()

// UI State
const isExpanded = ref(false)
const historyOpen = ref(true)
const inputMessage = ref('')
const isStreaming = ref(false)
const statusInfo = ref<AgentStatus | null>(null)
const historyError = ref('')

// Conversation State
const conversations = ref<AgentConversationItem[]>([])
const activeConversationId = ref<string>('')
const messages = ref<AgentMessageItem[]>([])

// Streaming State
const currentThinking = ref('')
const currentTextDelta = ref('')
const currentTools = ref<Array<{ tool: string; status: 'running' | 'done'; args?: any }>>([])
const currentReport = ref<StructuredReport | null>(null)
const currentPlan = ref<StructuredTreatmentPlan | null>(null)
const selectedCTSeries = ref<string>('')

type PreviewConversation = AgentConversationItem & { messages: AgentMessageItem[] }
const patientScope = computed(() => String(route.params.id || patients.selectedPatientId || ''))
const previewKey = computed(() => `pulmolink-agent-history-v1:${auth.session?.username || 'anonymous'}:${patientScope.value || 'none'}`)

function readPreviewConversations(): PreviewConversation[] {
  try {
    const value = JSON.parse(localStorage.getItem(previewKey.value) || '[]')
    return Array.isArray(value) ? value : []
  } catch { return [] }
}

function savePreviewMessages() {
  if (!localPreview || !activeConversationId.value) return
  const list = readPreviewConversations()
  const entry = list.find(item => item.id === activeConversationId.value)
  if (!entry) return
  entry.messages = [...messages.value]
  entry.updated_at = new Date().toISOString()
  localStorage.setItem(previewKey.value, JSON.stringify(list))
}

function extractTreatmentPlan(content: string | undefined | null): StructuredTreatmentPlan | null {
  if (!content) return null
  const start = content.indexOf('[TREATMENT_PLAN_START]')
  const end = content.indexOf('[TREATMENT_PLAN_END]')
  if (start < 0 || end < 0) return null
  try {
    return JSON.parse(content.slice(start + '[TREATMENT_PLAN_START]'.length, end))
  } catch {
    return null
  }
}

function extractReport(content: string | undefined | null): StructuredReport | null {
  if (!content) return null
  const start = content.indexOf('[REPORT_CARD_START]')
  const end = content.indexOf('[REPORT_CARD_END]')
  if (start < 0 || end < 0) return null
  try {
    return JSON.parse(content.slice(start + '[REPORT_CARD_START]'.length, end))
  } catch {
    return null
  }
}

function displayMessageText(content: string): string {
  return content
    .replace(/\[TREATMENT_PLAN_START\][\s\S]*?\[TREATMENT_PLAN_END\]/g, '')
    .replace(/\[REPORT_CARD_START\][\s\S]*?\[REPORT_CARD_END\]/g, '')
    .trim()
}

// Context Resolution
const radsightDetails = computed(() => statusInfo.value?.radsight_microservice?.details || {})
const radsightReady = computed(() => {
  const microservice = statusInfo.value?.radsight_microservice
  const details = microservice?.details || {}
  return microservice?.status === 'ready' && details.loaded === true && details.stub === false
})
const radsightStatusLabel = computed(() => {
  if (radsightReady.value) {
    const quant = radsightDetails.value.quant || 'bf16'
    return `RadSight-8B 已就绪 (${quant})`
  }
  const status = radsightDetails.value.status || statusInfo.value?.radsight_microservice?.status
  if (status === 'loading') return 'RadSight-8B 权重加载中'
  if (status === 'error' || status === 'unreachable') return 'RadSight-8B 未加载'
  return 'RadSight-8B 未连接'
})

const currentPatientId = computed<number>(() => {
  const pId = route.params.patientId || route.params.id || route.query.patientId || patients.selectedPatientId
  if (pId && /^[1-9]\d*$/.test(String(pId))) return Number(pId)
  return localPreview ? 1 : 0
})

const activeStudyId = computed<string>(() => {
  return (route.params.studyUid as string) || (route.query.studyId as string) || 'STD-DEMO-001'
})

const messagesContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function loadStatus() {
  if (localPreview) return
  try {
    statusInfo.value = await getAgentStatus()
  } catch (err) {
    console.warn('Could not load agent status', err)
  }
}

async function initConversations() {
  historyError.value = ''
  activeConversationId.value = ''
  messages.value = []
  try {
    const list = localPreview ? readPreviewConversations() : currentPatientId.value ? await listAgentConversations(currentPatientId.value) : []
    conversations.value = list
    if (list.length > 0) {
      activeConversationId.value = list[0].id
      await loadMessages(list[0].id)
    }
  } catch (err) {
    historyError.value = err instanceof Error ? err.message : '读取对话记录失败'
  }
}

function newChat() {
  if (isStreaming.value) return
  activeConversationId.value = ''
  messages.value = []
  inputMessage.value = ''
  selectedCTSeries.value = ''
  scrollToBottom()
}

async function startNewConversation(title: string): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    const newConv: AgentConversationItem = localPreview
      ? { id: `preview_${crypto.randomUUID()}`, patient_id: currentPatientId.value, doctor_id: 0, title, created_at: now, updated_at: now }
      : await createAgentConversation(currentPatientId.value, title)
    activeConversationId.value = newConv.id
    conversations.value.unshift(newConv)
    messages.value = []
    if (localPreview) localStorage.setItem(previewKey.value, JSON.stringify([{ ...newConv, messages: [] }, ...readPreviewConversations()]))
    return true
  } catch (err) {
    historyError.value = err instanceof Error ? err.message : '创建对话失败'
    return false
  }
}

async function loadMessages(convId: string) {
  try {
    const list = localPreview
      ? readPreviewConversations().find(item => item.id === convId)?.messages || []
      : await getAgentMessages(convId)
    messages.value = list
    scrollToBottom()
  } catch (err) {
    historyError.value = err instanceof Error ? err.message : '读取消息失败'
  }
}

async function selectConversation(convId: string) {
  if (isStreaming.value || activeConversationId.value === convId) return
  activeConversationId.value = convId
  historyError.value = ''
  await loadMessages(convId)
}

function handleQuickPrompt(promptText: string) {
  inputMessage.value = promptText
  handleSendMessage()
}

async function handleSendMessage() {
  const text = inputMessage.value.trim()
  if (!text || isStreaming.value) return

  if (!localPreview && !currentPatientId.value) {
    historyError.value = '请先打开患者档案，再开始影像会诊。'
    return
  }

  if (!activeConversationId.value) {
    if (!await startNewConversation(text.slice(0, 36))) return
  }

  // Push user message locally for instant feedback
  messages.value.push({
    id: Date.now(),
    conversation_id: activeConversationId.value,
    role: 'user',
    content: text,
    tool_calls: [],
    created_at: new Date().toISOString(),
  })
  savePreviewMessages()

  inputMessage.value = ''
  isStreaming.value = true
  currentThinking.value = ''
  currentTextDelta.value = ''
  currentTools.value = []
  currentReport.value = null
  currentPlan.value = null
  scrollToBottom()

  if (localPreview) {
    messages.value.push({
      id: Date.now() + 1,
      conversation_id: activeConversationId.value,
      role: 'assistant',
      content: '当前为本地演示。问题已保存到对话记录；连接临床后端后可运行影像与病历分析。',
      tool_calls: [],
      created_at: new Date().toISOString(),
    })
    isStreaming.value = false
    savePreviewMessages()
    scrollToBottom()
    return
  }

  try {
    await streamAgentChat({
      conversation_id: activeConversationId.value,
      patient_id: currentPatientId.value,
      message: text,
      active_study_id: activeStudyId.value,
      onStart: () => {
        scrollToBottom()
      },
      onThinking: (delta) => {
        currentThinking.value += delta
        scrollToBottom()
      },
      onToolStart: (tool, args) => {
        currentTools.value.push({ tool, status: 'running', args })
        scrollToBottom()
      },
      onToolEnd: (tool) => {
        const t = currentTools.value.find((item) => item.tool === tool && item.status === 'running')
        if (t) t.status = 'done'
        scrollToBottom()
      },
      onSeriesSelected: (seriesId) => {
        selectedCTSeries.value = seriesId
      },
      onTextDelta: (delta) => {
        currentTextDelta.value += delta
        scrollToBottom()
      },
      onReportCard: (report) => {
        currentReport.value = report
        scrollToBottom()
      },
      onPlanCard: (plan) => {
        currentPlan.value = plan
        scrollToBottom()
      },
      onDone: (fullText) => {
        const content = fullText || currentTextDelta.value
        messages.value.push({
          id: Date.now() + 1,
          conversation_id: activeConversationId.value,
          role: 'assistant',
          content,
          tool_calls: currentTools.value.map((t) => ({ tool: t.tool })),
          thought: currentThinking.value || undefined,
          selected_ct_series: selectedCTSeries.value || undefined,
          created_at: new Date().toISOString(),
          plan: currentPlan.value || extractTreatmentPlan(content),
        })

        const active = conversations.value.find(item => item.id === activeConversationId.value)
        if (active) active.updated_at = new Date().toISOString()

        currentThinking.value = ''
        currentTextDelta.value = ''
        currentTools.value = []
        currentReport.value = null
        currentPlan.value = null
        isStreaming.value = false
        scrollToBottom()
      },
      onError: (err) => {
        console.error('Stream error', err)
        messages.value.push({
          id: Date.now() + 2,
          conversation_id: activeConversationId.value,
          role: 'assistant',
          content: `⚠️ 对话流连接遇到问题: ${err.message}`,
          tool_calls: [],
          created_at: new Date().toISOString(),
        })
        isStreaming.value = false
        scrollToBottom()
      },
    })
  } catch (err: any) {
    isStreaming.value = false
  }
}

watch(patientScope, () => {
  initConversations()
})

let statusTimer: number | undefined
onMounted(() => {
  initConversations()
  if (!localPreview) {
    loadStatus()
    statusTimer = window.setInterval(loadStatus, 10000)
  }
})
onUnmounted(() => {
  if (statusTimer) window.clearInterval(statusTimer)
})
</script>

<template>
  <aside
    v-if="open"
    class="copilot-drawer"
    :class="{ expanded: isExpanded }"
    role="dialog"
    :aria-label="$t('ui.copilot.title')"
  >
    <!-- Header -->
    <div class="drawer-header">
      <div class="header-left">
        <span class="agent-avatar">🧠</span>
        <div class="header-meta">
          <div class="title-row">
            <span class="title">{{ $t('ui.copilot.title') }}</span>
            <span class="version-tag">{{ $t('ui.copilot.engine') }}</span>
          </div>
          <div class="context-row">
            <span class="context-pill">{{ patientScope ? `患者 ${patientScope}` : '请选择患者' }}</span>
            <span class="context-pill" :title="radsightStatusLabel">{{ radsightStatusLabel }}</span>
            <span v-if="selectedCTSeries" class="series-pill" :title="selectedCTSeries">
              CT: {{ selectedCTSeries }}
            </span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="icon-btn"
          @click="historyOpen = !historyOpen"
          :aria-expanded="historyOpen"
          :title="$t('ui.copilot.history')"
        >
          ☰
        </button>
        <button
          type="button"
          class="icon-btn"
          @click="newChat"
          :title="$t('ui.copilot.newChat')"
        >
          ＋
        </button>
        <button type="button" class="icon-btn" :title="$t('ui.copilot.recordsMode')" @click="emit('openRecords')">✧</button>
        <button
          type="button"
          class="icon-btn"
          @click="isExpanded = !isExpanded"
          :title="isExpanded ? '还原常规宽度' : '扩展为工作台视图'"
        >
          {{ isExpanded ? '⇲' : '⇱' }}
        </button>
        <button
          type="button"
          class="icon-btn close"
          @click="emit('close')"
          title="最小化助手"
        >
          ✕
        </button>
      </div>
    </div>

    <nav v-if="historyOpen" class="conversation-history" :aria-label="$t('ui.copilot.history')">
      <div class="history-heading"><strong>{{ $t('ui.copilot.history') }}</strong><span>{{ conversations.length }}</span></div>
      <p v-if="historyError" class="history-error" role="alert">{{ historyError }}</p>
      <p v-if="!conversations.length" class="history-empty">{{ $t('ui.copilot.noHistory') }}</p>
      <div v-else class="history-list">
        <button v-for="conversation in conversations" :key="conversation.id" type="button" class="history-item" :class="{ selected: activeConversationId === conversation.id }" :disabled="isStreaming" @click="selectConversation(conversation.id)">
          <span>{{ conversation.title }}</span><small>{{ conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : '' }}</small>
        </button>
      </div>
    </nav>

    <!-- Messages Body -->
    <div ref="messagesContainer" class="drawer-messages">
      <!-- Welcome Intro -->
      <div v-if="messages.length === 0 && !isStreaming" class="welcome-box">
        <div class="welcome-icon">🏥</div>
        <h4>{{ $t('ui.copilot.welcome') }}</h4>
        <p v-if="radsightReady">基于 Pi 框架自主调度，本地 RadSight-8B 3D CT 多模态大模型已加载（{{ radsightDetails.quant || 'bf16' }}）。</p>
        <p v-else>基于 Pi 框架自主调度。{{ radsightStatusLabel }}，Talk to CT 将在权重就绪后进行真推理。</p>
        <div class="feature-badges">
          <span>{{ $t('ui.copilot.featureCt') }}</span>
          <span>{{ $t('ui.copilot.featureRecords') }}</span>
          <span>{{ $t('ui.copilot.featureQc') }}</span>
          <span>{{ $t('ui.copilot.featureReport') }}</span>
          <span>{{ $t('ui.copilot.featurePlan') }}</span>
        </div>
      </div>

      <!-- Message History -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="msg.role"
      >
        <div class="bubble-avatar">
          {{ msg.role === 'user' ? '👨‍⚕️' : '🧠' }}
        </div>
        <div class="bubble-content">
          <!-- Collapsible Thought -->
          <details v-if="msg.thought" class="thought-box">
            <summary>{{ $t('ui.copilot.thinkingHistory') }}</summary>
            <div class="thought-content">{{ msg.thought }}</div>
          </details>

          <!-- Selected CT Series Badge if recorded -->
          <div v-if="msg.selected_ct_series" class="series-selected-badge">
            <span>🎯 分析序列：{{ msg.selected_ct_series }}</span>
          </div>

          <!-- Message Text -->
          <div class="text-body markdown-rendered">{{ displayMessageText(msg.content) }}</div>
          <ReportCard v-if="extractReport(msg.content)" :report="extractReport(msg.content)!" />
          <TreatmentPlanCard v-if="msg.plan || extractTreatmentPlan(msg.content)" :plan="(msg.plan || extractTreatmentPlan(msg.content))!" />
        </div>
      </div>

      <!-- Live Streaming Message -->
      <div v-if="isStreaming" class="message-row assistant streaming">
        <div class="bubble-avatar">🧠</div>
        <div class="bubble-content">
          <!-- Streaming Thinking -->
          <details v-if="currentThinking" open class="thought-box active">
            <summary>{{ $t('ui.copilot.thinkingNow') }}</summary>
            <div class="thought-content">{{ currentThinking }}</div>
          </details>

          <!-- Active Tools Indicators -->
          <div v-if="currentTools.length > 0" class="tools-tray">
            <div
              v-for="(t, idx) in currentTools"
              :key="idx"
              class="tool-pill"
              :class="t.status"
            >
              <span class="tool-icon">
                {{ t.tool === 'talk_to_ct' ? '🧠' : t.tool === 'draft_treatment_plan' ? '🩺' : t.tool === 'draft_radiology_report' ? '📝' : '🔍' }}
              </span>
              <span class="tool-name">
                {{
                  t.tool === 'talk_to_ct'
                    ? 'RadSight-8B 3D CT 分析'
                    : t.tool === 'get_patient_records'
                    ? '调取患者病历'
                    : t.tool === 'get_segmentation_qc'
                    ? '提取器官分割体积'
                    : t.tool === 'draft_radiology_report'
                    ? '起草放射学报告'
                    : t.tool === 'draft_treatment_plan'
                    ? '起草完整治疗计划'
                    : t.tool === 'list_patient_ct_scans'
                    ? '检索 CT 序列'
                    : t.tool
                }}
              </span>
              <span class="tool-spinner" v-if="t.status === 'running'">⏳</span>
              <span class="tool-check" v-else>✓</span>
            </div>
          </div>

          <!-- Streaming Text Delta -->
          <div class="text-body">{{ currentTextDelta }}</div>

          <ReportCard v-if="currentReport" :report="currentReport" />
          <TreatmentPlanCard v-if="currentPlan" :plan="currentPlan" />
        </div>
      </div>
    </div>

    <!-- Quick Prompts Tray -->
    <div class="quick-prompts-tray">
      <button
        type="button"
        class="prompt-chip"
        @click="handleQuickPrompt('Talk to CT：请全面分析当前CT序列是否存在肺结节或占位征象')"
      >
        {{ $t('ui.copilot.quickCt') }}
      </button>
      <button
        type="button"
        class="prompt-chip"
        @click="handleQuickPrompt('查询当前患者的既往病史、过敏史与实验室检验指标')"
      >
        {{ $t('ui.copilot.quickRecords') }}
      </button>
      <button
        type="button"
        class="prompt-chip"
        @click="handleQuickPrompt('核验当前 3D 解剖器官分割体积统计与质控指标')"
      >
        {{ $t('ui.copilot.quickQc') }}
      </button>
      <button
        type="button"
        class="prompt-chip"
        @click="handleQuickPrompt('根据当前 CT 影像征象与病历，帮我起草一份标准放射学诊断报告')"
      >
        {{ $t('ui.copilot.quickReport') }}
      </button>
      <button
        type="button"
        class="prompt-chip"
        @click="handleQuickPrompt('请深入分析该患者症状、病史、CT 与分割质控后，列出完整的治疗计划（须调用全部临床工具，禁止编造影像征象）')"
      >
        {{ $t('ui.copilot.featurePlan') }}
      </button>
    </div>

    <!-- Input Footer -->
    <div class="drawer-footer">
      <textarea
        v-model="inputMessage"
        class="chat-input"
        rows="2"
        placeholder="向 AI Copilot 提问，或指示 Talk to CT 分析当前影像 (Enter 发送)..."
        :disabled="isStreaming"
        @keydown.enter.prevent="handleSendMessage"
      ></textarea>
      <button
        type="button"
        class="send-btn"
        :disabled="!inputMessage.trim() || isStreaming"
        @click="handleSendMessage"
      >
        <span v-if="!isStreaming">发送</span>
        <span v-else class="spin">⋯</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Drawer Container */
.copilot-drawer {
  position: fixed;
  bottom: 98px;
  right: 28px;
  width: 440px;
  height: 640px;
  max-height: calc(100dvh - 115px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 22px 90px #173a3a33, 0 0 0 1px #d9e6e2;
  display: flex;
  flex-direction: column;
  z-index: 60;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copilot-drawer.expanded {
  width: 720px;
}

/* Header */
.drawer-header {
  display: grid;
  grid-template-columns: minmax(0,1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(130deg,#f0f8f5,#fff);
  border-bottom: 1px solid #d9e6e2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.agent-avatar {
  font-size: 20px;
}

.header-meta{min-width:0}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: #173a3a;
}

.version-tag {
  display:none;
}

.context-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  flex-wrap:wrap;
}

.context-pill, .series-pill {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 500;
}

.series-pill {
  background: #f0fdf4;
  color: #166534;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink:0;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #64748b;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: #dcefe7;
  color: #176766;
}

.conversation-history{padding:10px 14px;border-bottom:1px solid #d9e6e2;background:#fff}
.history-heading{display:flex;justify-content:space-between;align-items:center;color:#234e4b;font-size:12px;margin-bottom:7px}
.history-heading span{color:#728981}
.history-list{max-height:112px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}
.history-item{display:flex;justify-content:space-between;gap:8px;text-align:left;background:#fff;border:1px solid transparent;border-radius:8px;padding:7px 9px;color:#324e49;cursor:pointer;font-size:12px}
.history-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.history-item small{font-size:10px;white-space:nowrap;color:#748981}
.history-item:hover,.history-item.selected{background:#eef7f3;border-color:#c7dfd7}
.history-item:disabled{opacity:.6;cursor:default}
.history-empty,.history-error{font-size:11px;margin:6px 0;color:#728981}
.history-error{color:#a24e50}

.icon-btn.close:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Messages */
.drawer-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f8fbf9;
}

.welcome-box {
  text-align: center;
  padding: 24px 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #475569;
}

.welcome-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.welcome-box h4 {
  margin: 0 0 6px 0;
  color: #0f172a;
  font-size: 14px;
}

.welcome-box p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #64748b;
}

.feature-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.feature-badges span {
  font-size: 11px;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 9999px;
  color: #334155;
}

/* Message Rows */
.message-row {
  display: flex;
  gap: 10px;
}

.message-row.user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.bubble-content {
  max-width: 85%;
  background: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 13px;
  line-height: 1.5;
  color: #1e293b;
}

.message-row.user .bubble-content {
  background: #267c72;
  color: #ffffff;
  border-color: #176766;
}

.text-body{white-space:pre-wrap;overflow-wrap:anywhere}

/* Thoughts */
.thought-box {
  margin-bottom: 8px;
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.thought-box.active {
  border-color: #a5d2c4;
  background: #eef7f3;
}

.thought-box summary {
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.thought-content {
  margin-top: 6px;
  white-space: pre-wrap;
  font-family: monospace;
}

/* Tools Tray */
.tools-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tool-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #e2e8f0;
  color: #334155;
  font-weight: 500;
}

.tool-pill.running {
  background: #fef3c7;
  color: #92400e;
}

.tool-pill.done {
  background: #dcfce7;
  color: #166534;
}

.series-selected-badge {
  display: inline-block;
  font-size: 11px;
  background: #f0fdf4;
  color: #15803d;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  font-weight: 600;
}

/* Quick Prompts */
.quick-prompts-tray {
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
}

.prompt-chip {
  white-space: nowrap;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s;
}

.prompt-chip:hover {
  background: #e5f3ed;
  color: #176766;
  border-color: #a5d2c4;
}

/* Footer Input */
.drawer-footer {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.chat-input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  font-family: inherit;
  outline: none;
}

.chat-input:focus {
  border-color: #3e9990;
  box-shadow: 0 0 0 2px rgba(62,153,144,.15);
}

.send-btn {
  background: #267c72;
  color: #ffffff;
  border: none;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #176766;
}

.send-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
@media(max-width:760px){.copilot-drawer.expanded{width:calc(100vw - 32px)}}
@media(max-width:500px){.copilot-drawer{right:16px;bottom:90px;width:calc(100vw - 32px);max-height:calc(100dvh - 105px)}.context-row{flex-wrap:wrap}.version-tag{display:none}}
</style>
