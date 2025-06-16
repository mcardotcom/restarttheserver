import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page before each test
    await page.goto('/admin');
  });

  test('should show login form for unauthenticated users', async ({ page }) => {
    // Check if we're redirected to login page
    await expect(page).toHaveURL('/admin/login');
    
    // Verify login form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify error message
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in valid credentials (using environment variables)
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify successful login
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('should show admin dashboard after successful login', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify dashboard elements
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    await expect(page.getByText('Articles')).toBeVisible();
    await expect(page.getByText('Sponsors')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should handle rate limiting on login attempts', async ({ page }) => {
    // Attempt multiple logins in quick succession
    for (let i = 0; i < 6; i++) {
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('password');
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    // Verify rate limit message
    await expect(page.getByText('Too many requests')).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Refresh the page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('should successfully logout', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Click logout button
    await page.getByRole('button', { name: 'Sign Out' }).click();

    // Verify redirected to login page
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByLabel('Email')).toBeVisible();
  });
}); 