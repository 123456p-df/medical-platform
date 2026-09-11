import { zhCN } from './locales/zh-CN.ts'
import { enUS } from './locales/en-US.ts'

// Every UI phrase can be addressed by its English canonical text or its Chinese
// counterpart. This lets older screens migrate incrementally without mixed output.
const chineseSelf = Object.fromEntries(Object.values(zhCN).map(value => [value, value]))
const englishSelf = Object.fromEntries(Object.keys(zhCN).map(value => [value, value]))
const reverse = Object.fromEntries(Object.entries(zhCN).map(([english, chinese]) => [chinese, english]))

export const localeMessages = {
  zh: { ...zhCN, ...chineseSelf },
  en: { ...englishSelf, ...reverse, ...enUS },
}

export const zh = localeMessages.zh
export const en = localeMessages.en
export default localeMessages
