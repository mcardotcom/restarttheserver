import { test, expect } from '@playwright/test';

test.describe('Article Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin panel
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to articles section
    await page.getByText('Articles').click();
  });

  test('should display article list with pagination', async ({ page }) => {
    // Verify articles section is visible
    await expect(page.getByText('Articles')).toBeVisible();
    
    // Check for article elements
    const articles = await page.getByTestId('article-item').all();
    expect(articles.length).toBeGreaterThan(0);

    // Verify pagination controls
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('should filter articles by status', async ({ page }) => {
    // Click on status filter
    await page.getByRole('button', { name: 'Status' }).click();

    // Select 'Published' status
    await page.getByRole('option', { name: 'Published' }).click();

    // Verify filtered results
    const articles = await page.getByTestId('article-item').all();
    for (const article of articles) {
      await expect(article.getByTestId('status')).toHaveText('Published');
    }
  });

  test('should search articles by title', async ({ page }) => {
    // Get first article title
    const firstArticleTitle = await page.getByTestId('article-item').first().getByTestId('title').textContent();

    // Enter search term
    await page.getByPlaceholder('Search articles...').fill(firstArticleTitle || '');

    // Verify search results
    const articles = await page.getByTestId('article-item').all();
    for (const article of articles) {
      const title = await article.getByTestId('title').textContent();
      expect(title).toContain(firstArticleTitle);
    }
  });

  test('should edit article details', async ({ page }) => {
    // Click edit button on first article
    await page.getByTestId('article-item').first().getByRole('button', { name: 'Edit' }).click();

    // Update article details
    await page.getByLabel('Title').fill('Updated Article Title');
    await page.getByLabel('Summary').fill('Updated article summary');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success message
    await expect(page.getByText('Article updated successfully')).toBeVisible();

    // Verify updated article appears in the list
    await expect(page.getByText('Updated Article Title')).toBeVisible();
  });

  test('should change article status', async ({ page }) => {
    // Get initial status
    const initialStatus = await page.getByTestId('article-item').first().getByTestId('status').textContent();

    // Click status toggle button
    await page.getByTestId('article-item').first().getByRole('button', { name: 'Toggle Status' }).click();

    // Verify status changed
    const newStatus = await page.getByTestId('article-item').first().getByTestId('status').textContent();
    expect(newStatus).not.toBe(initialStatus);
  });

  test('should delete article with confirmation', async ({ page }) => {
    // Get initial article count
    const initialCount = await page.getByTestId('article-item').count();

    // Click delete button on first article
    await page.getByTestId('article-item').first().getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success message
    await expect(page.getByText('Article deleted successfully')).toBeVisible();

    // Verify article count decreased
    const newCount = await page.getByTestId('article-item').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should handle article moderation', async ({ page }) => {
    // Click moderate button on first article
    await page.getByTestId('article-item').first().getByRole('button', { name: 'Moderate' }).click();

    // Add moderation notes
    await page.getByLabel('Moderation Notes').fill('Test moderation notes');

    // Select moderation status
    await page.getByLabel('Status').selectOption('approved');

    // Save moderation
    await page.getByRole('button', { name: 'Save Moderation' }).click();

    // Verify success message
    await expect(page.getByText('Article moderated successfully')).toBeVisible();

    // Verify moderation status updated
    await expect(page.getByTestId('article-item').first().getByTestId('moderation-status')).toHaveText('Approved');
  });

  test('should handle bulk article actions', async ({ page }) => {
    // Select multiple articles
    await page.getByTestId('article-item').first().getByRole('checkbox').check();
    await page.getByTestId('article-item').nth(1).getByRole('checkbox').check();

    // Click bulk action button
    await page.getByRole('button', { name: 'Bulk Actions' }).click();

    // Select 'Publish' action
    await page.getByRole('option', { name: 'Publish Selected' }).click();

    // Confirm action
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success message
    await expect(page.getByText('Articles published successfully')).toBeVisible();

    // Verify status updated for selected articles
    const selectedArticles = await page.getByTestId('article-item').all();
    for (const article of selectedArticles.slice(0, 2)) {
      await expect(article.getByTestId('status')).toHaveText('Published');
    }
  });
}); 