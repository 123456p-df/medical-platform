import { spawnSync, spawn } from 'node:child_process'

const port = 8001
const databaseUrl = `sqlite:////tmp/vmrb-e2e-real-${Date.now()}.db`
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  JWT_SECRET: 'j'.repeat(48),
  ID_HASH_KEY: 'h'.repeat(48),
  ID_ENCRYPTION_KEY: '0'.repeat(43) + '=',
}

const seed = spawnSync('uv', ['run', '--project', 'backend', 'python', 'e2e/support/seed_real_api.py'], {
  cwd: process.cwd(),
  env,
  encoding: 'utf8',
})
if (seed.status !== 0) {
  process.stderr.write(seed.stderr || seed.stdout)
  process.exit(seed.status || 1)
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
  { cwd: process.cwd(), env, stdio: 'inherit' },
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
  if (!server.killed) server.kill('SIGTERM')
}

process.on('SIGTERM', stop)
process.on('SIGINT', stop)
server.on('exit', code => process.exit(code ?? 0))
await waitForHealth()
await new Promise(resolve => server.once('exit', resolve))
