import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const directory = join(root, 'backend/migrations/versions')
const revisions = new Map()

for (const file of readdirSync(directory).filter(name => name.endsWith('.py'))) {
  const source = readFileSync(join(directory, file), 'utf8')
  const revision = source.match(/^revision = "([^"]+)"$/m)?.[1]
  const parent = source.match(/^down_revision = (.+)$/m)?.[1]
  if (!revision) throw new Error(`Missing revision in ${file}`)
  revisions.set(revision, { file, parent: parent === 'None' ? null : parent?.replace(/^"|"$/g, '') })
}

for (const [revision, entry] of revisions) {
  if (entry.parent && !revisions.has(entry.parent)) {
    throw new Error(`${entry.file} points to missing parent ${entry.parent}`)
  }
}

const children = new Set([...revisions.values()].map(entry => entry.parent).filter(Boolean))
const heads = [...revisions.keys()].filter(revision => !children.has(revision))
if (heads.length !== 1) throw new Error(`Expected one migration head, found ${heads.join(', ')}`)

console.log(`PASS: ${revisions.size} migrations form one linear chain with head ${heads[0]}.`)
