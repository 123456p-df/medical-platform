import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, readSession, SESSION_KEY, writeSession } from '@/api/client'
import { usePatientStore } from './patients'
import { useProfileStore } from './profile'
import { useWorkflowStore } from './workflow'
import { useWorkspaceTabsStore } from './workspaceTabs'
import { useReportDraftStore } from './reportDrafts'
import { useAIChatStore } from './aiChat'
import { localPreview } from '@/utils/runtime'
import type { PortalRole, UserSession } from '@/types'

type AccountRole = PortalRole | 'admin'

type PreviewAccount = {
  password: string
  session: UserSession
}

const PREVIEW_ACCOUNTS_KEY = 'pulmolink-preview-accounts-v2'

const previewAccounts: Record<string, PreviewAccount> = {
  admin: {
    password: '123456',
    session: { id: 'admin', username: 'admin', name: 'admin', role: 'doctor', accountRole: 'admin', profileCompleted: true, accessToken: 'local-preview' },
  },
  demo_doctor: {
    password: '123456',
    session: { id: 'demo_doctor', username: 'demo_doctor', name: 'demo_doctor', role: 'doctor', accountRole: 'doctor', profileCompleted: true, accessToken: 'local-preview' },
  },
  demo_patient: {
    password: '123456',
    session: { id: 'P20260021', username: 'demo_patient', name: 'demo_patient', role: 'patient', accountRole: 'patient', profileCompleted: true, accessToken: 'local-preview' },
  },
  test_patient: {
    password: '123456',
    session: { id: 'P20260037', username: 'test_patient', name: 'test_patient', role: 'patient', accountRole: 'patient', profileCompleted: true, accessToken: 'local-preview' },
  },
}

function toPortalRole(role: unknown): PortalRole | null {
  if (role === 'patient') return 'patient'
  if (role === 'doctor' || role === 'admin') return 'doctor'
  return null
}

function clearStoredSession() {
  writeSession(null)
}

function tokenIsExpired(accessToken: string): boolean {
  if (accessToken === 'local-preview') return false
  try {
    const payload = accessToken.split('.')[1]
    if (!payload) return true
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = JSON.parse(atob(padded)) as { exp?: number }
    return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function stored(): UserSession | null {
  try {
    const raw = readSession()
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<UserSession> & { role?: AccountRole }
    const role = toPortalRole(value?.role)
    if (
      !role
      || typeof value.accessToken !== 'string'
      || !value.accessToken
      || tokenIsExpired(value.accessToken)
    ) {
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
  const sessionChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pulmolink-session-v1') : null

  function clearSessionState(broadcast = false) {
    session.value = null
    clearStoredSession()
    usePatientStore().reset()
    useProfileStore().reset()
    useWorkflowStore().reset()
    useWorkspaceTabsStore().reset()
    useReportDraftStore().reset()
    useAIChatStore().reset()
    if (broadcast) sessionChannel?.postMessage({ type: 'signed-out' })
  }
  async function logout() {
    const shouldRevoke = !localPreview && Boolean(session.value?.accessToken)
    try {
      if (shouldRevoke) await api('/auth/logout', { method: 'POST' })
    } catch {
      // Local state must still be cleared when the server cannot be reached.
    } finally {
      clearSessionState(true)
    }
  }
  function rememberSession(value: UserSession, remember: boolean) {
    session.value = { ...value }
    writeSession(JSON.stringify(session.value), remember)
  }
  async function login(username: string, password: string, remember = true) {
    clearSessionState()
    if (localPreview) {
      const account = {
        ...previewAccounts,
        ...customPreviewAccounts(),
      }[username.trim().toLowerCase()]
      if (!account || account.password !== password) throw new Error('用户名或密码错误。')
      rememberSession(account.session, remember)
      return account.session.role
    }
    const result = await api<{ access_token: string; role: AccountRole; user_id: number }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    })
    const role = toPortalRole(result.role)
    if (!role) throw new Error('账号角色无法识别。')
    const loginSession: UserSession = {
      id: String(result.user_id),
      username,
      name: username,
      role,
      accountRole: result.role,
      profileCompleted: result.role !== 'patient',
      accessToken: result.access_token,
    }
    rememberSession(loginSession, remember)
    try {
      const me = await api<{ patient_id: number | null; username: string; account_role: AccountRole; profile_completed: boolean }>('/auth/me')
      if (me.patient_id) loginSession.id = String(me.patient_id)
      loginSession.username = me.username
      loginSession.name = me.username
      loginSession.accountRole = me.account_role
      loginSession.profileCompleted = me.profile_completed
      rememberSession(loginSession, remember)
    } catch (error) { clearSessionState(); throw error }
    return role
  }
  async function register(username: string, password: string, role: PortalRole, remember = true) {
    const normalized = username.trim().toLowerCase()
    if (!/^[\w.-]{3,64}$/.test(normalized)) throw new Error('用户名需为 3–64 位字母、数字、点、横线或下划线。')
    if (password.length < 8 || password.length > 128) throw new Error('密码长度需为 8–128 位。')
    if (role !== 'patient') throw new Error('普通注册仅开放患者账号；医生账号由管理员创建。')
    if (localPreview) {
      const accounts = customPreviewAccounts()
      if (previewAccounts[normalized] || accounts[normalized]) throw new Error('该用户名已经被注册。')
      const account: PreviewAccount = {
        password,
        session: {
          id: role === 'patient' ? `P${Date.now()}` : `D${Date.now()}`,
          username: normalized,
          name: username.trim(),
          role,
          accountRole: role,
          profileCompleted: role !== 'patient',
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
  function markProfileComplete(patientId?: string) {
    if (!session.value) return
    if (patientId) session.value.id = patientId
    session.value.profileCompleted = true
    writeSession(JSON.stringify(session.value), Boolean(localStorage.getItem(SESSION_KEY)))
  }
  window.addEventListener('vmrb-session-expired', () => { clearSessionState(true); window.location.assign('/login') })
  sessionChannel?.addEventListener('message', event => {
    if (event.data?.type === 'signed-out') {
      clearSessionState()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
  })
  return { session, isAuthenticated, portal, login, register, logout, markProfileComplete }
})
