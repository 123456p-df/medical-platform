import { createI18n } from 'vue-i18n'
import { zhCN } from './locales/zh-CN'
import { enUS } from './locales/en-US'
import { computed, type Ref } from 'vue'

export type Locale = 'zh' | 'en'

export function storedLocale(): Locale {
  try {
    return localStorage.getItem('pulmolink-language') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

const initialLocale = storedLocale()
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale === 'zh' ? 'zh-CN' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    zh: zhCN,
    'zh-CN': zhCN,
    en: enUS,
    'en-US': enUS,
  },
  missingWarn: false,
  fallbackWarn: false,
  missing: (_locale, key) => key,
})

// Reactive locale ref compatible with existing `locale.value`
export const locale = computed<Locale>({
  get: () => (i18n.global.locale as unknown as Ref<string>).value as Locale,
  set: (val: Locale) => setLocale(val),
})

export function setLocale(value: Locale) {
  (i18n.global.locale as unknown as Ref<string>).value = value
  if (typeof document !== 'undefined') {
    document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en'
  }
  try {
    localStorage.setItem('pulmolink-language', value)
  } catch {
    /* Keep the language for this session. */
  }
}

// Presentation-only translation. User-entered clinical text is stored verbatim.
export function t(value: unknown, ...args: any[]): string {
  if (value == null) return ''
  const text = String(value)
  const curLocale = (i18n.global.locale as unknown as Ref<string>).value

  if (curLocale === 'en') {
    if (args.length > 0) {
      try {
        // @ts-ignore
        return i18n.global.t(text, ...args)
      } catch {
        return text
      }
    }
    return text
  }

  const key = text.trim().replace(/\s+/g, ' ')
  // Dynamic greetings in Chinese
  const queueGreeting = key.match(/^Good morning, (.*)\. Here is today's clinical queue\.$/)
  if (queueGreeting) return `您好，${queueGreeting[1]}。这是今天的临床工作列表。`
  const greeting = key.match(/^Good morning, (.*?)(\. Here is your health overview\.)?$/)
  if (greeting) return `您好，${greeting[1]}${greeting[2] ? '。这是您的健康概览。' : ''}`
  if (key.startsWith('Uploaded study: ')) return `上传检查：${key.slice(16)}`

  // Direct dictionary lookup for best fidelity
  if (zhCN[key]) return zhCN[key]

  // vue-i18n lookup
  try {
    // @ts-ignore
    const res = i18n.global.t(key, ...args)
    if (res && res !== key) return res
  } catch {
    // ignore
  }

  return text
}

export { useI18n } from 'vue-i18n'
export default i18n
