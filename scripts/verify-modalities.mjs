import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const source = ts.transpileModule(fs.readFileSync('src/utils/studyLoader.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replace("'dicom-parser'", JSON.stringify(pathToFileURL(require.resolve('dicom-parser')).href))
const { detectModalityFromFiles, isSupportedFile } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const files = ['CT', 'MR', 'DX'].map((type) => new File([fs.readFileSync(`test-fixtures/fixture-${type}.dcm`)], 'anonymous.dcm'))
for (const [index, expected] of ['CT', 'MRI', 'X-Ray'].entries()) assert.equal(await detectModalityFromFiles([files[index]]), expected)
assert.equal(await detectModalityFromFiles([new File(['image'], 'scan.png', { type: 'image/png' })]), null)
assert.equal(await detectModalityFromFiles([new File(['image'], 'CT-scan.png', { type: 'image/png' })]), 'CT')
assert.equal(await detectModalityFromFiles([new File(['invalid'], 'unknown.dcm')]), null)
assert.equal(isSupportedFile(new File(['archive'], 'scan.zip')), false)
await assert.rejects(() => detectModalityFromFiles([files[0], files[1]]), /Mixed imaging types/)
console.log('PASS: CT/MR/DX metadata, ambiguous images, filename hint, invalid metadata, unsupported archive, and mixed-modality rejection (8 checks).')
