/**
 * BookingService - API Service Layer
 * Handles all API calls for Restful-Booker (Auth, Create, Get, Update, Delete)
 * Implements Dependency Inversion: accepts APIRequestContext in constructor
 * Adheres to SOLID principles
 */

import { APIRequestContext, expect } from '@playwright/test';
import { Booking } from '../utils/BookingFactory';
import { config } from '../utils/EnvConfig';

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface BookingIdResponse {
  bookingid: number;
}

export interface AuthResponse {
  token: string;
}

export class BookingService {
  private readonly apiContext: APIRequestContext;
  private authToken: string = '';
  private readonly baseURL = config.api.baseUrl;

  /**
   * Constructor with Dependency Inversion
   * @param apiContext Playwright APIRequestContext instance
   */
  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  /**
   * Authenticate user and retrieve auth token
   * @returns Promise with authentication token
   */
  async authenticate(): Promise<string> {
    const response = await this.apiContext.post(`${this.baseURL}/auth`, {
      data: {
        username: config.api.auth.username,
        password: config.api.auth.password,
      },
    });

    expect(response.status()).toBe(200);
    const data = (await response.json()) as AuthResponse;
    this.authToken = data.token;
    return this.authToken;
  }

  /**
   * Create a new booking
   * @param booking Booking object to create
   * @returns Promise with created booking details
   */
  async createBooking(booking: Booking): Promise<BookingResponse> {
    const response = await this.apiContext.post(`${this.baseURL}/booking`, {
      data: booking,
    });

    expect(response.status()).toBe(200);
    const data = (await response.json()) as BookingResponse;
    return data;
  }

  /**
   * Get booking by ID
   * @param bookingId ID of the booking to retrieve
   * @returns Promise with booking details
   */
  async getBooking(bookingId: number): Promise<Booking> {
    const response = await this.apiContext.get(`${this.baseURL}/booking/${bookingId}`);

    expect(response.status()).toBe(200);
    const data = (await response.json()) as Booking;
    return data;
  }

  /**
   * Get all booking IDs
   * @returns Promise with array of booking IDs
   */
  async getAllBookingIds(): Promise<number[]> {
    const response = await this.apiContext.get(`${this.baseURL}/booking`);

    expect(response.status()).toBe(200);
    const data = (await response.json()) as BookingIdResponse[];
    return data.map((item) => item.bookingid);
  }

  /**
   * Update an existing booking
   * @param bookingId ID of the booking to update
   * @param updatedBooking Updated booking data
   * @returns Promise with updated booking details
   */
  async updateBooking(bookingId: number, updatedBooking: Partial<Booking>): Promise<Booking> {
    // Ensure we have an auth token
    if (!this.authToken) {
      await this.authenticate();
    }

    // RESTful-Booker API requires full booking object for PUT
    // Fetch current booking first
    const currentBooking = await this.getBooking(bookingId);

    // Merge updated fields with current booking
    const fullBookingData: Booking = {
      firstname: updatedBooking.firstname ?? currentBooking.firstname,
      lastname: updatedBooking.lastname ?? currentBooking.lastname,
      totalprice: updatedBooking.totalprice ?? currentBooking.totalprice,
      depositpaid: updatedBooking.depositpaid ?? currentBooking.depositpaid,
      bookingdates: updatedBooking.bookingdates ?? currentBooking.bookingdates,
      additionalneeds: updatedBooking.additionalneeds ?? currentBooking.additionalneeds,
    };

    const response = await this.apiContext.put(`${this.baseURL}/booking/${bookingId}`, {
      data: fullBookingData,
      headers: {
        Cookie: `token=${this.authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const data = (await response.json()) as Booking;
    return data;
  }

  /**
   * Partially update a booking (PATCH)
   * @param bookingId ID of the booking to patch
   * @param partialBooking Partial booking data
   * @returns Promise with patched booking details
   */
  async partialUpdateBooking(
    bookingId: number,
    partialBooking: Partial<Booking>,
  ): Promise<Booking> {
    // Ensure we have an auth token
    if (!this.authToken) {
      await this.authenticate();
    }

    const response = await this.apiContext.patch(`${this.baseURL}/booking/${bookingId}`, {
      data: partialBooking,
      headers: {
        Cookie: `token=${this.authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const data = (await response.json()) as Booking;
    return data;
  }

  /**
   * Delete a booking
   * @param bookingId ID of the booking to delete
   * @returns Promise<void>
   */
  async deleteBooking(bookingId: number): Promise<void> {
    // Ensure we have an auth token
    if (!this.authToken) {
      await this.authenticate();
    }

    const response = await this.apiContext.delete(`${this.baseURL}/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${this.authToken}`,
      },
    });

    expect(response.status()).toBe(201);
  }

  /**
   * Get the current auth token
   * @returns Current auth token or empty string
   */
  getAuthToken(): string {
    return this.authToken;
  }

  /**
   * Set auth token manually
   * @param token Token to set
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    this.authToken = '';
  }
}
