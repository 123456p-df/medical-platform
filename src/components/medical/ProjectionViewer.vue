<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Examination } from '@/types'
import SliceViewport from './SliceViewport.vue'
import { activeMedicalTool } from '@/composables/useViewportGestures'

defineProps<{ examination: Examination }>()
const position = ref(0)

onMounted(() => { activeMedicalTool.value = 'pointer' })
</script>

<template>
  <section class="projection-viewer">
    <header>
      <strong>{{ examination.type }} · {{ $t('ui.viewer.projectionImage') }}</strong>
      <span>{{ $t('ui.viewer.projectionHelp') }}</span>
    </header>
    <SliceViewport
      :key="examination.id"
      :examination="examination"
      axis="axial"
      preset="auto"
      :zoom="1"
      :renderer="null"
      :position="position"
      :sync-crosshairs="false"
      :show-crosshairs="false"
      @position-change="position = $event"
    />
  </section>
</template>

<style scoped>
.projection-viewer{overflow:hidden;border:1px solid #2a3b44;border-radius:12px;background:#0d191e}.projection-viewer>header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px;border-bottom:1px solid #2a3b44;color:#d9eceb}.projection-viewer>header span{color:#93abb1;font-size:11px;text-align:right}@media(max-width:700px){.projection-viewer>header{align-items:flex-start;flex-direction:column}.projection-viewer>header span{text-align:left}}
</style>
