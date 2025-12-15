/**
 * Test Data Management - Central Export Point
 * Aggregates all test data utilities for easy imports
 *
 * Usage:
 *   import { BookingFactory, UserFactory, TestDataValidator } from '@utils';
 *   import { ModalHandler } from '@utils';
 */

// Factories
export { BookingFactory } from './BookingFactory';
export type { Booking, BookingDates } from './BookingFactory';
export { UserFactory } from './UserFactory';
export type { UserDetails } from './UserFactory';

// Data providers and fixtures
export { BookingDataProvider, UserDataProvider, TestScenarioProvider } from './TestDataProvider';

// Validators
export { TestDataValidator, assertDataValid } from './TestDataValidator';
export type { ValidationResult } from './TestDataValidator';

// Modal handling
export { ModalHandler } from './ModalHandler';
export type { ModalConfig } from './ModalHandler';

// Constants
export { TEST_DATA_CONSTANTS, TEST_SCENARIOS } from './TestDataConstants';

// Environment configuration
export { config } from './EnvConfig';
export type { EnvConfig } from './EnvConfig';
