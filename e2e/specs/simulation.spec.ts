import { expect, test } from '@playwright/test'
import { signInDoctor, useEnglish } from '../pages/demoPortal'

test('simulation loads manifest structures and creates a prediction-only opening', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 1200 })
  await useEnglish(page)
  await signInDoctor(page)
  await page.goto('/doctor/patients/P20260021/simulation')

  await expect(page.getByRole('heading', { name: '3D Human Interaction Simulation' })).toBeVisible()
  await expect(page.getByText('LOCAL PREDICTION · NOT AUTHORITATIVE')).toBeVisible()
  await expect(page.getByText('Body / Skin', { exact: true })).toBeVisible()
  await expect(page.getByText('Liver', { exact: true })).toBeVisible()
  await expect(page.getByText('Cut depth', { exact: true })).toBeVisible()
  await expect(page.getByText('Loading simulation assets…')).toBeHidden({ timeout: 30_000 })

  const canvas = page.locator('.simulation-canvas canvas')
  await expect(canvas).toBeVisible()
  await canvas.scrollIntoViewIfNeeded()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Simulation canvas has no layout box')
  await page.mouse.click(box.x + box.width * 0.49, box.y + box.height * 0.38)
  await expect(page.getByText(/triangle \d+/).first()).toBeVisible()
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.61)
  await expect(page.getByRole('button', { name: 'Preview local opening' })).toBeEnabled()
  await page.getByRole('button', { name: 'Preview local opening' }).click()
  await expect(page.getByText(/Local opening prediction created/)).toBeVisible()
  await expect(page.getByText('DISCONNECTED · topology v1')).toBeVisible()
  await testInfo.attach('predicted-opening', {
    body: await canvas.screenshot(),
    contentType: 'image/png',
  })

  // Intact skin remains cuttable after the first wound; cuts are not globally locked.
  await page.mouse.click(box.x + box.width * 0.37, box.y + box.height * 0.45)
  await expect(page.getByText('Select point B', { exact: true })).toBeVisible()

  // A ray through the real opening can reach the first exposed internal organ.
  await page.mouse.click(box.x + box.width * 0.495, box.y + box.height * 0.43)
  await expect(page.getByText('Select point B', { exact: true })).toBeVisible()
})
