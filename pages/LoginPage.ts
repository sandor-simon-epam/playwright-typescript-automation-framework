import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly loginErrorMessage: Locator;
  readonly logoutLink: Locator;
  readonly loggedInUserText: Locator;
  readonly deleteAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginEmailInput = page.locator('input[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('input[data-qa="login-password"]');
    this.loginButton = page.locator('button[data-qa="login-button"]');
    this.signupNameInput = page.locator('input[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('input[data-qa="signup-email"]');
    this.signupButton = page.locator('button[data-qa="signup-button"]');
    this.loginErrorMessage = page.locator('form[action="/login"] p');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.loggedInUserText = page.locator('li:has(a[href="/logout"]) b');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginAndVerify(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.loggedInUserText.waitFor({ state: 'visible' });
  }

  async getLoggedInUsername(): Promise<string> {
    return (await this.loggedInUserText.textContent()) || '';
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.logoutLink.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async signup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLoginErrorMessage(): Promise<string> {
    await this.loginErrorMessage.waitFor({ state: 'visible' });
    return (await this.loginErrorMessage.textContent()) || '';
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isLoginErrorVisible(): Promise<boolean> {
    try {
      await this.loginErrorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}
