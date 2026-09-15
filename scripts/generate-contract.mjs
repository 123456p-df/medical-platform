import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const openapiPath = join(root, 'contracts', 'openapi.json')

function pythonInvocation() {
  if (process.env.PYTHON) return { command: process.env.PYTHON, prefix: [] }
  for (const relative of [
    join('backend', '.venv', 'Scripts', 'python.exe'),
    join('backend', '.venv', 'bin', 'python'),
  ]) {
    const candidate = join(root, relative)
    if (existsSync(candidate)) return { command: candidate, prefix: [] }
  }
  return { command: 'uv', prefix: ['run', '--project', 'backend', 'python'] }
}

function fail(result, action) {
  const details = result.stderr || result.stdout || result.error?.message || `${action} failed`
  process.stderr.write(String(details).trimEnd() + '\n')
  process.exit(result.status ?? 1)
}

const python = pythonInvocation()
const exportResult = spawnSync(python.command, [...python.prefix,
  'backend/scripts/export_openapi.py',
  '--output',
  openapiPath,
], { cwd: root, encoding: 'utf8' })
if (exportResult.status !== 0) {
  fail(exportResult, 'OpenAPI export')
}

const typesResult = spawnSync(process.execPath, [
  join(root, 'node_modules', 'openapi-typescript', 'bin', 'cli.js'),
  openapiPath,
  '-o',
  join(root, 'src/api/generated/schema.ts'),
  '--enum',
  '--export-type',
], { cwd: root, encoding: 'utf8' })
if (typesResult.status !== 0) {
  fail(typesResult, 'TypeScript schema generation')
}

process.stdout.write(`Generated ${openapiPath} and src/api/generated/schema.ts\n`)
