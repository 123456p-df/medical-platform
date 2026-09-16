import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('390px login, doctor workspace, and onboarding remain usable without horizontal overflow', async ({ page }) => {
  await page.goto('/login')
  const loginOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(loginOverflow).toBeLessThanOrEqual(1)
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await expect(page.getByRole('button', { name: 'Add patient' })).toBeVisible()
  const workspaceOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(workspaceOverflow).toBeLessThanOrEqual(1)

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.waitForTimeout(500)
  await page.locator('.sidebar.is-open').getByRole('button', { name: 'Sign out' }).click({ force: true })
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.locator('#username').fill('e2e_mobile_patient')
  await page.locator('#password').fill('Password123!')
  await page.locator('#confirm-password').fill('Password123!')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/patient\/onboarding/)
  await expect(page.locator('[data-testid="onboarding-name"]')).toBeVisible()
  const onboardingOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(onboardingOverflow).toBeLessThanOrEqual(1)
})

test('768, 1024, and 1440 px doctor views keep primary actions reachable', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.waitForURL(/\/doctor\/dashboard/)

  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(250)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    await expect(page.getByRole('button', { name: 'Add patient' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open AI assistant' })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Switch interface language to Chinese' }).click({ force: true })
  await expect(page.getByRole('heading', { name: '患者工作台' })).toBeVisible()
})
