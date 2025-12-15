/**
 * BookingFactory - Factory Pattern Implementation
 * Generates valid, randomized booking payload objects for API testing
 * Adheres to SOLID principles and avoids Builder Pattern
 * Uses centralized test data constants for maintainability
 */

import { TEST_DATA_CONSTANTS } from './TestDataConstants';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export class BookingFactory {
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
   * Gets additional needs from centralized constants
   */
  private static get ADDITIONAL_NEEDS() {
    return TEST_DATA_CONSTANTS.ADDITIONAL_NEEDS;
  }

  /**
   * Creates a valid booking object with random data
   * @returns A complete booking object
   */
  static createBooking(overrides?: Partial<Booking>): Booking {
    const checkinDate = this.generateFutureDate();
    const checkoutDate = this.generateFutureDate(checkinDate);

    const booking: Booking = {
      firstname: this.getRandomElement(this.FIRST_NAMES),
      lastname: this.getRandomElement(this.LAST_NAMES),
      totalprice: this.generateRandomPrice(),
      depositpaid: Math.random() > 0.5,
      bookingdates: {
        checkin: checkinDate,
        checkout: checkoutDate,
      },
      additionalneeds: this.getRandomElement(this.ADDITIONAL_NEEDS),
    };

    return { ...booking, ...overrides };
  }

  /**
   * Creates a booking with minimal required fields
   * @returns A booking with only required fields
   */
  static createMinimalBooking(overrides?: Partial<Booking>): Booking {
    const checkinDate = this.generateFutureDate();
    const checkoutDate = this.generateFutureDate(checkinDate);

    const booking: Booking = {
      firstname: this.getRandomElement(this.FIRST_NAMES),
      lastname: this.getRandomElement(this.LAST_NAMES),
      totalprice: this.generateRandomPrice(),
      depositpaid: false,
      bookingdates: {
        checkin: checkinDate,
        checkout: checkoutDate,
      },
    };

    return { ...booking, ...overrides };
  }

  /**
   * Creates a booking with specific requirements
   * @param options Configuration options for booking creation
   * @returns A configured booking object
   */
  static createCustomBooking(options: {
    firstname?: string;
    lastname?: string;
    price?: number;
    depositpaid?: boolean;
    additionalneeds?: string;
    checkinDate?: string;
    checkoutDate?: string;
  }): Booking {
    const checkinDate = options.checkinDate || this.generateFutureDate();
    const checkoutDate = options.checkoutDate || this.generateFutureDate(checkinDate);

    return {
      firstname: options.firstname || this.getRandomElement(this.FIRST_NAMES),
      lastname: options.lastname || this.getRandomElement(this.LAST_NAMES),
      totalprice: options.price ?? this.generateRandomPrice(),
      depositpaid: options.depositpaid ?? Math.random() > 0.5,
      bookingdates: {
        checkin: checkinDate,
        checkout: checkoutDate,
      },
      additionalneeds: options.additionalneeds,
    };
  }

  /**
   * Creates a batch of bookings
   * @param count Number of bookings to create
   * @returns An array of booking objects
   */
  static createBatch(count: number): Booking[] {
    return Array.from({ length: count }, () => this.createBooking());
  }

  /**
   * Gets a random element from an array
   * @private
   */
  private static getRandomElement<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generates a random price using validation constraints
   * Price range: MIN to MAX from VALIDATION constants
   * @private
   */
  private static generateRandomPrice(): number {
    const { MIN, MAX } = TEST_DATA_CONSTANTS.VALIDATION.PRICE;
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  }

  /**
   * Generates a future date in YYYY-MM-DD format
   * Uses validation constants for date ranges
   * @param afterDate Optional date to generate after
   * @private
   */
  private static generateFutureDate(afterDate?: string): string {
    const date = new Date();
    const { MIN_FUTURE_DAYS, CHECKOUT_DAYS_AFTER_CHECKIN, MAX_FUTURE_DAYS } =
      TEST_DATA_CONSTANTS.VALIDATION.DATE;

    const minDays = afterDate ? MIN_FUTURE_DAYS : MIN_FUTURE_DAYS;
    const maxDays = afterDate ? CHECKOUT_DAYS_AFTER_CHECKIN : MAX_FUTURE_DAYS;
    const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;

    if (afterDate) {
      const after = new Date(afterDate);
      after.setDate(after.getDate() + randomDays);
      return this.formatDate(after);
    }

    date.setDate(date.getDate() + randomDays);
    return this.formatDate(date);
  }

  /**
   * Formats date to YYYY-MM-DD
   * @private
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
