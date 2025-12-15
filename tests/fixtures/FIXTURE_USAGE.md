/\*\*

- Modal Fixture Usage Guide
-
- This document explains how to use the automatic modal handling fixture
- in your Playwright tests.
  \*/

/\*\*

- BASIC USAGE
-
- Instead of importing from '@playwright/test', import from the modalFixture:
-
- ✅ RECOMMENDED:
- ```typescript

  ```

- import { test, expect } from '../fixtures/modalFixture';
-
- test('my test', async ({ pageWithModalHandling, modalHandler }) => {
- // pageWithModalHandling: Page with automatic modal handling
- // modalHandler: ModalHandler instance for manual control if needed
- });
- ```

  ```

-
- ❌ OLD WAY:
- ```typescript

  ```

- import { test, expect } from '@playwright/test';
- test('my test', async ({ page }) => {
- // Manual modal handling required
- });
- ```
  */
  ```

/\*\*

- FIXTURE FEATURES
-
- 1.  Automatic Modal Handling
- - Automatically closes FunnyConsent modals on page load
- - Handles modals that appear during navigation
- - Gracefully ignores if modal doesn't exist
-
- 2.  Page Event Listeners
- - Listens for 'load' events and closes modals
- - Handles popup windows automatically
- - Ensures modals are closed within 500ms after page load
-
- 3.  Manual Control
- - Provides ModalHandler instance for fine-grained control
- - Use modalHandler for custom modal interactions if needed
    \*/

/\*\*

- EXAMPLE 1: Simple Registration Test with Auto Modal Handling
-
- ```typescript

  ```

- import { test, expect } from '../fixtures/modalFixture';
- import { RegistrationPage } from '../../pages/RegistrationPage';
-
- test('Register user', async ({ pageWithModalHandling }) => {
- const page = new RegistrationPage(pageWithModalHandling);
- await page.goto(); // Modal automatically handled if it appears
- await page.performInitialSignup('John Doe', 'john@example.com');
- // No need to manually close modals!
- });
- ```
  */
  ```

/\*\*

- EXAMPLE 2: Using Manual Modal Control
-
- ```typescript

  ```

- import { test, expect } from '../fixtures/modalFixture';
-
- test('Check modal behavior', async ({ pageWithModalHandling, modalHandler }) => {
- await pageWithModalHandling.goto('https://example.com');
-
- // Check if modal is visible
- const isVisible = await modalHandler.isModalVisible();
- expect(isVisible).toBe(true);
-
- // Manually close modal
- const closed = await modalHandler.closeModal();
- expect(closed).toBe(true);
- });
- ```
  */
  ```

/\*\*

- EXAMPLE 3: Wrap Actions with Modal Handling
-
- ```typescript

  ```

- import { test, expect } from '../fixtures/modalFixture';
-
- test('Action with guaranteed modal handling', async ({ modalHandler, pageWithModalHandling }) => {
- await modalHandler.executeWithModalHandling(async () => {
-     // Your action here - modals will be handled before and after
-     await pageWithModalHandling.click('button#submit');
- });
- });
- ```
  */
  ```

/\*\*

- EXAMPLE 4: Multiple Page Objects with Auto Modal Handling
-
- ```typescript

  ```

- import { test, expect } from '../fixtures/modalFixture';
- import { LoginPage } from '../../pages/LoginPage';
- import { DashboardPage } from '../../pages/DashboardPage';
-
- test('Full user journey', async ({ pageWithModalHandling }) => {
- const loginPage = new LoginPage(pageWithModalHandling);
- const dashboardPage = new DashboardPage(pageWithModalHandling);
-
- // All modals handled automatically
- await loginPage.goto();
- await loginPage.login('user@example.com', 'password');
-
- await dashboardPage.goto();
- await dashboardPage.verifyDashboard();
- });
- ```
  */
  ```

/\*\*

- MIGRATING EXISTING TESTS
-
- 1.  Change import:
- FROM: import { test, expect } from '@playwright/test';
- TO: import { test, expect } from '../fixtures/modalFixture';
-
- 2.  Change page parameter:
- FROM: async ({ page }) => {
- TO: async ({ pageWithModalHandling }) => {
-
- 3.  Use pageWithModalHandling like regular page:
- const registrationPage = new RegistrationPage(pageWithModalHandling);
-
- 4.  Remove manual modal handling code (optional, won't hurt)
- The fixture handles modals automatically anyway
  \*/

/\*\*

- FIXTURE LIFECYCLE
-
- 1.  Test Starts
- - Page is created
- - Modal event listeners are attached
- - pageWithModalHandling is provided to test
-
- 2.  During Test
- - Page navigates
- - 'load' event triggers modal check
- - Modal is closed if found (within 500ms)
- - Test continues
-
- 3.  Test Ends
- - Event listeners are cleaned up
- - Page is closed
    \*/

/\*\*

- TROUBLESHOOTING
-
- Q: Modal still appears in my test
- A: The fixture waits 500ms for modal to appear. Very slow modals might need:
- await page.waitForTimeout(1000);
- Or add a manual: await modalHandler.handleModalIfPresent();
-
- Q: Can I still use regular 'page' fixture?
- A: Yes, but modals won't be handled automatically. Use pageWithModalHandling instead.
-
- Q: Does this affect test performance?
- A: Minimal impact. Only adds 500ms wait per navigation and a few event listeners.
-
- Q: Can I customize modal behavior?
- A: Yes, use the modalHandler instance for custom configurations:
- const handled = await modalHandler.closeModal(ModalHandler.COOKIE_BANNER);
  \*/

/\*\*

- BEST PRACTICES
-
- 1.  Always use pageWithModalHandling for E2E tests that interact with web
- 2.  Keep modal handling automatic - don't manually duplicate modal closing
- 3.  Use modalHandler for advanced scenarios (custom modals, verification)
- 4.  Combine with RegistrationPage and other POMs for clean tests
- 5.  Verify modal handling is working via logs:
- "Modal closed successfully (attempt 1/3)"
  \*/

export {}; // This is a documentation file, not executable code
