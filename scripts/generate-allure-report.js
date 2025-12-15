#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceFile = '.allure/history.jsonl';

// Check if allure-results exists with test results
if (!fs.existsSync('allure-results')) {
  console.log('⚠ No allure-results directory found - tests may not have run');
  console.log('Creating empty allure-report directory for Pages deployment');
  fs.mkdirSync('allure-report', { recursive: true });
  fs.writeFileSync(
    'allure-report/index.html',
    '<html><body><h1>No test results available</h1></body></html>',
  );
  process.exit(0);
}

const resultsCount = fs.readdirSync('allure-results').length;
if (resultsCount === 0) {
  console.log('⚠ allure-results directory is empty - no tests were executed');
  console.log('Creating empty allure-report directory for Pages deployment');
  fs.mkdirSync('allure-report', { recursive: true });
  fs.writeFileSync(
    'allure-report/index.html',
    '<html><body><h1>No test results available</h1></body></html>',
  );
  process.exit(0);
}

// Generate report first
console.log('📊 Generating Allure report...');
console.log('  Input: allure-results/');
try {
  const inputFiles = execSync('find allure-results -type f 2>/dev/null | wc -l', {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  console.log(`  Files found: ${inputFiles.trim()}`);
} catch (e) {
  console.log('  Could not count files');
}

try {
  const output = execSync('npx allure@latest generate allure-results -o allure-report', {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  if (output) console.log(output);
  console.log('✓ Report generated successfully');

  console.log('  Output: allure-report/');
  try {
    const outputFiles = execSync('find allure-report -type f 2>/dev/null | wc -l', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log(`  Files generated: ${outputFiles.trim()}`);
  } catch (e) {
    console.log('  Could not count files');
  }
} catch (error) {
  console.error('✗ Error generating report:');
  console.error(error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout);
  if (error.stderr) console.error('STDERR:', error.stderr);
  process.exit(1);
}

// Verify report was created
if (!fs.existsSync('allure-report/index.html')) {
  console.log('  index.html not found at root, checking for versioned directories...');
  // Allure 3.0 may create versioned subdirectories like awesome/
  const reportDir = fs.readdirSync('allure-report');
  const versionedDir = reportDir.find((f) => fs.statSync(`allure-report/${f}`).isDirectory());

  if (versionedDir && fs.existsSync(`allure-report/${versionedDir}/index.html`)) {
    console.log(`  Found report in allure-report/${versionedDir}/`);
    console.log(`  Moving to root...`);
    // Move versioned directory contents to root
    const sourceDir = `allure-report/${versionedDir}`;
    const files = execSync(`find "${sourceDir}" -type f`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).split('\n');

    files.forEach((file) => {
      if (!file) return;
      const relative = file.replace(sourceDir + '/', '');
      const target = `allure-report/${relative}`;
      const targetDir = target.substring(0, target.lastIndexOf('/'));
      try {
        execSync(`mkdir -p "${targetDir}" && cp "${file}" "${target}"`, {
          stdio: 'pipe',
        });
      } catch (e) {
        console.error(`Failed to copy ${file}`);
      }
    });
    console.log('✓ Report files moved to root');
  } else {
    console.error('✗ Report generation failed - index.html not found');
    console.log('\n📁 Directory structure:');
    try {
      const files = execSync('find allure-report -type f | sort', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      console.log(files || '(empty)');
    } catch (e) {
      console.log('allure-report directory not found or error reading');
    }
    process.exit(1);
  }
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
