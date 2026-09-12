import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, readSession, SESSION_KEY } from '@/api/client'
import { usePatientStore } from './patients'
import { useProfileStore } from './profile'
import { useWorkflowStore } from './workflow'
import { useWorkspaceTabsStore } from './workspaceTabs'
import { localPreview } from '@/utils/runtime'
import { DEMO_ACCOUNTS_BY_USERNAME } from '@/config/demoAccounts'
import type { PortalRole, UserSession } from '@/types'
import { clearVolumeRendererPool } from '@/utils/volumeRendererPool'

function stored(): UserSession | null {
  try {
    const value = JSON.parse(readSession() || 'null') as UserSession | null
    if (!value?.accessToken || !value.username) return null
    if (value.accessToken === 'local-preview' && !DEMO_ACCOUNTS_BY_USERNAME[value.username]) return null
    return value
  }
  catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<UserSession | null>(stored())
  const isAuthenticated = computed(() => Boolean(session.value?.accessToken))
  const portal = computed<PortalRole | null>(() => session.value?.role ?? null)
  function logout() {
    clearVolumeRendererPool()
    session.value = null
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
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
      const account = DEMO_ACCOUNTS_BY_USERNAME[username.trim().toLowerCase()]
      if (!account || account.password !== password) throw new Error('用户名或密码错误。')
      rememberSession(account.session, remember)
      return account.session.role
    }
    logout()
    const result = await api<{ access_token: string; role: PortalRole; user_id: number }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    })
    const loginSession: UserSession = {
      id: String(result.user_id),
      username: username.trim(),
      name: username,
      role: result.role,
      accessToken: result.access_token,
    }
    rememberSession(loginSession, remember)
    try {
      const me = await api<{ patient_id: number | null; username: string }>('/auth/me')
      if (me.patient_id) loginSession.id = String(me.patient_id)
      loginSession.username = me.username
      loginSession.name = me.username
      rememberSession(loginSession, remember)
    } catch (error) { logout(); throw error }
    return result.role
  }
  window.addEventListener('vmrb-session-expired', () => { logout(); window.location.assign('/login') })
  return { session, isAuthenticated, portal, login, logout }
})
