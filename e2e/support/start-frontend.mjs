import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, preview } from 'vite'

const realApi = process.argv.includes('--real-api')
const port = realApi ? 4192 : 4190
const root = fileURLToPath(new URL('../../', import.meta.url))
const outDir = join(root, '.cache', `e2e-frontend-${realApi ? 'real' : 'mock'}`)

mkdirSync(join(root, '.cache'), { recursive: true })
process.env.VITE_LOCAL_PREVIEW = realApi ? 'false' : 'true'
if (realApi) process.env.VMRB_BACKEND_URL = 'http://127.0.0.1:8001'

await build({
  root,
  build: { outDir, emptyOutDir: true },
})

const server = await preview({
  root,
  build: { outDir },
  preview: { host: '127.0.0.1', port, strictPort: true },
})

let stopping = false
function stop() {
  if (stopping) return
  stopping = true
  server.httpServer.close(() => process.exit(0))
}

process.once('SIGTERM', stop)
process.once('SIGINT', stop)
await new Promise(resolve => server.httpServer.once('close', resolve))
