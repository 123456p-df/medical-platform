<script setup lang="ts">
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

defineProps<{
  preset: string
  zoom?: number
  layout?: 'mpr' | 'compare' | 'ai' | '3d' | 'single'
  isPlaying?: boolean
  fps?: number
  isCT?: boolean
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

const { visible: crosshairsVisible } = useCrosshairs()

const tools: { id: MedicalTool; label: string; icon: any; shortcut: string }[] = [
  { id: 'pointer', label: '默认选择', icon: MousePointer, shortcut: 'V' },
  { id: 'crosshairs', label: '3D十字光标', icon: Crosshair, shortcut: 'C' },
  { id: 'ww_wl', label: '窗宽窗位(右键)', icon: Sliders, shortcut: 'W' },
  { id: 'pan', label: '平移视图(中键)', icon: Move, shortcut: 'P' },
  { id: 'ruler', label: '长度标尺', icon: Ruler, shortcut: 'M' },
  { id: 'probe', label: 'HU探针', icon: Activity, shortcut: 'H' },
]

const layouts: { id: 'mpr' | 'compare' | 'ai' | '3d'; label: string; icon: any }[] = [
  { id: 'mpr', label: '经典MPR', icon: Grid2X2 },
  { id: 'compare', label: '多期对比', icon: Columns2 },
  { id: 'ai', label: 'AI阅片', icon: Sparkles },
  { id: '3d', label: '3D全景', icon: Box },
]

function selectTool(tool: MedicalTool) {
  activeMedicalTool.value = tool
}
</script>

<template>
  <div class="viewport-toolbar">
    <!-- 医学交互工具集 -->
    <div class="tool-group">
      <button
        v-for="t in tools"
        :key="t.id"
        :class="['tool-btn', { active: activeMedicalTool === t.id }]"
        :title="`${t.label} (快捷键 ${t.shortcut})`"
        @click="selectTool(t.id)"
      >
        <component :is="t.icon" :size="15" />
        <span>{{ t.label }}</span>
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- 窗宽窗位预设 -->
    <div class="preset-group">
      <label class="preset-label">窗宽预设:</label>
      <select
        :value="preset"
        class="preset-select"
        @change="emit('update:preset', ($event.target as HTMLSelectElement).value)"
      >
        <option value="auto">自动窗宽</option>
        <template v-if="isCT !== false">
          <option value="lung">肺窗 (W:1500 L:-600)</option>
          <option value="soft">软组织 (W:400 L:40)</option>
          <option value="bone">骨窗 (W:1800 L:400)</option>
          <option value="brain">脑窗 (W:80 L:40)</option>
        </template>
      </select>
    </div>

    <div class="toolbar-divider" />

    <!-- 缩放与复位 -->
    <div class="zoom-group">
      <button class="icon-btn" title="缩小" @click="emit('zoomOut')">
        <Minus :size="14" />
      </button>
      <span class="zoom-text">{{ Math.round((zoom ?? 1) * 100) }}%</span>
      <button class="icon-btn" title="放大" @click="emit('zoomIn')">
        <Plus :size="14" />
      </button>
      <button class="icon-btn reset-btn" title="复位缩放与平移" @click="emit('resetView')">
        <RotateCcw :size="14" />
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- 十字准星显隐 -->
    <button
      :class="['toggle-btn', { active: crosshairsVisible }]"
      :title="crosshairsVisible ? '隐藏3D十字光标' : '显示3D十字光标'"
      @click="crosshairsVisible = !crosshairsVisible"
    >
      <component :is="crosshairsVisible ? Eye : EyeOff" :size="14" />
      <span>十字光标</span>
    </button>

    <!-- Cine 电影回放 -->
    <button
      :class="['cine-btn', { playing: isPlaying }]"
      :title="isPlaying ? '暂停电影回放 (空格键)' : '启动电影回放 (空格键)'"
      @click="emit('togglePlay')"
    >
      <component :is="isPlaying ? Pause : Play" :size="14" />
      <span>{{ isPlaying ? '暂停' : 'Cine 连读' }}</span>
    </button>

    <div class="toolbar-spacer" />

    <!-- 工作流布局引擎切换 -->
    <div v-if="layout" class="layout-group">
      <button
        v-for="l in layouts"
        :key="l.id"
        :class="['layout-btn', { active: layout === l.id }]"
        :title="l.label"
        @click="emit('update:layout', l.id)"
      >
        <component :is="l.icon" :size="14" />
        <span>{{ l.label }}</span>
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
