/**
 * RegistrationPage - Page Object Model
 * Encapsulates all interactions with the Automation Exercise registration page
 * Implements POM best practices: locators, navigation, and interaction methods
 * Extends BasePage for automatic modal handling
 */

import { Page, Locator } from '@playwright/test';
import { UserDetails } from '../utils/UserFactory';
import { ModalHandler } from '../utils/ModalHandler';
import { BasePage } from './BasePage';

export class RegistrationPage extends BasePage {
  // Navigation elements
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;

  // Login/Signup form
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;

  // Registration form - Account Information
  readonly titleMrRadio: Locator;
  readonly titleMrsRadio: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly dayDropdown: Locator;
  readonly monthDropdown: Locator;
  readonly yearDropdown: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;

  // Registration form - Address Information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countryDropdown: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;

  // Buttons
  readonly createAccountButton: Locator;

  // Success message
  readonly accountCreatedHeading: Locator;
  readonly successContinueButton: Locator;

  constructor(page: Page, modalHandler?: ModalHandler) {
    super(page, modalHandler);

    // Navigation elements
    this.signupLoginLink = page
      .locator('a[href="/login"]')
      .or(page.getByRole('link', { name: /Signup \/ Login/i }));
    this.logoutLink = page
      .locator('a[href="/logout"]')
      .or(page.getByRole('link', { name: /Logout/i }));

    // Login/Signup form selectors
    this.signupNameInput = page
      .locator('input[data-qa="signup-name"]')
      .or(page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Name'));
    this.signupEmailInput = page
      .locator('input[data-qa="signup-email"]')
      .or(page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address'));
    this.signupButton = page
      .locator('button[data-qa="signup-button"]')
      .or(page.getByRole('button', { name: /^Signup$/i }));

    // Registration form - Account Information
    this.titleMrRadio = page
      .locator('input[id="id_gender1"]')
      .or(page.locator('input[value="Mr"]').first());
    this.titleMrsRadio = page
      .locator('input[id="id_gender2"]')
      .or(page.locator('input[value="Mrs"]').first());
    this.nameInput = page
      .locator('input[data-qa="name"]')
      .or(page.locator('input[name="name"]').first());
    this.emailInput = page
      .locator('input[data-qa="email"]')
      .or(page.locator('input[name="email"][disabled]'));
    this.passwordInput = page
      .locator('input[data-qa="password"]')
      .or(page.locator('input[type="password"]').first());
    this.dayDropdown = page.locator('select[data-qa="days"]').or(page.locator('select').nth(0));
    this.monthDropdown = page.locator('select[data-qa="months"]').or(page.locator('select').nth(1));
    this.yearDropdown = page.locator('select[data-qa="years"]').or(page.locator('select').nth(2));
    this.newsletterCheckbox = page
      .locator('input[id="newsletter"]')
      .or(page.locator('input[name="newsletter"]'));
    this.specialOffersCheckbox = page
      .locator('input[id="optin"]')
      .or(page.locator('input[name="optin"]'));

    // Registration form - Address Information
    this.firstNameInput = page
      .locator('input[data-qa="first_name"]')
      .or(page.locator('input[placeholder="First name *"]'));
    this.lastNameInput = page
      .locator('input[data-qa="last_name"]')
      .or(page.locator('input[placeholder="Last name *"]'));
    this.companyInput = page
      .locator('input[data-qa="company"]')
      .or(page.locator('input[placeholder="Company"]'));
    this.address1Input = page
      .locator('input[data-qa="address"]')
      .or(
        page
          .locator('textarea[placeholder*="Street address"]')
          .or(page.locator('input[name="address1"]')),
      );
    this.address2Input = page
      .locator('input[data-qa="address2"]')
      .or(page.locator('input[placeholder="Address 2"]'));
    this.countryDropdown = page
      .locator('select[data-qa="country"]')
      .or(page.locator('select[name="country"]'));
    this.stateInput = page
      .locator('input[data-qa="state"]')
      .or(page.locator('input[placeholder="State *"]'));
    // City field has combined placeholder "City * Zipcode *"
    this.cityInput = page
      .locator('input[data-qa="city"]')
      .or(page.locator('input[placeholder*="City"]'));
    // Zipcode is a separate input field - use data-qa selector specifically
    this.zipcodeInput = page
      .locator('input[data-qa="zipcode"]')
      .or(page.locator('input#zipcode'))
      .or(page.locator('input[name="zipcode"]'));
    this.mobileNumberInput = page
      .locator('input[data-qa="mobile_number"]')
      .or(page.locator('input[placeholder="Mobile Number *"]'));

    // Action buttons
    this.createAccountButton = page
      .locator('button[data-qa="create-account"]')
      .or(page.getByRole('button', { name: /Create Account/i }));

    // Success message
    this.accountCreatedHeading = page
      .locator('h2:has-text("Account Created!")')
      .or(page.getByRole('heading', { name: /Account Created/i }));
    this.successContinueButton = page
      .locator('a[data-qa="continue-button"]')
      .or(page.getByRole('link', { name: /Continue/i }));
  }

  /**
   * Navigate to the login/signup page
   * Includes retry logic for network errors
   * @param path Optional path to navigate to (default: /login)
   */
  async goto(path: string = '/login'): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 10000 });
        break; // Success
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error; // Give up after max attempts
        }
        // Wait before retrying
        await new Promise((r) => setTimeout(r, 500 * attempts));
      }
    }
  }

  /**
   * Navigate to signup form (assumes we're on login page)
   */
  async navigateToSignup(): Promise<void> {
    await this.goto();
  }

  /**
   * Perform initial signup (name and email only)
   * This redirects to the full registration form
   * @param name User's full name
   * @param email User's email address
   */
  async performInitialSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);

    // Wait for Signup button to be clickable
    await this.signupButton.waitFor({ state: 'visible', timeout: 10000 });

    // Handle any blocking modals before clicking
    try {
      const modalRoot = this.page.locator('.fc-consent-root, .fc-dialog-container');
      const isModalVisible = await modalRoot.isVisible({ timeout: 1000 }).catch(() => false);

      if (isModalVisible) {
        console.log('🔴 Modal blocking signup button, attempting to dismiss...');

        // Try multiple strategies to close the modal
        const consentBtn = this.page.locator('.fc-cta-consent, .fc-button');
        try {
          await consentBtn.first().click({ force: true, timeout: 2000 });
          await new Promise((r) => setTimeout(r, 300));
          console.log('✅ Modal dismissed via consent button');
        } catch {
          // If button click fails, try to hide the modal with CSS
          try {
            await this.page.evaluate(() => {
              const modal = document.querySelector('.fc-consent-root');
              if (modal) {
                (modal as HTMLElement).style.display = 'none';
              }
            });
            console.log('✅ Modal hidden via CSS');
          } catch {
            console.log('⚠️  Could not close modal, attempting forced button click anyway');
          }
        }
      }
    } catch {
      // If modal check fails, continue anyway
    }

    // Click signup button (using force if needed to bypass any remaining overlays)
    try {
      await this.signupButton.click({ timeout: 10000 });
    } catch {
      // If normal click fails, try with force
      console.log('Normal click failed, attempting forced click...');
      await this.signupButton.click({ force: true, timeout: 10000 });
    }

    // Wait for page navigation to happen (not networkidle, as page is never fully idle)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // Wait for the registration form to load - look for password field
    try {
      await this.page.waitForSelector('input[data-qa="password"]', {
        state: 'visible',
        timeout: 10000,
      });
    } catch {
      // Fallback: wait for any password input field
      console.log('Password field with data-qa not found, trying fallback...');
      await this.page.waitForSelector('input[type="password"]', {
        state: 'visible',
        timeout: 10000,
      });
    }
  }

  /**
   * Close cookie consent modal if it appears
   * Uses centralized ModalHandler for consistency
   */
  private async closeConsentModalIfPresent(): Promise<void> {
    await this.modalHandler.handleModalIfPresent();
  }

  /**
   * Fill the complete registration form
   * @param userDetails User details to fill in the form
   */
  async fillRegistrationForm(userDetails: UserDetails): Promise<void> {
    // Wait for page DOM to be ready (not networkidle - ads never stop loading)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // Close consent modal if present before filling form - CRITICAL
    await this.handleModalIfPresent();
    await new Promise((r) => setTimeout(r, 300));

    // Wait for title radio button to be visible and stable
    await this.titleMrRadio.waitFor({ state: 'visible', timeout: 5000 });

    // Close modal again before interactions
    await this.handleModalIfPresent();

    // Select title - scroll into view to ensure it's clickable and not obscured by ads
    if (userDetails.title === 'Mr.') {
      await this.titleMrRadio.scrollIntoViewIfNeeded();
      await this.titleMrRadio.click({ timeout: 5000 });
    } else {
      await this.titleMrsRadio.scrollIntoViewIfNeeded();
      await this.titleMrsRadio.click({ timeout: 5000 });
    }

    // Fill account information
    await this.nameInput.fill(userDetails.name);
    // Email is pre-filled and disabled, so we skip it
    await this.passwordInput.fill(userDetails.password);

    // Set date of birth
    await this.dayDropdown.selectOption(userDetails.dayOfBirth);
    await this.monthDropdown.selectOption(userDetails.monthOfBirth);
    await this.yearDropdown.selectOption(userDetails.yearOfBirth);

    // Set checkboxes - scroll into view to ensure they're clickable and not obscured by ads
    if (userDetails.newsletter) {
      const isChecked = await this.newsletterCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await this.newsletterCheckbox.scrollIntoViewIfNeeded();
        await this.newsletterCheckbox.check({ timeout: 5000 });
      }
    }
    if (userDetails.specialOffers) {
      const isChecked = await this.specialOffersCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await this.specialOffersCheckbox.scrollIntoViewIfNeeded();
        await this.specialOffersCheckbox.check({ timeout: 5000 });
      }
    }

    // Handle modal before address section
    await this.handleModalIfPresent();

    // Fill address information
    await this.firstNameInput.fill(userDetails.firstName);
    await this.lastNameInput.fill(userDetails.lastName);

    if (userDetails.company) {
      await this.companyInput.fill(userDetails.company);
    }

    await this.address1Input.fill(userDetails.address1);

    if (userDetails.address2) {
      await this.address2Input.fill(userDetails.address2);
    }

    await this.countryDropdown.selectOption(userDetails.country);
    await this.stateInput.fill(userDetails.state);
    await this.cityInput.fill(userDetails.city);
    await this.zipcodeInput.fill(userDetails.zipcode);
    await this.mobileNumberInput.fill(userDetails.mobileNumber);
  }

  /**
   * Complete the entire registration process from signup page to account creation
   * @param userDetails User details to register
   */
  async completeRegistration(userDetails: UserDetails): Promise<void> {
    // Start signup with name and email
    await this.performInitialSignup(userDetails.name, userDetails.email);

    // Fill the registration form
    await this.fillRegistrationForm(userDetails);

    // Submit the form with proper scrolling and wait
    await this.createAccountButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Let ads settle
    await this.createAccountButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Submit the registration form
   */
  async submitRegistration(): Promise<void> {
    // Close any consent modal that might be blocking
    await this.closeConsentModalIfPresent();

    // Scroll to Create Account button to ensure it's visible and not obscured by ads
    await this.createAccountButton.scrollIntoViewIfNeeded();

    // Wait briefly for any dynamic ads to finish loading/repositioning
    await this.page.waitForTimeout(500);

    // Click the Create Account button - uses actionability checks to avoid clicking ads
    await this.createAccountButton.click({ timeout: 10000 });

    // Wait for page to load after submission (but not networkidle as it never completes)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  }

  /**
   * Verify that account was created successfully
   * @returns True if success message is visible
   */
  async isAccountCreatedMessageVisible(): Promise<boolean> {
    try {
      await this.accountCreatedHeading.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the account created success message text
   */
  async getSuccessMessageText(): Promise<string | null> {
    return await this.accountCreatedHeading.textContent();
  }

  /**
   * Click the continue button after successful registration
   */
  async clickContinueAfterSuccess(): Promise<void> {
    await this.successContinueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if we're on the account creation success page
   */
  async isOnSuccessPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/account_created') || url.includes('account-created');
  }

  /**
   * Logout from the current session
   * Required for batch registration to avoid being logged in as previous user
   */
  async logout(): Promise<void> {
    try {
      // Check if logout link is visible (user is logged in)
      const isLogoutVisible = await this.logoutLink.isVisible({ timeout: 2000 }).catch(() => false);

      if (isLogoutVisible) {
        await this.logoutLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✓ Logged out successfully');
      } else {
        console.log('ℹ Already logged out or not logged in');
      }
    } catch (error) {
      console.log('⚠ Logout failed, continuing anyway:', error);
    }
  }

  /**
   * Delete account (if logged in)
   * Useful for cleaning up test users after batch registration
   */
  async deleteAccount(): Promise<void> {
    try {
      const deleteLink = this.page
        .locator('a[href="/delete_account"]')
        .or(this.page.getByRole('link', { name: /Delete Account/i }));

      const isDeleteVisible = await deleteLink.isVisible({ timeout: 2000 }).catch(() => false);

      if (isDeleteVisible) {
        await deleteLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✓ Account deleted successfully');
      }
    } catch (error) {
      console.log('⚠ Delete account failed:', error);
    }
  }
}
