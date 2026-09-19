import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('local preview uses simulated AI answers and report drafting', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()

  await page.getByRole('button', { name: 'Open AI assistant' }).click()
  await page.getByLabel('Question for AI assistant').fill('Summarize the latest records')
  await page.getByRole('button', { name: 'Send question' }).click()
  await expect(page.getByText(/Local preview/).first()).toBeVisible()

  await page.getByRole('link', { name: 'Clinical report' }).first().click()
  await expect(page.getByRole('button', { name: 'Generate AI report draft' })).toBeVisible()
  await page.getByRole('button', { name: 'Generate AI report draft' }).click()
  await expect(page.locator('.candidate-preview')).toBeVisible()
})
