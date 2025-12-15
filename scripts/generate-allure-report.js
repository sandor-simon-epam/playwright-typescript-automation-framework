#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const historyDir = 'allure-report/history';
const sourceFile = '.allure/history.jsonl';
const targetFile = path.join(historyDir, 'history.jsonl');

// Create directory if it doesn't exist
fs.mkdirSync(historyDir, { recursive: true });

// Copy history file if it exists
try {
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✓ Allure history copied successfully');
  } else {
    console.log('ℹ History file not found yet (first run)');
  }
} catch (error) {
  console.error('✗ Error copying history:', error.message);
  process.exit(1);
}

// Generate report
console.log('\n📊 Generating Allure report...');
try {
  execSync('npx allure@latest generate allure-results -o allure-report', { stdio: 'pipe' });
  console.log('✓ Report generated successfully\n');
} catch (error) {
  console.error('✗ Error generating report:', error.message);
  process.exit(1);
}

// Only open report in browser if not in CI environment
const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
if (!isCI) {
  console.log('🌐 Opening report...\n');
  try {
    execSync('npx allure open allure-report', { stdio: 'inherit' });
  } catch (error) {
    console.error('✗ Error opening report:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ Running in CI environment - skipping browser open\n');
}
