<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Box } from 'lucide-vue-next'
import { inheritSessionFromOpener, readSession, writeSession } from '@/api/client'
import { usePatientStore } from '@/stores/patients'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()
const patientId = computed(() => String(route.params.id))
const opened = ref(false)
const blocked = ref(false)

function viewerHref() {
  const exam = store.examinations.find((item) => item.type === 'CT')
  const resolved = router.resolve({
    name: 'study-viewer',
    params: { patientId: patientId.value },
    query: exam ? { image: exam.id } : {},
  })
  return resolved.href
}

function openViewer() {
  inheritSessionFromOpener()
  const session = readSession()
  if (session) writeSession(session)
  const popup = window.open(viewerHref(), 'vmrb-3d-' + patientId.value, 'popup=yes,width=1600,height=960')
  if (!popup) {
    blocked.value = true
    void router.push({
      name: 'study-viewer',
      params: { patientId: patientId.value },
      query: store.examinations.find((item) => item.type === 'CT') ? { image: store.examinations.find((item) => item.type === 'CT')!.id } : {},
    })
    return
  }
  opened.value = true
}

onMounted(openViewer)
</script>

<template>
  <section class="card viewer-launch">
    <Box :size="28" />
    <div>
      <h3>3D 查看器在独立窗口中打开</h3>
      <p v-if="blocked">浏览器拦截了弹窗，已在当前页全屏打开。</p>
      <p v-else-if="opened">患者工作台留在此页。关闭窗口后可再次打开。</p>
      <p v-else>正在打开 3D 窗口…</p>
    </div>
    <button class="btn btn-primary" type="button" @click="openViewer">打开 3D 窗口</button>
  </section>
</template>

<style scoped>
.viewer-launch {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 32px;
}
.viewer-launch h3 { margin: 0 0 8px; }
.viewer-launch p { margin: 0; color: var(--text-muted); }
</style>
