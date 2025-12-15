# Playwright TypeScript Automation Framework

A comprehensive, enterprise-grade Playwright automation framework using TypeScript with support for both API and UI/E2E testing. Built with SOLID principles, Page Object Model (POM), and Factory Pattern for scalability and maintainability.

## 🎯 Framework Architecture

The framework is organized into distinct layers to maintain separation of concerns and adhere to SOLID principles:

```
playwright-typescript-automation-framework/
├── tests/
│   ├── api/                 # API tests (Mini Project 1)
│   ├── ui/                  # UI/E2E tests (Mini Project 2)
│   └── fixtures/            # Test fixtures and setup
├── pages/                   # Page Object Models
├── services/                # Business logic and API services
├── utils/                   # Factories and utilities
├── config/                  # Configuration files
├── playwright.config.ts     # Playwright configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── README.md               # Documentation
```

## 📋 Projects

### Mini Project 1: API Testing

**Target**: [RESTful Booker API](https://restful-booker.herokuapp.com/)

Tests for CRUD operations on the Restful-Booker API:

- **Authentication**: Obtain auth tokens
- **Create**: Add new bookings
- **Read**: Retrieve booking details
- **Update**: Modify existing bookings (PUT)
- **Partial Update**: Update specific fields (PATCH)
- **Delete**: Remove bookings

**Key Files**:

- `utils/BookingFactory.ts` - Factory Pattern for generating booking data
- `services/BookingService.ts` - API service layer with dependency injection
- `tests/api/booking.spec.ts` - Comprehensive CRUD test suite

### Mini Project 2: UI/E2E Testing

**Target**: [Automation Exercise](https://automationexercise.com/)

End-to-end testing for user registration workflow:

- **Navigation**: Access signup/login page
- **Registration**: Fill out complete registration form
- **Verification**: Confirm account creation success
- **Data Validation**: Verify all form fields are persisted correctly

**Key Files**:

- `utils/UserFactory.ts` - Factory Pattern for generating user data
- `pages/RegistrationPage.ts` - Page Object Model for registration page
- `tests/ui/registration.spec.ts` - Complete E2E registration tests

## 🏗️ Design Patterns

### Factory Pattern

Used for data generation in both API and UI testing:

```typescript
// API Testing
const booking = BookingFactory.createBooking({
  /* overrides */
});
const bookings = BookingFactory.createBatch(5);

// UI Testing
const user = UserFactory.createUser({
  /* overrides */
});
const users = UserFactory.createBatch(3);
```

### Page Object Model (POM)

Encapsulates page interactions and locators:

```typescript
const registrationPage = new RegistrationPage(page);
await registrationPage.completeRegistration(userDetails);
const isSuccess = await registrationPage.isAccountCreatedMessageVisible();
```

### Dependency Inversion

Services accept dependencies through constructors:

```typescript
const bookingService = new BookingService(request); // Inject APIRequestContext
await bookingService.authenticate();
await bookingService.createBooking(booking);
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Install Playwright browsers**:

```bash
npx playwright install
```

### Configuration

The framework automatically configures two Playwright projects:

- **API Project**: Uses `https://restful-booker.herokuapp.com` as base URL
- **E2E Project**: Uses `https://automationexercise.com` as base URL

## 📝 Running Tests

### Run all tests

```bash
npm test
```

### Run API tests only

```bash
npm run test:api
```

### Run UI/E2E tests only

```bash
npm run test:ui
```

### Run tests in headed mode (visible browser)

```bash
npm run test:ui:headed
```

### Debug mode

```bash
npm run test:debug
```

## 📊 Reporting

### Generate Allure Report

```bash
npm run allure:report
```

### Serve Allure Results

```bash
npm run allure:serve
```

## 🧹 Code Quality

### Linting

```bash
npm run lint           # Check for errors
npm run lint:fix       # Fix linting errors
```

### Formatting

```bash
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted
```

## 📚 API Testing Guide

### Authentication

```typescript
const bookingService = new BookingService(request);
const token = await bookingService.authenticate();
```

### Creating Bookings

```typescript
// Random booking
const booking = BookingFactory.createBooking();

// Custom booking
const booking = BookingFactory.createCustomBooking({
  firstname: 'John',
  lastname: 'Doe',
  price: 1500,
  checkinDate: '2025-12-20',
  checkoutDate: '2025-12-25',
});

// Create via API
const response = await bookingService.createBooking(booking);
const bookingId = response.bookingid;
```

### Updating Bookings

```typescript
// Full update (PUT)
const updated = await bookingService.updateBooking(bookingId, {
  firstname: 'Jane',
  lastname: 'Smith',
});

// Partial update (PATCH)
const patched = await bookingService.partialUpdateBooking(bookingId, {
  additionalneeds: 'Extra bed',
});
```

### Deleting Bookings

```typescript
await bookingService.deleteBooking(bookingId);
```

## 🎨 UI Testing Guide

### Using the RegistrationPage POM

```typescript
const registrationPage = new RegistrationPage(page);

// Navigate to signup
await registrationPage.navigateToSignup();

// Generate user data
const user = UserFactory.createUser();

// Complete registration in one step
await registrationPage.completeRegistration(user);

// Verify success
const isSuccess = await registrationPage.isAccountCreatedMessageVisible();
expect(isSuccess).toBe(true);
```

### Step-by-step registration

```typescript
// Initial signup (name + email)
await registrationPage.performInitialSignup(user.name, user.email);

// Fill detailed form
await registrationPage.fillRegistrationForm(user);

// Submit
await registrationPage.submitRegistration();

// Verify
const successMessage = await registrationPage.getSuccessMessageText();
```

## 🏭 Factory Pattern Usage

### BookingFactory

```typescript
// Full booking with random data
BookingFactory.createBooking();

// Minimal booking (required fields only)
BookingFactory.createMinimalBooking();

// Custom booking with specific fields
BookingFactory.createCustomBooking({
  firstname: 'John',
  price: 2000,
});

// Batch creation
BookingFactory.createBatch(5);
```

### UserFactory

```typescript
// Full user with random data
UserFactory.createUser();

// Minimal user
UserFactory.createMinimalUser();

// Custom user
UserFactory.createCustomUser({
  firstName: 'John',
  country: 'United States',
});

// Batch creation
UserFactory.createBatch(3);
```

## 🔐 Best Practices

1. **Use Factories**: Always use factory methods for test data generation
2. **Page Objects**: Interact with pages through POM methods, not direct locators in tests
3. **Dependency Injection**: Pass dependencies through constructors
4. **Meaningful Assertions**: Use clear assertions with helpful error messages
5. **Logging**: Add console logs for better test visibility
6. **Separation of Concerns**: Keep business logic in services, locators in pages
7. **DRY Principle**: Extract common actions into reusable methods
8. **Type Safety**: Use TypeScript interfaces for all data structures

## 🛠️ CI/CD Integration

The framework is designed to work seamlessly with GitHub Actions:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install

- name: Run API tests
  run: npm run test:api

- name: Run UI tests
  run: npm run test:ui

- name: Generate Allure Report
  run: npm run allure:report
```

## 📦 Dependencies

- **@playwright/test**: ^1.57.0 - Playwright testing library
- **@playwright/mcp**: ^0.0.49 - Playwright MCP support
- **typescript**: ^5.6.3 - TypeScript compiler
- **eslint**: ^9.39.1 - Linting
- **prettier**: ^3.7.4 - Code formatting
- **husky**: ^9.1.7 - Git hooks
- **allure-playwright**: ^3.4.3 - Allure reporting

## 📖 TypeScript Configuration

The framework includes path aliases for cleaner imports:

```typescript
// Instead of:
import { BookingFactory } from '../../../utils/BookingFactory';

// Use:
import { BookingFactory } from '@utils/BookingFactory';
```

## 🤝 Contributing

When adding new features:

1. Create factories for new data types in `utils/`
2. Create POMs for new pages in `pages/`
3. Create services for new domains in `services/`
4. Write tests in appropriate `tests/api/` or `tests/ui/` directories
5. Run linting and formatting before committing
6. Update this README with new features

## 📝 Example Test Output

```
✓ Complete booking lifecycle: Create → Read → Update → Delete (5s)
  ✓ Authentication successful
  ✓ Booking created with ID: 1234
  ✓ Booking retrieved successfully
  ✓ Booking updated successfully
  ✓ Update verification passed
  ✓ Booking deleted successfully
  ✓ Deletion verified: booking no longer exists

✓ Complete user registration flow with generated data (8s)
  ✓ Generated user data: John Smith (john.smith.1234567890@gmail.com)
  ✓ On login/signup page
  ✓ Initial signup completed
  ✓ Registration form filled
  ✓ Form submitted
  ✓ Account created successfully - success message visible
  ✓ Success message verified: "ACCOUNT CREATED!"
  ✓ On account creation success page
```

## 🐛 Troubleshooting

### Tests timeout

- Increase timeout in individual tests: `test.setTimeout(30000)`
- Check network connectivity to target sites

### Locator issues

- Run with `--debug` flag: `npm run test:debug`
- Check selector visibility: `await page.waitForSelector(selector)`

### API failures

- Verify API base URL in `playwright.config.ts`
- Check authentication token validity
- Validate request payload with factory

## 📄 License

ISC

## 👤 Author

Your Name

---

**Happy Testing!** 🎉
