import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const python = process.env.PYTHON || 'backend/.venv/bin/python'
const temp = mkdtempSync(join(tmpdir(), 'pulmolink-contract-'))
const generatedOpenapi = join(temp, 'openapi.json')
const generatedTypes = join(temp, 'schema.ts')

const exportResult = spawnSync(python, [
  'backend/scripts/export_openapi.py',
  '--output',
  generatedOpenapi,
], { cwd: root, encoding: 'utf8' })
if (exportResult.status !== 0) {
  process.stderr.write(exportResult.stderr || exportResult.stdout)
  process.exit(exportResult.status || 1)
}

const committedOpenapi = JSON.parse(readFileSync(join(root, 'contracts/openapi.json'), 'utf8'))
const actualOpenapi = JSON.parse(readFileSync(generatedOpenapi, 'utf8'))
if (JSON.stringify(committedOpenapi) !== JSON.stringify(actualOpenapi)) {
  process.stderr.write('OpenAPI contract is stale. Run pnpm contract:generate.\n')
  process.exit(1)
}

const typesResult = spawnSync('node_modules/.bin/openapi-typescript', [
  generatedOpenapi,
  '-o',
  generatedTypes,
  '--enum',
  '--export-type',
], { cwd: root, encoding: 'utf8' })
if (typesResult.status !== 0) {
  process.stderr.write(typesResult.stderr || typesResult.stdout)
  process.exit(typesResult.status || 1)
}

const committedTypes = readFileSync(join(root, 'src/api/generated/schema.ts'), 'utf8')
const actualTypes = readFileSync(generatedTypes, 'utf8')
if (committedTypes !== actualTypes) {
  process.stderr.write('Generated TypeScript schema is stale. Run pnpm contract:generate.\n')
  process.exit(1)
}

process.stdout.write('PASS: committed OpenAPI and generated TypeScript schemas are current.\n')
