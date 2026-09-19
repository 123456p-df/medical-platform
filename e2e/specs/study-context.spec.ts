import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
})

test('doctor and patient portals keep the selected examination in report and detail views', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('searchbox').fill('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()

  const studyItems = page.locator('.study-item')
  const selectedStudy = studyItems.nth(1)
  await selectedStudy.click()
  const doctorExamId = new URL(page.url()).searchParams.get('exam')
  expect(doctorExamId).toBeTruthy()

  await page.getByRole('link', { name: 'Clinical report' }).first().click()
  await expect(page).toHaveURL(/\/report/)
  await expect(page.getByLabel('Report examination')).toHaveValue(String(doctorExamId))

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await page.getByRole('link', { name: 'My Examinations' }).click()

  const examCard = page.locator('.exam-card').nth(1)
  await examCard.click()
  await expect(page).toHaveURL(/\/patient\/examinations\/.+/)
  const patientExamId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1)
  expect(patientExamId).toBeTruthy()

  await page.getByRole('link', { name: 'My Reports' }).click()
  await expect(page).toHaveURL(/\/patient\/reports/)
})
