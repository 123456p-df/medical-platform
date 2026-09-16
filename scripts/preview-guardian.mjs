import { spawnSync } from 'node:child_process'
import process from 'node:process'

const ownerPid = Number.parseInt(process.argv[2] ?? '', 10)
const stopScript = process.argv[3]
const root = process.argv[4]

if (!Number.isInteger(ownerPid) || ownerPid <= 0 || !stopScript || !root) {
  process.exit(2)
}

function ownerIsRunning() {
  try {
    process.kill(ownerPid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}

const timer = setInterval(() => {
  if (ownerIsRunning()) return
  clearInterval(timer)
  const result = spawnSync('powershell.exe', [
    '-NoLogo',
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    stopScript,
  ], {
    cwd: root,
    env: process.env,
    stdio: 'ignore',
    windowsHide: true,
  })
  process.exit(result.status ?? 1)
}, 500)
