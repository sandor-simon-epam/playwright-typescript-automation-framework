/**
 * TestDataValidator - Validates generated test data
 * Ensures all generated data meets business and technical requirements
 * Provides detailed validation feedback for debugging
 */

import { TEST_DATA_CONSTANTS } from './TestDataConstants';
import { Booking } from './BookingFactory';
import { UserDetails } from './UserFactory';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TestDataValidator {
  /**
   * Validates a booking object
   * @param booking The booking to validate
   * @returns Validation result with errors and warnings
   */
  static validateBooking(booking: Booking): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!booking.firstname || booking.firstname.trim().length === 0) {
      errors.push('Booking firstname is required');
    }

    if (!booking.lastname || booking.lastname.trim().length === 0) {
      errors.push('Booking lastname is required');
    }

    // Name length validation
    if (booking.firstname?.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `Booking firstname exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    if (booking.lastname?.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `Booking lastname exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    // Price validation
    if (typeof booking.totalprice !== 'number') {
      errors.push('Booking totalprice must be a number');
    } else {
      if (booking.totalprice < TEST_DATA_CONSTANTS.VALIDATION.PRICE.MIN) {
        errors.push(
          `Booking totalprice must be at least ${TEST_DATA_CONSTANTS.VALIDATION.PRICE.MIN}`,
        );
      }

      if (booking.totalprice > TEST_DATA_CONSTANTS.VALIDATION.PRICE.MAX) {
        errors.push(
          `Booking totalprice must not exceed ${TEST_DATA_CONSTANTS.VALIDATION.PRICE.MAX}`,
        );
      }
    }

    // Deposit paid validation
    if (typeof booking.depositpaid !== 'boolean') {
      errors.push('Booking depositpaid must be a boolean');
    }

    // Dates validation
    if (!booking.bookingdates) {
      errors.push('Booking bookingdates is required');
    } else {
      const checkinValid = this.isValidDateFormat(booking.bookingdates.checkin);
      const checkoutValid = this.isValidDateFormat(booking.bookingdates.checkout);

      if (!checkinValid) {
        errors.push('Booking checkin date must be in YYYY-MM-DD format');
      }

      if (!checkoutValid) {
        errors.push('Booking checkout date must be in YYYY-MM-DD format');
      }

      if (checkinValid && checkoutValid) {
        const checkin = new Date(booking.bookingdates.checkin);
        const checkout = new Date(booking.bookingdates.checkout);

        if (checkout <= checkin) {
          errors.push('Booking checkout date must be after checkin date');
        }

        // Warn if checkout is more than 30 days after checkin
        const daysDiff = Math.floor(
          (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff > TEST_DATA_CONSTANTS.VALIDATION.DATE.CHECKOUT_DAYS_AFTER_CHECKIN) {
          warnings.push(
            `Booking checkout is ${daysDiff} days after checkin (typically max 30 days)`,
          );
        }
      }
    }

    // Additional needs validation (optional field)
    if (
      booking.additionalneeds &&
      booking.additionalneeds.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH
    ) {
      errors.push(
        `Booking additionalneeds exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a user details object
   * @param user The user to validate
   * @returns Validation result with errors and warnings
   */
  static validateUser(user: UserDetails): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!['Mr.', 'Mrs.'].includes(user.title)) {
      errors.push('User title must be Mr. or Mrs.');
    }

    // Name validation
    if (!user.name || user.name.trim().length === 0) {
      errors.push('User name is required');
    } else if (user.name.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `User name exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    // First and last name
    if (!user.firstName || user.firstName.trim().length === 0) {
      errors.push('User firstName is required');
    }

    if (!user.lastName || user.lastName.trim().length === 0) {
      errors.push('User lastName is required');
    }

    // Email validation
    if (!user.email || user.email.trim().length === 0) {
      errors.push('User email is required');
    } else if (!this.isValidEmail(user.email)) {
      errors.push('User email format is invalid');
    } else if (user.email.length > TEST_DATA_CONSTANTS.VALIDATION.EMAIL.MAX_LENGTH) {
      errors.push(
        `User email exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.EMAIL.MAX_LENGTH}`,
      );
    }

    // Password validation
    if (!user.password || user.password.trim().length === 0) {
      errors.push('User password is required');
    } else {
      const passwordValidation = this.validatePassword(user.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    // Date of birth validation
    if (!user.dayOfBirth || !user.monthOfBirth || !user.yearOfBirth) {
      errors.push('User date of birth (day, month, year) is required');
    } else {
      const dobValid = this.isValidDateOfBirth(
        user.dayOfBirth,
        user.monthOfBirth,
        user.yearOfBirth,
      );
      if (!dobValid) {
        errors.push(
          'User date of birth is invalid (day: 1-31, month: valid month name, year: 1950-2010)',
        );
      }
    }

    // Newsletter and special offers (boolean)
    if (typeof user.newsletter !== 'boolean') {
      errors.push('User newsletter must be a boolean');
    }

    if (typeof user.specialOffers !== 'boolean') {
      errors.push('User specialOffers must be a boolean');
    }

    // Address validation
    if (!user.address1 || user.address1.trim().length === 0) {
      errors.push('User address1 is required');
    }

    // Country validation
    if (!user.country || user.country.trim().length === 0) {
      errors.push('User country is required');
    }

    // State validation
    if (!user.state || user.state.trim().length === 0) {
      errors.push('User state is required');
    }

    // City validation
    if (!user.city || user.city.trim().length === 0) {
      errors.push('User city is required');
    }

    // Zipcode validation
    if (!user.zipcode || user.zipcode.trim().length === 0) {
      errors.push('User zipcode is required');
    } else if (!/^\d{5}$/.test(user.zipcode)) {
      warnings.push('User zipcode should be 5 digits');
    }

    // Mobile number validation
    if (!user.mobileNumber || user.mobileNumber.trim().length === 0) {
      errors.push('User mobileNumber is required');
    } else if (
      user.mobileNumber.length < TEST_DATA_CONSTANTS.VALIDATION.PHONE.MIN_LENGTH ||
      user.mobileNumber.length > TEST_DATA_CONSTANTS.VALIDATION.PHONE.MAX_LENGTH
    ) {
      warnings.push(
        `User mobileNumber should be between ${TEST_DATA_CONSTANTS.VALIDATION.PHONE.MIN_LENGTH}-${TEST_DATA_CONSTANTS.VALIDATION.PHONE.MAX_LENGTH} digits`,
      );
    }

    // Company (optional)
    if (user.company && user.company.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `User company exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    // Address2 (optional)
    if (user.address2 && user.address2.length > TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `User address2 exceeds max length of ${TEST_DATA_CONSTANTS.VALIDATION.NAME.MAX_LENGTH}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a password meets security requirements
   * @private
   */
  private static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (TEST_DATA_CONSTANTS.VALIDATION.PASSWORD.REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (TEST_DATA_CONSTANTS.VALIDATION.PASSWORD.REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (TEST_DATA_CONSTANTS.VALIDATION.PASSWORD.REQUIRES_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (TEST_DATA_CONSTANTS.VALIDATION.PASSWORD.REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validates email format
   * @private
   */
  private static isValidEmail(email: string): boolean {
    return TEST_DATA_CONSTANTS.VALIDATION.EMAIL.PATTERN.test(email);
  }

  /**
   * Validates date format (YYYY-MM-DD)
   * @private
   */
  private static isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validates date of birth components
   * @private
   */
  private static isValidDateOfBirth(day: string, month: string, year: string): boolean {
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);

    // Validate day
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return false;

    // Validate month
    const validMonths = TEST_DATA_CONSTANTS.MONTHS as readonly string[];
    if (!validMonths.includes(month)) return false;

    // Validate year
    if (
      isNaN(yearNum) ||
      yearNum < TEST_DATA_CONSTANTS.DATE_RANGES.BIRTH_YEAR_MIN ||
      yearNum > TEST_DATA_CONSTANTS.DATE_RANGES.BIRTH_YEAR_MAX
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Assertion helper for use in tests
 */
export function assertDataValid(data: Booking | UserDetails, dataType: 'booking' | 'user') {
  const result =
    dataType === 'booking'
      ? TestDataValidator.validateBooking(data as Booking)
      : TestDataValidator.validateUser(data as UserDetails);

  if (!result.isValid) {
    throw new Error(`Invalid ${dataType} data:\n${result.errors.map((e) => `- ${e}`).join('\n')}`);
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️ Warnings for ${dataType}:`, result.warnings);
  }
}
