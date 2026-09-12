import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

function run(command, args, env = process.env) {
  const child = spawn(command, args, { cwd: root, env, stdio: 'inherit', windowsHide: true })
  child.on('error', error => { console.error(error.message); process.exitCode = 1 })
  child.on('exit', code => { process.exitCode = code ?? 1 })
}

if (process.platform === 'win32') {
  // The application requires PostgreSQL and FastAPI, not just Vite.
  run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    fileURLToPath(new URL('./start-preview.ps1', import.meta.url)), ...process.argv.slice(2)])
} else {
  const backend = process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080'
  try {
    const response = await fetch(`${backend}/health`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok || (await response.json()).data?.status !== 'ok') throw new Error('unhealthy')
    run(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173'],
      { ...process.env, VMRB_BACKEND_URL: backend, VITE_LOCAL_PREVIEW: 'false' })
  } catch {
    console.error(`Backend unavailable at ${backend}. Start it with bash scripts/start-services.sh, or set VMRB_BACKEND_URL to a running backend.`)
    process.exitCode = 1
  }
}
