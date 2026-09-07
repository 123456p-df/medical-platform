<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import OrganWorkspace from '@/components/3d/OrganWorkspace.vue'
const route=useRoute()
const patientId=computed(() => String(route.params.id))
</script>
<template><OrganWorkspace :patient-id="patientId" /></template>
