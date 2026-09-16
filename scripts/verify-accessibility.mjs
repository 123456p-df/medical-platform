import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.vue') ? [path] : []
  })
}

const failures = []
const globalCss = readFileSync(join(root, 'src/style.css'), 'utf8')
if (!globalCss.includes('button:focus-visible') || !globalCss.includes('outline: 3px')) {
  failures.push('Global :focus-visible styling is missing')
}

const appLayout = readFileSync(join(root, 'src/components/layout/AppLayout.vue'), 'utf8')
if (!appLayout.includes('class="skip-link"') || !appLayout.includes('id="main-content"')) {
  failures.push('Skip link and main landmark are missing')
}

const workspaceTabs = readFileSync(join(root, 'src/components/layout/WorkspaceTabs.vue'), 'utf8')
for (const token of ['role="group"', 'aria-current', ':tabindex']) {
  if (!workspaceTabs.includes(token)) failures.push(`Workspace tabs are missing ${token}`)
}

for (const file of walk(join(root, 'src'))) {
  const source = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  for (const match of source.matchAll(/<dialog\b([^>]*)>/g)) {
    const attributes = match[1]
    if (!/aria-(?:label|labelledby)=/.test(attributes)) {
      failures.push(`${file}: dialog has no accessible name`)
    }
  }
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (basename(file) === 'AppButton.vue') continue
    const attributes = match[1]
    const hasInterpolation = /\{\{/.test(match[2])
    const inner = match[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{\{[\s\S]*?\}\}/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const hasLabel = /aria-(?:label|labelledby)=|\btitle=/.test(attributes)
    if (!hasLabel && !hasInterpolation && !inner) failures.push(`${file}: icon-only button has no accessible name`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('PASS: key landmarks, dialog names, roving tabs, focus styling, and icon buttons are accessible.')
