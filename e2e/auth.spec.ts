import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('should redirect to admin panel after successful login', async ({ page }) => {
    // Note: In a real test, you would use test credentials from environment variables
    await page.getByLabel('Email').fill(process.env.TEST_ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.TEST_ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to complete
    await page.waitForURL('/admin');
    
    // Verify we're on the admin page
    await expect(page.getByRole('heading', { name: /admin panel/i })).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    
    // Click the sign in button and verify loading state
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();
    
    // Verify the button is disabled and shows loading state
    await expect(signInButton).toBeDisabled();
    await expect(page.getByText('Signing in...')).toBeVisible();
  });
}); 