<script setup lang="ts">
import type { Examination, Finding } from '@/types'
import MPRViewer from './MPRViewer.vue'
import ProjectionViewer from './ProjectionViewer.vue'
defineProps<{ examination: Examination; findings?: Finding[] }>()
defineEmits<{ selectFinding: [id: string] }>()
</script>
<template>
  <ProjectionViewer v-if="examination.type === 'X-Ray'" :examination="examination" />
  <MPRViewer
    v-else
    :examination="examination"
    :findings="findings"
    @select-finding="$emit('selectFinding', $event)"
  />
</template>
