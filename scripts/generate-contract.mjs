import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const root = process.cwd()
const python = process.env.PYTHON || 'backend/.venv/bin/python'
const openapiPath = join(root, 'contracts', 'openapi.json')
const exportResult = spawnSync(python, [
  'backend/scripts/export_openapi.py',
  '--output',
  openapiPath,
], { cwd: root, encoding: 'utf8' })
if (exportResult.status !== 0) {
  process.stderr.write(exportResult.stderr || exportResult.stdout)
  process.exit(exportResult.status || 1)
}

const typesResult = spawnSync('node_modules/.bin/openapi-typescript', [
  openapiPath,
  '-o',
  join(root, 'src/api/generated/schema.ts'),
  '--enum',
  '--export-type',
], { cwd: root, encoding: 'utf8' })
if (typesResult.status !== 0) {
  process.stderr.write(typesResult.stderr || typesResult.stdout)
  process.exit(typesResult.status || 1)
}

process.stdout.write(`Generated ${openapiPath} and src/api/generated/schema.ts\n`)
