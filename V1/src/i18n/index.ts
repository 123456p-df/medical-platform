import { ref } from 'vue'
import { zh } from './messages'

export type Locale = 'zh' | 'en'
function storedLocale(): Locale {
  try { return localStorage.getItem('pulmolink-language') === 'en' ? 'en' : 'zh' } catch { return 'zh' }
}
export const locale = ref<Locale>(storedLocale())
document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
export function setLocale(value: Locale) {
  locale.value = value
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en'
  try { localStorage.setItem('pulmolink-language', value) } catch { /* Keep the language for this session. */ }
}

// Presentation-only translation. User-entered clinical text is stored verbatim.
export function t(value: unknown): string {
  if (value == null) return ''
  const text = String(value)
  if (locale.value === 'en') return text
  const key = text.trim().replace(/\s+/g, ' ')
  if (zh[key]) return zh[key]
  const queueGreeting = key.match(/^Good morning, (.*)\. Here is today's clinical queue\.$/)
  if (queueGreeting) return `您好，${queueGreeting[1]}。这是今天的临床工作列表。`
  const greeting = key.match(/^Good morning, (.*?)(\. Here is your health overview\.)?$/)
  if (greeting) return `您好，${greeting[1]}${greeting[2] ? '。这是您的健康概览。' : ''}`
  if (key.startsWith('Uploaded study: ')) return `上传检查：${key.slice(16)}`
  return text
}

declare module 'vue' {
  interface ComponentCustomProperties { $t: typeof t }
}
