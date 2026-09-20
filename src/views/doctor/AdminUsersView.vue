<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { LogOut, Plus, RefreshCw, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import type { AdminUser } from '@/types'

const USERS_KEY = 'pulmolink-admin-users-v1'
const users = ref<AdminUser[]>([])
const busy = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({ username: '', password: '', department: '' })
const doctors = computed(() => users.value.filter(user => user.role === 'doctor' || user.role === 'admin'))

function localUsers(): AdminUser[] {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || 'null')
    if (Array.isArray(stored)) return stored
  } catch { /* fall through */ }
  return [
    { userId: 1, username: 'admin', role: 'admin', isActive: true, department: 'Platform administration', createdAt: new Date().toISOString() },
    { userId: 2, username: 'demo_doctor', role: 'doctor', isActive: true, department: 'Radiology', createdAt: new Date().toISOString() },
    { userId: 3, username: 'doctor_a', role: 'doctor', isActive: false, department: 'Radiology', createdAt: new Date().toISOString() },
  ]
}

function persistLocal() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
}

async function loadUsers() {
  busy.value = true
  error.value = ''
  try {
    users.value = localPreview ? localUsers() : (await adminApi.listUsers({ role: 'doctor', pageSize: 100 })).items
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.loadFailed')
  } finally {
    busy.value = false
  }
}

async function createDoctor() {
  if (!form.username.trim() || form.password.length < 8) {
    error.value = t('ui.adminUsers.createInvalid')
    return
  }
  busy.value = true
  error.value = ''
  try {
    if (localPreview) {
      users.value.push({
        userId: Date.now(),
        username: form.username.trim(),
        role: 'doctor',
        isActive: true,
        department: form.department.trim(),
        createdAt: new Date().toISOString(),
      })
      persistLocal()
    } else {
      await adminApi.createDoctor({
        username: form.username.trim(),
        password: form.password,
        department: form.department.trim(),
      })
      await loadUsers()
    }
    Object.assign(form, { username: '', password: '', department: '' })
    message.value = t('ui.adminUsers.created')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.createFailed')
  } finally {
    busy.value = false
  }
}

async function toggleStatus(user: AdminUser) {
  busy.value = true
  try {
    if (localPreview) {
      user.isActive = !user.isActive
      persistLocal()
    } else {
      const updated = await adminApi.setUserStatus(user.userId, !user.isActive)
      Object.assign(user, updated)
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.updateFailed')
  } finally {
    busy.value = false
  }
}

async function forceLogout(user: AdminUser) {
  busy.value = true
  try {
    if (!localPreview) await adminApi.forceLogout(user.userId)
    message.value = t('ui.adminUsers.forceLoggedOut', { username: user.username })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.updateFailed')
  } finally {
    busy.value = false
  }
}

async function resetPassword(user: AdminUser) {
  const password = window.prompt(t('ui.adminUsers.resetPrompt', { username: user.username }))
  if (!password || password.length < 8) return
  busy.value = true
  try {
    if (!localPreview) await adminApi.resetPassword(user.userId, password)
    message.value = t('ui.adminUsers.passwordReset', { username: user.username })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.updateFailed')
  } finally {
    busy.value = false
  }
}

async function removeUser(user: AdminUser) {
  if (user.role === 'admin' || !window.confirm(t('ui.adminUsers.deleteConfirm', { username: user.username }))) return
  busy.value = true
  try {
    if (localPreview) {
      user.deletedAt = new Date().toISOString()
      user.isActive = false
      persistLocal()
    } else {
      await adminApi.deleteUser(user.userId)
      await loadUsers()
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.adminUsers.updateFailed')
  } finally {
    busy.value = false
  }
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : t('ui.adminUsers.never')
}

onMounted(loadUsers)
</script>

<template>
  <div class="admin-page">
    <section class="page-header">
      <div><span class="eyebrow">{{ $t('ui.admin.eyebrow') }}</span><h1>{{ $t('ui.adminUsers.title') }}</h1><p>{{ $t('ui.adminUsers.subtitle') }}</p></div>
      <button class="btn btn-secondary" type="button" :disabled="busy" @click="loadUsers"><RefreshCw :size="16" /> {{ $t('ui.admin.refresh') }}</button>
    </section>

    <section class="card create-card">
      <h3><Plus :size="18" /> {{ $t('ui.adminUsers.createTitle') }}</h3>
      <div class="create-grid">
        <label class="label">{{ $t('ui.adminUsers.username') }}<input v-model="form.username" class="input" maxlength="64" /></label>
        <label class="label">{{ $t('ui.adminUsers.password') }}<input v-model="form.password" class="input" type="password" minlength="8" maxlength="128" /></label>
        <label class="label">{{ $t('ui.adminUsers.department') }}<input v-model="form.department" class="input" maxlength="100" /></label>
        <button class="btn btn-primary" type="button" :disabled="busy" @click="createDoctor"><Plus :size="16" /> {{ $t('ui.adminUsers.create') }}</button>
      </div>
    </section>

    <p v-if="message" class="success" role="status">{{ message }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <section class="card table-card">
      <table>
        <thead><tr><th>{{ $t('ui.adminUsers.user') }}</th><th>{{ $t('ui.adminUsers.department') }}</th><th>{{ $t('ui.adminUsers.status') }}</th><th>{{ $t('ui.adminUsers.lastLogin') }}</th><th>{{ $t('ui.adminUsers.actions') }}</th></tr></thead>
        <tbody>
          <tr v-for="user in doctors" :key="user.userId">
            <td><strong>{{ user.username }}</strong><small>{{ user.role }}</small></td>
            <td>{{ user.department || '—' }}</td>
            <td><span :class="['status', user.isActive ? 'active' : 'inactive']"><ShieldCheck v-if="user.isActive" :size="13" /><UserX v-else :size="13" />{{ $t(user.isActive ? 'ui.adminUsers.active' : 'ui.adminUsers.inactive') }}</span></td>
            <td>{{ formatDate(user.lastLoginAt) }}</td>
            <td class="actions">
              <div class="action-buttons">
                <button type="button" :title="$t(user.isActive ? 'ui.adminUsers.disable' : 'ui.adminUsers.enable')" @click="toggleStatus(user)"><UserCheck v-if="!user.isActive" :size="15" /><UserX v-else :size="15" /></button>
                <button type="button" :title="$t('ui.adminUsers.resetPassword')" @click="resetPassword(user)"><span class="text-icon">•••</span></button>
                <button type="button" :title="$t('ui.adminUsers.forceLogout')" @click="forceLogout(user)"><LogOut :size="15" /></button>
                <button type="button" :title="$t('ui.adminUsers.delete')" @click="removeUser(user)"><Trash2 :size="15" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!doctors.length" class="empty">{{ $t('ui.adminUsers.empty') }}</p>
    </section>
  </div>
</template>

<style scoped>
.admin-page{display:grid;gap:18px}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.page-header h1{margin:7px 0 4px}.page-header p{margin:0;color:var(--text-muted);font-size:12px}.create-card,.table-card{padding:20px}.create-card h3{display:flex;align-items:center;gap:8px;margin:0 0 15px;font-size:15px}.create-grid{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end}.label{display:grid;gap:7px;color:var(--text-soft);font-size:12px}.table-card{overflow:auto}table{width:100%;border-collapse:collapse;font-size:12px}tr{height:58px}th,td{padding:12px 10px;border-bottom:1px solid var(--border);text-align:left;vertical-align:middle}th{color:var(--text-muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}td strong,td small{display:block}td small{margin-top:3px;color:var(--text-muted);text-transform:capitalize}.status{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:700}.status.active{background:#e6f1eb;color:#2f6a4c}.status.inactive{background:#f5e9e9;color:#9a4d52}.actions{width:1%;white-space:nowrap}.action-buttons{display:flex;align-items:center;gap:4px}.action-buttons button{display:grid;width:30px;height:30px;place-items:center;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text-muted)}.action-buttons button:hover{border-color:var(--accent);color:var(--accent-strong)}.text-icon{font-size:13px;font-weight:800}.success{color:var(--green);font-size:12px}.error{color:var(--red);font-size:12px}.empty{color:var(--text-muted);font-size:12px;text-align:center}@media(max-width:900px){.create-grid{grid-template-columns:1fr}.page-header{align-items:stretch;flex-direction:column}.page-header .btn{width:100%}}
</style>
