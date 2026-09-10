import fs from 'node:fs'
import path from 'node:path'
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]) }
for (const file of walk('src').filter((file) => file.endsWith('.vue'))) {
  const source = fs.readFileSync(file, 'utf8')
  const output = source.replace(/\$t\(&quot;([^\n]*?)&quot;\)/g, (_, text) => `$t('${text.replaceAll("'", "\\'")}')`)
  if (output !== source) fs.writeFileSync(file, output)
}
