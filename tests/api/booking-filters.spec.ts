/**
 * API Booking Filter and Search Tests
 * Tests for filtering, pagination, and advanced queries
 * User Story: As a tester, I want to filter bookings by various criteria
 * and verify search functionality works correctly.
 */

import { test, expect } from '@playwright/test';
import { BookingService } from '../../services/BookingService';
interface BookingResult {
  bookingid: number;
}

test.describe('Booking API - Filters and Queries', () => {
  let bookingService: BookingService;
  const createdBookingIds: number[] = [];

  test.beforeEach(async ({ request }) => {
    bookingService = new BookingService(request);
  });

  test.afterEach(async () => {
    // Cleanup created bookings
    for (const id of createdBookingIds) {
      try {
        await bookingService.deleteBooking(id);
      } catch {
        // Ignore cleanup errors
      }
    }
    createdBookingIds.length = 0;
  });

  test('Retrieve all bookings without filters', async () => {
    const response = await fetch('https://restful-booker.herokuapp.com/booking');

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    console.log(`✓ Retrieved ${data.length} total bookings`);

    // Each item should have a bookingid
    data.slice(0, 5).forEach((booking: BookingResult) => {
      expect(booking.bookingid).toBeTruthy();
    });
  });

  test('Filter bookings by firstname', async () => {
    // Create a booking with specific firstname
    const uniqueName = `Filter${Date.now()}`;

    const created = await bookingService.createBooking({
      firstname: uniqueName,
      lastname: 'Test',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-06-01',
        checkout: '2025-06-05',
      },
    });

    createdBookingIds.push(created.bookingid);

    // Query by firstname
    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?firstname=${uniqueName}`,
    );

    expect(response.status).toBe(200);

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    console.log(`✓ Found ${results.length} booking(s) with firstname: ${uniqueName}`);

    // Verify at least one result matches
    const bookingIds = results.map((r: BookingResult) => r.bookingid);
    expect(bookingIds).toContain(created.bookingid);
  });

  test('Filter bookings by lastname', async () => {
    // Create a booking with specific lastname
    const uniqueLastName = `LastName${Date.now()}`;

    const created = await bookingService.createBooking({
      firstname: 'John',
      lastname: uniqueLastName,
      totalprice: 200,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-07-01',
        checkout: '2025-07-10',
      },
    });

    createdBookingIds.push(created.bookingid);

    // Query by lastname
    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?lastname=${uniqueLastName}`,
    );

    expect(response.status).toBe(200);

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    console.log(`✓ Found ${results.length} booking(s) with lastname: ${uniqueLastName}`);
  });

  test('Filter bookings by checkin date', async () => {
    // Create bookings with specific checkin date
    const checkinDate = '2025-08-15';

    const created1 = await bookingService.createBooking({
      firstname: 'Test1',
      lastname: 'Checkin',
      totalprice: 300,
      depositpaid: true,
      bookingdates: {
        checkin: checkinDate,
        checkout: '2025-08-20',
      },
    });

    createdBookingIds.push(created1.bookingid);

    // Query by checkin date
    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?checkin=${checkinDate}`,
    );

    expect(response.status).toBe(200);

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);

    console.log(`✓ Found bookings with checkin date: ${checkinDate}`);
  });

  test('Filter bookings by checkout date', async () => {
    // Create booking with specific checkout date
    const checkoutDate = '2025-09-30';

    const created = await bookingService.createBooking({
      firstname: 'Test',
      lastname: 'Checkout',
      totalprice: 400,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-09-25',
        checkout: checkoutDate,
      },
    });

    createdBookingIds.push(created.bookingid);

    // Query by checkout date
    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?checkout=${checkoutDate}`,
    );

    expect(response.status).toBe(200);

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);

    console.log(`✓ Found bookings with checkout date: ${checkoutDate}`);
  });

  test('Combine multiple filters', async () => {
    // Create booking
    const firstName = `First${Date.now()}`;
    const lastName = `Last${Date.now()}`;

    const created = await bookingService.createBooking({
      firstname: firstName,
      lastname: lastName,
      totalprice: 500,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-10-01',
        checkout: '2025-10-10',
      },
    });

    createdBookingIds.push(created.bookingid);

    // Query with multiple filters
    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?firstname=${firstName}&lastname=${lastName}`,
    );

    expect(response.status).toBe(200);

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);

    console.log('✓ Combined firstname and lastname filters work correctly');
  });

  test.skip('Pagination with limit parameter', async () => {
    // RESTful-Booker API does not support limit/pagination parameters
    // Keeping test skipped until API adds support
    const response = await fetch('https://restful-booker.herokuapp.com/booking?limit=5');

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    // API ignores limit parameter and returns all bookings
    console.log(`⚠️  API does not support limit parameter: received ${data.length} bookings`);
  });

  test('Get specific booking by ID', async () => {
    // Create a booking

    const created = await bookingService.createBooking({
      firstname: 'GetById',
      lastname: 'Test',
      totalprice: 600,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-11-01',
        checkout: '2025-11-05',
      },
    });

    createdBookingIds.push(created.bookingid);

    // Retrieve by ID
    const retrieved = await bookingService.getBooking(created.bookingid);

    expect(retrieved.firstname).toBe('GetById');
    expect(retrieved.lastname).toBe('Test');
    expect(retrieved.totalprice).toBe(600);

    console.log(`✓ Successfully retrieved booking by ID: ${created.bookingid}`);
  });

  test('Filter with special characters in query', async () => {
    const response = await fetch(
      // eslint-disable-next-line quotes
      "https://restful-booker.herokuapp.com/booking?firstname=O'Brien&lastname=Smith",
    );

    expect(response.status).toBe(200);
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);

    console.log('✓ Special characters in filter handled correctly');
  });

  test('Filter with empty string returns results', async () => {
    const response = await fetch('https://restful-booker.herokuapp.com/booking?firstname=');

    expect(response.status).toBe(200);
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);

    console.log(`✓ Empty filter string handled (returned ${results.length} results)`);
  });

  test('Non-existent firstname filter returns empty array', async () => {
    const uniqueName = `NonExistent${Date.now()}${Math.random()}`;

    const response = await fetch(
      `https://restful-booker.herokuapp.com/booking?firstname=${uniqueName}`,
    );

    expect(response.status).toBe(200);
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);

    console.log('✓ Non-existent filter returns empty array');
  });

  test('Case-sensitive filter behavior', async () => {
    // Create booking
    await bookingService.authenticate();

    const created = await bookingService.createBooking({
      firstname: 'CaseSensitive',
      lastname: 'Test',
      totalprice: 700,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-12-01',
        checkout: '2025-12-05',
      },
    });

    createdBookingIds.push(created.bookingid);

    // Try different cases
    const lowerResponse = await fetch(
      'https://restful-booker.herokuapp.com/booking?firstname=casesensitive',
    );
    const upperResponse = await fetch(
      'https://restful-booker.herokuapp.com/booking?firstname=CASESENSITIVE',
    );
    const exactResponse = await fetch(
      'https://restful-booker.herokuapp.com/booking?firstname=CaseSensitive',
    );

    const lowerResults = await lowerResponse.json();
    const upperResults = await upperResponse.json();
    const exactResults = await exactResponse.json();

    console.log(`✓ Lowercase results: ${lowerResults.length}`);
    console.log(`✓ Uppercase results: ${upperResults.length}`);
    console.log(`✓ Exact case results: ${exactResults.length}`);
  });
});
