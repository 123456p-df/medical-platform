import assert from 'node:assert/strict'
import fs from 'node:fs'

const read = file => fs.readFileSync(file, 'utf8')
const exists = file => assert.equal(fs.existsSync(file), true, `missing documented file: ${file}`)

const readme = read('README.md')
const vite = read('vite.config.ts')
assert.match(vite, /127\.0\.0\.1:8080/)
assert.match(readme, /VMRB_BACKEND_URL=http:\/\/127\.0\.0\.1:8000/)
assert.match(readme, /0017_patient_onboarding_and_archives/)
assert.match(readme, /0018_merge_mri_and_v5/)
assert.doesNotMatch(readme, /compose\.override\.yaml/)
for (const file of ['compose.yaml', 'compose.infra.yaml', 'compose.gpu.yaml', 'backend/.env.example']) exists(file)
const featureMatrix = read('docs/feature-matrix.md')
for (const mode of ['Synthetic demo', 'Local browser import', 'Real API']) {
  assert.match(featureMatrix, new RegExp(mode))
}

const migrations = fs.readdirSync('backend/migrations/versions').filter(file => file.endsWith('.py')).sort()
assert.equal(migrations.at(-1), '0018_merge_mri_and_v5.py')

console.log(JSON.stringify({ passed: true, checks: [
  'documented development and backend ports match Vite proxy configuration',
  'documented Compose files and latest migration exist',
  'README distinguishes demo, real API, and production upload capabilities',
] }, null, 2))
