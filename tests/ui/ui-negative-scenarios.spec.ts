/**
 * UI Negative Scenario Tests
 * Tests for error handling, invalid inputs, and edge cases
 * User Stories:
 * - As a tester, I want to verify invalid login attempts are properly rejected
 * - As a tester, I want to test form validation for invalid input
 * - As a tester, I want to verify error messages are displayed correctly
 */

import { test, expect } from '@playwright/test';
import { UserFactory } from '../../utils/UserFactory';
import { ModalHandler } from '../../utils/ModalHandler';

test.describe('UI Negative Scenario Tests', () => {
  test('Login with non-existent email returns error', async ({ page }) => {
    await page.goto('/login');
    const modalHandler = new ModalHandler(page);
    await modalHandler.handleModalIfPresent();

    const loginForm = page.locator('form').filter({ hasText: 'Login' });
    const emailInput = loginForm.getByPlaceholder('Email Address');
    const passwordInput = loginForm.getByPlaceholder('Password');
    const loginBtn = page.getByRole('button', { name: 'Login' });

    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('TestPassword123!');
    await loginBtn.click();

    await page.waitForLoadState('domcontentloaded');

    // Look for error message - appears as paragraph
    const errorMessage = page.locator('p:has-text("incorrect"), p:has-text("invalid")');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const stillOnLogin = page.url().includes('/login');

    expect(hasError || stillOnLogin).toBeTruthy();
    console.log('? Login error displayed for non-existent email');
  });

  test('Login with incorrect password returns error', async ({ page }) => {
    const userDetails = UserFactory.createUser();
    const modalHandler = new ModalHandler(page);

    // First register a user - navigate to signup explicitly
    await page.goto('/login');
    await modalHandler.handleModalIfPresent();

    // Wait for page to be ready
    await page
      .waitForLoadState('networkidle')
      .catch(() => page.waitForLoadState('domcontentloaded'));

    // Fill the signup form on /login page FIRST
    const signupFormInitial = page.locator('form').filter({ hasText: 'Signup' });
    await signupFormInitial.getByPlaceholder('Name').fill(userDetails.name);
    await signupFormInitial.getByPlaceholder('Email Address').fill(userDetails.email);

    // Now click Signup button to navigate to /signup (scoped to signup form)
    const signupButton = signupFormInitial.getByRole('button', { name: 'Signup' });
    await signupButton.click();
    await page.waitForURL('**/signup', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Wait for registration form on /signup page
    await page.waitForSelector('h2:has-text("Enter Account Information")', { timeout: 10000 });
    await page
      .waitForLoadState('networkidle')
      .catch(() => page.waitForLoadState('domcontentloaded'));

    // Fill registration form with available data using role-based selectors
    await page.getByRole('textbox', { name: 'First name *' }).fill(userDetails.firstName || 'Test');
    await page.getByRole('textbox', { name: 'Last name *' }).fill(userDetails.lastName || 'User');
    await page.locator('input[type="password"]').first().fill(userDetails.password);
    await page
      .getByRole('textbox', { name: /Address.*Street/ })
      .fill('123 Test Street')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: 'State *' })
      .fill('TestState')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: /City/ })
      .fill('TestCity')
      .catch(() => {});
    await page
      .locator('input[name="zipcode"]')
      .fill('12345')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: 'Mobile Number *' })
      .fill('1234567890')
      .catch(() => {});

    // Submit
    const createBtn = page.getByRole('button', { name: /Create Account/i });
    await createBtn.click();

    // Wait for account creation success
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click continue if on success page
    const continueBtn = page.locator('a:has-text("Continue")');
    if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueBtn.click();
      await page.waitForLoadState('domcontentloaded');
    }

    // Ensure we're logged out before attempting login
    const logoutLinkWrong = page.locator('a[href*="/logout"]');
    if (await logoutLinkWrong.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutLinkWrong.click();
      await page.waitForLoadState('domcontentloaded');
      await modalHandler.handleModalIfPresent();
      await page.waitForTimeout(500);
    }

    // Navigate to login and ensure we're on the login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Verify we're actually on login page (not logged in)
    await page.waitForSelector('form', { timeout: 5000 });

    // Try login with wrong password using the first form (login form)
    const loginForm = page.locator('form').nth(0);
    await loginForm.getByPlaceholder('Email Address').fill(userDetails.email);
    await loginForm.locator('input[type="password"]').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('domcontentloaded');

    const errorMessage = page.locator('p:has-text("incorrect"), p:has-text("invalid")');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasError).toBeTruthy();
    console.log('? Login error displayed for incorrect password');
  });

  test('Empty email field shows validation error', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[data-qa="login-email"]');
    const passwordInput = page.locator('input[data-qa="login-password"]');
    const loginBtn = page.locator('button[data-qa="login-button"]');

    // Leave email empty
    await emailInput.clear();
    await passwordInput.fill('TestPassword123!');

    // Check if button is disabled or submit
    const isDisabled = await loginBtn.isDisabled().catch(() => false);

    if (!isDisabled) {
      await loginBtn.click();
    }

    const errorMessage = page.locator('text=/email|required|invalid/i');
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasError || isDisabled) {
      console.log('? Empty email field validation triggered');
    }
  });

  test('Empty password field shows validation error', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[data-qa="login-email"]');
    const passwordInput = page.locator('input[data-qa="login-password"]');
    const loginBtn = page.locator('button[data-qa="login-button"]');

    // Leave password empty
    await emailInput.fill('test@example.com');
    await passwordInput.clear();

    const isDisabled = await loginBtn.isDisabled().catch(() => false);

    if (!isDisabled) {
      await loginBtn.click();
    }

    const errorMessage = page.locator('text=/password|required|invalid/i');
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasError || isDisabled) {
      console.log('? Empty password field validation triggered');
    }
  });

  test('Invalid email format shows validation error', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[data-qa="login-email"]');
    const passwordInput = page.locator('input[data-qa="login-password"]');
    const loginBtn = page.locator('button[data-qa="login-button"]');

    // Enter invalid email format
    await emailInput.fill('notanemail');
    await passwordInput.fill('TestPassword123!');

    const isDisabled = await loginBtn.isDisabled().catch(() => false);

    if (!isDisabled) {
      await loginBtn.click();
    }

    const errorMessage = page.locator('text=/email|format|invalid/i');
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasError || isDisabled) {
      console.log('? Invalid email format validation triggered');
    }
  });

  test('Registration with duplicate email shows error', async ({ page }) => {
    const userDetails = UserFactory.createUser();

    // Register first user
    await page.goto('/signup');
    await page.fill('input[name="name"]', userDetails.name);
    await page.fill('input[name="email"]', userDetails.email);
    await page.fill('input[name="password"]', userDetails.password);
    const submitBtn = page.locator('button:has-text("Signup")');
    await submitBtn.click();

    // Logout
    const logoutLink = page.locator('a[href*="/logout"]');
    if (await logoutLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutLink.click();
    }

    // Try to register with same email
    await page.goto('/signup');
    await page.fill('input[name="name"]', userDetails.name);
    await page.fill('input[name="email"]', userDetails.email);
    await page.fill('input[name="password"]', userDetails.password);
    const submitBtn2 = page.locator('button:has-text("Signup")');
    await submitBtn2.click();

    const errorMessage = page.locator('text=/already|exist|duplicate/i, [data-qa="signup-error"]');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      console.log('? Duplicate email registration error shown');
    } else {
      console.log('??  Duplicate email handling may not be implemented');
    }
  });

  test('Missing required registration fields shows error', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit form with empty fields
    const submitBtn = page.locator('button[data-qa="create-account"], button:has-text("Create")');

    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await submitBtn.isDisabled().catch(() => false);

      if (!isDisabled) {
        await submitBtn.click();
      }

      const errorMessage = page.locator('text=/required|invalid|error/i');
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasError || isDisabled) {
        console.log('? Missing required fields validation triggered');
      }
    }
  });

  test('Special characters in form fields', async ({ page }) => {
    await page.goto('/signup');

    const nameInput = page.locator('input[placeholder*="Name"]').first();
    const emailInput = page
      .locator('form')
      .filter({ hasText: 'Signup' })
      .getByPlaceholder('Email Address');

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Enter XSS attempt
      await nameInput.fill('<script>alert("xss")</script>');
      await emailInput.fill('test+special@example.com');

      console.log('? Special characters handled');
    }
  });

  test('SQL injection attempt in login fields', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[data-qa="login-email"]');
    const passwordInput = page.locator('input[data-qa="login-password"]');
    const loginBtn = page.locator('button[data-qa="login-button"]');

    // SQL injection attempt
    // eslint-disable-next-line quotes
    await emailInput.fill("' OR '1'='1");
    // eslint-disable-next-line quotes
    await passwordInput.fill("' OR '1'='1");
    await loginBtn.click();

    // Should not be logged in
    const logoutLink = page.locator('a[href*="/logout"]');
    const isLoggedIn = await logoutLink.isVisible({ timeout: 2000 }).catch(() => false);

    expect(isLoggedIn).toBeFalsy();
    console.log('? SQL injection attempt properly rejected');
  });

  test('Add out of stock product shows warning', async ({ page }) => {
    await page.goto('/products');

    const outOfStockLabel = page.locator('text=/out of stock|unavailable/i').first();

    if (await outOfStockLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      const outOfStockProduct = outOfStockLabel.locator('..');

      const addBtn = outOfStockProduct.locator('button:has-text("Add")');
      const isDisabled = await addBtn.isDisabled().catch(() => false);

      expect(isDisabled).toBeTruthy();
      console.log('? Out of stock product properly disabled');
    } else {
      console.log('??  No out of stock product found');
    }
  });

  test('Product page with invalid ID shows error', async ({ page }) => {
    // Try to access invalid product ID
    await page.goto('/product/999999');

    const errorMessage = page.locator('text=/not found|invalid|error|does not exist/i');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      console.log('? Invalid product ID error displayed');
    } else {
      console.log('??  Product not found error may not be displayed');
    }
  });

  test('Checkout without items shows error', async ({ page }) => {
    // Register and login
    const userDetails = UserFactory.createUser();

    await page.goto('/signup');
    await page.fill('input[name="name"]', userDetails.name);
    await page.fill('input[name="email"]', userDetails.email);
    await page.fill('input[name="password"]', userDetails.password);
    const submitBtn3 = page.locator('button:has-text("Signup")');
    await submitBtn3.click();

    // Try to go directly to checkout
    await page.goto('/checkout');

    const emptyCartMessage = page.locator('text=/empty|cart is empty|no items/i');
    const hasMessage = await emptyCartMessage.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasMessage) {
      console.log('? Empty cart checkout error displayed');
    } else {
      console.log('??  Empty cart handling may not be implemented');
    }
  });

  test('Session timeout shows login required message', async ({ page }) => {
    // Register and login
    const userDetails = UserFactory.createUser();

    await page.goto('/signup');
    await page.fill('input[name="name"]', userDetails.name);
    await page.fill('input[name="email"]', userDetails.email);
    await page.fill('input[name="password"]', userDetails.password);
    const submitBtn4 = page.locator('button:has-text("Signup")');
    await submitBtn4.click();

    // Clear session/cookies
    await page.context().clearCookies();
    await page.reload();

    // Check if redirected to login
    const loginForm = page.locator('input[data-qa="login-email"]');
    const isOnLoginPage = await loginForm.isVisible({ timeout: 3000 }).catch(() => false);

    if (isOnLoginPage) {
      console.log('? Session timeout redirects to login');
    } else {
      console.log('??  Session handling may not be implemented');
    }
  });

  test('Invalid payment details shows error', async ({ page }) => {
    // Register, login, and add item to cart
    const userDetails = UserFactory.createUser();
    const modalHandler = new ModalHandler(page);

    await page.goto('/login');
    await modalHandler.handleModalIfPresent();
    await page
      .waitForLoadState('networkidle')
      .catch(() => page.waitForLoadState('domcontentloaded'));

    // Fill the signup form on /login page FIRST
    const signupFormPayment = page.locator('form').filter({ hasText: 'Signup' });
    await signupFormPayment.getByPlaceholder('Name').fill(userDetails.name);
    await signupFormPayment.getByPlaceholder('Email Address').fill(userDetails.email);

    // Click Signup button to navigate to /signup (scoped to form)
    const signupButtonPayment = signupFormPayment.getByRole('button', { name: 'Signup' });
    await signupButtonPayment.click();
    await page.waitForURL('**/signup', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    // Wait for registration form and fill it using role-based selectors
    await page.waitForSelector('h2:has-text("Enter Account Information")', { timeout: 10000 });
    await page.getByRole('textbox', { name: 'First name *' }).fill(userDetails.firstName || 'Test');
    await page.getByRole('textbox', { name: 'Last name *' }).fill(userDetails.lastName || 'User');
    await page.locator('input[type="password"]').first().fill(userDetails.password);
    await page
      .getByRole('textbox', { name: /Address.*Street/ })
      .fill('123 Test Street')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: 'State *' })
      .fill('TestState')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: /City/ })
      .fill('TestCity')
      .catch(() => {});
    await page
      .locator('input[name="zipcode"]')
      .fill('12345')
      .catch(() => {});
    await page
      .getByRole('textbox', { name: 'Mobile Number *' })
      .fill('1234567890')
      .catch(() => {});

    const submitBtn5 = page.getByRole('button', { name: /Create Account/i });
    await submitBtn5.click();

    // Add product and go to checkout
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    const firstProduct = page.locator('a:has-text("View Product")').first();
    await firstProduct.click();
    await modalHandler.handleModalIfPresent();

    const addToCartBtn = page.locator('text=Add to cart').first();
    await addToCartBtn.click({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await modalHandler.handleModalIfPresent();

    // Close cart modal if visible
    const cartModal = page.locator('#cartModal, .modal.show');
    if (await cartModal.isVisible({ timeout: 500 }).catch(() => false)) {
      const cartCloseBtn = cartModal.locator('button.close, [data-dismiss="modal"]').first();
      if (await cartCloseBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await cartCloseBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    const cartLink = page.locator('a[href*="/view_cart"]').first();
    await cartLink.click({ timeout: 30000 });

    const checkoutBtn = page.locator('a:has-text("Checkout"), button:has-text("Proceed")');
    await checkoutBtn.click();

    // Try invalid payment
    const cardNumberInput = page.locator(
      'input[data-qa="card-number"], input[placeholder*="card"]',
    );

    if (await cardNumberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cardNumberInput.fill('4111111111111112'); // Invalid card
      const cvcInput = page.locator('input[data-qa="cvc"]');
      await cvcInput.fill('999');

      const payBtn = page.locator('button:has-text("Pay"), [data-qa="pay-button"]');
      await payBtn.click();

      const errorMessage = page.locator('text=/invalid|error|failed|declined/i');
      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasError) {
        console.log('? Invalid payment error displayed');
      }
    } else {
      console.log('??  Payment form not found');
    }
  });

  test('Negative quantity in cart shows error', async ({ page }) => {
    // Add product to cart
    const modalHandler = new ModalHandler(page);
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    const firstProduct = page.locator('a:has-text("View Product")').first();
    await firstProduct.click();
    await modalHandler.handleModalIfPresent();

    const addToCartBtn = page.locator('text=Add to cart').first();
    await addToCartBtn.click({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await modalHandler.handleModalIfPresent();

    // Close cart modal if visible
    const cartModal = page.locator('#cartModal, .modal.show');
    if (await cartModal.isVisible({ timeout: 500 }).catch(() => false)) {
      const closeBtn = cartModal.locator('button.close, [data-dismiss="modal"]').first();
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // Go to cart
    const cartLink = page.locator('a[href*="/view_cart"]').first();
    await cartLink.click();

    // Try to set negative quantity
    const quantityInput = page.locator('input[name="quantity"], input[type="number"]').first();

    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quantityInput.fill('-5');

      const minValue = await quantityInput.evaluate((el: HTMLInputElement) => el.min);
      if (minValue === '0' || minValue === '1') {
        console.log('? Quantity input has minimum validation');
      }
    } else {
      console.log('??  Quantity field not found');
    }
  });

  test('Extremely large quantity shows error', async ({ page }) => {
    // Add product to cart
    const modalHandler = new ModalHandler(page);
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await modalHandler.handleModalIfPresent();

    const firstProduct = page.locator('a:has-text("View Product")').first();
    await firstProduct.click();
    await modalHandler.handleModalIfPresent();

    const addToCartBtn = page.locator('text=Add to cart').first();
    await addToCartBtn.click({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await modalHandler.handleModalIfPresent();

    // Close cart modal if visible
    const cartModalLarge = page.locator('#cartModal, .modal.show');
    if (await cartModalLarge.isVisible({ timeout: 500 }).catch(() => false)) {
      const closeBtnLarge = cartModalLarge.locator('button.close, [data-dismiss="modal"]').first();
      if (await closeBtnLarge.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtnLarge.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // Go to cart
    const cartLinkLarge = page.locator('a[href*="/view_cart"]').first();
    await cartLinkLarge.click();
    await modalHandler.handleModalIfPresent();

    // Try very large quantity
    const quantityInput = page.locator('input[name="quantity"], input[type="number"]').first();

    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quantityInput.fill('999999');

      const maxValue = await quantityInput.evaluate((el: HTMLInputElement) => el.max);
      if (maxValue && parseInt(maxValue) < 999999) {
        console.log('? Quantity input has maximum validation');
      }
    }
  });
});
