import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartTableRows: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly registerLoginLink: Locator;
  readonly cartInfoTable: Locator;
  readonly cartProductLinks: Locator;
  readonly cartQuantities: Locator;
  readonly cartPrices: Locator;
  readonly cartTotalPrices: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingButton: Locator;
  readonly deleteProductButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTableRows = page.locator('#cart_info_table tbody tr');
    this.proceedToCheckoutButton = page.locator('a.btn-default.check_out');
    this.registerLoginLink = page.locator('a[href="/login"]').first();
    this.cartInfoTable = page.locator('#cart_info_table');
    this.cartProductLinks = page.locator('.cart_description a');
    this.cartQuantities = page.locator('.cart_quantity button');
    this.cartPrices = page.locator('.cart_price p');
    this.cartTotalPrices = page.locator('.cart_total_price');
    this.emptyCartMessage = page.locator('#empty_cart span, .empty-cart');
    this.continueShoppingButton = page.locator('a:has-text("Continue Shopping")');
    this.deleteProductButtons = page.locator('.cart_quantity_delete');
  }

  async navigateToCart(): Promise<void> {
    await this.page.goto('/view_cart');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCartItemCount(): Promise<number> {
    try {
      await this.cartTableRows.first().waitFor({ state: 'visible', timeout: 3000 });
      return await this.cartTableRows.count();
    } catch {
      return 0;
    }
  }

  async getProductNames(): Promise<string[]> {
    const count = await this.cartProductLinks.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await this.cartProductLinks.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async getProductQuantity(index: number): Promise<number> {
    const qtyText = await this.cartQuantities.nth(index).textContent();
    return parseInt(qtyText || '0', 10);
  }

  async getProductPrice(index: number): Promise<number> {
    const priceText = await this.cartPrices.nth(index).textContent();
    const cleanPrice = priceText?.replace(/[^0-9]/g, '') || '0';
    return parseInt(cleanPrice, 10);
  }

  async getTotalPrice(index: number): Promise<number> {
    const totalText = await this.cartTotalPrices.nth(index).textContent();
    const cleanTotal = totalText?.replace(/[^0-9]/g, '') || '0';
    return parseInt(cleanTotal, 10);
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isCartEmpty(): Promise<boolean> {
    try {
      const itemCount = await this.getCartItemCount();
      return itemCount === 0;
    } catch {
      return true;
    }
  }

  async removeProduct(index: number): Promise<void> {
    await this.deleteProductButtons.nth(index).click();
    await this.page.waitForTimeout(1000); // Wait for cart update animation
  }

  async removeAllProducts(): Promise<void> {
    let count = await this.getCartItemCount();
    while (count > 0) {
      await this.removeProduct(0);
      count = await this.getCartItemCount();
    }
  }

  async addProductToCart(productId: number): Promise<void> {
    await this.page.goto(`/product_details/${productId}`);
    await this.page.waitForLoadState('domcontentloaded');

    const addToCartButton = this.page.locator('button.cart');
    await addToCartButton.click();

    // Wait for modal to appear
    await this.page.waitForTimeout(1000);

    // Click "View Cart" or "Continue Shopping"
    const viewCartButton = this.page.locator('a[href="/view_cart"]').first();
    if (await viewCartButton.isVisible()) {
      await viewCartButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async continueShopping(): Promise<void> {
    const continueButton = this.page.locator('button:has-text("Continue Shopping")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
  }

  async getTotalCartValue(): Promise<number> {
    let total = 0;
    const count = await this.getCartItemCount();
    for (let i = 0; i < count; i++) {
      total += await this.getTotalPrice(i);
    }
    return total;
  }

  async verifyCartContainsProduct(productName: string): Promise<boolean> {
    const products = await this.getProductNames();
    return products.some((name) => name.toLowerCase().includes(productName.toLowerCase()));
  }
}
