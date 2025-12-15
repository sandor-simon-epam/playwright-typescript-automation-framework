/**
 * Environment Configuration Manager
 * Centralizes all environment variables and provides type-safe access
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  // API Testing
  api: {
    baseUrl: string;
    auth: {
      username: string;
      password: string;
    };
  };

  // UI/E2E Testing
  ui: {
    baseUrl: string;
  };

  // Timeouts
  timeouts: {
    action: number;
    navigation: number;
    test: number;
    apiTest: number;
    e2eTest: number;
  };

  // Storage State
  storageStatePath: string;

  // Reporting
  reporting: {
    allurePath: string;
    allureResultsPath: string;
  };

  // Test Data
  testData: {
    defaultCountry: string;
    defaultCity: string;
    emailDomains: string[];
  };

  // Artifacts
  screenshotPath: string;

  // CI/CD
  ci: boolean;
}

export type { EnvConfig };

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined. Please check your .env file.`);
  }
  return value || defaultValue || '';
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined. Please check your .env file.`);
  }
  return value ? parseInt(value, 10) : defaultValue || 0;
};

const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined. Please check your .env file.`);
  }
  if (value === undefined) return defaultValue || false;
  return value.toLowerCase() === 'true';
};

/**
 * Load and validate environment configuration
 */
export const config: EnvConfig = {
  // API Testing Configuration
  api: {
    baseUrl: getEnvVariable('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
    auth: {
      username: getEnvVariable('API_AUTH_USERNAME', 'admin'),
      password: getEnvVariable('API_AUTH_PASSWORD', 'password123'),
    },
  },

  // UI/E2E Testing Configuration
  ui: {
    baseUrl: getEnvVariable('UI_BASE_URL', 'https://automationexercise.com'),
  },

  // Timeout Configuration (in milliseconds)
  timeouts: {
    action: getEnvNumber('ACTION_TIMEOUT', 15000),
    navigation: getEnvNumber('NAVIGATION_TIMEOUT', 60000),
    test: getEnvNumber('TEST_TIMEOUT', 60000),
    apiTest: getEnvNumber('API_TEST_TIMEOUT', 30000),
    e2eTest: getEnvNumber('E2E_TEST_TIMEOUT', 180000),
  },

  // Storage State Configuration
  storageStatePath: getEnvVariable('STORAGE_STATE_PATH', '.auth/cookie-consent-state.json'),

  // Reporting Configuration
  reporting: {
    allurePath: getEnvVariable('ALLURE_REPORT_PATH', 'allure-report'),
    allureResultsPath: getEnvVariable('ALLURE_RESULTS_PATH', 'allure-results'),
  },

  // Test Data Configuration
  testData: {
    defaultCountry: getEnvVariable('DEFAULT_COUNTRY', 'India'),
    defaultCity: getEnvVariable('DEFAULT_CITY', 'New York'),
    emailDomains: getEnvVariable('EMAIL_DOMAINS', 'gmail.com,outlook.com,yahoo.com')
      .split(',')
      .map((d) => d.trim()),
  },

  // Artifacts Configuration
  screenshotPath: getEnvVariable('SCREENSHOT_PATH', './screenshots'),

  // CI/CD Configuration
  ci: getEnvBoolean('CI', false),
};

/**
 * Validate that all required environment variables are loaded
 */
export function validateConfig(): void {
  const requiredVars = ['API_BASE_URL', 'UI_BASE_URL', 'API_AUTH_USERNAME', 'API_AUTH_PASSWORD'];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠ Missing environment variables: ${missing.join(', ')}. Using defaults.`);
  }
}

// Export convenience accessors
export const getApiBaseUrl = (): string => config.api.baseUrl;
export const getUiBaseUrl = (): string => config.ui.baseUrl;
export const getApiAuthUsername = (): string => config.api.auth.username;
export const getApiAuthPassword = (): string => config.api.auth.password;
export const getActionTimeout = (): number => config.timeouts.action;
export const getNavigationTimeout = (): number => config.timeouts.navigation;
export const getTestTimeout = (): number => config.timeouts.test;
export const getStorageStatePath = (): string => config.storageStatePath;
export const isCiEnvironment = (): boolean => config.ci;

export default config;
