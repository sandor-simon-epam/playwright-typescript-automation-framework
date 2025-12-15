#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceFile = '.allure/history.jsonl';

// Generate report first
console.log('📊 Generating Allure report...');
try {
  execSync('npx allure@latest generate allure-results -o allure-report', {
    stdio: 'inherit',
  });
  console.log('✓ Report generated successfully\n');
} catch (error) {
  console.error('✗ Error generating report:', error.message);
  process.exit(1);
}

// Then copy history file if it exists (for future trend data)
const historyDir = 'allure-report/data/history';
const targetFile = path.join(historyDir, 'history.jsonl');

try {
  if (fs.existsSync(sourceFile)) {
    fs.mkdirSync(historyDir, { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✓ Allure history copied for next run');
  } else {
    console.log('ℹ History file not found (first run)');
  }
} catch (error) {
  console.error('✗ Error copying history:', error.message);
  process.exit(1);
}

// Only open report in browser if not in CI environment
const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
if (!isCI) {
  console.log('\n🌐 Opening report...\n');
  try {
    execSync('npx allure open allure-report', { stdio: 'inherit' });
  } catch (error) {
    console.error('✗ Error opening report:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ Running in CI environment - skipping browser open\n');
}
