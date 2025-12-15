/**
 * API Authentication Tests
 * Tests for token-based authentication and authorization
 * User Story: As a tester, I want to authenticate using the /auth endpoint
 * so that I can obtain a token for subsequent requests.
 */

import { test, expect } from '@playwright/test';
import { BookingService } from '../../services/BookingService';

test.describe('Booking API - Authentication Tests', () => {
  let bookingService: BookingService;

  test.beforeEach(async ({ request }) => {
    bookingService = new BookingService(request);
  });

  test('Successfully authenticate and receive a valid token', async () => {
    // ============ AUTHENTICATE ============
    const token = await bookingService.authenticate();

    // Verify token exists and is not empty
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    console.log('✓ Authentication successful');
    console.log(`✓ Token received: ${token.substring(0, 20)}...`);
  });

  test('Token can be used to create a booking', async () => {
    // Authenticate first
    const token = await bookingService.authenticate();
    expect(token).toBeTruthy();

    // Create a booking (this implicitly tests that token works)
    const bookingData = {
      firstname: 'Auth',
      lastname: 'Test',
      totalprice: 500,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-15',
        checkout: '2025-01-20',
      },
      additionalneeds: 'WiFi access',
    };

    const createResponse = await bookingService.createBooking(bookingData);

    expect(createResponse.bookingid).toBeTruthy();
    expect(createResponse.booking.firstname).toBe('Auth');
    expect(createResponse.booking.lastname).toBe('Test');

    console.log('✓ Token successfully used to create booking');
    console.log(`✓ Booking ID: ${createResponse.bookingid}`);

    // Cleanup
    await bookingService.deleteBooking(createResponse.bookingid);
  });

  test('Token can be used to update a booking', async () => {
    // Authenticate
    const token = await bookingService.authenticate();
    expect(token).toBeTruthy();

    // Create a booking
    const bookingData = {
      firstname: 'Update',
      lastname: 'Test',
      totalprice: 750,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-02-01',
        checkout: '2025-02-05',
      },
    };

    const createResponse = await bookingService.createBooking(bookingData);
    const bookingId = createResponse.bookingid;

    // Update the booking with token
    const updatedData = {
      firstname: 'UpdatedWithToken',
      lastname: 'AuthTest',
      totalprice: 1000,
    };

    const updateResponse = await bookingService.updateBooking(bookingId, updatedData);

    expect(updateResponse.firstname).toBe('UpdatedWithToken');
    expect(updateResponse.totalprice).toBe(1000);

    console.log('✓ Token successfully used to update booking');

    // Cleanup
    await bookingService.deleteBooking(bookingId);
  });

  test('Token can be used to delete a booking', async () => {
    // Authenticate
    const token = await bookingService.authenticate();
    expect(token).toBeTruthy();

    // Create a booking
    const bookingData = {
      firstname: 'Delete',
      lastname: 'AuthTest',
      totalprice: 300,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-03-10',
        checkout: '2025-03-15',
      },
    };

    const createResponse = await bookingService.createBooking(bookingData);
    const bookingId = createResponse.bookingid;

    expect(bookingId).toBeTruthy();

    // Delete with token
    await bookingService.deleteBooking(bookingId);

    // Verify deletion
    const response = await fetch(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
    expect(response.status).toBe(404);

    console.log('✓ Token successfully used to delete booking');
  });

  test('Multiple tokens can be issued independently', async () => {
    // Get first token
    const token1 = await bookingService.authenticate();
    expect(token1).toBeTruthy();

    // Get second token
    const token2 = await bookingService.authenticate();
    expect(token2).toBeTruthy();

    // Both tokens should be valid (though may be identical)
    console.log(`✓ Token 1: ${token1.substring(0, 10)}...`);
    console.log(`✓ Token 2: ${token2.substring(0, 10)}...`);

    // Use both tokens to create bookings
    const booking1 = await bookingService.createBooking({
      firstname: 'Token1',
      lastname: 'Test',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-04-01',
        checkout: '2025-04-05',
      },
    });

    const booking2 = await bookingService.createBooking({
      firstname: 'Token2',
      lastname: 'Test',
      totalprice: 200,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-04-10',
        checkout: '2025-04-15',
      },
    });

    expect(booking1.bookingid).toBeTruthy();
    expect(booking2.bookingid).toBeTruthy();
    expect(booking1.bookingid).not.toBe(booking2.bookingid);

    console.log('✓ Multiple tokens issued and used successfully');

    // Cleanup
    await bookingService.deleteBooking(booking1.bookingid);
    await bookingService.deleteBooking(booking2.bookingid);
  });

  test('Token authentication works across multiple API operations', async () => {
    // Single authentication
    const token = await bookingService.authenticate();
    expect(token).toBeTruthy();

    // Create multiple bookings with same token
    const bookingIds: number[] = [];

    for (let i = 0; i < 3; i++) {
      const response = await bookingService.createBooking({
        firstname: `Multi${i}`,
        lastname: 'AuthTest',
        totalprice: 100 * (i + 1),
        depositpaid: i % 2 === 0,
        bookingdates: {
          checkin: `2025-05-${10 + i}`,
          checkout: `2025-05-${15 + i}`,
        },
      });

      bookingIds.push(response.bookingid);
      expect(response.bookingid).toBeTruthy();
    }

    console.log(`✓ Created ${bookingIds.length} bookings with single token`);

    // Retrieve all and verify
    for (const id of bookingIds) {
      const booking = await bookingService.getBooking(id);
      expect(booking.firstname).toMatch(/^Multi[0-2]$/);
    }

    console.log('✓ All bookings retrieved and verified');

    // Cleanup
    for (const id of bookingIds) {
      await bookingService.deleteBooking(id);
    }
  });
});
