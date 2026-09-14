import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const localeFiles = ['src/i18n/locales/zh-CN.ts', 'src/i18n/locales/en-US.ts']
const hardcodedPriorityFiles = walk(join(root, 'src')).filter(file => file.endsWith('.vue'))
const technicalLiterals = new Set([
  'VOLUME RECONSTRUCTION', 'ANATOMY NAVIGATION', 'CT', 'MRI', 'X-Ray', 'RAS', 'PulmoLink',
])

function semanticKeys(file) {
  const source = readFileSync(join(root, file), 'utf8')
  return new Set([...source.matchAll(/['"](ui\.[^'"]+)['"]\s*:/g)].map(match => match[1]))
}

function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.vue') || path.endsWith('.ts') ? [path] : []
  })
}

const [zh, en] = localeFiles.map(semanticKeys)
const used = new Set()
for (const file of walk(join(root, 'src'))) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/['"](ui\.[^'"]+)['"]/g)) used.add(match[1])
}

const missingZh = [...used].filter(key => !zh.has(key))
const missingEn = [...used].filter(key => !en.has(key))
const asymmetric = [...new Set([...zh, ...en])].filter(key => !zh.has(key) || !en.has(key))
if (missingZh.length || missingEn.length || asymmetric.length) {
  console.error(JSON.stringify({ missingZh, missingEn, asymmetric }, null, 2))
  process.exit(1)
}

const topbar = readFileSync(join(root, 'src/components/layout/Topbar.vue'), 'utf8')
if (!topbar.includes('white-space: nowrap') || !topbar.includes('min-width: 66px')) {
  console.error('Language toggle must keep a fixed minimum width and a single line.')
  process.exit(1)
}

const hardcoded = []
for (const file of hardcodedPriorityFiles) {
  const source = readFileSync(file, 'utf8')
  const template = source.match(/<template>([\s\S]*?)<\/template>/)?.[1] || ''
  const withoutComments = template.replace(/<!--[\s\S]*?-->/g, '')
  for (const match of withoutComments.matchAll(/>([^<]+)</g)) {
    const text = match[1].trim()
    if (!text || text.includes('{{')) continue
    if (/[=@:]/.test(text)) continue
    const words = text.match(/\p{L}{3,}/gu) || []
    if (!words.length) continue
    if (technicalLiterals.has(text)) continue
    if (/^[A-Z0-9+\-–—×·/:.() ]+$/.test(text)) continue
    hardcoded.push(`${file}: ${text}`)
  }
}
if (hardcoded.length) {
  console.error(JSON.stringify({ hardcoded }, null, 2))
  process.exit(1)
}

console.log(`i18n semantic and hardcoded-text checks passed: ${used.size} used keys, ${zh.size} bilingual keys.`)
