import { spawn } from 'node:child_process'
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

function runToCompletion(command, args) {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
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

async function backendIsHealthy(backend) {
  try {
    const response = await fetch(`${backend}/health`, { signal: AbortSignal.timeout(5000) })
    return response.ok && (await response.json()).data?.status === 'ok'
  } catch {
    return false
  }
}

if (process.platform === 'win32') {
  // The application requires PostgreSQL and FastAPI, not just Vite.
  run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    fileURLToPath(new URL('./start-preview.ps1', import.meta.url)), ...process.argv.slice(2)])
} else {
  const backend = process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080'
  if (!process.env.VMRB_BACKEND_URL) {
    console.log('Preparing PostgreSQL and FastAPI with Docker Compose...')
    const code = await runToCompletion('bash', [
      fileURLToPath(new URL('./start-services.sh', import.meta.url)),
    ])
    if (code !== 0) {
      process.exit(code)
    }
  }
  const healthy = await backendIsHealthy(backend)
  if (!healthy) {
    const hint = process.env.VMRB_BACKEND_URL
      ? 'Check VMRB_BACKEND_URL and the remote service.'
      : 'Check Docker Desktop and the Compose logs.'
    console.error(`Backend unavailable at ${backend}. ${hint}`)
    process.exitCode = 1
  } else {
    run(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173'],
      { ...process.env, VMRB_BACKEND_URL: backend, VITE_LOCAL_PREVIEW: 'false' })
  }
}
