import assert from 'node:assert/strict'
import { i18n, locale, setLocale, t } from '../src/i18n/index.ts'

console.log('Testing refactored vue-i18n system...')

// 1. Initial locale test (default 'zh')
setLocale('zh')
assert.equal(locale.value, 'zh', 'Locale should be zh')
assert.equal(t('Age'), '年龄', 't("Age") in zh should return 年龄')
assert.equal(t('Doctor Dashboard'), '医生工作台', 't("Doctor Dashboard") in zh should return 医生工作台')
assert.equal(t('Digital Human'), '数字人体', 't("Digital Human") in zh should return 数字人体')

// 2. Dynamic greeting regex test
assert.equal(
  t("Good morning, Dr. Alice. Here is today's clinical queue."),
  '您好，Dr. Alice。这是今天的临床工作列表。',
  'Dynamic queue greeting translation'
)
assert.equal(
  t("Good morning, John. Here is your health overview."),
  '您好，John。这是您的健康概览。',
  'Dynamic patient health overview greeting translation'
)
assert.equal(
  t("Uploaded study: CT-2026-09-10"),
  '上传检查：CT-2026-09-10',
  'Uploaded study prefix translation'
)

// 3. Null / undefined / number safety
assert.equal(t(null), '', 't(null) should return empty string')
assert.equal(t(undefined), '', 't(undefined) should return empty string')
assert.equal(t(45), '45', 't(45) should return string "45"')

// 4. Fallback for unmapped keys
assert.equal(
  t('Unmapped term 12345'),
  'Unmapped term 12345',
  'Unmapped term should fallback to original key'
)

// 5. Switching to English
setLocale('en')
assert.equal(locale.value, 'en', 'Locale should be en')
assert.equal(t('Age'), 'Age', 't("Age") in en should return Age')
assert.equal(t('Doctor Dashboard'), 'Doctor Dashboard', 't("Doctor Dashboard") in en should return Doctor Dashboard')
assert.equal(t('患者管理'), 'Patient management', 'Chinese UI keys should reverse to English')
assert.equal(t('医学影像'), 'Medical Imaging', 'Chinese navigation keys should reverse to English')
assert.equal(t('资料加载失败。'), 'Unable to load profile.', 'Chinese errors should reverse to English')
assert.equal(
  t("Good morning, Dr. Alice. Here is today's clinical queue."),
  "Good morning, Dr. Alice. Here is today's clinical queue.",
  'Greeting in en should remain verbatim'
)

// 6. Switch back to Chinese
setLocale('zh')
assert.equal(locale.value, 'zh', 'Locale should be back to zh')
assert.equal(t('Age'), '年龄', 't("Age") should be 年龄 again')

console.log('ALL I18N TESTS PASSED!')
