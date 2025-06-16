import { test, expect } from '@playwright/test';

test.describe('Sponsor Card Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin panel
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to sponsor cards section
    await page.getByText('Sponsors').click();
  });

  test('should display existing sponsor cards', async ({ page }) => {
    // Verify sponsor cards section is visible
    await expect(page.getByText('Sponsor Cards')).toBeVisible();
    
    // Check for sponsor card elements
    const cards = await page.getByTestId('sponsor-card').all();
    expect(cards.length).toBeGreaterThan(0);
  });

  test('should create a new sponsor card', async ({ page }) => {
    // Click add new sponsor card button
    await page.getByRole('button', { name: 'Add Sponsor Card' }).click();

    // Fill in sponsor card details
    await page.getByLabel('Title').fill('Test Sponsor');
    await page.getByLabel('Description').fill('Test Description');
    await page.getByLabel('Link').fill('https://example.com');
    await page.getByLabel('Partner Name').fill('Test Partner');

    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success message
    await expect(page.getByText('Sponsor card created successfully')).toBeVisible();

    // Verify new card appears in the list
    await expect(page.getByText('Test Sponsor')).toBeVisible();
  });

  test('should edit an existing sponsor card', async ({ page }) => {
    // Click edit button on first sponsor card
    await page.getByTestId('sponsor-card').first().getByRole('button', { name: 'Edit' }).click();

    // Update sponsor card details
    await page.getByLabel('Title').fill('Updated Sponsor');
    await page.getByLabel('Description').fill('Updated Description');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success message
    await expect(page.getByText('Sponsor card updated successfully')).toBeVisible();

    // Verify updated card appears in the list
    await expect(page.getByText('Updated Sponsor')).toBeVisible();
  });

  test('should toggle sponsor card active status', async ({ page }) => {
    // Get initial active status
    const initialStatus = await page.getByTestId('sponsor-card').first().getByTestId('active-status').textContent();

    // Toggle active status
    await page.getByTestId('sponsor-card').first().getByRole('button', { name: 'Toggle Active' }).click();

    // Verify status changed
    const newStatus = await page.getByTestId('sponsor-card').first().getByTestId('active-status').textContent();
    expect(newStatus).not.toBe(initialStatus);
  });

  test('should delete a sponsor card with confirmation', async ({ page }) => {
    // Get initial card count
    const initialCards = await page.getByTestId('sponsor-card').count();

    // Click delete button on first sponsor card
    await page.getByTestId('sponsor-card').first().getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success message
    await expect(page.getByText('Sponsor card deleted successfully')).toBeVisible();

    // Verify card count decreased
    const newCards = await page.getByTestId('sponsor-card').count();
    expect(newCards).toBe(initialCards - 1);
  });

  test('should validate required fields when creating sponsor card', async ({ page }) => {
    // Click add new sponsor card button
    await page.getByRole('button', { name: 'Add Sponsor Card' }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify validation messages
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
    await expect(page.getByText('Link is required')).toBeVisible();
  });

  test('should validate URL format for sponsor card link', async ({ page }) => {
    // Click add new sponsor card button
    await page.getByRole('button', { name: 'Add Sponsor Card' }).click();

    // Enter invalid URL
    await page.getByLabel('Link').fill('invalid-url');

    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify validation message
    await expect(page.getByText('Please enter a valid URL')).toBeVisible();
  });
}); 