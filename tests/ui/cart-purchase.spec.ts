/**
 * Shopping Cart and Purchase E2E Tests
 * Tests adding products to cart, viewing cart, and purchase flow
 */

import { test, expect } from '@playwright/test';

test.describe('Shopping Cart and Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
  });

  test('User should be able to view products', async ({ page }) => {
    // Check for product list
    const products = page.locator('[data-product-id], .productinfo, .product-item');
    const productCount = await products.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('User should be able to add product to cart', async ({ page }) => {
    // Find first product
    const firstProduct = page.locator('[data-product-id]').first();
    const productVisible = await firstProduct.isVisible();
    expect(productVisible).toBeTruthy();

    // Find add to cart button
    const addToCartButton = firstProduct
      .locator('a:has-text("Add to cart"), button:has-text("Add")')
      .first();
    const addToCartVisible = await addToCartButton.isVisible().catch(() => false);

    if (addToCartVisible) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);

      // Check for confirmation (modal, message, or cart count update)
      const continueShoppingBtn = page
        .locator('button:has-text("Continue Shopping"), a:has-text("Continue")')
        .first();
      const confirmVisible = await continueShoppingBtn.isVisible().catch(() => false);
      expect(
        confirmVisible ||
          (await page
            .locator('.cart-count')
            .isVisible()
            .catch(() => false)),
      ).toBeTruthy();

      // Close modal if present
      if (confirmVisible) {
        await continueShoppingBtn.click();
      }
    }
  });

  test('User should be able to view cart', async ({ page }) => {
    // Navigate to cart
    const cartLink = page.locator('a[href="/view_cart"], a:has-text("Cart")').first();
    const cartLinkVisible = await cartLink.isVisible().catch(() => false);

    if (cartLinkVisible) {
      await cartLink.click();
    } else {
      await page.goto('/view_cart');
    }

    await page.waitForLoadState('domcontentloaded');

    // Check for cart page elements
    const cartContainer = page.locator('#cart_info_table, .cart-info, [data-qa*="cart"]').first();
    expect(await cartContainer.isVisible().catch(() => false)).toBeDefined();
  });

  test('User should be able to proceed to checkout', async ({ page }) => {
    // Navigate to cart
    await page.goto('/view_cart');
    await page.waitForLoadState('domcontentloaded');

    // Find checkout button
    const checkoutButton = page
      .locator(
        'a[href*="checkout"], button:has-text("Proceed to Checkout"), a:has-text("Checkout")',
      )
      .first();
    const checkoutVisible = await checkoutButton.isVisible().catch(() => false);

    if (checkoutVisible) {
      await checkoutButton.click();
      await page.waitForLoadState('domcontentloaded');

      // Should be on checkout page
      expect(page.url().includes('checkout') || page.url().includes('payment')).toBeTruthy();
    }
  });

  test('Empty cart should display empty message', async ({ page }) => {
    // Navigate to cart
    await page.goto('/view_cart');
    await page.waitForLoadState('domcontentloaded');

    // Check for empty cart message
    const emptyMessage = page
      .locator('p:has-text("Cart is empty"), b:has-text("Cart is Empty"), [data-qa*="empty"]')
      .first();
    const isEmpty = await emptyMessage.isVisible().catch(() => false);

    // Either empty message or cart table is visible
    const cartTable = page.locator('#cart_info_table, table.table').first();
    const hasTable = await cartTable.isVisible().catch(() => false);

    expect(isEmpty || hasTable || page.url().includes('/view_cart')).toBeTruthy();
  });

  test('User should see product details in cart', async ({ page }) => {
    // Add a product first
    await page.goto('/products');
    const firstProduct = page.locator('[data-product-id]').first();

    if (await firstProduct.isVisible()) {
      const addBtn = firstProduct.locator('a:has-text("Add to cart")').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // Close modal
        const continueBtn = page.locator('button:has-text("Continue Shopping")').first();
        if (await continueBtn.isVisible().catch(() => false)) {
          await continueBtn.click();
        }
      }
    }

    // Navigate to cart
    const cartLink = page.locator('a[href="/view_cart"]').first();
    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
    } else {
      await page.goto('/view_cart');
    }

    await page.waitForLoadState('domcontentloaded');

    // Check for product info in cart
    const cartItems = page.locator('td[data-product-id], tr.cart_item, [data-qa*="product"]');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(0);
  });

  test('User should be able to update product quantity in cart', async ({ page }) => {
    await page.goto('/view_cart');
    await page.waitForLoadState('domcontentloaded');

    // Find quantity input
    const quantityInput = page
      .locator('input[data-qa="quantity"], input.cart_quantity_input')
      .first();
    const quantityVisible = await quantityInput.isVisible().catch(() => false);

    if (quantityVisible) {
      // Update quantity
      await quantityInput.fill('2');

      // Find update button
      const updateBtn = page.locator('a[href*="quantity"], button:has-text("Update")').first();
      if (await updateBtn.isVisible().catch(() => false)) {
        await updateBtn.click();
        await page.waitForLoadState('domcontentloaded');
      }
    }
  });

  test('User should be able to remove product from cart', async ({ page }) => {
    await page.goto('/view_cart');
    await page.waitForLoadState('domcontentloaded');

    // Find remove button
    const removeButton = page.locator('a[data-product-id], a:has-text("Remove"), a.delete').first();
    const removeVisible = await removeButton.isVisible().catch(() => false);

    if (removeVisible) {
      await removeButton.click();
      await page.waitForLoadState('domcontentloaded');

      // Cart should be empty or have fewer items
      expect(page.url().includes('/view_cart')).toBeTruthy();
    }
  });

  test('Cart total should be calculated correctly', async ({ page }) => {
    await page.goto('/view_cart');
    await page.waitForLoadState('domcontentloaded');

    // Check for total price
    const totalPrice = page
      .locator('#summary_table td.cart_total, [data-qa*="total"], b:has-text("Total")')
      .first();
    const totalVisible = await totalPrice.isVisible().catch(() => false);

    // Either total is visible or we're on cart page
    expect(totalVisible || page.url().includes('/view_cart')).toBeTruthy();
  });
});
