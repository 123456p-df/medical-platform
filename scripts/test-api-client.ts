import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { api, request, ApiError, isAccessTokenExpired, readSession, SESSION_KEY } from '../src/api/client.ts'
import { setLocale } from '../src/i18n/index.ts'

const originalFetch = globalThis.fetch
const fakeJwt = (expiresAtSeconds: number) => `e30.${Buffer.from(JSON.stringify({ exp: expiresAtSeconds })).toString('base64url')}.test`
const makeStorage = () => {
  const entries = new Map<string, string>()
  return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value), removeItem: (key: string) => entries.delete(key) }
}
Object.defineProperty(globalThis, 'localStorage', { value: makeStorage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: makeStorage(), configurable: true })
Object.defineProperty(globalThis, 'window', { value: new EventTarget(), configurable: true })
afterEach(() => { globalThis.fetch = originalFetch; localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); setLocale('zh') })

test('empty proxy 500 and HTML 502 explain the missing backend in both languages', async () => {
  for (const [status, body] of [[500, ''], [502, '<html>Bad Gateway</html>']] as const) {
    globalThis.fetch = async () => new Response(body, { status })
    setLocale('zh')
    await assert.rejects(api('/auth/profile'), (e: unknown) => e instanceof ApiError && e.status === status && e.message === '后端服务未连接，请启动服务后重试。')
    setLocale('en')
    await assert.rejects(api('/auth/profile'), /The backend is unavailable/)
  }
})

test('network failures are explained while intentional cancellation is preserved', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(api('/patients'), (e: unknown) => e instanceof ApiError && e.status === 0)
  const cancelled = new DOMException('Cancelled by study switch', 'AbortError')
  globalThis.fetch = async () => { throw cancelled }
  await assert.rejects(request('/medical-images/example/volume'), (e: unknown) => e === cancelled)
})

test('API envelopes retain business errors and validate successful responses', async () => {
  globalThis.fetch = async () => Response.json({ code: 40103, message: 'Invalid username or password', data: null }, { status: 401 })
  await assert.rejects(api('/auth/login'), /用户名或密码错误/)
  globalThis.fetch = async () => Response.json({ code: 50303, message: 'Database unavailable', data: null }, { status: 503 })
  await assert.rejects(api('/patients'), /数据库暂时不可用/)
  globalThis.fetch = async () => Response.json({ code: 50001, message: 'Internal server error', data: null }, { status: 500 })
  await assert.rejects(api('/patients'), /服务器暂时无法完成请求/)
  for (const body of ['<html>SPA fallback</html>', 'null', '{}']) {
    globalThis.fetch = async () => new Response(body)
    await assert.rejects(api('/patients'), /服务器返回了无效响应/)
  }
  globalThis.fetch = async () => Response.json({ code: 0, message: 'success', data: { records: 1 } })
  assert.deepEqual(await api('/patients'), { records: 1 })
})

test('expired browser tokens are discarded before a request reaches the API', async () => {
  const expiredToken = fakeJwt(Math.floor(Date.now() / 1000) - 1)
  assert.equal(isAccessTokenExpired(expiredToken), true)
  localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: expiredToken }))
  assert.equal(readSession(), null)
  assert.equal(localStorage.getItem(SESSION_KEY), null)

  let fetches = 0
  let expiredEvents = 0
  const listener = () => { expiredEvents++ }
  window.addEventListener('vmrb-session-expired', listener)
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: expiredToken }))
    globalThis.fetch = async () => { fetches++; return Response.json({ code: 0, data: {} }) }
    await assert.rejects(request('/auth/profile'), /登录已过期/)
    assert.equal(fetches, 0)
    assert.equal(expiredEvents, 1)
    assert.equal(localStorage.getItem(SESSION_KEY), null)
  } finally { window.removeEventListener('vmrb-session-expired', listener) }
})

test('401 expires only the session that made the failed request', async () => {
  let expired = 0
  const listener = () => { expired++ }
  window.addEventListener('vmrb-session-expired', listener)
  try {
    const oldToken = fakeJwt(Math.floor(Date.now() / 1000) + 3600)
    const newToken = fakeJwt(Math.floor(Date.now() / 1000) + 7200)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: oldToken }))
    globalThis.fetch = async () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: newToken }))
      return Response.json({ code: 40101, data: null }, { status: 401 })
    }
    await assert.rejects(api('/auth/profile'), /登录已过期/)
    assert.equal(expired, 0)
    assert.equal(JSON.parse(localStorage.getItem(SESSION_KEY)!).accessToken, newToken)
    globalThis.fetch = async () => Response.json({ code: 40102, message: 'Invalid or expired token', data: null }, { status: 401 })
    await assert.rejects(api('/auth/profile'), /登录已过期/)
    assert.equal(expired, 1)
    assert.equal(localStorage.getItem(SESSION_KEY), null)
  } finally { window.removeEventListener('vmrb-session-expired', listener) }
})
