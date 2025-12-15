# Environment Configuration Guide

This project uses environment variables for configuration management. All sensitive data, URLs, and timeouts are externalized and managed through `.env` files.

## Overview

- **`.env.example`** - Template with all available configuration variables
- **`.env`** - Actual configuration file (excluded from git)
- **`utils/EnvConfig.ts`** - Centralized environment configuration manager

## Setup

### 1. Create your .env file

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and update values for your environment:

```env
# API Testing
API_BASE_URL=https://restful-booker.herokuapp.com
API_AUTH_USERNAME=admin
API_AUTH_PASSWORD=password123

# UI/E2E Testing
UI_BASE_URL=https://automationexercise.com

# Timeouts
ACTION_TIMEOUT=15000
NAVIGATION_TIMEOUT=30000
TEST_TIMEOUT=60000
API_TEST_TIMEOUT=30000
E2E_TEST_TIMEOUT=90000
```

## Available Configuration Variables

### API Testing

| Variable            | Default                                | Description                 |
| ------------------- | -------------------------------------- | --------------------------- |
| `API_BASE_URL`      | `https://restful-booker.herokuapp.com` | Base URL for API testing    |
| `API_AUTH_USERNAME` | `admin`                                | API authentication username |
| `API_AUTH_PASSWORD` | `password123`                          | API authentication password |

### UI/E2E Testing

| Variable      | Default                          | Description           |
| ------------- | -------------------------------- | --------------------- |
| `UI_BASE_URL` | `https://automationexercise.com` | Base URL for UI tests |

### Timeouts (milliseconds)

| Variable             | Default | Description                    |
| -------------------- | ------- | ------------------------------ |
| `ACTION_TIMEOUT`     | `15000` | Timeout for individual actions |
| `NAVIGATION_TIMEOUT` | `30000` | Timeout for page navigation    |
| `TEST_TIMEOUT`       | `60000` | Global test timeout            |
| `API_TEST_TIMEOUT`   | `30000` | Timeout for API tests          |
| `E2E_TEST_TIMEOUT`   | `90000` | Timeout for E2E tests          |

### Storage State

| Variable             | Default                           | Description                |
| -------------------- | --------------------------------- | -------------------------- |
| `STORAGE_STATE_PATH` | `.auth/cookie-consent-state.json` | Path to storage state file |

### Reporting

| Variable              | Default          | Description                    |
| --------------------- | ---------------- | ------------------------------ |
| `ALLURE_REPORT_PATH`  | `allure-report`  | Allure report output directory |
| `ALLURE_RESULTS_PATH` | `allure-results` | Allure results directory       |

### Test Data

| Variable          | Default                           | Description                    |
| ----------------- | --------------------------------- | ------------------------------ |
| `DEFAULT_COUNTRY` | `India`                           | Default country for test users |
| `DEFAULT_CITY`    | `New York`                        | Default city for test users    |
| `EMAIL_DOMAINS`   | `gmail.com,outlook.com,yahoo.com` | Comma-separated email domains  |

### Artifacts

| Variable          | Default         | Description                 |
| ----------------- | --------------- | --------------------------- |
| `SCREENSHOT_PATH` | `./screenshots` | Path for screenshot storage |

### CI/CD

| Variable | Default | Description                         |
| -------- | ------- | ----------------------------------- |
| `CI`     | `false` | Set to `true` in CI/CD environments |

## Usage in Code

### Using EnvConfig

```typescript
import { config } from './utils/EnvConfig';

// Access nested configuration
const apiUrl = config.api.baseUrl;
const username = config.api.auth.username;
const timeout = config.timeouts.action;

// Use convenience accessors
import { getApiBaseUrl, getUiBaseUrl, getActionTimeout } from './utils/EnvConfig';

const url = getApiBaseUrl();
const actionTimeout = getActionTimeout();
```

### In Playwright Config

```typescript
import { config } from './utils/EnvConfig';

export default defineConfig({
  timeout: config.timeouts.test,
  projects: [
    {
      use: {
        baseURL: config.ui.baseUrl,
        actionTimeout: config.timeouts.action,
      },
    },
  ],
});
```

### In Services

```typescript
import { config } from '../utils/EnvConfig';

export class BookingService {
  private readonly baseURL = config.api.baseUrl;

  async authenticate(): Promise<string> {
    const response = await this.apiContext.post(`${this.baseURL}/auth`, {
      data: {
        username: config.api.auth.username,
        password: config.api.auth.password,
      },
    });
    // ...
  }
}
```

## Environment-Specific Configuration

### For Different Environments

Create environment-specific files:

```bash
# Local development
.env

# Staging environment
.env.staging

# Production environment
.env.production
```

Load specific environment:

```bash
# On Windows
set NODE_ENV=staging && npm test

# On macOS/Linux
NODE_ENV=staging npm test
```

Update `EnvConfig.ts` to load based on `NODE_ENV`:

```typescript
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });
```

## CI/CD Integration

### GitHub Actions

Set environment variables in your GitHub Actions workflow:

```yaml
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
  API_AUTH_USERNAME: ${{ secrets.API_AUTH_USERNAME }}
  API_AUTH_PASSWORD: ${{ secrets.API_AUTH_PASSWORD }}
  UI_BASE_URL: ${{ secrets.UI_BASE_URL }}
  CI: true
```

### Using Secrets

Store sensitive values as GitHub Secrets:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add secrets like `API_AUTH_PASSWORD`, `API_AUTH_USERNAME`
3. Reference in workflow: `${{ secrets.API_AUTH_PASSWORD }}`

## Validation

The `EnvConfig.ts` module validates required environment variables on import:

```typescript
import { config, validateConfig } from './utils/EnvConfig';

// Validate all configuration
validateConfig();
```

Missing variables will log warnings but use defaults. To make variables truly required:

```typescript
const requiredVars = ['API_AUTH_PASSWORD', 'API_BASE_URL'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
```

## Best Practices

1. **Never commit `.env`** - Add to `.gitignore` ✓
2. **Always provide `.env.example`** - Shows expected variables ✓
3. **Use defaults wisely** - Provide sensible defaults for non-sensitive variables ✓
4. **Document variables** - Keep this guide updated ✓
5. **Type safety** - Use the EnvConfig interface for type checking ✓
6. **Centralized access** - Always import from `EnvConfig.ts` ✓

## Troubleshooting

### "Environment variable X is not defined"

**Solution**:

1. Check that `.env` file exists
2. Verify variable name is correct (case-sensitive)
3. Ensure `.env` is in the root directory
4. Try restarting your IDE or terminal

### Changes in `.env` not reflected

**Solution**:

1. Restart your dev server/tests
2. Clear Node.js module cache: `npm cache clean --force`
3. Ensure you're modifying the correct `.env` file

### Values are `undefined`

**Solution**:

1. Check `.env` file exists in root directory
2. Verify `dotenv.config()` is called before accessing config
3. Check for typos in variable names
4. Use default values as fallback

## Migration from Hardcoded Values

If migrating from hardcoded values:

1. Create `.env.example` with all variables
2. Create `.env` with values
3. Update files to import from `EnvConfig.ts`
4. Remove hardcoded strings
5. Commit `.env.example`, `.gitignore` update, and refactored code
6. Do NOT commit `.env` file

Example migration:

```typescript
// Before
const baseURL = 'https://restful-booker.herokuapp.com';

// After
import { config } from '../utils/EnvConfig';
const baseURL = config.api.baseUrl;
```

---

For more information, see the [dotenv documentation](https://www.npmjs.com/package/dotenv).
