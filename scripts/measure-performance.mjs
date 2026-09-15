import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = fileURLToPath(new URL('..', import.meta.url))
const port = 4191
const baseURL = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'pipe'],
  windowsHide: true,
})

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(baseURL + '/login')
      if (response.ok) return
    } catch {
      // The server has not opened its port yet.
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Vite server did not start')
}

async function sample(page, label) {
  await page.waitForTimeout(600)
  return page.evaluate(label => {
    const resources = performance.getEntriesByType('resource')
      .filter(entry => entry.name.startsWith(location.origin))
      .map(entry => ({ name: entry.name.slice(location.origin.length), transfer: Math.round(entry.transferSize || 0) }))
    const navigation = performance.getEntriesByType('navigation')[0]
    return {
      label,
      url: location.pathname,
      domContentLoadedMs: Math.round(navigation?.domContentLoadedEventEnd || 0),
      loadMs: Math.round(navigation?.loadEventEnd || 0),
      usedJsHeapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null,
      resourceCount: resources.length,
      transferBytes: resources.reduce((sum, entry) => sum + entry.transfer, 0),
      heavyResources: resources.filter(entry => /(cornerstone|dicom|three|gltf|\.glb)/i.test(entry.name)),
    }
  }, label)
}

let browser
try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))

  await page.goto(baseURL + '/login', { waitUntil: 'networkidle' })
  const login = await sample(page, 'login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.waitForURL(/\/doctor\/dashboard/)
  await page.waitForLoadState('networkidle')
  const dashboard = await sample(page, 'doctor-dashboard')

  await page.goto(baseURL + '/doctor/patients/P20260021/imaging', { waitUntil: 'networkidle' })
  await page.locator('canvas').first().waitFor()
  const imaging = await sample(page, 'doctor-imaging')

  await page.goto(baseURL + '/viewer/study/P20260021', { waitUntil: 'networkidle' })
  await page.locator('.viewer-window').waitFor()
  const model3d = await sample(page, 'doctor-3d')

  const switchStart = performance.now()
  for (let index = 0; index < 20; index++) {
    await page.goto(index % 2 ? baseURL + '/doctor/patients/P20260021/overview' : baseURL + '/doctor/patients/P20260021/imaging')
    await page.waitForTimeout(40)
  }
  const switchMs = Math.round(performance.now() - switchStart)
  const afterSwitches = await sample(page, 'after-20-route-switches')

  const results = { baseURL, sampledAt: new Date().toISOString(), login, dashboard, imaging, model3d, switchMs, afterSwitches }
  const markdown = `# Performance baseline

Sampled locally on ${results.sampledAt} with installed Google Chrome, Vite development server, 1280×900 viewport, and synthetic demo data.

| Route | DOMContentLoaded (ms) | Load (ms) | Resources | Transferred (bytes) | JS heap (MB) | Heavy resources |
|---|---:|---:|---:|---:|---:|---|
| login | ${login.domContentLoadedMs} | ${login.loadMs} | ${login.resourceCount} | ${login.transferBytes} | ${login.usedJsHeapMB ?? 'n/a'} | ${login.heavyResources.length} |
| doctor dashboard | ${dashboard.domContentLoadedMs} | ${dashboard.loadMs} | ${dashboard.resourceCount} | ${dashboard.transferBytes} | ${dashboard.usedJsHeapMB ?? 'n/a'} | ${dashboard.heavyResources.length} |
| imaging | ${imaging.domContentLoadedMs} | ${imaging.loadMs} | ${imaging.resourceCount} | ${imaging.transferBytes} | ${imaging.usedJsHeapMB ?? 'n/a'} | ${imaging.heavyResources.length} |
| 3D | ${model3d.domContentLoadedMs} | ${model3d.loadMs} | ${model3d.resourceCount} | ${model3d.transferBytes} | ${model3d.usedJsHeapMB ?? 'n/a'} | ${model3d.heavyResources.length} |

- Twenty alternating imaging/overview switches took ${switchMs} ms.
- JS heap after switching: ${afterSwitches.usedJsHeapMB ?? 'n/a'} MB.
- Heavy imaging/3D resources requested by route: imaging ${imaging.heavyResources.map(item => item.name).join(', ') || 'none'}, 3D ${model3d.heavyResources.map(item => item.name).join(', ') || 'none'}.

This is a development-server baseline, not a production/CDN measurement. Production performance should be sampled from the built bundle with HTTP caching enabled.
`
  writeFileSync(new URL('../docs/performance-baseline.md', import.meta.url), markdown, 'utf8')
  console.log(JSON.stringify(results, null, 2))
  console.log('Wrote docs/performance-baseline.md')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
