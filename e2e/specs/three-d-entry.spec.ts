import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('3D entry stays in the current app window and reuses the imaging tab', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()
  await expect(page).toHaveURL(/\/imaging/)
  const tabCount = await page.locator('.workspace-tab').count()
  let popupOpened = false
  page.on('popup', () => { popupOpened = true })

  await page.getByRole('link', { name: '3D organ model' }).click()
  await expect(page).toHaveURL(/\/3d/)
  await expect(page.locator('.workspace-tab')).toHaveCount(tabCount)
  await expect(page.locator('.viewer-launch, .viewer-window')).toBeVisible()
  expect(popupOpened).toBe(false)
})
