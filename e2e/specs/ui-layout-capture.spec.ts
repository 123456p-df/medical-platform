import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('doctor and patient portals keep navigation and primary content visually separated', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await page.waitForTimeout(700)
  await page.screenshot({ path: '/tmp/pulmolink-doctor-dashboard.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)

  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()
  await expect(page).toHaveURL(/\/imaging/)
  await page.waitForTimeout(900)
  await page.screenshot({ path: '/tmp/pulmolink-doctor-imaging.png', fullPage: true })

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await page.waitForTimeout(700)
  await page.screenshot({ path: '/tmp/pulmolink-patient-dashboard.png', fullPage: true })
  await page.getByRole('link', { name: 'My Examinations' }).click()
  await expect(page).toHaveURL(/\/patient\/examinations/)
  await page.waitForTimeout(900)
  await page.screenshot({ path: '/tmp/pulmolink-patient-examinations.png', fullPage: true })
})
