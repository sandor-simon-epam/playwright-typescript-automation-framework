/**
 * TestDataConstants - Centralized test data constants
 * Manages all predefined test data used across factories and tests
 * Ensures consistency and maintainability of test data sources
 */

export const TEST_DATA_CONSTANTS = {
  // ========== NAMES ==========
  FIRST_NAMES: [
    'John',
    'Jane',
    'Michael',
    'Sarah',
    'David',
    'Emma',
    'James',
    'Olivia',
    'Robert',
    'Sophia',
  ],

  LAST_NAMES: [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
  ],

  // ========== LOCATION DATA ==========
  COUNTRIES: [
    'India',
    'United States',
    'Canada',
    'Australia',
    'Israel',
    'New Zealand',
    'Singapore',
  ],

  CITIES: [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
  ],

  STATES: Array.from({ length: 50 }, (_, i) => `State${i + 1}`),

  // ========== BOOKING DATA ==========
  ADDITIONAL_NEEDS: [
    'Breakfast',
    'Late checkout',
    'Extra pillows',
    'Rollaway bed',
    'High chair',
    'Crib',
    'Pet friendly',
    'Smoking room',
    'Non-smoking room',
    'Quiet room',
  ],

  // ========== COMPANY DATA ==========
  COMPANIES: [
    'Tech Corp',
    'Digital Solutions',
    'Cloud Systems',
    'Data Labs',
    'Innovation Inc',
    'Future Tech',
    'Smart Systems',
    'Tech Innovations',
  ],

  // ========== EMAIL DOMAINS ==========
  EMAIL_DOMAINS: ['gmail.com', 'yahoo.com', 'outlook.com', 'test.com'],

  // ========== VALIDATION RULES ==========
  VALIDATION: {
    // Password requirements
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRES_UPPERCASE: true,
      REQUIRES_LOWERCASE: true,
      REQUIRES_NUMBERS: true,
      REQUIRES_SPECIAL: true,
    },

    // Email validation
    EMAIL: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 254,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Phone number
    PHONE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 15,
    },

    // Price range
    PRICE: {
      MIN: 50,
      MAX: 5000,
    },

    // Date ranges
    DATE: {
      MIN_FUTURE_DAYS: 1,
      MAX_FUTURE_DAYS: 365,
      CHECKOUT_DAYS_AFTER_CHECKIN: 30,
    },

    // Booking name length
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },

    // Zipcode
    ZIPCODE: {
      MIN: 10000,
      MAX: 99999,
    },
  },

  // ========== MONTHS ==========
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  // ========== DATE RANGES ==========
  DATE_RANGES: {
    BIRTH_YEAR_MIN: 1950,
    BIRTH_YEAR_MAX: 2010,
    BIRTH_DAY_MAX: 28, // Avoid day 29-31 to ensure all months work
  },

  // ========== CHARACTER SETS ==========
  CHARACTERS: {
    UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
    NUMBERS: '0123456789',
    SPECIAL: '!@#$%^&*',
  },
} as const;

/**
 * Predefined test scenarios for specific use cases
 */
export const TEST_SCENARIOS = {
  // Valid complete user registration
  VALID_USER_COMPLETE: {
    title: 'Mr.',
    newsletter: true,
    specialOffers: true,
  },

  // Valid minimal user registration
  VALID_USER_MINIMAL: {
    title: 'Mr.',
    newsletter: false,
    specialOffers: false,
  },

  // Valid complete booking
  VALID_BOOKING_COMPLETE: {
    depositpaid: true,
  },

  // Valid minimal booking
  VALID_BOOKING_MINIMAL: {
    depositpaid: false,
  },

  // High-value booking scenario
  HIGH_VALUE_BOOKING: {
    price: 4500,
    depositpaid: true,
  },

  // Low-value booking scenario
  LOW_VALUE_BOOKING: {
    price: 100,
    depositpaid: false,
  },
} as const;
