<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Box, ExternalLink, Layers } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()
const patientId = computed(() => String(route.params.id))
const ctStudies = computed(() => store.examinations.filter((item) => item.type === 'CT'))

function viewerHref() {
  const exam = ctStudies.value[0]
  const resolved = router.resolve({
    name: 'study-viewer',
    params: { patientId: patientId.value },
    query: exam ? { image: exam.id } : {},
  })
  return resolved.href
}
</script>

<template>
  <section class="card viewer-launch">
    <div class="launch-icon">
      <Box :size="36" />
    </div>
    <div class="launch-content">
      <h3>3D 器官模型与解剖查看器</h3>
      <p>
        支持全器官 AI 分割三维模型交互、MPR 正交切片联动浏览与多期 CT 同屏对比。为提供最佳视野与多屏体验，查看器将在独立新标签页中运行。
      </p>
      <div v-if="ctStudies.length" class="study-badge">
        <Layers :size="14" />
        <span>已关联 {{ ctStudies.length }} 组 CT 影像序列</span>
      </div>
      <div v-else class="study-badge warning">
        <span>当前患者暂未上传 CT 影像序列</span>
      </div>
    </div>
    <div class="launch-action">
      <a :href="viewerHref()" target="_blank" class="btn btn-primary launch-btn">
        <span>在新标签页打开 3D 查看器</span>
        <ExternalLink :size="16" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.viewer-launch {
  display: flex;
  min-height: 220px;
  align-items: center;
  gap: 24px;
  padding: 36px;
  background: var(--surface, #ffffff);
  border-radius: 12px;
}

.launch-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 16px;
  background: var(--accent-soft, #e6f6f4);
  color: var(--accent, #149486);
  flex-shrink: 0;
}

.launch-content {
  flex: 1;
}

.launch-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text, #1e293b);
}

.launch-content p {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted, #64748b);
  max-width: 620px;
}

.study-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--surface-3, #f1f5f9);
  color: var(--text-soft, #475569);
  font-size: 12px;
  font-weight: 500;
}

.study-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.launch-action {
  flex-shrink: 0;
}

.launch-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
</style>
