<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import {
  MousePointer,
  Crosshair,
  Sliders,
  Move,
  Ruler,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Grid2X2,
  Columns2,
  Sparkles,
  Box,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import { activeMedicalTool, type MedicalTool } from '@/composables/useViewportGestures'
import { useCrosshairs } from '@/composables/useCrosshairs'
import { viewerCapabilities } from '@/utils/viewerCapabilities'
import type { ExaminationType } from '@/types'

const props = defineProps<{
  preset: string
  zoom?: number
  layout?: 'mpr' | 'compare' | 'ai' | '3d' | 'single'
  isPlaying?: boolean
  fps?: number
  crosshairScope?: string
  modality: ExaminationType
}>()

const emit = defineEmits<{
  'update:preset': [preset: string]
  'update:layout': [layout: 'mpr' | 'compare' | 'ai' | '3d' | 'single']
  zoomIn: []
  zoomOut: []
  resetView: []
  togglePlay: []
  updateFps: [fps: number]
}>()

const { visible: crosshairsVisible, releaseCrosshairs } = useCrosshairs(props.crosshairScope || 'default')
onBeforeUnmount(releaseCrosshairs)
const capability = computed(() => viewerCapabilities(props.modality))

const tools: { id: MedicalTool; label: string; icon: any; shortcut: string }[] = [
  { id: 'pointer', label: 'ui.toolbar.pointer', icon: MousePointer, shortcut: 'V' },
  { id: 'crosshairs', label: 'ui.toolbar.crosshairs', icon: Crosshair, shortcut: 'C' },
  { id: 'ww_wl', label: 'ui.toolbar.windowLevel', icon: Sliders, shortcut: 'W' },
  { id: 'pan', label: 'ui.toolbar.pan', icon: Move, shortcut: 'P' },
  { id: 'ruler', label: 'ui.toolbar.ruler', icon: Ruler, shortcut: 'M' },
  { id: 'probe', label: 'ui.toolbar.probe', icon: Activity, shortcut: 'H' },
]

const layouts: { id: 'mpr' | 'compare' | 'ai' | '3d'; label: string; icon: any }[] = [
  { id: 'mpr', label: 'ui.toolbar.mpr', icon: Grid2X2 },
  { id: 'compare', label: 'ui.toolbar.compare', icon: Columns2 },
  { id: 'ai', label: 'ui.toolbar.ai', icon: Sparkles },
  { id: '3d', label: 'ui.toolbar.full3d', icon: Box },
]
const availableTools = computed(() => tools.filter(tool => capability.value.tools.includes(tool.id)))
const availableLayouts = computed(() => layouts.filter(item => capability.value.layouts.includes(item.id)))

watch(capability, value => {
  if (!value.tools.includes(activeMedicalTool.value)) activeMedicalTool.value = 'pointer'
}, { immediate: true })

function selectTool(tool: MedicalTool) {
  activeMedicalTool.value = tool
}
</script>

<template>
  <div class="viewport-toolbar">
    <!-- 医学交互工具集 -->
    <div class="tool-group">
      <button
        v-for="t in availableTools"
        :key="t.id"
        :class="['tool-btn', { active: activeMedicalTool === t.id }]"
        :title="$t('ui.toolbar.toolShortcut', { label: $t(t.label), shortcut: t.shortcut })"
        :aria-pressed="activeMedicalTool === t.id"
        @click="selectTool(t.id)"
      >
        <component :is="t.icon" :size="15" />
        <span>{{ $t(t.label) }}</span>
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- 窗宽窗位预设 -->
    <div class="preset-group">
      <label class="preset-label">{{ $t('ui.toolbar.preset') }}</label>
      <select
        :value="preset"
        class="preset-select"
        @change="emit('update:preset', ($event.target as HTMLSelectElement).value)"
      >
        <option value="auto">{{ $t('ui.toolbar.autoWindow') }}</option>
        <template v-if="modality === 'CT'">
          <option value="lung">{{ $t('ui.toolbar.lungWindow') }}</option>
          <option value="soft">{{ $t('ui.toolbar.softWindow') }}</option>
          <option value="bone">{{ $t('ui.toolbar.boneWindow') }}</option>
          <option value="brain">{{ $t('ui.toolbar.brainWindow') }}</option>
        </template>
      </select>
    </div>

    <div class="toolbar-divider" />

    <!-- 缩放与复位 -->
    <div class="zoom-group">
      <button class="icon-btn" :title="$t('Zoom out')" :aria-label="$t('Zoom out')" @click="emit('zoomOut')">
        <Minus :size="14" />
      </button>
      <span class="zoom-text">{{ Math.round((zoom ?? 1) * 100) }}%</span>
      <button class="icon-btn" :title="$t('Zoom in')" :aria-label="$t('Zoom in')" @click="emit('zoomIn')">
        <Plus :size="14" />
      </button>
      <button class="icon-btn reset-btn" :title="$t('ui.toolbar.resetView')" :aria-label="$t('ui.toolbar.resetView')" @click="emit('resetView')">
        <RotateCcw :size="14" />
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- 十字准星显隐 -->
    <button
      v-if="capability.tools.includes('crosshairs')"
      :class="['toggle-btn', { active: crosshairsVisible }]"
      :title="$t(crosshairsVisible ? 'ui.toolbar.hideCrosshairs' : 'ui.toolbar.showCrosshairs')"
      :aria-pressed="crosshairsVisible"
      @click="crosshairsVisible = !crosshairsVisible"
    >
      <component :is="crosshairsVisible ? Eye : EyeOff" :size="14" />
      <span>{{ $t('ui.toolbar.crosshairs') }}</span>
    </button>

    <!-- Cine 电影回放 -->
    <button
      v-if="capability.cine"
      :class="['cine-btn', { playing: isPlaying }]"
      :title="$t(isPlaying ? 'ui.toolbar.pauseCine' : 'ui.toolbar.playCine')"
      :aria-pressed="Boolean(isPlaying)"
      @click="emit('togglePlay')"
    >
      <component :is="isPlaying ? Pause : Play" :size="14" />
      <span>{{ $t(isPlaying ? 'Pause' : 'ui.toolbar.cine') }}</span>
    </button>

    <div class="toolbar-spacer" />

    <!-- 工作流布局引擎切换 -->
    <div v-if="layout" class="layout-group">
      <button
        v-for="l in availableLayouts"
        :key="l.id"
        :class="['layout-btn', { active: layout === l.id }]"
        :title="$t(l.label)"
        :aria-pressed="layout === l.id"
        @click="emit('update:layout', l.id)"
      >
        <component :is="l.icon" :size="14" />
        <span>{{ $t(l.label) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.viewport-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #101c24;
  border-bottom: 1px solid #24353f;
  flex-wrap: wrap;
  user-select: none;
}

.tool-group,
.layout-group,
.zoom-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  font-size: 11px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: #172732;
  color: #9ab4bd;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background: #1f3442;
  color: #d6e8ec;
}

.tool-btn.active {
  background: #254a55;
  border-color: #4b8b8f;
  color: #5ce6d4;
  font-weight: 500;
  box-shadow: 0 0 8px rgba(92, 230, 212, 0.2);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #263842;
  margin: 0 4px;
}

.preset-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.preset-label {
  color: #79959f;
}

.preset-select {
  background: #172732;
  color: #c9dde2;
  border: 1px solid #2a3e4b;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 11px;
  outline: none;
  cursor: pointer;
}

.preset-select:focus {
  border-color: #5ce6d4;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid #2a3e4b;
  background: #172732;
  color: #9ab4bd;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #233b49;
  color: #ffffff;
}

.zoom-text {
  font-size: 11px;
  color: #8da9b2;
  min-width: 36px;
  text-align: center;
}

.toggle-btn,
.cine-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  font-size: 11px;
  border-radius: 5px;
  border: 1px solid #2a3e4b;
  background: #172732;
  color: #9ab4bd;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn:hover,
.cine-btn:hover {
  background: #233b49;
  color: #d6e8ec;
}

.toggle-btn.active {
  background: #1a3c3f;
  border-color: #3b7b80;
  color: #5ce6d4;
}

.cine-btn.playing {
  background: #3e2824;
  border-color: #9e4b3e;
  color: #ff8a7a;
  animation: pulse-border 1.5s infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: #9e4b3e; }
  50% { border-color: #ff5238; box-shadow: 0 0 8px rgba(255, 82, 56, 0.4); }
}

.toolbar-spacer {
  flex: 1;
}

.layout-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid #263842;
  background: #12212b;
  color: #83a0a8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.layout-btn:hover {
  background: #192d3b;
  color: #d6e8ec;
}

.layout-btn.active {
  background: #20414f;
  border-color: #437a8c;
  color: #72dbec;
  font-weight: 500;
}
</style>
