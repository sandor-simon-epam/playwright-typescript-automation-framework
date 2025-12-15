#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceFile = '.allure/history.jsonl';

// Generate report first
console.log('📊 Generating Allure report...');
try {
  const output = execSync(
    'npx allure@latest generate allure-results -o allure-report 2>&1',
    {
      encoding: 'utf-8',
    },
  );
  console.log(output);
  console.log('✓ Report generated successfully\n');
} catch (error) {
  console.error('✗ Error generating report:');
  console.error(error.message);
  console.error(error.stdout);
  process.exit(1);
}

// Verify report was created
if (!fs.existsSync('allure-report/index.html')) {
  console.error('✗ Report generation failed - index.html not found');
  console.log('Directory contents:');
  try {
    const files = execSync('find allure-report -type f 2>/dev/null', {
      encoding: 'utf-8',
    });
    console.log(files);
  } catch (e) {
    console.log('allure-report directory not found');
  }
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
