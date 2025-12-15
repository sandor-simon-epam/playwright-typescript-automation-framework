/**
 * Modal Fixture - Aggressive Cookie Consent Modal Handling
 * Provides automatic modal handling for all tests via Playwright fixtures
 * Uses multiple strategies to ensure modals are closed
 */

import { test as base, Page } from '@playwright/test';
import { ModalHandler } from '../../utils/ModalHandler';

/**
 * Extended fixture with automatic modal handling
 */
export type ModalFixtures = {
  pageWithModalHandling: Page;
  modalHandler: ModalHandler;
};

/**
 * Create test fixture with aggressive modal handling
 */
export const test = base.extend<ModalFixtures>({
  /**
   * Page with aggressive automatic modal handling
   * Uses multiple strategies to close modals
   */
  pageWithModalHandling: async ({ page }, use) => {
    // Aggressive modal handler function
    const aggressiveModalHandler = async () => {
      // Small delay to allow modal to render
      await new Promise((r) => setTimeout(r, 500));

      const modalHandler = new ModalHandler(page);

      // Strategy 1: Try to close the FunnyConsent modal using the close button
      try {
        const isVisible = await modalHandler.isModalVisible(ModalHandler.FUNNY_CONSENT);
        if (isVisible) {
          console.log('🔴 Modal detected, attempting to close...');
          const closed = await modalHandler.closeModal(ModalHandler.FUNNY_CONSENT);
          if (closed) {
            console.log('✅ Modal closed successfully');
          } else {
            console.log('⚠️  Modal close failed, attempting alternative strategy...');

            // Strategy 2: Force click on any consent button
            try {
              const consentBtn = page.locator(
                '.fc-cta-consent, [data-qa="accept-consent"], .fc-button',
              );
              const btnVisible = await consentBtn.isVisible({ timeout: 1000 }).catch(() => false);

              if (btnVisible) {
                await consentBtn.first().click({ force: true, timeout: 3000 });
                await new Promise((r) => setTimeout(r, 300));
                console.log('✅ Alternative consent button clicked');
              }
            } catch {
              console.log('⚠️  Alternative strategy also failed');
            }

            // Strategy 3: Try to hide/remove the modal completely
            try {
              await page.evaluate(() => {
                const modalRoot = document.querySelector('.fc-consent-root, .fc-dialog-container');
                if (modalRoot) {
                  (modalRoot as HTMLElement).style.display = 'none';
                  console.log('Modal hidden via CSS');
                }
              });
            } catch {
              console.log('Could not hide modal via CSS');
            }
          }
        }
      } catch (error) {
        console.log(
          'Modal handling error:',
          error instanceof Error ? error.message.substring(0, 100) : 'unknown',
        );
      }
    };

    // Handle modals on page load
    page.on('load', () => {
      aggressiveModalHandler().catch(() => {});
    });

    // Handle modals on navigation
    page.on('framenavigated', () => {
      aggressiveModalHandler().catch(() => {});
    });

    // Try to close modal right away in case it's already visible
    aggressiveModalHandler().catch(() => {});

    // Listen for new pages (popups, etc.)
    page.on('popup', async (popup) => {
      await new Promise((r) => setTimeout(r, 500));
      const popupModalHandler = new ModalHandler(popup);
      popupModalHandler.handleModalIfPresent().catch(() => {});
    });

    // Use the page with automatic modal handling
    await use(page);

    // Cleanup listeners
    page.removeAllListeners('load');
    page.removeAllListeners('framenavigated');
    page.removeAllListeners('popup');
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
