import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly placeOrderButton: Locator;
  readonly commentTextArea: Locator;
  readonly deliveryAddressSection: Locator;
  readonly billingAddressSection: Locator;
  readonly cardNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payAndConfirmButton: Locator;
  readonly orderPlacedMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.placeOrderButton = page.locator('a[href="/payment"]');
    this.commentTextArea = page.locator('textarea.form-control');
    this.deliveryAddressSection = page.locator('#address_delivery');
    this.billingAddressSection = page.locator('#address_invoice');
    this.cardNameInput = page.locator('input[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('input[data-qa="card-number"]');
    this.cvcInput = page.locator('input[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('input[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('input[data-qa="expiry-year"]');
    this.payAndConfirmButton = page.locator('button[data-qa="pay-button"]');
    this.orderPlacedMessage = page.locator('h2:has-text("Order Placed!")');
    this.downloadInvoiceButton = page.locator('a.btn-default.check_out');
    this.continueButton = page.locator('a[data-qa="continue-button"]');
  }

  async addOrderComment(comment: string): Promise<void> {
    await this.commentTextArea.fill(comment);
  }

  async getDeliveryAddress(): Promise<string> {
    return (await this.deliveryAddressSection.textContent()) || '';
  }

  async getBillingAddress(): Promise<string> {
    return (await this.billingAddressSection.textContent()) || '';
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillPaymentDetails(
    cardName: string,
    cardNumber: string,
    cvc: string,
    expiryMonth: string,
    expiryYear: string,
  ): Promise<void> {
    await this.cardNameInput.fill(cardName);
    await this.cardNumberInput.fill(cardNumber);
    await this.cvcInput.fill(cvc);
    await this.expiryMonthInput.fill(expiryMonth);
    await this.expiryYearInput.fill(expiryYear);
  }

  async payAndConfirm(): Promise<void> {
    await this.payAndConfirmButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isOrderPlaced(): Promise<boolean> {
    try {
      await this.orderPlacedMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async downloadInvoice(): Promise<void> {
    await this.downloadInvoiceButton.click();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async completePayment(
    cardName: string = 'Test User',
    cardNumber: string = '4532015112830366',
    cvc: string = '123',
    expiryMonth: string = '12',
    expiryYear: string = '2028',
  ): Promise<void> {
    await this.fillPaymentDetails(cardName, cardNumber, cvc, expiryMonth, expiryYear);
    await this.payAndConfirm();
  }
}
