<script setup lang="ts">
import RemoteSliceViewer from './RemoteSliceViewer.vue'
import UploadedStudyViewer from './UploadedStudyViewer.vue'
import { isLocalUpload } from '@/api/localUploads'
import type { Examination, Finding } from '@/types'
defineProps<{ examination: Examination; findings?: Finding[] }>()
defineEmits<{ selectFinding: [findingId: string] }>()
</script>
<template>
  <UploadedStudyViewer v-if="isLocalUpload(examination)" :key="examination.id" :examination="examination" />
  <RemoteSliceViewer v-else :examination="examination" />
</template>
