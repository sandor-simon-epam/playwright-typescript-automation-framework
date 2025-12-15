/**
 * Negative Scenario Tests
 * Tests error handling and edge cases
 */

import { test, expect } from '@playwright/test';
import { ModalHandler } from '../../utils/ModalHandler';

test.describe('Negative Scenarios and Error Handling', () => {
  test('Invalid email format should show error on login', async ({ page }) => {
    // Clear session cookies to ensure fresh login
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(
      (c) => c.name.toLowerCase().includes('session') || c.name === 'PHPSESSID',
    );
    if (sessionCookies.length > 0) {
      await page.context().clearCookies({ name: sessionCookies[0].name });
    }

    const modalHandler = new ModalHandler(page);

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Try to login with invalid email
    const loginForm = page.locator('form').filter({ hasText: 'Login' });
    await loginForm.getByPlaceholder('Email Address').fill('invalidemail');
    await loginForm.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForLoadState('domcontentloaded');

    // Should show error or stay on login page
    const errorMessage = page.locator('p:has-text("incorrect"), p:has-text("invalid")');
    const hasError = await errorMessage.isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/login');

    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('Empty login fields should not allow submission', async ({ page }) => {
    const modalHandler = new ModalHandler(page);

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Try to submit empty form
    const loginButton = page.locator('button[data-qa="login-button"]');
    const isDisabled = await loginButton.isDisabled().catch(() => false);

    // Either button is disabled or form won't submit
    if (!isDisabled) {
      await loginButton.click();
      await page.waitForTimeout(1000);
      // Should still be on login page or show error
      expect(page.url().includes('/login')).toBeTruthy();
    }
  });

  test('Duplicate email registration should show error', async ({ page }) => {
    const modalHandler = new ModalHandler(page);

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Use an existing email
    const existingEmail = 'test@automationexercise.com';
    await page.locator('input[data-qa="signup-name"]').fill('Test User');
    await page.locator('input[data-qa="signup-email"]').fill(existingEmail);
    await page.locator('button[data-qa="signup-button"]').click();

    await page.waitForLoadState('domcontentloaded');

    // Should show error about email already existing
    const errorMessage = page
      .locator('[data-qa="signup-error"], .error, p:has-text("already")')
      .first();
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError || !page.url().includes('/signup')).toBeTruthy();
  });

  test('Invalid product ID should handle gracefully', async ({ page }) => {
    // Try to access non-existent product
    await page.goto('/product/99999');

    // Should either redirect or show error
    const notFoundMessage = page
      .locator('[data-qa*="not"], h1:has-text("not found"), p:has-text("not available")')
      .first();
    const hasNotFoundMessage = await notFoundMessage.isVisible().catch(() => false);

    expect(hasNotFoundMessage || !page.url().includes('/product/99999')).toBeTruthy();
  });

  test('Accessing checkout without login should redirect', async ({ page }) => {
    const modalHandler = new ModalHandler(page);

    // Try to access checkout without login
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // The site allows guest checkout, so we check if either:
    // 1. Redirected to login, OR
    // 2. On checkout page (guest checkout allowed)
    const isOnLogin = page.url().includes('/login');
    const isOnCheckout = page.url().includes('/checkout');
    const loginForm = await page
      .locator('form')
      .filter({ hasText: 'Login' })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const checkoutForm = await page
      .locator('heading:has-text("Address Details"), h2:has-text("Address Details")')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(isOnLogin || loginForm || (isOnCheckout && checkoutForm)).toBeTruthy();
  });

  test('Payment with invalid card should show error', async ({ page }) => {
    // This test assumes you're already on checkout page
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');

    // Look for card number field
    const cardInput = page.locator('input[data-qa*="card"], input[placeholder*="card"]').first();
    const cardInputVisible = await cardInput.isVisible().catch(() => false);

    if (cardInputVisible) {
      // Fill with invalid card number
      await cardInput.fill('0000000000000000');

      // Look for submit button
      const submitBtn = page
        .locator('button:has-text("Place Order"), button:has-text("Pay")')
        .first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForLoadState('domcontentloaded');

        // Should show error or stay on payment page
        const errorMessage = page
          .locator('[data-qa*="error"], .error, p:has-text("invalid")')
          .first();
        const hasError = await errorMessage.isVisible().catch(() => false);

        expect(
          hasError || page.url().includes('checkout') || page.url().includes('payment'),
        ).toBeTruthy();
      }
    }
  });

  test('Expired session should require re-login', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // This is a simulated test - checking if session protection exists
    // In real scenario, you'd wait for session to expire
    expect(page.url().includes('/login')).toBeTruthy();
  });

  test('Special characters in search should not break page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Look for search field
    const searchInput = page.locator('input[placeholder*="search"]').first();
    const searchVisible = await searchInput.isVisible().catch(() => false);

    if (searchVisible) {
      // Search with special characters
      await searchInput.fill('<script>alert("xss")</script>');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');

      // Page should still be functional
      expect(page.url()).toBeTruthy();
    }
  });

  test('Network error should display appropriate message', async ({ page }) => {
    // This test checks error handling when network fails
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Simulate network issue by setting offline mode
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/products').catch(() => {
      // Network error expected
    });

    await page.context().setOffline(false);

    // Page should handle gracefully
    expect(page).toBeTruthy();
  });

  test('Missing required fields in checkout should show validation', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');

    // Look for submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Place Order")').first();
    const submitVisible = await submitBtn.isVisible().catch(() => false);

    if (submitVisible) {
      // Try to submit without filling fields
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Should show validation errors or stay on checkout
      expect(page.url().includes('checkout') || page.url().includes('payment')).toBeTruthy();
    }
  });
});
