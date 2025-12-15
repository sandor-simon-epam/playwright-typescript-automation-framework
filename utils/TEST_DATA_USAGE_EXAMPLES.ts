/**
 * Test Data Management - Usage Examples
 * Demonstrates best practices using the refined test data system
 */

import { expect } from '@playwright/test';
// import { test } from '@playwright/test'; // Commented out - used only in examples
import {
  BookingFactory,
  BookingDataProvider,
  UserFactory,
  UserDataProvider,
  TestScenarioProvider,
  TestDataValidator,
  assertDataValid,
  TEST_DATA_CONSTANTS,
  // TEST_SCENARIOS,
  type Booking,
  type UserDetails,
} from './index';

// ========== EXAMPLE 1: Simple Booking Creation ==========
export function example1_simpleBooking() {
  // Before refinement: Multiple hardcoded values
  // const booking = {
  //   firstname: 'John',
  //   lastname: 'Doe',
  //   totalprice: 500,
  //   depositpaid: true,
  //   bookingdates: { checkin: '2025-12-10', checkout: '2025-12-15' },
  //   additionalneeds: 'Breakfast'
  // };

  // After refinement: Clean and clear
  const booking = BookingDataProvider.getStandardBooking();
  return booking;
}

// ========== EXAMPLE 2: Custom Booking with Validation ==========
export function example2_customBookingWithValidation() {
  // Create custom booking
  const booking = BookingFactory.createCustomBooking({
    firstname: 'Premium',
    lastname: 'Guest',
    price: TEST_DATA_CONSTANTS.VALIDATION.PRICE.MAX, // Use constant
    depositpaid: true,
  });

  // Validate data before using
  assertDataValid(booking, 'booking');

  return booking;
}

// ========== EXAMPLE 3: Batch Bookings with Validation ==========
export function example3_batchBookingsWithValidation() {
  const bookings = BookingDataProvider.getBatchBookings(5);

  // Validate all bookings
  bookings.forEach((booking: Booking) => {
    const result = TestDataValidator.validateBooking(booking);

    if (!result.isValid) {
      console.error('Invalid booking:', result.errors);
      throw new Error(`Booking validation failed: ${result.errors.join(', ')}`);
    }

    if (result.warnings.length > 0) {
      console.warn('Booking warnings:', result.warnings);
    }
  });

  return bookings;
}

// ========== EXAMPLE 4: Regional User Registration ==========
export function example4_regionalUserRegistration() {
  // Get user from specific country
  const usUser = UserDataProvider.getUSUser();
  const indiaUser = UserDataProvider.getIndiaUser();

  // Validate both
  assertDataValid(usUser, 'user');
  assertDataValid(indiaUser, 'user');

  return { usUser, indiaUser };
}

// ========== EXAMPLE 5: Users with Mixed Preferences ==========
export function example5_usersWithMixedPreferences() {
  // Get batch with alternating newsletter/offers preferences
  const users = UserDataProvider.getUsersWithMixedPreferences(10);

  // Verify variety
  const withNewsletter = users.filter((u: UserDetails) => u.newsletter).length;
  const withOffers = users.filter((u: UserDetails) => u.specialOffers).length;

  console.log(`Newsletter: ${withNewsletter}/10, Offers: ${withOffers}/10`);

  return users;
}

// ========== EXAMPLE 6: Booking Lifecycle Scenario ==========
export function example6_bookingLifecycleScenario() {
  const scenario = TestScenarioProvider.getBookingLifecycleScenario();

  console.log('Initial booking:', scenario.initialBooking);
  console.log('Update data:', scenario.updateData);
  console.log('Expected outcome:', scenario.expectedBehavior);

  return scenario;
}

// ========== EXAMPLE 7: Edge Case - Max Price ==========
export function example7_maxPriceBooking() {
  const scenario = TestScenarioProvider.getMaxPriceBookingScenario();

  // Verify price is at maximum
  expect(scenario.booking.totalprice).toBe(TEST_DATA_CONSTANTS.VALIDATION.PRICE.MAX);

  return scenario;
}

// ========== EXAMPLE 8: Long Stay Booking ==========
export function example8_longStayBooking() {
  const scenario = TestScenarioProvider.getLongStayBookingScenario();

  console.log(`Booking for ${scenario.stayDays} days`);
  console.log('Checkin:', scenario.booking.bookingdates.checkin);
  console.log('Checkout:', scenario.booking.bookingdates.checkout);

  return scenario;
}

// ========== EXAMPLE 9: Accessing Constants ==========
export function example9_accessingConstants() {
  // Password requirements
  const passwordRules = TEST_DATA_CONSTANTS.VALIDATION.PASSWORD;
  console.log('Password minimum length:', passwordRules.MIN_LENGTH);
  console.log('Must include uppercase:', passwordRules.REQUIRES_UPPERCASE);

  // Email format
  const emailPattern = TEST_DATA_CONSTANTS.VALIDATION.EMAIL.PATTERN;
  const isValidEmail = emailPattern.test('test@example.com');
  console.log('Valid email:', isValidEmail);

  // Price range
  const { MIN, MAX } = TEST_DATA_CONSTANTS.VALIDATION.PRICE;
  console.log(`Price range: ${MIN} - ${MAX}`);

  return { passwordRules, emailPattern, isValidEmail };
}

// ========== EXAMPLE 10: Validation Details ==========
export function example10_validationDetails() {
  const booking = BookingFactory.createBooking({
    firstname: 'Test',
    totalprice: 100000, // Invalid - exceeds max
  });

  const result = TestDataValidator.validateBooking(booking);

  console.log('Is valid:', result.isValid);
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);

  // Errors would include:
  // - "Booking totalprice must not exceed 5000"

  return result;
}

// ========== EXAMPLE 11: Test Scenario Usage ==========
export async function example11_completeRegistrationTest() {
  // Get complete registration scenario
  const scenario = TestScenarioProvider.getCompleteRegistrationScenario();

  // Use in test
  const user = scenario.user;

  console.log('Registering user:', user.name);
  console.log('Email:', user.email);
  console.log('Expected result:', scenario.expectedBehavior);

  // In real test:
  // await registrationPage.completeRegistration(user);
  // expect(result).toBe('success');

  return scenario;
}

// ========== EXAMPLE 12: Data Provider Chaining ==========
export function example12_dataProviderChaining() {
  // Get different user types for comprehensive testing
  const standardUser = UserDataProvider.getStandardUser();
  const minimalUser = UserDataProvider.getMinimalUser();
  const corporateUser = UserDataProvider.getCorporateUser();
  const premiumUser = UserDataProvider.getUserWithEmailDomain('premium.com');

  // All validated automatically by factory
  assertDataValid(standardUser, 'user');
  assertDataValid(minimalUser, 'user');
  assertDataValid(corporateUser, 'user');
  assertDataValid(premiumUser, 'user');

  return {
    standardUser,
    minimalUser,
    corporateUser,
    premiumUser,
  };
}

// ========== EXAMPLE 13: Dynamic Test Data ==========
export function example13_dynamicTestData() {
  // Create users with specific password
  const strongPassword = 'TestPass@123456';
  const user1 = UserDataProvider.getUserWithPassword(strongPassword);

  // Create booking with specific price
  const expensiveBooking = BookingDataProvider.getBookingWithPrice(3000);
  const budgetBooking = BookingDataProvider.getBookingWithPrice(100);

  return {
    user: user1,
    expensive: expensiveBooking,
    budget: budgetBooking,
  };
}

// ========== EXAMPLE 14: Scenario-Based Testing ==========
export function example14_scenarioBasedTesting() {
  // Get all edge case scenarios
  const scenarios = {
    maxPrice: TestScenarioProvider.getMaxPriceBookingScenario(),
    minPrice: TestScenarioProvider.getMinPriceBookingScenario(),
    longStay: TestScenarioProvider.getLongStayBookingScenario(),
  };

  return scenarios;
}

// ========== EXAMPLE 15: Full Integration Test Pattern ==========
export async function example15_fullIntegrationPattern() {
  /**
   * This demonstrates the recommended pattern for using
   * the refined test data management system in real tests
   */

  // 1. Get predefined test data
  const scenario = TestScenarioProvider.getCompleteRegistrationScenario();

  // 2. Validate data (optional but recommended)
  assertDataValid(scenario.user, 'user');

  // 3. Use in test
  console.log('Test scenario:', scenario);

  // 4. Access constants if needed
  const maxPrice = TEST_DATA_CONSTANTS.VALIDATION.PRICE.MAX;
  console.log('Max price:', maxPrice);

  // 5. Create custom variations if needed
  const customUser = UserFactory.createCustomUser({
    country: 'Canada',
    email: 'custom@test.com',
  });

  // 6. Validate custom data
  assertDataValid(customUser, 'user');

  return {
    scenario,
    customUser,
    maxPrice,
  };
}

// ========== EXPORT EXAMPLES ==========
export const EXAMPLES = {
  example1_simpleBooking,
  example2_customBookingWithValidation,
  example3_batchBookingsWithValidation,
  example4_regionalUserRegistration,
  example5_usersWithMixedPreferences,
  example6_bookingLifecycleScenario,
  example7_maxPriceBooking,
  example8_longStayBooking,
  example9_accessingConstants,
  example10_validationDetails,
  example11_completeRegistrationTest,
  example12_dataProviderChaining,
  example13_dynamicTestData,
  example14_scenarioBasedTesting,
  example15_fullIntegrationPattern,
};
