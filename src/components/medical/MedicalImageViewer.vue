<script setup lang="ts">
import RemoteSliceViewer from './RemoteSliceViewer.vue'
import type { Examination, Finding } from '@/types'
defineProps<{ examination: Examination; findings?: Finding[] }>()
defineEmits<{ selectFinding: [findingId: string] }>()
</script>
<template><RemoteSliceViewer :examination="examination" /></template>
