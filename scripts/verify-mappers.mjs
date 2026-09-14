import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = readFileSync(join(root, 'src/api/mappers.ts'), 'utf8')
const contract = JSON.parse(readFileSync(join(root, 'contracts/openapi.json'), 'utf8'))
const schemas = contract.components.schemas

function schemaFor(typeName) {
  const value = schemas[typeName]
  if (!value?.properties) throw new Error(`Missing schema ${typeName}`)
  return value.properties
}

function functionBody(name) {
  const start = source.indexOf(`export function ${name}`)
  if (start < 0) throw new Error(`Missing mapper ${name}`)
  const end = source.indexOf('\nexport function', start + 1)
  return source.slice(start, end < 0 ? source.length : end)
}

const checks = [
  ['mapPatient', 'PatientRosterItem', /p\??\.([A-Za-z_]\w*)/g],
  ['mapImage', 'ImageOut', /i\??\.([A-Za-z_]\w*)/g],
  ['mapRecord', 'RecordOut', /r\??\.([A-Za-z_]\w*)/g],
  ['mapAddendum', 'AddendumOut', /item\??\.([A-Za-z_]\w*)/g],
]

const failures = []
for (const [mapper, typeName, pattern] of checks) {
  const properties = schemaFor(typeName)
  const body = functionBody(mapper)
  for (const match of body.matchAll(pattern)) {
    if (!Object.hasOwn(properties, match[1])) {
      failures.push(`${mapper} reads ${match[1]} missing from ${typeName}`)
    }
  }
}

const clinicalValues = readFileSync(join(root, 'src/utils/clinicalValues.ts'), 'utf8')
if (!clinicalValues.includes(": 'Unknown'") || !clinicalValues.includes('reviewStatuses.has')) {
  failures.push('Unknown enum values must map to Unknown without losing the raw value')
}

const mockData = readFileSync(join(root, 'src/data/mockData.ts'), 'utf8')
for (const factory of ['createPatient', 'createExamination', 'createFinding', 'createReport']) {
  if (!mockData.includes(factory)) failures.push(`mockData must use ${factory}`)
}

for (const typeName of ['PatientRosterItem', 'ImageOut', 'RecordOut', 'AddendumOut', 'FindingOut', 'UserOut']) {
  if (!schemas[typeName]) failures.push(`Missing OpenAPI schema ${typeName}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('PASS: mapper fields, OpenAPI schemas, and unknown enum fallback are aligned.')
