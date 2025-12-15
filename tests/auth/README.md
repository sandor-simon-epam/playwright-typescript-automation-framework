# Cookie Consent Storage State Setup

This directory contains authentication and state setup files for Playwright tests.

## Files

- `cookieConsent.setup.ts` - One-time setup that captures the cookie consent acceptance state
- `.auth/cookie-consent-state.json` - Generated storage state file (auto-created, included in .gitignore)

## How It Works

1. **Setup Phase**: Before running UI tests, the setup file:
   - Navigates to automationexercise.com
   - Waits for the FunnyConsent cookie banner
   - Accepts/closes the modal using ModalHandler
   - Saves the browser's storage state (cookies, localStorage) to `.auth/cookie-consent-state.json`

2. **Test Phase**: All e2e tests automatically:
   - Load the saved storage state from `setup`
   - Start with cookies already accepted
   - Never see the cookie consent modal

## Usage

### Generate/Update Storage State

```bash
# Run the setup to generate fresh storage state
npx playwright test --project=setup

# This creates .auth/cookie-consent-state.json
```

### Run Tests with Storage State

```bash
# Run all tests (setup runs first due to dependsOn)
npx playwright test

# Or run only e2e tests (will run setup first)
npx playwright test --project=e2e
```

## Benefits

- **Faster Tests**: No time wasted waiting for modal to appear and close
- **More Reliable**: Eliminates timing issues with modal detection
- **Cleaner Code**: No event listeners constantly monitoring for modals
- **Consistent State**: All tests start with identical, known state

## Storage State Contents

The generated `cookie-consent-state.json` includes:

- Cookies (including FunnyConsent consent acceptance)
- LocalStorage values
- SessionStorage values
- Origin

## Troubleshooting

### Tests still show modal after setup

- Run setup again: `npx playwright test --project=setup`
- The storage state may have expired or become stale
- Check `.auth/cookie-consent-state.json` exists and is recent

### Setup fails to find modal

- Site may have changed the modal selectors
- Check `utils/ModalHandler.ts` for current selectors
- Update `FUNNY_CONSENT` config if needed

### Want to regenerate state periodically

- Delete `.auth/cookie-consent-state.json`
- Run: `npx playwright test --project=setup`
- Or run: `npm run test:setup` if you add this script to package.json

## CI/CD Integration

For CI environments:

1. Run setup once: `npx playwright test --project=setup`
2. Commit `.auth/cookie-consent-state.json` to repo (or generate in pipeline)
3. Run tests: `npx playwright test`

Or run fresh each time:

```bash
npx playwright test  # setup runs automatically due to dependsOn
```
