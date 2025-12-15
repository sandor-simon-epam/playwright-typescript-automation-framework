/**
 * E2E Registration Test
 * Pure UI/E2E testing for user registration on Automation Exercise
 * Uses: RegistrationPage POM, UserFactory, and Modal Fixture
 *
 * Cookie Consent Handling:
 * - Storage state (.auth/cookie-consent-state.json) is loaded automatically
 * - This prevents the FunnyConsent modal from appearing in tests
 * - If modal still appears, run: npm run test:setup
 * - Modal fixture provides fallback handling as extra safety
 */

import { test, expect } from '../fixtures/modalFixture';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { UserFactory } from '../../utils/UserFactory';

test.describe('User Registration E2E Tests', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ pageWithModalHandling, modalHandler }) => {
    registrationPage = new RegistrationPage(pageWithModalHandling, modalHandler);
    await registrationPage.goto('/login');
  });

  test('Complete user registration flow with generated data', async () => {
    // ============ STEP 1: GENERATE USER DATA ============
    const userDetails = UserFactory.createUser({
      newsletter: true,
      specialOffers: true,
    });

    console.log('📝 Generated user data:');
    console.log(`  Name: ${userDetails.name}`);
    console.log(`  Email: ${userDetails.email}`);
    console.log(`  Country: ${userDetails.country}`);
    console.log(`  City: ${userDetails.city}`);

    try {
      // ============ STEP 2: NAVIGATE TO SIGNUP ============
      await registrationPage.navigateToSignup();
      console.log('✓ On login/signup page');

      // ============ STEP 3: PERFORM INITIAL SIGNUP ============
      await registrationPage.performInitialSignup(userDetails.name, userDetails.email);
      console.log('✓ Initial signup completed, redirected to registration form');

      // ============ STEP 4: FILL REGISTRATION FORM ============
      await registrationPage.fillRegistrationForm(userDetails);
      console.log('✓ Registration form filled with user data');

      // ============ STEP 5: SUBMIT FORM ============
      await registrationPage.submitRegistration();
      console.log('✓ Registration form submitted');

      // ============ STEP 6: VERIFY SUCCESS ============
      const isAccountCreated = await registrationPage.isAccountCreatedMessageVisible();
      expect(isAccountCreated).toBe(true);
      console.log('✓ Account created successfully - success message visible');

      // Get and verify the success message text
      const successText = await registrationPage.getSuccessMessageText();
      expect(successText).toContain('Account Created');
      console.log(`✓ Success message verified: "${successText}"`);

      // ============ STEP 7: VERIFY SUCCESS PAGE ============
      const onSuccessPage = await registrationPage.isOnSuccessPage();
      expect(onSuccessPage).toBe(true);
      console.log('✓ On account creation success page');

      // ============ STEP 8: CONTINUE ============
      await registrationPage.clickContinueAfterSuccess();
      console.log('✓ Clicked continue after registration');

      // Verify we're on a different page (account page or home)
      const finalUrl = await registrationPage.getCurrentUrl();
      expect(finalUrl).not.toContain('/signup');
      console.log('✓ Successfully navigated away from registration page');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('Register with minimal required information only', async () => {
    try {
      const userDetails = UserFactory.createMinimalUser();

      console.log('📝 Registering with minimal data');

      await registrationPage.navigateToSignup();
      await registrationPage.performInitialSignup(userDetails.name, userDetails.email);
      await registrationPage.fillRegistrationForm(userDetails);
      await registrationPage.submitRegistration();

      const isAccountCreated = await registrationPage.isAccountCreatedMessageVisible();
      expect(isAccountCreated).toBe(true);
      console.log('✓ Account created with minimal information');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('Register with custom user data', async () => {
    try {
      const customUser = UserFactory.createCustomUser({
        firstName: 'AutoTest',
        lastName: 'Engineer',
        country: 'United States',
        city: 'New York',
        title: 'Mrs.',
        newsletter: true,
        specialOffers: false,
      });

      console.log('📝 Registering with custom user data');
      console.log(`  Name: ${customUser.firstName} ${customUser.lastName}`);
      console.log(`  Email: ${customUser.email}`);

      await registrationPage.navigateToSignup();
      await registrationPage.performInitialSignup(customUser.name, customUser.email);
      await registrationPage.fillRegistrationForm(customUser);
      await registrationPage.submitRegistration();

      const isAccountCreated = await registrationPage.isAccountCreatedMessageVisible();
      expect(isAccountCreated).toBe(true);
      console.log('✓ Custom user registration successful');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('Verify all form fields are filled correctly', async () => {
    try {
      const userDetails = UserFactory.createUser();

      await registrationPage.navigateToSignup();
      await registrationPage.performInitialSignup(userDetails.name, userDetails.email);

      // Fill the form
      await registrationPage.fillRegistrationForm(userDetails);

      // Verify each field has the correct value
      const nameValue = await registrationPage.nameInput.inputValue();
      expect(nameValue).toBe(userDetails.name);

      const firstNameValue = await registrationPage.firstNameInput.inputValue();
      expect(firstNameValue).toBe(userDetails.firstName);

      const lastNameValue = await registrationPage.lastNameInput.inputValue();
      expect(lastNameValue).toBe(userDetails.lastName);

      const addressValue = await registrationPage.address1Input.inputValue();
      expect(addressValue).toBe(userDetails.address1);

      const stateValue = await registrationPage.stateInput.inputValue();
      expect(stateValue).toBe(userDetails.state);

      const cityValue = await registrationPage.cityInput.inputValue();
      expect(cityValue).toBe(userDetails.city);

      const zipcodeValue = await registrationPage.zipcodeInput.inputValue();
      expect(zipcodeValue).toBe(userDetails.zipcode);

      const mobileValue = await registrationPage.mobileNumberInput.inputValue();
      expect(mobileValue).toBe(userDetails.mobileNumber);

      console.log('✓ All form fields filled and verified correctly');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('Register multiple users in batch', async () => {
    try {
      const users = UserFactory.createBatch(2);

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`📝 Registering user ${i + 1}/${users.length}`);

        // Navigate to signup
        if (i === 0) {
          await registrationPage.navigateToSignup();
        } else {
          // For subsequent users, logout first then navigate to signup
          await registrationPage.logout();
          await registrationPage.goto();
        }

        // Perform registration
        await registrationPage.performInitialSignup(user.name, user.email);
        await registrationPage.fillRegistrationForm(user);
        await registrationPage.submitRegistration();

        // Verify success
        const isAccountCreated = await registrationPage.isAccountCreatedMessageVisible();
        expect(isAccountCreated).toBe(true);
        console.log(`✓ User ${i + 1} registered successfully`);

        // Continue to complete registration
        await registrationPage.clickContinueAfterSuccess();
      }

      console.log('✓ All users registered successfully');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });

  test('Verify newsletter and special offers checkboxes', async () => {
    try {
      const userWithOffers = UserFactory.createCustomUser({
        newsletter: true,
        specialOffers: true,
      });

      const userWithoutOffers = UserFactory.createCustomUser({
        newsletter: false,
        specialOffers: false,
      });

      // Test user with offers
      await registrationPage.navigateToSignup();
      await registrationPage.performInitialSignup(userWithOffers.name, userWithOffers.email);
      await registrationPage.fillRegistrationForm(userWithOffers);

      let isNewsletterChecked = await registrationPage.newsletterCheckbox.isChecked();
      let isOffersChecked = await registrationPage.specialOffersCheckbox.isChecked();
      expect(isNewsletterChecked).toBe(true);
      expect(isOffersChecked).toBe(true);
      console.log('✓ Newsletter and special offers checkboxes checked correctly');

      await registrationPage.submitRegistration();
      await registrationPage.isAccountCreatedMessageVisible();
      await registrationPage.clickContinueAfterSuccess();

      // Logout before testing second user (otherwise we're logged in as first user)
      await registrationPage.logout();

      // Test user without offers
      await registrationPage.navigateToSignup();
      await registrationPage.performInitialSignup(userWithoutOffers.name, userWithoutOffers.email);
      await registrationPage.fillRegistrationForm(userWithoutOffers);

      isNewsletterChecked = await registrationPage.newsletterCheckbox.isChecked();
      isOffersChecked = await registrationPage.specialOffersCheckbox.isChecked();
      expect(isNewsletterChecked).toBe(false);
      expect(isOffersChecked).toBe(false);
      console.log('✓ Unchecked checkboxes remain unchecked');

      await registrationPage.submitRegistration();
      const isAccountCreated = await registrationPage.isAccountCreatedMessageVisible();
      expect(isAccountCreated).toBe(true);
      console.log('✓ Registration successful without newsletter/offers');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });
});
