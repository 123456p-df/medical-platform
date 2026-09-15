import { spawnSync, spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = 8001
const root = fileURLToPath(new URL('../../', import.meta.url))
const tempRoot = mkdtempSync(join(tmpdir(), 'vmrb-e2e-real-'))
const databasePath = join(tempRoot, 'test.db').replaceAll('\\', '/')
const databaseUrl = `sqlite:///${databasePath}`
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  STORAGE_ROOT: join(tempRoot, 'storage'),
  JWT_SECRET: 'j'.repeat(48),
  ID_HASH_KEY: 'h'.repeat(48),
  ID_ENCRYPTION_KEY: '0'.repeat(43) + '=',
}

const seed = spawnSync('uv', ['run', '--project', 'backend', 'python', 'e2e/support/seed_real_api.py'], {
  cwd: root,
  env,
  encoding: 'utf8',
})
if (seed.status !== 0) {
  const details = seed.stderr || seed.stdout || seed.error?.message || 'Unable to seed real API test data'
  process.stderr.write(String(details).trimEnd() + '\n')
  rmSync(tempRoot, { recursive: true, force: true })
  process.exit(seed.status ?? 1)
}

const server = spawn(
  'uv',
  [
    'run',
    '--project',
    'backend',
    'uvicorn',
    'app.main:create_app',
    '--factory',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  { cwd: root, env, stdio: 'inherit', windowsHide: true },
)

async function waitForHealth() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`)
      if (response.ok) return
    } catch {
      // Keep waiting for uvicorn.
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Real API test server did not start')
}

function stop() {
  if (!server.killed) server.kill()
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)
try {
  await waitForHealth()
  const code = await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.once('exit', resolve)
  })
  process.exitCode = code ?? 0
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}
