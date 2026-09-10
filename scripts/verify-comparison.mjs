import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = ts.transpileModule(fs.readFileSync('src/utils/sliceSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const { clampPosition, positionToSlice, sliceToPosition } = await import(moduleUrl)

assert.equal(clampPosition(-1), 0)
assert.equal(clampPosition(2), 1)
assert.equal(clampPosition(Number.NaN), 0.5)
assert.equal(positionToSlice(0.5, 10), 5)
assert.equal(positionToSlice(0.5, 101), 50)
assert.equal(positionToSlice(1, 0), 0)
assert.equal(sliceToPosition(50, 101), 0.5)
assert.equal(sliceToPosition(0, 1), 0)

const sharedPosition = sliceToPosition(37, 75)
assert.equal(positionToSlice(sharedPosition, 151), 75)
assert.equal(positionToSlice(sharedPosition, 31), 15)

console.log('PASS: synchronized comparison maps relative position across unequal CT stacks.')
