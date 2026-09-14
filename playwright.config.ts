import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testIgnore: /real-api\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4190',
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /(?:mobile|real-api)\.spec\.ts/,
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        channel: process.env.CI ? undefined : 'chrome',
      },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm exec vite --host 127.0.0.1 --port 4190 --strictPort',
    url: 'http://127.0.0.1:4190/login',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
