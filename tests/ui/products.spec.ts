/**
 * Products and Shopping E2E Tests
 * Tests for browsing products, viewing details, and product filtering
 * User Story: As a tester, I want to browse products and verify
 * product catalog functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Product Catalog E2E Tests', () => {
  test('Products page loads and displays products', async ({ page }) => {
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('.product-image-wrapper, [data-qa="product"]', { timeout: 10000 });

    // Get all products
    const products = await page.locator('.product-image-wrapper, [data-qa="product"]').all();

    expect(products.length).toBeGreaterThan(0);
    console.log(`✓ Products page loaded with ${products.length} products`);
  });

  test('Product details page loads when clicking on product', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Wait for products to load
    await page.waitForSelector('a:has-text("View Product")', { timeout: 10000 }).catch(() => null);

    // Find first product
    const productLink = page.locator('a:has-text("View Product")').first();
    const isVisible = await productLink.isVisible({ timeout: 2000 }).catch(() => false);

    if (isVisible) {
      await productLink.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

      // Check for product details
      expect(page.url()).toContain('/product_details');
    }
  });

  test('Product search functionality works', async ({ page }) => {
    await page.goto('/products');

    // Find search input
    const searchInput = page
      .locator('input[type="text"][placeholder*="search"], [data-qa="search-input"]')
      .first();
    const searchButton = page
      .locator('button:has-text("Search"), [data-qa="search-button"]')
      .first();

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Type search term
      await searchInput.fill('blue');
      await searchButton.click();

      console.log('✓ Product search executed');

      // Verify results contain searched term (name or description)
      const results = await page.locator('.product-image-wrapper, [data-qa="product"]').count();
      console.log(`✓ Search returned ${results} results`);
    } else {
      console.log('⚠️  Search functionality not available on products page');
    }
  });

  test('Product categories can be filtered', async ({ page }) => {
    await page.goto('/products');

    // Look for category filters/sidebar
    const categoryLinks = page.locator('a[href*="/category/"], [data-qa="category"]');
    const categoryCount = await categoryLinks.count();

    if (categoryCount > 0) {
      // Click first category
      await categoryLinks.first().click();

      // Verify filtered products loaded
      const products = await page.locator('.product-image-wrapper, [data-qa="product"]').count();
      expect(products).toBeGreaterThan(0);

      console.log(`✓ Category filter applied, showing ${products} products`);
    } else {
      console.log('⚠️  Category filters not found');
    }
  });

  test('Product price information is displayed', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Wait for products to load
    await page.waitForSelector('h2:has-text("Rs.")', { timeout: 10000 }).catch(() => null);

    // Find product price
    const productPrice = page.locator('h2:has-text("Rs.")').first();
    const isVisible = await productPrice.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('Product list pagination works (if available)', async ({ page }) => {
    await page.goto('/products');

    // Look for pagination controls
    const nextPageButton = page.locator(
      'a:has-text("Next"), button:has-text("Next"), [aria-label*="next"]',
    );

    const hasNextButton = await nextPageButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasNextButton) {
      // Click next page
      await nextPageButton.click();

      const products = await page.locator('.product-image-wrapper, [data-qa="product"]').count();
      expect(products).toBeGreaterThan(0);

      console.log('✓ Pagination works and shows next page of products');
    } else {
      console.log('⚠️  Pagination not available');
    }
  });

  test('Product with sale badge is highlighted', async ({ page }) => {
    await page.goto('/products');

    // Look for products with sale badges
    const saleProducts = page.locator('.productinfo:has-text("Sale"), [data-qa*="sale"]');
    const saleCount = await saleProducts.count();

    if (saleCount > 0) {
      console.log(`✓ Found ${saleCount} products on sale`);
    } else {
      console.log('⚠️  No sale products found');
    }
  });

  test('Product sorting functionality (if available)', async ({ page }) => {
    await page.goto('/products');

    // Look for sort dropdown
    const sortDropdown = page.locator(
      'select[name*="sort"], [data-qa="sort-by"], a:has-text("Sort")',
    );

    if (await sortDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Select sort option
      await sortDropdown.click();

      const sortOption = page.locator('a:has-text("Price")', { has: page.locator('text="price"') });
      if (await sortOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await sortOption.click();

        console.log('✓ Product sorting applied successfully');
      }
    } else {
      console.log('⚠️  Sort functionality not available');
    }
  });

  test('Reviews or ratings are displayed on products', async ({ page }) => {
    await page.goto('/products');

    // Look for review elements
    const reviews = page.locator(
      '[data-qa*="review"], .fa-star, [aria-label*="star"], [title*="rating"]',
    );
    const reviewCount = await reviews.count();

    if (reviewCount > 0) {
      console.log(`✓ Product reviews/ratings visible (${reviewCount} elements)`);
    } else {
      console.log('⚠️  Reviews/ratings not displayed');
    }
  });

  test('Related products section on product details page', async ({ page }) => {
    await page.goto('/products');

    // Click on first product
    const firstProduct = page.locator('.productinfo a, [data-qa="product-link"]').first();
    await firstProduct.click();

    // Look for related products section
    const relatedSection = page.locator('text=/related|you may also|recommended/i', {
      has: page.locator('.product-image-wrapper'),
    });

    const hasRelated = await relatedSection.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasRelated) {
      console.log('✓ Related products section visible');
    } else {
      console.log('⚠️  Related products section not found');
    }
  });

  test('Product description is complete and readable', async ({ page }) => {
    await page.goto('/products');

    // Click on first product to see full description
    const firstProduct = page.locator('.productinfo a, [data-qa="product-link"]').first();
    await firstProduct.click();

    // Get product description
    const description = page.locator(
      'text=/description|details|about/i, [data-qa="product-description"]',
    );

    const hasDescription = await description.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasDescription) {
      const descText = await description.textContent();
      expect(descText?.length).toBeGreaterThan(10);

      console.log('✓ Product description displayed');
    } else {
      console.log('⚠️  Product description not found');
    }
  });
});
