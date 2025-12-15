/**
 * BasePage - Base Page Object Model
 * Provides common functionality for all page objects including modal handling
 */

import { Page } from '@playwright/test';
import { ModalHandler, ModalConfig } from '../utils/ModalHandler';

export class BasePage {
  protected page: Page;
  protected modalHandler: ModalHandler;

  constructor(page: Page, modalHandler?: ModalHandler) {
    this.page = page;
    this.modalHandler = modalHandler || new ModalHandler(page);
  }

  /**
   * Navigate to a page with automatic modal handling
   * @param path Path to navigate to
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.modalHandler.handleModalIfPresent();
  }

  /**
   * Handle modal if present on current page
   */
  async handleModalIfPresent(config?: ModalConfig): Promise<void> {
    await this.modalHandler.handleModalIfPresent(config);
  }

  /**
   * Execute action with modal handling before and after
   */
  async executeWithModalHandling<T>(action: () => Promise<T>, config?: ModalConfig): Promise<T> {
    return this.modalHandler.executeWithModalHandling(action, config);
  }

  /**
   * Close modal
   */
  async closeModal(config?: ModalConfig): Promise<boolean> {
    return this.modalHandler.closeModal(config);
  }

  /**
   * Check if modal is visible
   */
  async isModalVisible(config?: ModalConfig): Promise<boolean> {
    return this.modalHandler.isModalVisible(config);
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for page to load (DOM ready, not networkidle)
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }
}
