import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('doctor and patient sidebars keep exactly one current navigation item', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await expect(page.locator('.app-shell')).toHaveAttribute('data-build-id', /.+/)

  const sidebar = page.locator('.sidebar')
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'Patient workspace' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await expect(page).toHaveURL(/\/doctor\/patients\/P20260021/)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'Patient overview' })).toHaveAttribute('aria-current', 'page')

  await sidebar.getByRole('link', { name: 'Medical Imaging' }).click()
  await expect(page).toHaveURL(/\/imaging/)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'Medical Imaging' })).toHaveAttribute('aria-current', 'page')

  await sidebar.getByRole('link', { name: 'Clinical report' }).click()
  await expect(page).toHaveURL(/\/report/)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'Clinical report' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(sidebar.getByRole('link', { name: 'Home', exact: true })).toHaveCount(0)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'My Health' })).toHaveAttribute('aria-current', 'page')

  await sidebar.getByRole('link', { name: 'My Examinations' }).click()
  await expect(page).toHaveURL(/\/patient\/examinations/)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'My Examinations' })).toHaveAttribute('aria-current', 'page')

  await page.locator('.exam-card').first().click()
  await expect(page).toHaveURL(/\/patient\/examinations\/.+/)
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(sidebar.getByRole('link', { name: 'My Examinations' })).toHaveAttribute('aria-current', 'page')
})
