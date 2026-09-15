import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const directory = join(root, 'backend/migrations/versions')
const revisions = new Map()

for (const file of readdirSync(directory).filter(name => name.endsWith('.py'))) {
  const source = readFileSync(join(directory, file), 'utf8')
  const revision = source.match(/^revision = "([^"]+)"$/m)?.[1]
  const parentExpression = source.match(/^down_revision = (.+)$/m)?.[1]
  if (!revision) throw new Error(`Missing revision in ${file}`)
  const parents = parentExpression === 'None'
    ? []
    : [...(parentExpression || '').matchAll(/"([^"]+)"/g)].map(match => match[1])
  if (parentExpression !== 'None' && !parents.length) {
    throw new Error(`Cannot parse down_revision in ${file}`)
  }
  revisions.set(revision, { file, parents })
}

for (const [revision, entry] of revisions) {
  for (const parent of entry.parents) {
    if (!revisions.has(parent)) throw new Error(`${entry.file} points to missing parent ${parent}`)
  }
}

const children = new Set([...revisions.values()].flatMap(entry => entry.parents))
const heads = [...revisions.keys()].filter(revision => !children.has(revision))
if (heads.length !== 1) throw new Error(`Expected one migration head, found ${heads.join(', ')}`)

const visiting = new Set()
const visited = new Set()
function visit(revision) {
  if (visiting.has(revision)) throw new Error(`Migration cycle includes ${revision}`)
  if (visited.has(revision)) return
  visiting.add(revision)
  for (const parent of revisions.get(revision).parents) visit(parent)
  visiting.delete(revision)
  visited.add(revision)
}
visit(heads[0])
if (visited.size !== revisions.size) {
  throw new Error('Migration graph contains revisions disconnected from the active head')
}

console.log(`PASS: ${revisions.size} migrations form one connected graph with head ${heads[0]}.`)
