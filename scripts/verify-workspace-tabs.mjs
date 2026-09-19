import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync('src/utils/workspaceTabKeys.ts', 'utf8')
  .replace("import type { PortalRole } from '@/types'", '')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const { stableWorkspaceTabId } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))

assert.equal(stableWorkspaceTabId('/doctor/dashboard', 'doctor', 'doctor:1'), 'doctor:doctor:1:workspace')
assert.equal(stableWorkspaceTabId('/doctor/patients/P001', 'doctor', 'doctor:1'), 'doctor:doctor:1:patient:P001:overview')
assert.equal(
  stableWorkspaceTabId('/doctor/patients/P001/imaging?exam=CT1&compare=1', 'doctor', 'doctor:1'),
  stableWorkspaceTabId('/doctor/patients/P001/imaging?compare=1&exam=CT1', 'doctor', 'doctor:1'),
)
assert.equal(
  stableWorkspaceTabId('/doctor/patients/P001/3d?image=CT1', 'doctor', 'doctor:1'),
  stableWorkspaceTabId('/doctor/patients/P001/imaging?exam=CT1', 'doctor', 'doctor:1'),
)
assert.equal(stableWorkspaceTabId('/patient/dashboard', 'patient', 'patient:7'), 'patient:patient:7:dashboard')
assert.equal(stableWorkspaceTabId('/patient/examinations/E1', 'patient', 'patient:7'), 'patient:patient:7:examination:E1')
assert.equal(stableWorkspaceTabId('/patient/reports#report-R1', 'patient', 'patient:7'), 'patient:patient:7:reports')

console.log('workspace tab key checks passed: query order, hash, patient detail, and module keys are stable.')
