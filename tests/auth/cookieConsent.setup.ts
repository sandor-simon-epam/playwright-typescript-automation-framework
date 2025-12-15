/**
 * Cookie Consent Setup - One-time setup to capture accepted cookie state
 * This stores the browser state after accepting cookies so tests can reuse it
 * Run this setup once before tests to generate the storage state
 */

import { test as setup } from '@playwright/test';
import { ModalHandler } from '../../utils/ModalHandler';

const STORAGE_STATE_FILE = '.auth/cookie-consent-state.json';

setup('Accept cookie consent and save state', async ({ page }) => {
  console.log('🍪 Setting up cookie consent state...');

  // Navigate to the site
  await page.goto('https://automationexercise.com/');

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  // Check if cookie consent modal appears
  const modalHandler = new ModalHandler(page);
  const hasModal = await modalHandler.waitForModal(ModalHandler.FUNNY_CONSENT);

  if (hasModal) {
    console.log('✓ Cookie consent modal detected, accepting...');

    // Close/accept the modal
    await modalHandler.closeModal(ModalHandler.FUNNY_CONSENT);

    // Wait for modal to disappear
    await page.waitForTimeout(500);

    console.log('✓ Cookie consent accepted');
  } else {
    console.log('ℹ Cookie consent modal not found (may already be accepted)');
  }

  // Save the storage state (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: STORAGE_STATE_FILE });

  console.log(`✓ Storage state saved to ${STORAGE_STATE_FILE}`);
});

export { STORAGE_STATE_FILE };
