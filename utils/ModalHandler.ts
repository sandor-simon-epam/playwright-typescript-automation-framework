/**
 * ModalHandler - Centralized Cookie Consent Modal Management
 * Provides reusable methods for handling FunnyConsent and other overlay modals
 * Ensures consistency across all pages and tests
 */

import { Page, Locator } from '@playwright/test';

export interface ModalConfig {
  rootSelector: string;
  closeButtonSelector: string;
  timeout?: number;
  retries?: number;
}

export class ModalHandler {
  private page: Page;
  private retries: number;
  private timeout: number;

  /**
   * FunnyConsent modal configuration
   */
  static readonly FUNNY_CONSENT: ModalConfig = {
    rootSelector: '.fc-dialog-container',
    closeButtonSelector: '.fc-cta-consent',
    timeout: 2000,
    retries: 3,
  };

  /**
   * Generic cookie banner configuration
   */
  static readonly COOKIE_BANNER: ModalConfig = {
    rootSelector: '[data-testid="cookie-banner"]',
    closeButtonSelector: '[data-testid="cookie-close"]',
    timeout: 2000,
    retries: 2,
  };

  constructor(page: Page) {
    this.page = page;
    this.retries = 3;
    this.timeout = 2000;
  }

  /**
   * Check if modal is visible on page
   * @param config Modal configuration
   * @returns Promise<boolean>
   */
  async isModalVisible(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Promise<boolean> {
    try {
      const modal = this.page.locator(config.rootSelector);
      return await modal.isVisible({ timeout: 1000 }).catch(() => false);
    } catch {
      return false;
    }
  }

  /**
   * Wait for modal to appear
   * @param config Modal configuration
   * @returns Promise<boolean> - true if modal appeared, false if timeout
   */
  async waitForModal(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Promise<boolean> {
    try {
      const modal = this.page.locator(config.rootSelector);
      await modal.waitFor({ state: 'visible', timeout: config.timeout || this.timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for modal to disappear
   * @param config Modal configuration
   * @returns Promise<boolean> - true if modal disappeared, false if timeout
   */
  async waitForModalToClose(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Promise<boolean> {
    try {
      const modal = this.page.locator(config.rootSelector);
      await modal.waitFor({ state: 'hidden', timeout: config.timeout || this.timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close modal with retry logic
   * @param config Modal configuration
   * @returns Promise<boolean> - true if closed successfully
   */
  async closeModal(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Promise<boolean> {
    const maxRetries = config.retries || this.retries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if modal is visible
        const isVisible = await this.isModalVisible(config);
        if (!isVisible) {
          console.log(`Modal already closed or not visible (attempt ${attempt + 1}/${maxRetries})`);
          return true;
        }

        // Try to close with force click
        const closeButton = this.page.locator(config.closeButtonSelector);
        const closeButtonVisible = await closeButton.isVisible({ timeout: 500 }).catch(() => false);

        if (!closeButtonVisible) {
          console.log(
            `Close button not visible, trying force click anyway (attempt ${attempt + 1}/${maxRetries})`,
          );
        }

        // Use force: true to bypass overlay blocking
        await closeButton.click({ force: true, timeout: 2000 });

        // Small delay for modal to close
        await new Promise((r) => setTimeout(r, 100));

        // Wait for modal to disappear
        const closed = await this.waitForModalToClose(config);
        if (closed) {
          console.log(`Modal closed successfully (attempt ${attempt + 1}/${maxRetries})`);
          return true;
        }

        console.log(`Modal close wait failed (attempt ${attempt + 1}/${maxRetries})`);
      } catch (error) {
        lastError = error as Error;
        console.log(
          `Attempt ${attempt + 1}/${maxRetries} failed: ${lastError.message?.substring(0, 100)}`,
        );

        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }

    console.warn(
      `Failed to close modal after ${maxRetries} attempts`,
      lastError?.message?.substring(0, 100),
    );
    return false;
  }

  /**
   * Handle modal if present (graceful approach)
   * Returns silently if modal doesn't exist
   * Removes modal from DOM if visible to ensure no overlay blocking
   * @param config Modal configuration
   */
  async handleModalIfPresent(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Promise<void> {
    try {
      const isVisible = await this.isModalVisible(config);
      if (isVisible) {
        // First try closing via button
        const closed = await this.closeModal(config);

        // If button click failed, forcefully remove from DOM
        if (!closed) {
          try {
            await this.page.evaluate((selector) => {
              const element = document.querySelector(selector);
              if (element) {
                element.remove();
                console.log('Modal forcefully removed from DOM');
              }
            }, config.rootSelector);
          } catch {
            // Silently ignore DOM manipulation failures
          }
        }
      }
    } catch {
      // Silently ignore if modal handling fails
    }
  }

  /**
   * Execute action while ensuring modal doesn't interfere
   * Closes modal before and after action
   * @param action Callback function to execute
   * @param config Modal configuration
   */
  async executeWithModalHandling<T>(
    action: () => Promise<T>,
    config: ModalConfig = ModalHandler.FUNNY_CONSENT,
  ): Promise<T> {
    // Close modal before action
    await this.handleModalIfPresent(config);

    try {
      // Execute the action
      const result = await action();

      // Close modal again after action in case it reappeared
      await this.handleModalIfPresent(config);

      return result;
    } catch (error) {
      // Try to close modal even if action failed
      await this.handleModalIfPresent(config);
      throw error;
    }
  }

  /**
   * Accept/Dismiss modal by clicking button with text
   * @param buttonText Text to match on button
   * @param config Modal configuration
   */
  async clickModalButton(
    buttonText: string,
    config: ModalConfig = ModalHandler.FUNNY_CONSENT,
  ): Promise<boolean> {
    try {
      const modal = this.page.locator(config.rootSelector);
      const button = modal.getByRole('button', { name: new RegExp(buttonText, 'i') });

      await button.click({ force: true, timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get modal element
   * @param config Modal configuration
   */
  getModal(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Locator {
    return this.page.locator(config.rootSelector);
  }

  /**
   * Get modal close button
   * @param config Modal configuration
   */
  getCloseButton(config: ModalConfig = ModalHandler.FUNNY_CONSENT): Locator {
    return this.page.locator(config.closeButtonSelector);
  }
}
