import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { useEnglish } from '../pages/demoPortal'

test.setTimeout(60_000)

test.beforeEach(async ({ page }) => {
  await useEnglish(page)
})

test('critical routes have no serious axe violations', async ({ page }) => {
  await page.goto('/login')
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;opacity:1!important}' })
  const login = await new AxeBuilder({ page }).analyze()
  expect(login.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([])

  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.waitForURL(/\/doctor\/dashboard/)
  await page.waitForLoadState('networkidle')
  const doctor = await new AxeBuilder({ page }).exclude('canvas').analyze()
  expect(doctor.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([])

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await page.waitForURL(/\/patient\/dashboard/)
  await page.waitForLoadState('networkidle')
  const patient = await new AxeBuilder({ page }).exclude('canvas').analyze()
  expect(patient.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([])
})

test('200% zoom keeps key actions reachable and keyboard opens a patient', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.waitForURL(/\/doctor\/dashboard/)
  await page.getByRole('searchbox').focus()
  await page.keyboard.type('Zhang')
  await page.waitForTimeout(400)
  await page.getByRole('row', { name: /Zhang San/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/doctor\/patients\/P20260021/)

  await page.evaluate(() => { document.body.style.zoom = '2' })
  await page.getByRole('link', { name: 'Medical Imaging' }).first().focus()
  await expect(page.getByRole('link', { name: 'Medical Imaging' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Open AI assistant/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  const activeTag = await page.evaluate(() => document.activeElement?.tagName)
  expect(['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(activeTag)
})
