import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const temp = mkdtempSync(join(tmpdir(), 'pulmolink-contract-'))
const generatedOpenapi = join(temp, 'openapi.json')
const generatedTypes = join(temp, 'schema.ts')

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
  generatedOpenapi,
], { cwd: root, encoding: 'utf8' })
if (exportResult.status !== 0) {
  fail(exportResult, 'OpenAPI export')
}

const committedOpenapi = JSON.parse(readFileSync(join(root, 'contracts/openapi.json'), 'utf8'))
const actualOpenapi = JSON.parse(readFileSync(generatedOpenapi, 'utf8'))
if (JSON.stringify(committedOpenapi) !== JSON.stringify(actualOpenapi)) {
  process.stderr.write('OpenAPI contract is stale. Run pnpm contract:generate.\n')
  process.exit(1)
}

const typesResult = spawnSync(process.execPath, [
  join(root, 'node_modules', 'openapi-typescript', 'bin', 'cli.js'),
  generatedOpenapi,
  '-o',
  generatedTypes,
  '--enum',
  '--export-type',
], { cwd: root, encoding: 'utf8' })
if (typesResult.status !== 0) {
  fail(typesResult, 'TypeScript schema generation')
}

const committedTypes = readFileSync(join(root, 'src/api/generated/schema.ts'), 'utf8')
const actualTypes = readFileSync(generatedTypes, 'utf8')
const normalizeEol = value => value.replace(/\r\n/g, '\n')
if (normalizeEol(committedTypes) !== normalizeEol(actualTypes)) {
  process.stderr.write('Generated TypeScript schema is stale. Run pnpm contract:generate.\n')
  process.exit(1)
}

process.stdout.write('PASS: committed OpenAPI and generated TypeScript schemas are current.\n')
