<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Link2, RefreshCw, RotateCcw, Unlink } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import type { AdminUser, PatientAccess } from '@/types'

const doctors = ref<AdminUser[]>([])
const selectedDoctorId = ref<number | null>(null)
const rows = ref<PatientAccess[]>([])
const busy = ref(false)
const error = ref('')
const message = ref('')
const selectedDoctor = computed(() => doctors.value.find(item => item.userId === selectedDoctorId.value) || null)

function localDoctors(): AdminUser[] {
  return [
    { userId: 2, username: 'demo_doctor', role: 'doctor', isActive: true, department: 'Radiology', createdAt: new Date().toISOString() },
    { userId: 3, username: 'doctor_a', role: 'doctor', isActive: true, department: 'Radiology', createdAt: new Date().toISOString() },
  ]
}

function localRows(doctorId: number): PatientAccess[] {
  return [
    { doctorUserId: doctorId, doctorUsername: 'demo_doctor', doctorName: 'Demo Doctor', patientId: 20260021, patientName: 'demo_patient', status: 'active', createdAt: new Date().toISOString() },
    { doctorUserId: doctorId, doctorUsername: 'demo_doctor', doctorName: 'Demo Doctor', patientId: 20260037, patientName: 'test_patient', status: 'revoked', createdAt: new Date().toISOString() },
  ]
}

async function loadDoctors() {
  busy.value = true
  try {
    doctors.value = localPreview ? localDoctors() : (await adminApi.listUsers({ role: 'doctor', pageSize: 100 })).items
    if (!selectedDoctorId.value && doctors.value.length) selectedDoctorId.value = doctors.value[0].userId
    if (selectedDoctorId.value) await loadAccess()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.patientAccess.loadFailed')
  } finally {
    busy.value = false
  }
}

async function loadAccess() {
  if (!selectedDoctorId.value) return
  rows.value = localPreview
    ? localRows(selectedDoctorId.value)
    : (await adminApi.userPatients(selectedDoctorId.value)).items
}

async function setAccess(row: PatientAccess, status: 'active' | 'revoked') {
  busy.value = true
  error.value = ''
  try {
    if (localPreview) row.status = status
    else Object.assign(row, await adminApi.setPatientAccess(row.doctorUserId, row.patientId, status))
    message.value = t(status === 'active' ? 'ui.patientAccess.restored' : 'ui.patientAccess.revoked')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.patientAccess.updateFailed')
  } finally {
    busy.value = false
  }
}

onMounted(loadDoctors)
</script>

<template>
  <div class="admin-page">
    <section class="page-header">
      <div><span class="eyebrow">{{ $t('ui.admin.eyebrow') }}</span><h1>{{ $t('ui.patientAccess.title') }}</h1><p>{{ $t('ui.patientAccess.subtitle') }}</p></div>
      <button class="btn btn-secondary" type="button" :disabled="busy" @click="loadDoctors"><RefreshCw :size="16" /> {{ $t('ui.admin.refresh') }}</button>
    </section>
    <section class="card filter-card">
      <label class="label">{{ $t('ui.patientAccess.doctor') }}<select v-model="selectedDoctorId" class="select" @change="loadAccess"><option v-for="doctor in doctors" :key="doctor.userId" :value="doctor.userId">{{ doctor.username }} · {{ doctor.department || $t('ui.patientAccess.noDepartment') }}</option></select></label>
      <div><strong>{{ selectedDoctor?.username }}</strong><span>{{ rows.filter(row => row.status === 'active').length }} {{ $t('ui.patientAccess.activeCount') }}</span></div>
    </section>
    <p v-if="message" class="success" role="status">{{ message }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <section class="card table-card">
      <table>
        <thead><tr><th>{{ $t('ui.patientAccess.patient') }}</th><th>{{ $t('ui.patientAccess.status') }}</th><th>{{ $t('ui.patientAccess.since') }}</th><th>{{ $t('ui.adminUsers.actions') }}</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="row.patientId">
            <td><strong>{{ row.patientName || row.patientId }}</strong><small>{{ row.patientId }}</small></td>
            <td><span :class="['status', row.status]"><Link2 v-if="row.status === 'active'" :size="13" /><Unlink v-else :size="13" />{{ $t(row.status === 'active' ? 'ui.patientAccess.active' : 'ui.patientAccess.revoked') }}</span></td>
            <td>{{ new Date(row.createdAt).toLocaleDateString() }}</td>
            <td class="actions">
              <button v-if="row.status === 'active'" type="button" :title="$t('ui.patientAccess.revoke')" @click="setAccess(row, 'revoked')"><Unlink :size="15" /></button>
              <button v-else type="button" :title="$t('ui.patientAccess.restore')" @click="setAccess(row, 'active')"><RotateCcw :size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!rows.length" class="empty">{{ $t('ui.patientAccess.empty') }}</p>
    </section>
  </div>
</template>

<style scoped>
.admin-page{display:grid;gap:18px}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.page-header h1{margin:7px 0 4px}.page-header p{margin:0;color:var(--text-muted);font-size:12px}.filter-card{display:flex;align-items:end;justify-content:space-between;gap:18px;padding:18px}.label{display:grid;gap:7px;min-width:320px;color:var(--text-soft);font-size:12px}.filter-card>div{display:grid;text-align:right}.filter-card>div span{color:var(--text-muted);font-size:11px}.table-card{overflow:auto;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:12px 10px;border-bottom:1px solid var(--border);text-align:left}th{color:var(--text-muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}td strong,td small{display:block}td small{margin-top:3px;color:var(--text-muted)}.status{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:700}.status.active{background:#e6f1eb;color:#2f6a4c}.status.revoked{background:#f5e9e9;color:#9a4d52}.actions button{display:grid;width:30px;height:30px;place-items:center;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text-muted)}.success{color:var(--green);font-size:12px}.error{color:var(--red);font-size:12px}.empty{color:var(--text-muted);font-size:12px;text-align:center}@media(max-width:800px){.page-header,.filter-card{align-items:stretch;flex-direction:column}.page-header .btn{width:100%}.label{min-width:0;width:100%}.filter-card>div{text-align:left}}
</style>
