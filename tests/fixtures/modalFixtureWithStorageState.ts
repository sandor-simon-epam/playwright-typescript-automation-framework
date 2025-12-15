/**
 * Simplified Modal Fixture with Storage State Support
 * Since cookie consent is handled via storage state setup,
 * this fixture provides minimal modal handling as fallback
 */

import { test as base, Page } from '@playwright/test';
import { ModalHandler } from '../../utils/ModalHandler';

/**
 * Extended fixture with minimal modal handling (fallback only)
 */
export type ModalFixtures = {
  pageWithModalHandling: Page;
  modalHandler: ModalHandler;
};

/**
 * Create test fixture with minimal modal handling
 * Storage state should prevent the modal in most cases
 */
export const test = base.extend<ModalFixtures>({
  /**
   * Page with minimal modal handling (fallback)
   * Primary protection comes from storage state, not event listeners
   */
  pageWithModalHandling: async ({ page }, use) => {
    // Minimal handling - only attempt to close modal if it somehow appears
    // despite storage state (can happen with stale storage or site changes)
    page.on('load', async () => {
      try {
        const modalHandler = new ModalHandler(page);
        // Only try once, no retries
        await modalHandler.handleModalIfPresent();
      } catch {
        // Silently ignore - storage state should handle this
      }
    });

    await use(page);

    // Cleanup
    page.removeAllListeners('load');
  },

  /**
   * Provide modal handler instance for manual control if needed
   */
  modalHandler: async ({ page }, use) => {
    const modalHandler = new ModalHandler(page);
    await use(modalHandler);
  },
});

/**
 * Convenience export for expect
 */
export { expect } from '@playwright/test';
