import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('doctor can submit, reopen, sign, and expose a report to the patient', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Clinical report' }).first().click()

  const examination = page.getByLabel('Report examination')
  await examination.selectOption('E20260612')
  await page.locator('#diagnosis').fill('Workflow MRI diagnosis')
  await page.locator('#description').fill('Workflow imaging findings')

  await page.getByRole('button', { name: 'Submit for review' }).click()
  await expect(page.locator('.report-task-status')).toContainText('In review')
  await expect(page.getByRole('button', { name: 'Return to draft' })).toBeVisible()

  await page.getByRole('button', { name: 'Return to draft' }).click()
  await expect(page.locator('.report-task-status')).toContainText('Drafting')

  await page.getByRole('button', { name: 'Submit for review' }).click()
  await page.getByRole('button', { name: 'Mark reviewed and sign' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm sign and publish' }).click()
  await expect(page.locator('.report-task-status')).toContainText('Signed')

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await page.getByRole('link', { name: 'My Reports' }).click()
  await expect(page.getByText('Workflow MRI diagnosis').first()).toBeVisible()
})
