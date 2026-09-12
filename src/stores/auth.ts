import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, SESSION_KEY } from '@/api/client'
import { usePatientStore } from './patients'
import { useProfileStore } from './profile'
import { useWorkflowStore } from './workflow'
import { useWorkspaceTabsStore } from './workspaceTabs'
import { localPreview } from '@/utils/runtime'
import type { PortalRole, UserSession } from '@/types'

type AccountRole = PortalRole | 'admin'

type PreviewAccount = {
  password: string
  session: UserSession
}

const PREVIEW_ACCOUNTS_KEY = 'pulmolink-preview-accounts-v1'

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

function toPortalRole(role: unknown): PortalRole | null {
  if (role === 'patient') return 'patient'
  if (role === 'doctor' || role === 'admin') return 'doctor'
  return null
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}

function stored(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<UserSession> & { role?: AccountRole }
    const role = toPortalRole(value?.role)
    if (!role || typeof value.accessToken !== 'string' || !value.accessToken) {
      clearStoredSession()
      return null
    }
    return { ...value, role } as UserSession
  }
  catch {
    clearStoredSession()
    return null
  }
}

function customPreviewAccounts(): Record<string, PreviewAccount> {
  try { return JSON.parse(localStorage.getItem(PREVIEW_ACCOUNTS_KEY) || '{}') }
  catch { return {} }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<UserSession | null>(stored())
  const isAuthenticated = computed(() => Boolean(session.value?.accessToken))
  const portal = computed<PortalRole | null>(() => session.value?.role ?? null)
  function logout() {
    session.value = null
    clearStoredSession()
    usePatientStore().reset()
    useProfileStore().reset()
    useWorkflowStore().reset()
    useWorkspaceTabsStore().reset()
  }
  function rememberSession(value: UserSession, remember: boolean) {
    session.value = { ...value }
    const preferred = remember ? localStorage : sessionStorage
    const alternate = remember ? sessionStorage : localStorage
    alternate.removeItem(SESSION_KEY)
    preferred.setItem(SESSION_KEY, JSON.stringify(session.value))
  }
  async function login(username: string, password: string, remember = true) {
    if (localPreview) {
      const account = {
        ...previewAccounts,
        ...customPreviewAccounts(),
      }[username.trim().toLowerCase()]
      if (!account || account.password !== password) throw new Error('用户名或密码错误。')
      rememberSession(account.session, remember)
      return account.session.role
    }
    logout()
    const result = await api<{ access_token: string; role: AccountRole; user_id: number }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    })
    const role = toPortalRole(result.role)
    if (!role) throw new Error('账号角色无法识别。')
    const loginSession: UserSession = {
      id: String(result.user_id),
      name: username,
      role,
      accessToken: result.access_token,
    }
    rememberSession(loginSession, remember)
    try {
      const me = await api<{ patient_id: number | null; username: string }>('/auth/me')
      if (me.patient_id) loginSession.id = String(me.patient_id)
      loginSession.name = me.username
      rememberSession(loginSession, remember)
    } catch (error) { logout(); throw error }
    return role
  }
  async function register(username: string, password: string, role: PortalRole, remember = true) {
    const normalized = username.trim().toLowerCase()
    if (!/^[\w.-]{3,64}$/.test(normalized)) throw new Error('用户名需为 3–64 位字母、数字、点、横线或下划线。')
    if (password.length < 8 || password.length > 128) throw new Error('密码长度需为 8–128 位。')
    if (localPreview) {
      const accounts = customPreviewAccounts()
      if (previewAccounts[normalized] || accounts[normalized]) throw new Error('该用户名已经被注册。')
      const account: PreviewAccount = {
        password,
        session: {
          id: role === 'patient' ? `P${Date.now()}` : `D${Date.now()}`,
          name: username.trim(),
          role,
          accessToken: 'local-preview',
        },
      }
      accounts[normalized] = account
      localStorage.setItem(PREVIEW_ACCOUNTS_KEY, JSON.stringify(accounts))
      rememberSession(account.session, remember)
      return role
    }
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password, role }),
    })
    return login(username.trim(), password, remember)
  }
  window.addEventListener('vmrb-session-expired', () => { logout(); window.location.assign('/login') })
  return { session, isAuthenticated, portal, login, register, logout }
})
