import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function sourceModule(file) {
  const source = fs.readFileSync(file, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
}

const navigation = await sourceModule('src/utils/navigation.ts')
const cases = [
  [{ name: 'doctor-dashboard' }, 'patients'],
  [{ name: 'doctor-archived' }, 'archive'],
  [{ name: 'doctor-patient-overview' }, 'overview'],
  [{ name: 'doctor-patient-imaging' }, 'imaging'],
  [{ name: 'doctor-patient-3d' }, 'imaging'],
  [{ name: 'doctor-patient-ai' }, 'ai'],
  [{ name: 'doctor-patient-report' }, 'report'],
  [{ name: 'patient-dashboard' }, 'overview'],
  [{ name: 'patient-examinations' }, 'examinations'],
  [{ name: 'patient-examination-detail' }, 'examinations'],
  [{ name: 'patient-reports' }, 'reports'],
  [{ name: 'patient-body' }, 'body'],
  [{ name: 'patient-ai' }, 'assistant'],
]

for (const [route, expected] of cases) {
  assert.equal(navigation.navigationKeyFromRoute(route), expected, `route ${route.name} should map to ${expected}`)
}
assert.equal(navigation.navigationKeyFromRoute({ name: 'patient-onboarding' }), null)
assert.equal(navigation.navigationKeyFromRoute({ name: 'profile' }), null)

console.log('navigation key checks passed: 15 route mappings and neutral routes verified.')
