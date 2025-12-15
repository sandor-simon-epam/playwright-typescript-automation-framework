/**
 * TestDataProvider - Provides predefined test data fixtures
 * Offers ready-to-use test data for common scenarios
 * Reduces duplication and improves test maintainability
 */

import { Booking, BookingFactory } from './BookingFactory';
import { UserDetails, UserFactory } from './UserFactory';
import { TEST_SCENARIOS } from './TestDataConstants';
import { config } from './EnvConfig';

/**
 * Collection of predefined booking data sets
 */
export class BookingDataProvider {
  /**
   * Standard valid booking - ready to use
   */
  static getStandardBooking(): Booking {
    return BookingFactory.createBooking({
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 500,
      depositpaid: true,
    });
  }

  /**
   * Minimal valid booking with required fields only
   */
  static getMinimalBooking(): Booking {
    return BookingFactory.createMinimalBooking();
  }

  /**
   * High-value booking for financial testing
   */
  static getHighValueBooking(): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'Premium',
      lastname: 'Guest',
      price: 4500,
      depositpaid: true,
      additionalneeds: 'Luxury suite with concierge',
    });
  }

  /**
   * Low-value booking for boundary testing
   */
  static getLowValueBooking(): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'Budget',
      lastname: 'Traveler',
      price: 75,
      depositpaid: false,
    });
  }

  /**
   * Booking with special requirements
   */
  static getBookingWithSpecialNeeds(): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'Special',
      lastname: 'Request',
      price: 200,
      depositpaid: true,
      additionalneeds: 'Wheelchair accessible room, pet allowed',
    });
  }

  /**
   * Booking with no deposit paid
   */
  static getNoDepositBooking(): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'No',
      lastname: 'Deposit',
      price: 300,
      depositpaid: false,
    });
  }

  /**
   * Collection of bookings for batch operations
   */
  static getBatchBookings(count: number = 3): Booking[] {
    return BookingFactory.createBatch(count);
  }

  /**
   * Get booking with specific date range
   */
  static getBookingForDateRange(checkinDate: string, checkoutDate: string): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'Date',
      lastname: 'Specific',
      checkinDate,
      checkoutDate,
    });
  }

  /**
   * Get booking with specific price
   */
  static getBookingWithPrice(price: number): Booking {
    return BookingFactory.createCustomBooking({
      firstname: 'Price',
      lastname: 'Specific',
      price,
    });
  }
}

/**
 * Collection of predefined user data sets
 */
export class UserDataProvider {
  /**
   * Standard valid user - ready to use
   */
  static getStandardUser(): UserDetails {
    return UserFactory.createUser({
      ...TEST_SCENARIOS.VALID_USER_COMPLETE,
    });
  }

  /**
   * Minimal user with required fields only
   */
  static getMinimalUser(): UserDetails {
    return UserFactory.createMinimalUser();
  }

  /**
   * User with all preferences enabled
   */
  static getUserWithPreferences(): UserDetails {
    return UserFactory.createUser({
      newsletter: true,
      specialOffers: true,
    });
  }

  /**
   * User with preferences disabled
   */
  static getUserWithoutPreferences(): UserDetails {
    return UserFactory.createUser({
      newsletter: false,
      specialOffers: false,
    });
  }

  /**
   * US-based user
   */
  static getUSUser(): UserDetails {
    return UserFactory.createCustomUser({
      country: 'United States',
      city: config.testData.defaultCity,
      firstName: 'John',
      lastName: 'Smith',
    });
  }

  /**
   * India-based user (or default country from config)
   */
  static getIndiaUser(): UserDetails {
    return UserFactory.createCustomUser({
      country: config.testData.defaultCountry,
      city: config.testData.defaultCity,
      firstName: 'Raj',
      lastName: 'Patel',
    });
  }

  /**
   * User with specific email domain
   */
  static getUserWithEmailDomain(domain: string): UserDetails {
    const firstName = 'Test';
    const lastName = 'User';
    const timestamp = Date.now();
    const customEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@${domain}`;

    return UserFactory.createCustomUser({
      firstName,
      lastName,
      email: customEmail,
    });
  }

  /**
   * User with specific password
   */
  static getUserWithPassword(password: string): UserDetails {
    return UserFactory.createCustomUser({
      password,
    });
  }

  /**
   * Corporate user (with company info)
   */
  static getCorporateUser(): UserDetails {
    const user = UserFactory.createUser();
    return {
      ...user,
      company: 'Acme Corporation',
      address2: 'Suite 100',
    };
  }

  /**
   * User from specific country
   */
  static getUserFromCountry(country: string): UserDetails {
    return UserFactory.createCustomUser({
      country,
    });
  }

  /**
   * Collection of users for batch operations
   */
  static getBatchUsers(count: number = 3): UserDetails[] {
    return UserFactory.createBatch(count);
  }

  /**
   * Collection of users with mixed preferences
   */
  static getUsersWithMixedPreferences(count: number = 3): UserDetails[] {
    const users: UserDetails[] = [];
    for (let i = 0; i < count; i++) {
      users.push(
        UserFactory.createUser({
          newsletter: i % 2 === 0,
          specialOffers: i % 2 !== 0,
        }),
      );
    }
    return users;
  }
}

/**
 * Grouped data providers for specific test scenarios
 */
export class TestScenarioProvider {
  /**
   * Complete user registration workflow data
   */
  static getCompleteRegistrationScenario(): {
    user: UserDetails;
    expectedBehavior: 'success' | 'validationError';
  } {
    return {
      user: UserFactory.createUser(TEST_SCENARIOS.VALID_USER_COMPLETE),
      expectedBehavior: 'success',
    };
  }

  /**
   * Multiple users registration scenario
   */
  static getBatchRegistrationScenario(count: number = 3): {
    users: UserDetails[];
    expectedBehavior: 'allSuccess';
  } {
    return {
      users: UserFactory.createBatch(count),
      expectedBehavior: 'allSuccess',
    };
  }

  /**
   * Complete booking lifecycle scenario
   */
  static getBookingLifecycleScenario(): {
    initialBooking: Booking;
    updateData: Partial<Booking>;
    expectedBehavior: 'success';
  } {
    const initialBooking = BookingFactory.createBooking({
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 500,
    });

    return {
      initialBooking,
      updateData: {
        firstname: 'Jane',
        lastname: 'Smith',
        totalprice: 750,
      },
      expectedBehavior: 'success',
    };
  }

  /**
   * Batch booking operations scenario
   */
  static getBatchBookingScenario(count: number = 3): {
    bookings: Booking[];
    operation: 'create' | 'update' | 'delete';
    expectedBehavior: 'allSuccess';
  } {
    return {
      bookings: BookingFactory.createBatch(count),
      operation: 'create',
      expectedBehavior: 'allSuccess',
    };
  }

  /**
   * Edge case: Maximum price booking
   */
  static getMaxPriceBookingScenario(): {
    booking: Booking;
    expectedBehavior: 'success';
  } {
    return {
      booking: BookingFactory.createCustomBooking({
        firstname: 'Max',
        lastname: 'Price',
        price: 5000,
        depositpaid: true,
      }),
      expectedBehavior: 'success',
    };
  }

  /**
   * Edge case: Minimum price booking
   */
  static getMinPriceBookingScenario(): {
    booking: Booking;
    expectedBehavior: 'success';
  } {
    return {
      booking: BookingFactory.createCustomBooking({
        firstname: 'Min',
        lastname: 'Price',
        price: 50,
        depositpaid: false,
      }),
      expectedBehavior: 'success',
    };
  }

  /**
   * Long-stay booking scenario (29 days)
   */
  static getLongStayBookingScenario(): {
    booking: Booking;
    stayDays: number;
    expectedBehavior: 'success';
  } {
    const checkin = new Date();
    checkin.setDate(checkin.getDate() + 1);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 29);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      booking: BookingFactory.createCustomBooking({
        firstname: 'Long',
        lastname: 'Stay',
        checkinDate: formatDate(checkin),
        checkoutDate: formatDate(checkout),
      }),
      stayDays: 29,
      expectedBehavior: 'success',
    };
  }
}
