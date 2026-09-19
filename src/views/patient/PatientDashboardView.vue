<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, FileText, RotateCw, Stethoscope, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import AnatomyScene from '@/components/3d/AnatomyScene.vue'
import OrganVisibilityList, { type OrganGroup } from '@/components/3d/OrganVisibilityList.vue'
import { examinationApi } from '@/api/examinations'
import { viewerApi, type SegmentationBatch, type ViewerOrgan } from '@/api/viewer'
import type { Examination } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()

const patientId = computed(() => auth.session?.id ?? '')
const studies = ref<Examination[]>([])
const selectedStudyId = ref<string>('')
const batch = ref<SegmentationBatch | null>(null)
const selectedGroups = ref<string[]>([])
const selectedLabelId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

const primaryStudy = computed(() =>
  studies.value.find((s) => s.id === selectedStudyId.value) || studies.value[0] || null,
)

const currentStudyDescription = computed(() => {
  if (!primaryStudy.value) return '全身解剖 3D 视图'
  return `${primaryStudy.value.date} · ${primaryStudy.value.organ} (${primaryStudy.value.type})`
})

const batchStatusText = computed(() => {
  if (!batch.value) return ''
  if (batch.value.status === 'completed') return `已识别 ${batch.value.completed_count || organs.value.length} 个器官结构`
  if (batch.value.status === 'running') return 'AI 器官分割中…'
  return `分割${batch.value.status}`
})

const activeModelId = computed(() => {
  if (batch.value?.atlas_model_id) return batch.value.atlas_model_id
  // Fallback to static interactive 3D navigation model
  return '/models/anatomy-navigation.glb'
})

const organs = computed(() =>
  (batch.value?.items || []).filter((item) => item.status === 'completed' && item.label_id != null),
)

const groups = computed<OrganGroup[]>(() => {
  if (batch.value?.items?.length) {
    const map = new Map<string, OrganGroup>()
    for (const item of organs.value) {
      const id = item.group_id || item.organ_id || `label_${item.label_id}`
      const existing = map.get(id)
      const color = (item.color || [160, 160, 160]) as [number, number, number]
      const meshName = item.mesh_name || `label_${item.label_id}`
      if (existing) {
        if (item.label_id != null) existing.labelIds.push(item.label_id)
        existing.meshNames.push(meshName)
        existing.count += 1
      } else {
        map.set(id, {
          id,
          name: item.group_name || item.display_name || item.name,
          color: [color[0], color[1], color[2]],
          labelIds: item.label_id != null ? [item.label_id] : [],
          meshNames: [meshName],
          count: 1,
        })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }

  // Fallback for anatomy navigation model
  return [
    { id: 'brain', name: '脑 (Brain)', color: [235, 130, 160], labelIds: [1], meshNames: ['brain'], count: 1 },
    { id: 'heart', name: '心脏 (Heart)', color: [220, 60, 60], labelIds: [2], meshNames: ['heart'], count: 1 },
    { id: 'lung', name: '肺部 (Lungs)', color: [100, 190, 220], labelIds: [3], meshNames: ['lung'], count: 1 },
    { id: 'liver', name: '肝脏 (Liver)', color: [180, 100, 60], labelIds: [4], meshNames: ['liver'], count: 1 },
    { id: 'kidney', name: '肾脏 (Kidneys)', color: [190, 130, 90], labelIds: [5], meshNames: ['kidney'], count: 1 },
    { id: 'stomach', name: '胃 (Stomach)', color: [220, 170, 90], labelIds: [6], meshNames: ['stomach'], count: 1 },
    { id: 'pancreas', name: '胰腺 (Pancreas)', color: [230, 200, 100], labelIds: [7], meshNames: ['pancreas'], count: 1 },
    { id: 'spleen', name: '脾脏 (Spleen)', color: [160, 90, 140], labelIds: [8], meshNames: ['spleen'], count: 1 },
    { id: 'spine', name: '脊柱 (Spine)', color: [220, 220, 210], labelIds: [9], meshNames: ['spine'], count: 1 },
    {
      id: 'eyes',
      name: '眼部 (Eyes)',
      color: [120, 180, 240],
      labelIds: [10],
      meshNames: ['eye_left_sclera', 'eye_left_iris', 'eye_left_pupil', 'eye_right_sclera', 'eye_right_iris', 'eye_right_pupil'],
      count: 6,
    },
    { id: 'body_shell', name: '人体轮廓 (Body Shell)', color: [200, 215, 225], labelIds: [11], meshNames: ['body_shell'], count: 1 },
  ]
})

const visibleNames = computed(() =>
  groups.value.filter((item) => selectedGroups.value.includes(item.id)).flatMap((item) => item.meshNames),
)

const organMetaMap = computed<Record<number, ViewerOrgan>>(() => {
  const map: Record<number, ViewerOrgan> = {}
  for (const item of batch.value?.items || []) {
    if (item.label_id != null) {
      map[item.label_id] = item
    }
  }
  return map
})

const selectedOrganInfo = computed(() => {
  if (selectedLabelId.value == null) return null
  return organMetaMap.value[selectedLabelId.value] || null
})

const statusMessage = computed(() => {
  if (loading.value) return '正在加载 3D 模型…'
  if (error.value) return error.value
  if (!batch.value && studies.value.length > 0) return '尚未完成 AI 器官分割，展示基准人体模型'
  return ''
})

function restoreSelection() {
  const ids = groups.value.map((item) => item.id)
  const saved = localStorage.getItem(`patient-3d-groups-${primaryStudy.value?.id || 'nav'}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as string[]
      const valid = parsed.filter((id) => ids.includes(id))
      if (valid.length) {
        selectedGroups.value = valid
        return
      }
    } catch { /* use default */ }
  }
  selectedGroups.value = ids
}

function persistSelection() {
  localStorage.setItem(
    `patient-3d-groups-${primaryStudy.value?.id || 'nav'}`,
    JSON.stringify(selectedGroups.value),
  )
}

function toggleOrgan(groupId: string, visible: boolean) {
  selectedGroups.value = visible
    ? [...new Set([...selectedGroups.value, groupId])]
    : selectedGroups.value.filter((id) => id !== groupId)
  persistSelection()
}

function setAll(visible: boolean) {
  selectedGroups.value = visible ? groups.value.map((item) => item.id) : []
  persistSelection()
}

function onSelectLabel(labelId: number) {
  selectedLabelId.value = labelId
}

async function loadStudyBatch(studyId: string) {
  if (!studyId) {
    batch.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    batch.value = await viewerApi.getBatch(studyId)
  } catch {
    batch.value = null
  } finally {
    loading.value = false
    restoreSelection()
  }
}

async function loadStudies() {
  if (!patientId.value) return
  loading.value = true
  try {
    const list = await examinationApi.getExaminationsByPatient(patientId.value)
    studies.value = list.filter((item) => item.type === 'CT')
    if (studies.value.length > 0 && !selectedStudyId.value) {
      selectedStudyId.value = studies.value[0].id
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载检查列表失败'
  } finally {
    loading.value = false
  }
}

watch(patientId, async (id) => {
  if (id) {
    await store.loadPatientContext(id)
    await loadStudies()
  }
}, { immediate: true })

watch(selectedStudyId, (id) => {
  if (id) void loadStudyBatch(id)
}, { immediate: true })

watch(groups, () => {
  if (groups.value.length && !selectedGroups.value.length) {
    restoreSelection()
  }
})

function reloadModel() {
  if (selectedStudyId.value) {
    void loadStudyBatch(selectedStudyId.value)
  }
}

onMounted(async () => {
  if (!store.patients.length) await store.loadPatients()
  if (patientId.value) {
    await store.loadPatientContext(patientId.value)
    await loadStudies()
  }
})
</script>

<template>
  <div class="page patient-health-page">
    <PageHeader
      title="我的健康"
      :subtitle="`欢迎回来，${auth.session?.name ?? '患者'}。以下是您的 3D 人体解剖与器官全景视图。`"
    >
      <template #actions>
        <div class="header-actions">
          <div v-if="studies.length > 1" class="study-selector">
            <label for="study-select">检查时期：</label>
            <select id="study-select" v-model="selectedStudyId">
              <option v-for="s in studies" :key="s.id" :value="s.id">
                {{ s.date }} · {{ s.organ }} · {{ s.sliceCount }} 层
              </option>
            </select>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="router.push({ name: 'patient-examinations' })">
            <Stethoscope :size="15" /> 我的检查
          </button>
          <button type="button" class="btn btn-secondary btn-sm" @click="router.push({ name: 'patient-reports' })">
            <FileText :size="15" /> 我的报告
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="health-3d-container card">
      <!-- 3D 视口顶部工具栏 -->
      <div class="viewer-3d-toolbar">
        <div class="toolbar-left">
          <div class="study-badge">
            <span class="pulse-dot" />
            <span class="study-title">{{ currentStudyDescription }}</span>
          </div>
          <span v-if="batchStatusText" class="batch-status-pill">{{ batchStatusText }}</span>
        </div>
        <div class="toolbar-right">
          <button type="button" class="tool-btn" @click="setAll(true)">
            <Eye :size="14" /> 全部显示
          </button>
          <button type="button" class="tool-btn" @click="setAll(false)">
            <EyeOff :size="14" /> 全部隐藏
          </button>
          <button type="button" class="tool-btn" @click="reloadModel">
            <RotateCw :size="14" /> 刷新
          </button>
        </div>
      </div>

      <!-- 核心 3D 解剖主区 (仅保留医生 3D 视口左侧部分，白色背景) -->
      <div class="viewer-3d-body">
        <!-- 3D 模型视口 (背景纯白 #ffffff) -->
        <div class="scene-viewport">
          <AnatomyScene
            :model-id="activeModelId"
            :visible-names="visibleNames"
            :status="statusMessage"
            :organ-meta="organMetaMap"
            theme="light"
            background="#ffffff"
            :show-plane="false"
            @select-label="onSelectLabel"
          />

          <!-- 交互：点击选中器官时浮动信息卡片 -->
          <transition name="fade">
            <div v-if="selectedOrganInfo" class="organ-inspection-overlay">
              <div class="inspection-header">
                <span class="inspection-title">
                  {{ selectedOrganInfo.group_name || selectedOrganInfo.display_name || selectedOrganInfo.name }}
                </span>
                <button type="button" class="close-btn" @click="selectedLabelId = null">
                  <X :size="14" />
                </button>
              </div>
              <div class="inspection-body">
                <div v-if="selectedOrganInfo.volume_cm3" class="metric-row">
                  <span class="metric-label">体积估算:</span>
                  <span class="metric-value">{{ selectedOrganInfo.volume_cm3.toFixed(1) }} cm³</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">解剖位置:</span>
                  <span class="metric-value">{{ selectedOrganInfo.name }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">健康状态:</span>
                  <span class="status-tag normal">已识别 · 正常</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 器官清单控制板 (纯白卡片样式，浅色主题) -->
        <div class="organ-panel">
          <OrganVisibilityList
            :groups="groups"
            :selected="selectedGroups"
            theme="light"
            @toggle="toggleOrgan"
            @set-all="setAll"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.patient-health-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.study-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-soft);
}

.study-selector select {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--text);
  font-size: 12px;
}

.health-3d-container {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  flex: 1;
  min-height: 640px;
}

.viewer-3d-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #edf2f7;
  background: #fafbfc;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.study-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.batch-status-pill {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.viewer-3d-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  flex: 1;
  min-height: 560px;
  background: #ffffff;
}

.scene-viewport {
  position: relative;
  background: #ffffff;
  min-height: 560px;
  height: 100%;
  overflow: hidden;
}

.scene-viewport :deep(.anatomy-scene) {
  height: 100%;
  min-height: 560px;
  border: none;
  border-radius: 0;
  background: #ffffff;
}

.organ-panel {
  border-left: 1px solid #edf2f7;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.organ-panel :deep(.organ-list) {
  height: 100%;
  border-top: none;
}

.organ-panel :deep(ul) {
  max-height: calc(100vh - 360px);
}

.organ-inspection-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.inspection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.inspection-title {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
}

.close-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 2px;
}

.close-btn:hover {
  color: #475569;
}

.inspection-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.metric-label {
  color: #64748b;
}

.metric-value {
  color: #1e293b;
  font-weight: 500;
}

.status-tag.normal {
  color: #059669;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 900px) {
  .viewer-3d-body {
    grid-template-columns: 1fr;
  }
  .organ-panel {
    border-left: none;
    border-top: 1px solid #edf2f7;
    min-height: 260px;
  }
}
</style>
