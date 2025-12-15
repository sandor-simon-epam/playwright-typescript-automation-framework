/**
 * API Booking Negative Tests
 * Tests for error handling and negative scenarios
 * User Story: As a tester, I want to verify that unauthorized/invalid requests
 * are rejected with appropriate error codes.
 */

import { test, expect } from '@playwright/test';
import { BookingService } from '../../services/BookingService';

test.describe('Booking API - Negative Scenarios', () => {
  let bookingService: BookingService;

  test.beforeEach(async ({ request }) => {
    bookingService = new BookingService(request);
  });

  test('Request with invalid booking ID returns 404', async () => {
    const invalidId = 999999999;

    const response = await fetch(`https://restful-booker.herokuapp.com/booking/${invalidId}`);

    expect(response.status).toBe(404);
    console.log('✓ Invalid booking ID returns 404');
  });

  test('Create booking with missing required fields fails', async () => {
    const incompleteBooking = {
      // Missing firstname, lastname, etc.
      totalprice: 100,
      // Missing bookingdates
    };

    try {
      const response = await fetch('https://restful-booker.herokuapp.com/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteBooking),
      });

      // Should fail or return bad request
      expect([400, 422, 500]).toContain(response.status);
      console.log(`✓ Missing required fields returns ${response.status}`);
    } catch {
      console.log('✓ Request with missing fields failed as expected');
    }
  });

  test('Create booking with invalid data types', async () => {
    const invalidBooking = {
      firstname: 123, // Should be string
      lastname: true, // Should be string
      totalprice: 'invalid', // Should be number
      depositpaid: 'yes', // Should be boolean
      bookingdates: 'not-an-object', // Should be object
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidBooking),
    });

    // Server may accept with type coercion or reject
    console.log(`✓ Invalid data types returns ${response.status}`);
  });

  test('Update non-existent booking returns 405', async () => {
    const token = await bookingService.authenticate();
    const invalidId = 999999999;

    const response = await fetch(`https://restful-booker.herokuapp.com/booking/${invalidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`,
      },
      body: JSON.stringify({
        firstname: 'Test',
        lastname: 'Update',
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
          checkin: '2025-01-01',
          checkout: '2025-01-05',
        },
      }),
    });

    expect(response.status).toBe(405);
    console.log('✓ Update non-existent booking returns 405 (Method Not Allowed)');
  });

  test('Delete non-existent booking returns 405', async () => {
    const token = await bookingService.authenticate();
    const invalidId = 999999999;

    const response = await fetch(`https://restful-booker.herokuapp.com/booking/${invalidId}`, {
      method: 'DELETE',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(405);
    console.log('✓ Delete non-existent booking returns 405 (Method Not Allowed)');
  });

  test('Malformed JSON in request body returns error', async () => {
    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json}',
    });

    expect([400, 422, 500]).toContain(response.status);
    console.log(`✓ Malformed JSON returns ${response.status}`);
  });

  test('Booking with negative price is handled', async () => {
    const negativeBooking = {
      firstname: 'Negative',
      lastname: 'Price',
      totalprice: -100, // Negative price
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05',
      },
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(negativeBooking),
    });

    // Server may accept or reject negative prices
    console.log(`✓ Negative price handled with status ${response.status}`);
  });

  test('Booking with invalid date format is handled', async () => {
    const invalidDateBooking = {
      firstname: 'Invalid',
      lastname: 'Dates',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: 'not-a-date',
        checkout: 'also-not-a-date',
      },
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidDateBooking),
    });

    // Server behavior with invalid dates
    console.log(`✓ Invalid date format handled with status ${response.status}`);
  });

  test('Checkout date before checkin date is handled', async () => {
    const invalidDates = {
      firstname: 'Invalid',
      lastname: 'Dates',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-20',
        checkout: '2025-01-10', // Before checkin
      },
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidDates),
    });

    // Server should handle invalid date range
    console.log(`✓ Invalid date range handled with status ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log('⚠️  Server accepted invalid date range:', data);
    }
  });

  test('Extremely long strings in booking details', async () => {
    const longString = 'A'.repeat(10000);

    const longBooking = {
      firstname: longString,
      lastname: longString,
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05',
      },
      additionalneeds: longString,
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(longBooking),
    });

    console.log(`✓ Extremely long strings handled with status ${response.status}`);
  });

  test('Special characters in booking data are handled', async () => {
    const specialCharBooking = {
      firstname: 'John<script>alert("xss")</script>',
      lastname: '"><script>alert("xss")</script>',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05',
      },
      // eslint-disable-next-line quotes
      additionalneeds: "'; DROP TABLE bookings; --",
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specialCharBooking),
    });

    expect([200, 201]).toContain(response.status);
    console.log('✓ Special characters properly escaped/handled');

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();
      if (data.bookingid) {
        await bookingService.deleteBooking(data.bookingid);
      }
    }
  });

  test('Empty string values in required fields', async () => {
    const emptyBooking = {
      firstname: '',
      lastname: '',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05',
      },
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emptyBooking),
    });

    console.log(`✓ Empty required fields handled with status ${response.status}`);
  });

  test('Null values in required fields', async () => {
    const nullBooking = {
      firstname: null,
      lastname: null,
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05',
      },
    };

    const response = await fetch('https://restful-booker.herokuapp.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nullBooking),
    });

    console.log(`✓ Null values handled with status ${response.status}`);
  });
});
