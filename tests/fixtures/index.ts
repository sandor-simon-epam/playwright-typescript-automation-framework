/**
 * Playwright Test Fixtures - Central Export Point
 *
 * Provides extended test fixtures with automatic handling of common scenarios
 */

export { test, expect } from './modalFixture';
export type { ModalFixtures } from './modalFixture';

/**
 * Usage:
 *
 * import { test, expect } from '@fixtures';
 *
 * test('my test', async ({ pageWithModalHandling, modalHandler }) => {
 *   // pageWithModalHandling: Page with automatic modal handling
 *   // modalHandler: ModalHandler for custom modal interactions
 * });
 */
