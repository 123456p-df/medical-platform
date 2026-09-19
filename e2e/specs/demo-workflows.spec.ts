import { expect, test } from '@playwright/test'
import { onePixelPng } from '../fixtures/synthetic-avatar'
import { syntheticNifti, syntheticNiftiGzip } from '../fixtures/synthetic-nifti'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pulmolink-language', 'en')
  })
})

test('a new app launch rejects a session from an earlier frontend process', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('vmrb-session-v2', JSON.stringify({
      id: 'demo_doctor',
      username: 'demo_doctor',
      name: 'demo_doctor',
      role: 'doctor',
      accountRole: 'doctor',
      profileCompleted: true,
      accessToken: 'local-preview',
    }))
    localStorage.setItem('vmrb-session-boot-v1', 'previous-frontend-process')
  })

  await page.goto('/doctor/dashboard')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in to PulmoLink' })).toBeVisible()
  const storedSession = await page.evaluate(() => localStorage.getItem('vmrb-session-v2'))
  expect(storedSession).toBeNull()
})

test('the current app process survives reload but rejects an expired token', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)

  await page.reload()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)

  await page.evaluate(() => {
    const raw = localStorage.getItem('vmrb-session-v2')
    if (!raw) throw new Error('Expected a remembered login session')
    const session = JSON.parse(raw)
    const expiredPayload = btoa(JSON.stringify({ exp: 1 }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    session.accessToken = `header.${expiredPayload}.signature`
    localStorage.setItem('vmrb-session-v2', JSON.stringify(session))
  })

  await page.reload()
  await expect(page).toHaveURL(/\/login/)
})

test('doctor opens a patient, preserves a report draft, signs it, and the patient sees it', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)

  const search = page.getByRole('searchbox')
  await search.fill('patient')
  await expect(page.getByText('demo_patient', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('test_patient', { exact: true }).first()).toBeVisible()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Open patient record: demo_patient' }).first().click()
  await expect(page).toHaveURL(/\/doctor\/patients\/P20260021/)

  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()
  await expect(page).toHaveURL(/\/imaging/)
  await expect(page.locator('canvas').first()).toBeVisible()

  await page.getByRole('link', { name: 'Clinical report' }).first().click()
  await expect(page).toHaveURL(/\/report/)
  await page.locator('#diagnosis').fill('E2E draft diagnosis')
  await page.locator('#description').fill('E2E draft imaging description')
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(page.getByText('Draft saved.')).toBeVisible()

  await page.reload()
  await expect(page.locator('#diagnosis')).toHaveValue('E2E draft diagnosis')
  await expect(page.locator('#description')).toHaveValue('E2E draft imaging description')

  await page.getByRole('button', { name: 'Mark reviewed and sign' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm sign and publish' }).click()
  await expect(page.getByText('Signed', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: /Patient Portal/ }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await page.getByRole('link', { name: 'My Reports' }).first().click()
  await expect(page.getByText('E2E draft diagnosis').first()).toBeVisible()
})

test('3D viewer previews in the same tab and Escape returns to the patient', async ({ page, context }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('button', { name: 'Open patient record: demo_patient' }).first().click()

  await page.getByRole('link', { name: '3D organ model' }).first().click()
  await expect(page).toHaveURL(/\/doctor\/patients\/P20260021\/3d/)
  await page.getByRole('button', { name: /Preview 3D viewer in this tab/ }).click()

  await expect(page).toHaveURL(/\/viewer\/study\/P20260021/)
  expect(context.pages()).toHaveLength(1)
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/doctor\/patients\/P20260021\/3d/)
})

test('new patient registration completes onboarding with an isolated profile', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.locator('#username').fill('e2e_new_patient')
  await page.locator('#password').fill('Password123!')
  await page.locator('#confirm-password').fill('Password123!')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/patient\/onboarding/)
  await page.locator('[data-testid="onboarding-name"]').fill('E2E Onboarding Patient')
  await page.locator('[data-testid="onboarding-id"]').fill('E2E-IDENTITY-000001')
  await page.getByRole('button', { name: 'Complete profile' }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByText('My Health').first()).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByRole('heading', { name: 'My Health', exact: true })).toBeVisible()
})

test('doctor invitation links a newly registered patient to one existing record', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)

  await page.getByRole('button', { name: 'Add patient' }).click()
  await page.locator('[data-testid="patient-create-name"]').fill('Invited E2E Patient')
  await page.locator('[data-testid="patient-create-id"]').fill('E2E-INVITED-IDENTITY')
  await page.getByRole('button', { name: 'Create patient record' }).click()
  await expect(page.getByText('Invited E2E Patient').first()).toBeVisible()

  const invitationButton = page.locator('button[aria-label="Generate record invitation for Invited E2E Patient"]').first()
  await invitationButton.click()
  const code = (await page.locator('.invite-code code').textContent())?.trim() || ''
  expect(code.length).toBeGreaterThan(32)
  await page.locator('dialog[open]').getByRole('button', { name: 'Close', exact: true }).click()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.locator('#username').fill('e2e_invited_patient')
  await page.locator('#password').fill('Password123!')
  await page.locator('#confirm-password').fill('Password123!')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/patient\/onboarding/)

  await page.getByRole('tab', { name: 'Link existing record' }).click()
  await page.locator('[data-testid="onboarding-token"]').fill(code)
  await page.locator('[data-testid="onboarding-link-name"]').fill('Invited E2E Patient')
  await page.locator('[data-testid="onboarding-link-id"]').fill('E2E-INVITED-IDENTITY')
  await page.getByRole('button', { name: 'Link existing record' }).last().click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByText('e2e_invited_patient').first()).toBeVisible()
})

test('admin archives a patient with a reason and restores it from the archive manager', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Administrator/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)

  await page.locator('button[aria-label="Archive patient demo_patient"]').first().click()
  await page.locator('dialog[open] [data-testid="archive-reason"]').fill('E2E archive verification')
  await page.getByRole('button', { name: 'Confirm global archive' }).click()
  await expect(page.getByText('demo_patient', { exact: true })).toHaveCount(0)

  await page.getByRole('link', { name: 'Archived patients' }).click()
  await expect(page).toHaveURL(/\/doctor\/archived/)
  await expect(page.getByText('demo_patient', { exact: true })).toBeVisible()
  await expect(page.getByText('E2E archive verification')).toBeVisible()
  await page.getByRole('button', { name: 'Restore' }).click()
  await expect(page.getByText('demo_patient', { exact: true })).toHaveCount(0)
})

test('profile avatar and attachment upload persist for the demo doctor account', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await expect(page).toHaveURL(/\/doctor\/dashboard/)
  await page.getByRole('link', { name: 'Open profile' }).click()
  await expect(page).toHaveURL(/\/doctor\/profile/)

  await page.locator('input[type="file"][accept^="image/png"]').setInputFiles({
    name: 'e2e-avatar.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  })
  await page.getByRole('button', { name: 'Use this avatar' }).click()
  await expect(page.getByText('Avatar updated')).toBeVisible()

  await page.locator('input[type="file"][accept*=".pdf"]').setInputFiles({
    name: 'e2e-credential.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('synthetic pdf attachment'),
  })
  await expect(page.getByText('e2e-credential.pdf')).toBeVisible()

  await page.reload()
  await expect(page.getByText('e2e-credential.pdf')).toBeVisible()
})

test('doctor imports and views .nii and .nii.gz volumes in local preview', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.getByRole('button', { name: 'Open patient record: Zhang San' }).first().click()
  await page.getByRole('link', { name: 'Medical Imaging' }).first().click()
  await page.locator('details.side-panel').last().locator('summary').click()

  const niftiInput = page.locator('input[type="file"][accept*=".nii"]').first()
  await expect(niftiInput).toHaveAttribute('accept', /\.nii\.gz/)
  await niftiInput.setInputFiles({
    name: 'synthetic_CT_scan.nii',
    mimeType: 'application/nifti',
    buffer: syntheticNifti(),
  })
  await expect(page.getByText('NIfTI 3D volume detected', { exact: true })).toBeVisible()
  await expect(page.getByText(/4 × 4 × 3/)).toBeVisible()
  await page.locator('.local-study-upload > button.btn-primary').click()

  await expect(page.getByLabel('NIfTI axial slice 2 of 3')).toBeVisible()
  await expect(page.getByText('synthetic_CT_scan.nii')).toBeVisible()
  await page.getByRole('button', { name: 'Next slice' }).click()
  await expect(page.getByLabel('NIfTI axial slice 3 of 3')).toBeVisible()

  await page.locator('details.side-panel').last().locator('summary').click()
  await niftiInput.setInputFiles({
    name: 'synthetic_CT_followup.nii.gz',
    mimeType: 'application/gzip',
    buffer: syntheticNiftiGzip(),
  })
  await expect(page.getByText('NIfTI 3D volume detected', { exact: true })).toBeVisible()
  await page.locator('.local-study-upload > button.btn-primary').click()
  await expect(page.getByLabel('NIfTI axial slice 2 of 3')).toBeVisible()
  await expect(page.getByText('synthetic_CT_followup.nii.gz')).toBeVisible()
})
