import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const exists = relative => {
  const target = path.join(root, relative)
  assert.equal(fs.existsSync(target), true, `missing deployment artifact: ${relative}`)
  return target
}

const requiredFiles = [
  'compose.yaml',
  'compose.infra.yaml',
  'compose.gpu.yaml',
  'backend/Dockerfile',
  'deploy/Dockerfile',
  'deploy/nginx.conf',
  'backend/.env.example',
  'backend/alembic.ini',
  'backend/migrations/env.py',
  'docs/release-checklist.md',
]
for (const file of requiredFiles) exists(file)

const compose = fs.readFileSync('compose.yaml', 'utf8')
assert.match(compose, /postgres:16-alpine/)
assert.match(compose, /backend:\n\s+build:/)
assert.match(compose, /nginx:/)

const env = fs.readFileSync('backend/.env.example', 'utf8')
for (const key of [
  'DATABASE_URL',
  'JWT_SECRET',
  'ID_ENCRYPTION_KEY',
  'ID_HASH_KEY',
  'STORAGE_ROOT',
  'AI_BASE_URL',
  'AI_MODEL',
  'TASK_QUEUE_ENABLED',
]) {
  assert.match(env, new RegExp(`^${key}=`, 'm'), `missing backend env key ${key}`)
}
assert.match(env, /^AI_API_KEY=$/m)
assert.match(env, /^AI_EXTERNAL_DEIDENTIFY=true$/m)

const migrationsDir = path.join(root, 'backend/migrations/versions')
const migrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.py')).sort()
const head = migrations.at(-1)
assert.match(head, /^\d{4}_/)
const readme = fs.readFileSync('README.md', 'utf8')
assert.match(readme, new RegExp(head.replace('.py', '').replace(/([.])/g, '\\$1')))

const buildDirs = fs.readdirSync(root).filter(name => name.startsWith('dist-v5-'))
assert.ok(buildDirs.length > 0, 'at least one versioned V5 build directory must exist')

console.log(JSON.stringify({
  passed: true,
  checks: [
    'Compose, Dockerfile, Nginx, Alembic and env-template artifacts exist',
    'backend environment template contains required secret and service keys',
    'latest migration is referenced by the root README',
    'versioned V5 build output is retained',
  ],
}, null, 2))
