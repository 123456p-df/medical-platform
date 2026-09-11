import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, SESSION_KEY } from '@/api/client'
import { usePatientStore } from './patients'
import { useProfileStore } from './profile'
import { useWorkflowStore } from './workflow'
import { useWorkspaceTabsStore } from './workspaceTabs'
import { localPreview } from '@/utils/runtime'
import type { PortalRole, UserSession } from '@/types'

type PreviewAccount = {
  password: string
  session: UserSession
}

const previewAccounts: Record<string, PreviewAccount> = {
  admin: {
    password: 'Admin123!',
    session: { id: 'admin', name: 'Administrator', role: 'doctor', accessToken: 'local-preview' },
  },
  demo_doctor: {
    password: 'DemoDoctor123!',
    session: { id: 'demo_doctor', name: 'Dr. Zhang Wei', role: 'doctor', accessToken: 'local-preview' },
  },
  demo_patient: {
    password: 'DemoPatient123!',
    session: { id: 'P20260021', name: 'Zhang San', role: 'patient', accessToken: 'local-preview' },
  },
}

function stored(): UserSession | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}
export const useAuthStore = defineStore('auth', () => {
  const session = ref<UserSession | null>(stored())
  const isAuthenticated = computed(() => Boolean(session.value?.accessToken))
  const portal = computed<PortalRole | null>(() => session.value?.role ?? null)
  function logout() {
    session.value = null
    sessionStorage.removeItem(SESSION_KEY)
    usePatientStore().reset()
    useProfileStore().reset()
    useWorkflowStore().reset()
    useWorkspaceTabsStore().reset()
  }
  async function login(username: string, password: string) {
    if (localPreview) {
      const account = previewAccounts[username.trim().toLowerCase()]
      if (!account || account.password !== password) throw new Error('用户名或密码错误。')
      session.value = { ...account.session }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
      return session.value.role
    }
    logout()
    const result = await api<{ access_token: string; role: PortalRole; user_id: number }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    })
    session.value = { id: String(result.user_id), name: username, role: result.role, accessToken: result.access_token }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
    try {
      const me = await api<{ patient_id: number | null; username: string }>('/auth/me')
      if (me.patient_id) session.value.id = String(me.patient_id)
      session.value.name = me.username
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
    } catch (error) { logout(); throw error }
    return result.role
  }
  window.addEventListener('vmrb-session-expired', () => { logout(); window.location.assign('/login') })
  return { session, isAuthenticated, portal, login, logout }
})
