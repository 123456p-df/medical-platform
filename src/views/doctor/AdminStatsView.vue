<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Activity, FileCheck2, ScanLine, Sparkles, UsersRound } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { localPreview } from '@/utils/runtime'
import type { AdminStats, TemplateUsage } from '@/types'

const days = ref(30)
const busy = ref(false)
const error = ref('')
const stats = ref<AdminStats | null>(null)
const usage = ref<TemplateUsage[]>([])

const totals = computed(() => ({
  patients: stats.value?.newPatients.reduce((sum, item) => sum + item.count, 0) || 0,
  images: stats.value?.imageUploads.reduce((sum, item) => sum + item.count, 0) || 0,
  ai: stats.value?.aiTasks.reduce((sum, item) => sum + item.count, 0) || 0,
  reports: stats.value?.signedReports.reduce((sum, item) => sum + item.count, 0) || 0,
}))

function localStats(): AdminStats {
  const today = new Date()
  const series = (base: number) => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - 6 + index)
    return { date: date.toISOString().slice(0, 10), count: Math.max(0, base + (index % 3) * 2 - 1) }
  })
  return {
    days: days.value,
    newPatients: series(3),
    imageUploads: series(8),
    aiTasks: series(5),
    signedReports: series(4),
    doctorActivity: [
      { userId: 2, username: 'demo_doctor', displayName: 'Demo Doctor', signedReports: 12, imagesUploaded: 18, auditActions: 47 },
      { userId: 3, username: 'doctor_a', displayName: 'Doctor A', signedReports: 7, imagesUploaded: 9, auditActions: 26 },
    ],
  }
}

async function loadStats() {
  busy.value = true
  error.value = ''
  try {
    if (localPreview) {
      stats.value = localStats()
      usage.value = [
        { templateId: 'template_chest_ct', templateName: 'Chest CT Structured Report', doctorUserId: 2, doctorName: 'Demo Doctor', reportCount: 9 },
        { templateId: 'template_brain_mri', templateName: 'Brain MRI Structured Report', doctorUserId: 3, doctorName: 'Doctor A', reportCount: 4 },
      ]
    } else {
      ;[stats.value, usage.value] = await Promise.all([adminApi.stats(days.value), adminApi.templateUsage()])
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unable to load statistics.'
  } finally {
    busy.value = false
  }
}

onMounted(loadStats)
</script>

<template>
  <div class="admin-page">
    <section class="page-header">
      <div><span class="eyebrow">{{ $t('ui.admin.eyebrow') }}</span><h1>{{ $t('ui.adminStats.title') }}</h1><p>{{ $t('ui.adminStats.subtitle') }}</p></div>
      <label class="range">{{ $t('ui.adminStats.range') }}<select v-model="days" class="select" @change="loadStats"><option :value="7">7</option><option :value="30">30</option><option :value="90">90</option></select></label>
    </section>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <section class="metric-grid">
      <article class="metric card"><UsersRound :size="20" /><span>{{ $t('ui.adminStats.newPatients') }}</span><strong>{{ totals.patients }}</strong></article>
      <article class="metric card"><ScanLine :size="20" /><span>{{ $t('ui.adminStats.images') }}</span><strong>{{ totals.images }}</strong></article>
      <article class="metric card"><Sparkles :size="20" /><span>{{ $t('ui.adminStats.aiTasks') }}</span><strong>{{ totals.ai }}</strong></article>
      <article class="metric card"><FileCheck2 :size="20" /><span>{{ $t('ui.adminStats.signedReports') }}</span><strong>{{ totals.reports }}</strong></article>
    </section>
    <section class="grid-two">
      <article class="card table-card">
        <h3><Activity :size="17" /> {{ $t('ui.adminStats.doctorActivity') }}</h3>
        <table><thead><tr><th>{{ $t('ui.adminUsers.user') }}</th><th>{{ $t('ui.adminStats.signedReports') }}</th><th>{{ $t('ui.adminStats.images') }}</th><th>{{ $t('ui.adminStats.auditActions') }}</th></tr></thead><tbody><tr v-for="doctor in stats?.doctorActivity || []" :key="doctor.userId"><td><strong>{{ doctor.displayName }}</strong><small>{{ doctor.username }}</small></td><td>{{ doctor.signedReports }}</td><td>{{ doctor.imagesUploaded }}</td><td>{{ doctor.auditActions }}</td></tr></tbody></table>
      </article>
      <article class="card table-card">
        <h3><FileCheck2 :size="17" /> {{ $t('ui.adminStats.templateUsage') }}</h3>
        <table><thead><tr><th>{{ $t('ui.adminStats.template') }}</th><th>{{ $t('ui.adminUsers.user') }}</th><th>{{ $t('ui.adminStats.reports') }}</th></tr></thead><tbody><tr v-for="item in usage" :key="`${item.templateId}:${item.doctorUserId}`"><td>{{ item.templateName }}</td><td>{{ item.doctorName }}</td><td>{{ item.reportCount }}</td></tr></tbody></table>
      </article>
    </section>
  </div>
</template>

<style scoped>
.admin-page{display:grid;gap:18px}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.page-header h1{margin:7px 0 4px}.page-header p{margin:0;color:var(--text-muted);font-size:12px}.range{display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:12px}.range .select{width:90px}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.metric{display:grid;gap:8px;padding:18px;color:var(--accent-strong)}.metric span{color:var(--text-muted);font-size:11px}.metric strong{color:var(--text);font-size:28px}.grid-two{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.table-card{padding:18px;overflow:auto}.table-card h3{display:flex;align-items:center;gap:8px;margin:0 0 14px;font-size:15px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px 8px;border-bottom:1px solid var(--border);text-align:left}th{color:var(--text-muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}td strong,td small{display:block}td small{margin-top:3px;color:var(--text-muted)}.error{color:var(--red);font-size:12px}@media(max-width:1000px){.metric-grid{grid-template-columns:repeat(2,1fr)}.grid-two{grid-template-columns:1fr}}@media(max-width:650px){.page-header{align-items:stretch;flex-direction:column}.metric-grid{grid-template-columns:1fr}}
</style>
