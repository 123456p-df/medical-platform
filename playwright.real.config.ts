import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/specs',
  testMatch: /real-api\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4192',
    ...devices['Desktop Chrome'],
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node e2e/support/start-real-api.mjs',
      url: 'http://127.0.0.1:8001/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'VITE_LOCAL_PREVIEW=false VMRB_BACKEND_URL=http://127.0.0.1:8001 pnpm exec vite --host 127.0.0.1 --port 4192 --strictPort',
      url: 'http://127.0.0.1:4192/login',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
