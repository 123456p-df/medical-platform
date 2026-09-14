<script setup lang="ts">
import { FileQuestion, Home } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const home = auth.portal === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
</script>

<template>
  <main class="not-found">
    <section class="card">
      <FileQuestion :size="38" />
      <span>404</span>
      <h1>{{ $t('ui.notFound.title') }}</h1>
      <p>{{ $t('ui.notFound.body') }}</p>
      <RouterLink class="btn btn-primary" :to="home"><Home :size="16" /> {{ $t('ui.notFound.back') }}</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.not-found{display:grid;min-height:100vh;place-items:center;padding:24px;background:var(--surface-2)}
.not-found .card{display:grid;width:min(480px,100%);justify-items:center;gap:13px;padding:42px;text-align:center}
.not-found svg,.not-found span{color:var(--accent)}.not-found span{font-size:12px;font-weight:750;letter-spacing:.16em}
.not-found h1,.not-found p{margin:0}.not-found p{color:var(--text-muted)}.not-found .btn{margin-top:8px}
</style>
