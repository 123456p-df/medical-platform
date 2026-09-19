import { t } from '@/i18n'

export const SESSION_KEY = 'vmrb-session-v2'
const SESSION_BOOT_KEY = 'vmrb-session-boot-v1'
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: number,
    message: string,
    public details: { fieldErrors?: Record<string, string>; retryable?: boolean; requestId?: string } = {},
  ) { super(message) }
}
export function readSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}
export function writeSession(value: string | null, remember = false) {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_BOOT_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_BOOT_KEY)
    if (value) {
      const storage = remember ? localStorage : sessionStorage
      storage.setItem(SESSION_KEY, value)
      storage.setItem(SESSION_BOOT_KEY, __VMRB_AUTH_BOOT_ID__)
    }
  } catch { /* private mode */ }
}
export function inheritSessionFromOpener(): boolean {
  try {
    const inherited = window.opener?.sessionStorage?.getItem(SESSION_KEY)
    const inheritedBoot = window.opener?.sessionStorage?.getItem(SESSION_BOOT_KEY)
    if (!inherited || inheritedBoot !== __VMRB_AUTH_BOOT_ID__) return false
    sessionStorage.setItem(SESSION_KEY, inherited)
    sessionStorage.setItem(SESSION_BOOT_KEY, inheritedBoot)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_BOOT_KEY)
    return true
  } catch {
    return false
  }
}
export function prepareSessionForAppBoot() {
  try {
    const sessionBoot = sessionStorage.getItem(SESSION_BOOT_KEY)
      || localStorage.getItem(SESSION_BOOT_KEY)
    if (sessionBoot !== __VMRB_AUTH_BOOT_ID__) writeSession(null)
  } catch {
    writeSession(null)
  }
}
export function token(): string | null {
  try {
    const stored = readSession()
    return JSON.parse(stored || 'null')?.accessToken ?? null
  }
  catch { return null }
}
export async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  const accessToken = token()
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken)
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json')
  const controller = new AbortController()
  let timedOut = false
  const abortFromCaller = () => controller.abort(options.signal?.reason)
  options.signal?.addEventListener('abort', abortFromCaller, { once: true })
  const timeout = globalThis.setTimeout(() => { timedOut = true; controller.abort() }, 30_000)
  let response: Response
  try {
    response = await fetch(path.startsWith('/api/') ? path : '/api/v1' + path, { ...options, headers, signal: controller.signal })
  } catch (reason) {
    if (options.signal?.aborted) throw reason
    if (timedOut) throw new ApiError(0, 40800, t('errors.timeout'), { retryable: true })
    throw new ApiError(0, 0, t('errors.offline'), { retryable: true })
  } finally {
    globalThis.clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && accessToken && accessToken !== 'local-preview' && token() === accessToken) {
      writeSession(null)
      window.dispatchEvent(new Event('vmrb-session-expired'))
    }
    const messages: Record<number, string> = {
      40103: 'errors.40103', 40301: 'errors.40301',
      40305: 'errors.40305', 40306: 'errors.40306',
      40405: 'errors.40405', 40406: 'errors.40406',
      40410: 'errors.40410', 40411: 'errors.40411',
      40901: 'errors.40901',
      40904: 'errors.40904',
      40910: 'errors.40910', 40911: 'errors.40911',
      40912: 'errors.40912', 40913: 'errors.40913',
      40914: 'errors.40914', 40915: 'errors.40915',
      40916: 'errors.40916', 40917: 'errors.40917',
      40918: 'errors.40918', 40919: 'errors.40919',
      50301: 'errors.50301',
      50302: 'errors.50302',
      50304: 'errors.50304',
      50305: 'errors.50305',
      40005: 'errors.40005', 40012: 'errors.40012', 42201: 'errors.42201',
      40008: 'errors.40008',
      40009: 'errors.40009',
      40010: 'errors.40010',
      40011: 'errors.40011',
      40903: 'errors.40903',
      40908: 'errors.40908',
      40909: 'errors.40909',
      50206: 'errors.50206',
    }
    const translated = messages[payload.code]
      ? t(messages[payload.code], { message: payload.message })
      : payload.message || t('errors.generic')
    throw new ApiError(response.status, payload.code, translated, {
      fieldErrors: payload.field_errors,
      retryable: payload.retryable ?? response.status >= 500,
      requestId: payload.request_id || response.headers.get('x-request-id') || undefined,
    })
  }
  return response
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  return (await (await request(path, options)).json()).data as T
}
export async function collection<T>(path: string): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const data = await api<{ items: T[]; total: number }>(path + '?page=' + page + '&page_size=100')
    items.push(...data.items)
    if (items.length >= data.total || !data.items.length) return items
  }
}
