import { responseError, ApiError } from './errors.ts'
import { t } from '../i18n/index.ts'
export { ApiError } from './errors.ts'

export const SESSION_KEY = 'vmrb-session-v3'
const OBSOLETE_SESSION_KEYS = ['vmrb-session-v1', 'vmrb-session-v2']

try {
  for (const key of OBSOLETE_SESSION_KEYS) {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  }
} catch { /* private mode */ }

interface StoredSessionState {
  serialized: string | null
  accessToken: string | null
  expired: boolean
}

export function accessTokenExpiresAt(accessToken: string): number | null {
  if (accessToken === 'local-preview') return null
  try {
    const parts = accessToken.split('.')
    if (parts.length !== 3) return 0
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')
    const payload = JSON.parse(globalThis.atob(padded)) as Record<string, unknown>
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0
  } catch { return 0 }
}

export function isAccessTokenExpired(accessToken: string, now = Date.now()): boolean {
  const expiresAt = accessTokenExpiresAt(accessToken)
  return expiresAt !== null && expiresAt <= now
}

function inspectStoredSession(): StoredSessionState {
  try {
    const serialized = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!serialized) return { serialized: null, accessToken: null, expired: false }
    const value = JSON.parse(serialized) as Record<string, unknown> | null
    const accessToken = typeof value?.accessToken === 'string' && value.accessToken ? value.accessToken : null
    return {
      serialized,
      accessToken,
      expired: !accessToken || isAccessTokenExpired(accessToken),
    }
  } catch {
    return { serialized: null, accessToken: null, expired: true }
  }
}

export function readSession(): string | null {
  const stored = inspectStoredSession()
  if (stored.expired) {
    writeSession(null)
    return null
  }
  return stored.serialized
}
export function writeSession(value: string | null) {
  try {
    if (value) {
      sessionStorage.setItem(SESSION_KEY, value)
      localStorage.setItem(SESSION_KEY, value)
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
    }
  } catch { /* private mode */ }
}
export function inheritSessionFromOpener() {
  try {
    if (!sessionStorage.getItem(SESSION_KEY) && window.opener?.sessionStorage) {
      const inherited = window.opener.sessionStorage.getItem(SESSION_KEY)
      if (inherited) sessionStorage.setItem(SESSION_KEY, inherited)
    }
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) sessionStorage.setItem(SESSION_KEY, stored)
    }
  } catch { /* opener blocked */ }
}
export function token(): string | null {
  const stored = inspectStoredSession()
  return stored.expired ? null : stored.accessToken
}
export async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  const stored = inspectStoredSession()
  if (stored.expired) {
    writeSession(null)
    if (stored.serialized) window.dispatchEvent(new Event('vmrb-session-expired'))
    throw responseError(401, { code: 40102 })
  }
  const accessToken = stored.accessToken
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken)
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json')
  let response: Response
  try { response = await fetch(path.startsWith('/api/') ? path : '/api/v1' + path, { ...options, headers }) }
  catch (error) {
    if (options.signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error
    throw responseError(0)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && accessToken && accessToken !== 'local-preview' && inspectStoredSession().accessToken === accessToken) {
      writeSession(null)
      window.dispatchEvent(new Event('vmrb-session-expired'))
    }
    throw responseError(response.status, payload)
  }
  return response
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await request(path, options)
  let payload
  try { payload = await response.json() }
  catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError(response.status, 0, t('The server returned an invalid response. Please retry.'))
  }
  if (!payload || typeof payload !== 'object' || typeof payload.code !== 'number' || !('data' in payload)) {
    throw new ApiError(response.status, 0, t('The server returned an invalid response. Please retry.'))
  }
  if (payload.code !== 0) throw responseError(response.status, payload)
  return payload.data as T
}
export async function collection<T>(path: string): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const data = await api<{ items: T[]; total: number }>(path + '?page=' + page + '&page_size=100')
    items.push(...data.items)
    if (items.length >= data.total || !data.items.length) return items
  }
}
