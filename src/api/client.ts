export const SESSION_KEY = 'vmrb-session-v1'
export class ApiError extends Error {
  constructor(public status: number, public code: number, message: string) { super(message) }
}
export function token(): string | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')?.accessToken ?? null }
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
      window.dispatchEvent(new Event('vmrb-session-expired'))
    }
    const messages: Record<number, string> = {
      40103: '用户名或密码错误。', 40301: '没有访问此患者的权限。',
      50301: '分割模型尚未配置，请先设置模型目录和 GPU 运行环境。',
      50302: 'AI 服务尚未配置，请填写 backend/.env 中的 AI 服务信息。',
      40005: '当前分割模型不支持此影像类型。', 42201: '请检查输入格式和必填字段。',
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
