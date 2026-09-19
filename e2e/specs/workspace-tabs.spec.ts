import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('workspace tabs reuse stable keys when query parameters change', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()
  await expect(page).toHaveURL(/\/imaging/)

  const doctorTabCount = await page.locator('.workspace-tab').count()
  await page.goto('/doctor/patients/P20260021/imaging?exam=CT1')
  await page.goto('/doctor/patients/P20260021/imaging?compare=1&exam=CT1')
  await expect(page.locator('.workspace-tab')).toHaveCount(doctorTabCount)

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await page.getByRole('link', { name: 'My Examinations' }).click()
  await expect(page).toHaveURL(/\/patient\/examinations/)
  const patientTabCount = await page.locator('.workspace-tab').count()
  await page.goto('/patient/examinations?view=list')
  await expect(page.locator('.workspace-tab')).toHaveCount(patientTabCount)
})

test('cancelled report close keeps the dirty tab and route', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Clinical report' }).first().click()
  await page.locator('#diagnosis').fill('Unsubmitted close test')

  const tabs = page.locator('.workspace-tab')
  const reportTab = tabs.filter({ hasText: 'Clinical report' })
  const tabCount = await tabs.count()

  page.once('dialog', dialog => dialog.dismiss())
  await reportTab.locator('button[aria-label^="Close"]').click()

  await expect(page).toHaveURL(/\/report/)
  await expect(page.locator('.workspace-tab')).toHaveCount(tabCount)
  await expect(page.locator('#diagnosis')).toHaveValue('Unsubmitted close test')
})
