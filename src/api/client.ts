export const SESSION_KEY = 'vmrb-session-v1'
export class ApiError extends Error {
  constructor(public status: number, public code: number, message: string) { super(message) }
}
export function readSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
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
  try {
    const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    return JSON.parse(stored || 'null')?.accessToken ?? null
  }
  catch { return null }
}
export async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  const accessToken = token()
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken)
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json')
  let response: Response
  try { response = await fetch(path.startsWith('/api/') ? path : '/api/v1' + path, { ...options, headers }) }
  catch { throw new ApiError(0, 0, '无法连接后端，请检查服务是否已启动。') }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && accessToken && accessToken !== 'local-preview') {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
      window.dispatchEvent(new Event('vmrb-session-expired'))
    }
    const messages: Record<number, string> = {
      40103: '用户名或密码错误。', 40301: '没有访问此患者的权限。',
      40901: '该用户名已经被注册。',
      50301: '分割模型尚未配置，请先设置模型目录和 GPU 运行环境。',
      50302: 'AI 服务尚未配置，请填写 backend/.env 中的 AI 服务信息。',
      50304: '肺结节检测模型尚未配置，请填写模型服务地址。',
      40005: '当前分割模型不支持此影像类型。', 42201: '请检查输入格式和必填字段。',
      40008: '肺结节检测当前只支持 CT 影像。',
      40009: '肺结节检测只接受器官标记为 lung 的影像。',
      40010: '检查日期不能晚于今天。',
      40903: '该影像已有正在排队或运行的肺结节检测任务。',
    }
    throw new ApiError(response.status, payload.code, messages[payload.code] || payload.message || '请求失败')
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
