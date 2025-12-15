/**
 * UserFactory - Factory Pattern Implementation
 * Generates valid, randomized user details for registration testing
 * Adheres to SOLID principles and avoids Builder Pattern
 * Uses centralized test data constants for maintainability
 */

import { TEST_DATA_CONSTANTS } from './TestDataConstants';

export interface UserDetails {
  title: 'Mr.' | 'Mrs.';
  name: string;
  email: string;
  password: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  newsletter: boolean;
  specialOffers: boolean;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class UserFactory {
  /**
   * Gets first names from centralized constants
   */
  private static get FIRST_NAMES() {
    return TEST_DATA_CONSTANTS.FIRST_NAMES;
  }

  /**
   * Gets last names from centralized constants
   */
  private static get LAST_NAMES() {
    return TEST_DATA_CONSTANTS.LAST_NAMES;
  }

  /**
   * Gets companies from centralized constants
   */
  private static get COMPANIES() {
    return TEST_DATA_CONSTANTS.COMPANIES;
  }

  /**
   * Gets cities from centralized constants
   */
  private static get CITIES() {
    return TEST_DATA_CONSTANTS.CITIES;
  }

  /**
   * Gets countries from centralized constants
   */
  private static get COUNTRIES() {
    return TEST_DATA_CONSTANTS.COUNTRIES;
  }

  /**
   * Creates a complete user registration object with random data
   * @returns A complete user details object
   */
  static createUser(overrides?: Partial<UserDetails>): UserDetails {
    const firstName = this.getRandomElement(this.FIRST_NAMES);
    const lastName = this.getRandomElement(this.LAST_NAMES);
    const email = this.generateRandomEmail(firstName, lastName);

    const user: UserDetails = {
      title: this.getRandomElement<'Mr.' | 'Mrs.'>(['Mr.', 'Mrs.']),
      name: `${firstName} ${lastName}`,
      email: email,
      password: this.generateRandomPassword(),
      dayOfBirth: this.getRandomDay(),
      monthOfBirth: this.getRandomMonth(),
      yearOfBirth: this.getRandomYear(),
      newsletter: Math.random() > 0.5,
      specialOffers: Math.random() > 0.5,
      firstName: firstName,
      lastName: lastName,
      company: this.getRandomElement(this.COMPANIES),
      address1: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
      address2: `Apt ${Math.floor(Math.random() * 500) + 1}`,
      country: this.getRandomElement(this.COUNTRIES),
      state: `State${Math.floor(Math.random() * 50) + 1}`,
      city: this.getRandomElement(this.CITIES),
      zipcode: this.generateRandomZipcode(),
      mobileNumber: this.generateRandomPhoneNumber(),
    };

    return { ...user, ...overrides };
  }

  /**
   * Creates a user with minimal required fields only
   * @returns A user with only required fields filled
   */
  static createMinimalUser(overrides?: Partial<UserDetails>): UserDetails {
    const firstName = this.getRandomElement(this.FIRST_NAMES);
    const lastName = this.getRandomElement(this.LAST_NAMES);
    const email = this.generateRandomEmail(firstName, lastName);

    const user: UserDetails = {
      title: 'Mr.',
      name: `${firstName} ${lastName}`,
      email: email,
      password: 'Test@12345',
      dayOfBirth: '15',
      monthOfBirth: 'March',
      yearOfBirth: '1990',
      newsletter: false,
      specialOffers: false,
      firstName: firstName,
      lastName: lastName,
      company: '',
      address1: '123 Test Street',
      address2: '',
      country: 'India',
      state: 'State1',
      city: 'New York',
      zipcode: '10001',
      mobileNumber: '9876543210',
    };

    return { ...user, ...overrides };
  }

  /**
   * Creates a user with specific requirements
   * @param options Configuration options for user creation
   * @returns A configured user object
   */
  static createCustomUser(options: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    country?: string;
    city?: string;
    title?: 'Mr.' | 'Mrs.';
    newsletter?: boolean;
    specialOffers?: boolean;
  }): UserDetails {
    const firstName = options.firstName || this.getRandomElement(this.FIRST_NAMES);
    const lastName = options.lastName || this.getRandomElement(this.LAST_NAMES);
    const email = options.email || this.generateRandomEmail(firstName, lastName);

    return {
      title: options.title || 'Mr.',
      name: `${firstName} ${lastName}`,
      email: email,
      password: options.password || this.generateRandomPassword(),
      dayOfBirth: this.getRandomDay(),
      monthOfBirth: this.getRandomMonth(),
      yearOfBirth: this.getRandomYear(),
      newsletter: options.newsletter ?? false,
      specialOffers: options.specialOffers ?? false,
      firstName: firstName,
      lastName: lastName,
      company: this.getRandomElement(this.COMPANIES),
      address1: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
      address2: `Apt ${Math.floor(Math.random() * 500) + 1}`,
      country: options.country || this.getRandomElement(this.COUNTRIES),
      state: `State${Math.floor(Math.random() * 50) + 1}`,
      city: options.city || this.getRandomElement(this.CITIES),
      zipcode: this.generateRandomZipcode(),
      mobileNumber: this.generateRandomPhoneNumber(),
    };
  }

  /**
   * Creates a batch of users
   * @param count Number of users to create
   * @returns An array of user details objects
   */
  static createBatch(count: number): UserDetails[] {
    return Array.from({ length: count }, () => this.createUser());
  }

  /**
   * Gets a random element from an array
   * @private
   */
  private static getRandomElement<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generates a random email
   * @private
   */
  /**
   * Generates random email using centralized email domains
   * Includes timestamp for uniqueness
   * @private
   */
  private static generateRandomEmail(firstName: string, lastName: string): string {
    const timestamp = Date.now();
    const domain = this.getRandomElement(TEST_DATA_CONSTANTS.EMAIL_DOMAINS);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@${domain}`;
  }

  /**
   * Generates a random password using centralized character sets
   * Meets all security requirements from validation constants
   * @private
   */
  private static generateRandomPassword(): string {
    const { UPPERCASE, LOWERCASE, NUMBERS, SPECIAL } = TEST_DATA_CONSTANTS.CHARACTERS;

    const randomUpper = this.getRandomElement(UPPERCASE.split(''));
    const randomLower = this.getRandomElement(LOWERCASE.split(''));
    const randomNumber = this.getRandomElement(NUMBERS.split(''));
    const randomSpecial = this.getRandomElement(SPECIAL.split(''));

    const remaining = (UPPERCASE + LOWERCASE + NUMBERS + SPECIAL)
      .split('')
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .join('');

    return (randomUpper + randomLower + randomNumber + randomSpecial + remaining)
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generates a random day (1-28) avoiding day 29-31 for month compatibility
   * @private
   */
  private static getRandomDay(): string {
    const day = Math.floor(Math.random() * TEST_DATA_CONSTANTS.DATE_RANGES.BIRTH_DAY_MAX) + 1;
    return day.toString();
  }

  /**
   * Generates a random month using centralized constants
   * @private
   */
  private static getRandomMonth(): string {
    return this.getRandomElement(TEST_DATA_CONSTANTS.MONTHS);
  }

  /**
   * Generates a random year from BIRTH_YEAR_MIN to BIRTH_YEAR_MAX
   * @private
   */
  private static getRandomYear(): string {
    const { BIRTH_YEAR_MIN, BIRTH_YEAR_MAX } = TEST_DATA_CONSTANTS.DATE_RANGES;
    const year = Math.floor(Math.random() * (BIRTH_YEAR_MAX - BIRTH_YEAR_MIN + 1)) + BIRTH_YEAR_MIN;
    return year.toString();
  }

  /**
   * Generates a random zipcode (5 digits)
   * @private
   */
  private static generateRandomZipcode(): string {
    const { MIN, MAX } = TEST_DATA_CONSTANTS.VALIDATION.ZIPCODE;
    return Math.floor(Math.random() * (MAX - MIN + 1) + MIN).toString();
  }

  /**
   * Generates a random phone number
   * @private
   */
  private static generateRandomPhoneNumber(): string {
    const prefix = Math.floor(Math.random() * 900) + 100;
    const middle = Math.floor(Math.random() * 900) + 100;
    const last = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${middle}${last}`;
  }
}
