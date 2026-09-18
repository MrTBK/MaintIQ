import { expect, test } from '@playwright/test';

test('sign in, view overview, open a machine', async ({ page }) => {
  await page.goto('/#/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Machines requiring attention')).toBeVisible();

  await page.getByRole('link', { name: 'Machines' }).last().click();
  await expect(page.getByPlaceholder('Search machines...')).toBeVisible();
  await page.getByPlaceholder('Search machines...').fill('M-001');
  const row = page.getByText('M-001', { exact: true });
  await expect(row.first()).toBeVisible();
  await row.first().click();
  await expect(page.getByText('Why is this machine at risk?')).toBeVisible();
});

test('signed out users only see sign in', async ({ page }) => {
  await page.goto('/#/overview');
  await expect(page.getByText('Sign in').first()).toBeVisible();
  await expect(page.getByText('Assets')).toHaveCount(0);
});
