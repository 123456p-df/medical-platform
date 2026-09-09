<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/layout/PageHeader.vue'
import OrganWorkspace from '@/components/3d/OrganWorkspace.vue'
const auth=useAuthStore()
</script>
<template>
  <div class="page">
    <PageHeader title="My Body" subtitle="Explore your organ models and recorded medical history." />
    <OrganWorkspace v-if="auth.session" :patient-id="auth.session.id" />
  </div>
</template>
