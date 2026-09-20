<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAgentStatus,
  listAgentConversations,
  createAgentConversation,
  getAgentMessages,
  streamAgentChat,
  type AgentStatus,
  type AgentMessageItem,
  type StructuredReport,
  type StructuredTreatmentPlan,
} from '@/api/agent'
import ReportCard from './ReportCard.vue'
import TreatmentPlanCard from './TreatmentPlanCard.vue'

const route = useRoute()

// UI State
const isOpen = ref(false)
const isExpanded = ref(false)
const inputMessage = ref('')
const isStreaming = ref(false)
const statusInfo = ref<AgentStatus | null>(null)

// Conversation State
const conversations = ref<Array<{ id: string; title: string }>>([])
const activeConversationId = ref<string>('')
const messages = ref<AgentMessageItem[]>([])

// Streaming State
const currentThinking = ref('')
const currentTextDelta = ref('')
const currentTools = ref<Array<{ tool: string; status: 'running' | 'done'; args?: any }>>([])
const currentReport = ref<StructuredReport | null>(null)
const currentPlan = ref<StructuredTreatmentPlan | null>(null)
const selectedCTSeries = ref<string>('')

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
  const pId = route.params.patientId || route.params.id || route.query.patientId
  if (pId && !isNaN(Number(pId))) return Number(pId)
  return 1 // Default demo patient
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
  try {
    statusInfo.value = await getAgentStatus()
  } catch (err) {
    console.warn('Could not load agent status', err)
  }
}

async function initConversations() {
  try {
    const list = await listAgentConversations(currentPatientId.value)
    conversations.value = list
    if (list.length > 0) {
      activeConversationId.value = list[0].id
      await loadMessages(list[0].id)
    } else {
      await startNewConversation()
    }
  } catch (err) {
    console.error('Failed to init conversations', err)
  }
}

async function startNewConversation() {
  try {
    const newConv = await createAgentConversation(currentPatientId.value, 'AI 放射与病历会诊')
    activeConversationId.value = newConv.id
    conversations.value.unshift(newConv)
    messages.value = []
  } catch (err) {
    console.error('Failed to create new conversation', err)
  }
}

async function loadMessages(convId: string) {
  try {
    const list = await getAgentMessages(convId)
    messages.value = list
    scrollToBottom()
  } catch (err) {
    console.error('Failed to load messages', err)
  }
}

function handleQuickPrompt(promptText: string) {
  inputMessage.value = promptText
  handleSendMessage()
}

async function handleSendMessage() {
  const text = inputMessage.value.trim()
  if (!text || isStreaming.value) return

  if (!activeConversationId.value) {
    await startNewConversation()
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

  inputMessage.value = ''
  isStreaming.value = true
  currentThinking.value = ''
  currentTextDelta.value = ''
  currentTools.value = []
  currentReport.value = null
  currentPlan.value = null
  scrollToBottom()

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

watch(currentPatientId, () => {
  initConversations()
})

let statusTimer: number | undefined
onMounted(() => {
  loadStatus()
  initConversations()
  statusTimer = window.setInterval(loadStatus, 10000)
})
onUnmounted(() => {
  if (statusTimer) window.clearInterval(statusTimer)
})
</script>

<template>
  <!-- Floating Launch Badge -->
  <div v-if="!isOpen" class="copilot-badge" @click="isOpen = true" title="打开 AI 影像与临床会诊助手">
    <div class="badge-pulse"></div>
    <div class="badge-icon">🩺</div>
    <div class="badge-text">
      <span class="main-label">{{ $t('ui.copilot.brand') }}</span>
      <span class="sub-label">{{ $t('ui.copilot.talkToCt') }}</span>
    </div>
  </div>

  <!-- Slide-in Drawer Container -->
  <aside
    v-show="isOpen"
    class="copilot-drawer"
    :class="{ expanded: isExpanded }"
    aria-label="AI 临床与影像助手"
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
            <span class="context-pill">患者 #{{ currentPatientId }}</span>
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
          @click="startNewConversation"
          title="开启新会诊对话"
        >
          ➕
        </button>
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
          @click="isOpen = false"
          title="最小化助手"
        >
          ✕
        </button>
      </div>
    </div>

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
          <div class="text-body markdown-rendered" v-html="displayMessageText(msg.content).replace(/\n/g, '<br/>')"></div>
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
          <div class="text-body" v-html="currentTextDelta.replace(/\n/g, '<br/>')"></div>

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
/* Launcher Floating Badge */
.copilot-badge {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.2);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.copilot-badge:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 28px -5px rgba(37, 99, 235, 0.5);
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  display: flex;
  flex-direction: column;
}

.main-label {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.sub-label {
  font-size: 10px;
  opacity: 0.85;
  font-weight: 500;
}

/* Drawer Container */
.copilot-drawer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 440px;
  height: 640px;
  max-height: calc(100vh - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copilot-drawer.expanded {
  width: 720px;
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agent-avatar {
  font-size: 24px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.version-tag {
  font-size: 10px;
  background: #eff6ff;
  color: #2563eb;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.context-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
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
  background: #e2e8f0;
  color: #0f172a;
}

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
  background: #f8fafc;
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
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
}

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
  border-color: #93c5fd;
  background: #eff6ff;
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
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
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
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.send-btn {
  background: #2563eb;
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
  background: #1d4ed8;
}

.send-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
