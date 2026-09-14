import type { Page } from '@playwright/test'

export async function useEnglish(page: Page) {
  await page.addInitScript(() => localStorage.setItem('pulmolink-language', 'en'))
}

export async function signInDoctor(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: /Doctor Portal/ }).click()
  await page.waitForURL(/\/doctor\/dashboard/)
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL(/\/login/)
}
