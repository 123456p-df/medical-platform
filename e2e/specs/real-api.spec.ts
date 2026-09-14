import { expect, test } from '@playwright/test'

test('real FastAPI mode authenticates doctor and patient and loads the seeded roster', async ({ page }) => {
  const patientRosterRequests: string[] = []
  page.on('request', request => {
    if (/\/api\/v1\/patients(?:\?|$)/.test(request.url())) patientRosterRequests.push(request.url())
  })
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
  await page.goto('/login')
  await page.locator('#username').fill('e2e_doctor')
  await page.locator('#password').fill('Password123!')
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await expect(page.getByText('Real API Patient', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  patientRosterRequests.length = 0
  await page.locator('#username').fill('e2e_patient')
  await page.locator('#password').fill('Password123!')
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByRole('heading', { name: 'My Health', exact: true })).toBeVisible()
  expect(patientRosterRequests).toEqual([])
})
