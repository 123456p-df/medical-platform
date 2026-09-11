<script setup lang="ts">
import type { Examination, Finding } from '@/types'
import MPRViewer from './MPRViewer.vue'
defineProps<{ examination: Examination; findings?: Finding[] }>()
defineEmits<{ selectFinding: [id: string] }>()
</script>
<template>
  <MPRViewer
    :examination="examination"
    :findings="findings"
    @select-finding="$emit('selectFinding', $event)"
  />
</template>
