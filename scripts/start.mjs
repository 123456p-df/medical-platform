import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

function run(command, args, env = process.env) {
  const child = spawn(command, args, { cwd: root, env, stdio: 'inherit', windowsHide: true })
  const forwardHangup = () => { if (!child.killed) child.kill('SIGHUP') }
  const forwardInterrupt = () => { if (!child.killed) child.kill('SIGINT') }
  const forwardTerminate = () => { if (!child.killed) child.kill('SIGTERM') }
  if (process.platform !== 'win32') process.once('SIGHUP', forwardHangup)
  process.once('SIGINT', forwardInterrupt)
  process.once('SIGTERM', forwardTerminate)
  child.on('error', error => { console.error(error.message); process.exitCode = 1 })
  child.on('exit', code => {
    if (process.platform !== 'win32') process.removeListener('SIGHUP', forwardHangup)
    process.removeListener('SIGINT', forwardInterrupt)
    process.removeListener('SIGTERM', forwardTerminate)
    process.exitCode = code ?? 1
  })
}

function runToCompletion(command, args, env = process.env) {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: 'inherit',
      windowsHide: true,
      detached: process.platform !== 'win32',
    })
    const forwardSignal = signal => {
      try {
        if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, signal)
        else if (!child.killed) child.kill(signal)
      } catch (error) {
        if (error.code !== 'ESRCH') console.error(error.message)
      }
    }
    const forwardHangup = () => forwardSignal('SIGHUP')
    const forwardInterrupt = () => forwardSignal('SIGINT')
    const forwardTerminate = () => forwardSignal('SIGTERM')
    const cleanup = () => {
      if (process.platform !== 'win32') process.removeListener('SIGHUP', forwardHangup)
      process.removeListener('SIGINT', forwardInterrupt)
      process.removeListener('SIGTERM', forwardTerminate)
    }
    if (process.platform !== 'win32') process.once('SIGHUP', forwardHangup)
    process.once('SIGINT', forwardInterrupt)
    process.once('SIGTERM', forwardTerminate)
    child.once('error', error => {
      cleanup()
      console.error(`Unable to start ${command}: ${error.message}`)
      resolve(1)
    })
    child.once('exit', code => {
      cleanup()
      resolve(code ?? 1)
    })
  })
}

function startWindowsGuardian(stopScript) {
  const guardianScript = fileURLToPath(new URL('./preview-guardian.mjs', import.meta.url))
  const guardian = spawn(
    process.execPath,
    [guardianScript, String(process.pid), stopScript, root],
    {
      cwd: root,
      env: process.env,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    },
  )
  guardian.unref()
}

function urlSafeSecret(bytes = 48) {
  return randomBytes(bytes).toString('base64url')
}

function fernetKey() {
  return randomBytes(32).toString('base64url') + '='
}

function createPrivateFile(path, content) {
  writeFileSync(path, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
}

function ensureLocalConfiguration() {
  const rootEnv = join(root, '.env')
  if (!existsSync(rootEnv)) {
    const template = readFileSync(join(root, '.env.example'), 'utf8')
    createPrivateFile(
      rootEnv,
      template.replace(/^POSTGRES_PASSWORD=.*$/m, `POSTGRES_PASSWORD=${urlSafeSecret(32)}`),
    )
    console.log('Created local Docker database configuration in .env.')
  }

  const backendEnv = join(root, 'backend', '.env')
  if (!existsSync(backendEnv)) {
    const template = readFileSync(join(root, 'backend', '.env.example'), 'utf8')
      .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${urlSafeSecret()}`)
      .replace(/^ID_ENCRYPTION_KEY=.*$/m, `ID_ENCRYPTION_KEY=${fernetKey()}`)
      .replace(/^ID_HASH_KEY=.*$/m, `ID_HASH_KEY=${urlSafeSecret()}`)
    createPrivateFile(backendEnv, template)
    console.log('Created local backend configuration in backend/.env.')
  }
}

async function backendIsHealthy(backend) {
  try {
    const response = await fetch(`${backend}/health`, { signal: AbortSignal.timeout(5000) })
    return response.ok && (await response.json()).data?.status === 'ok'
  } catch {
    return false
  }
}

const configuredBackend = process.env.VMRB_BACKEND_URL?.trim()
const backend = (configuredBackend || 'http://127.0.0.1:8080').replace(/\/+$/, '')
const viteArgs = ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173']
const frontendOnly = process.argv.includes('--frontend-only')

if (frontendOnly) {
  console.log('Starting the frontend-only synthetic demo...')
  run(process.execPath, viteArgs, { ...process.env, VITE_LOCAL_PREVIEW: 'true' })
} else if (process.platform === 'win32' && !configuredBackend) {
  ensureLocalConfiguration()
  const startScript = fileURLToPath(new URL('./start-preview.ps1', import.meta.url))
  const stopScript = fileURLToPath(new URL('./stop-preview.ps1', import.meta.url))
  const powershellArgs = script => [
    '-NoLogo',
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    script,
  ]
  console.log('Starting local PostgreSQL, FastAPI, and the frontend on Windows...')
  const code = await runToCompletion('powershell.exe', powershellArgs(startScript))
  if (code !== 0) process.exit(code)
  // Ctrl+C is delivered to the whole pnpm console process tree on Windows and
  // can interrupt in-process cleanup. A detached guardian performs the same
  // cleanup after this launcher disappears, including when the terminal closes.
  startWindowsGuardian(stopScript)
  const healthy = await backendIsHealthy('http://127.0.0.1:8000')
  if (!healthy) {
    console.error('The Windows launcher returned, but FastAPI is not healthy on port 8000.')
    process.exit(1)
  }
  console.log('Full stack is ready at http://127.0.0.1:4173. Press Ctrl+C to stop it.')
  await new Promise(resolve => {
    // Signal listeners alone do not keep Node's event loop alive. Keep a
    // referenced timer until shutdown so pnpm start remains the foreground
    // owner of the Windows services it launched.
    const keepAlive = setInterval(() => {}, 60_000)
    let stopping = false
    const stop = () => {
      if (stopping) return
      stopping = true
      clearInterval(keepAlive)
      console.log('\nStopping the local full stack...')
      const result = spawnSync('powershell.exe', powershellArgs(stopScript), {
        cwd: root,
        env: process.env,
        stdio: 'inherit',
        windowsHide: true,
      })
      process.exitCode = result.status ?? 1
      resolve()
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
} else {
  if (!configuredBackend) {
    ensureLocalConfiguration()
    console.log('Preparing PostgreSQL and FastAPI with Docker Compose...')
    const code = await runToCompletion('bash', [
      fileURLToPath(new URL('./start-services.sh', import.meta.url)),
    ])
    if (code !== 0) process.exit(code)
  }

  const healthy = await backendIsHealthy(backend)
  if (!healthy) {
    const hint = configuredBackend
      ? 'Check VMRB_BACKEND_URL and the remote service.'
      : 'Check Docker Desktop and the Compose logs.'
    console.error(`Backend unavailable at ${backend}. ${hint}`)
    process.exitCode = 1
  } else {
    run(process.execPath, viteArgs,
      { ...process.env, VMRB_BACKEND_URL: backend, VITE_LOCAL_PREVIEW: 'false' })
  }
}
