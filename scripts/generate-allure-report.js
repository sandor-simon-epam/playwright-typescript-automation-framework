#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function to recursively remove directory
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        removeDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Helper function to recursively copy directory
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.lstatSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

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
} catch {
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
  } catch {
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
console.log('\n🔍 Verifying report generation...');
console.log(`  Checking allure-report/index.html...`);

if (!fs.existsSync('allure-report/index.html')) {
  console.log('  ✗ index.html not found at root');

  // Show all files in allure-report
  const reportDir = fs.readdirSync('allure-report');
  console.log(`  📂 Contents of allure-report: ${reportDir.join(', ')}`);

  // Check if any subdirectories exist
  const dirs = reportDir.filter((f) => {
    const fullPath = `allure-report/${f}`;
    try {
      return fs.statSync(fullPath).isDirectory();
    } catch {
      return false;
    }
  });
  console.log(`  📁 Subdirectories found: ${dirs.join(', ') || '(none)'}`);

  if (dirs.length === 0) {
    console.error('✗ No subdirectories found - Allure generation may have failed');
    console.error('⚠ Aborting flattening attempt');
    process.exit(1);
  }

  // Find the versioned directory (assume first non-.gitkeep directory)
  const versionedDir = dirs.find((f) => f !== '.gitkeep' && !f.startsWith('.'));
  console.log(`  🎯 Targeting directory: ${versionedDir}`);

  if (versionedDir) {
    const indexPath = `allure-report/${versionedDir}/index.html`;
    console.log(`  Checking ${indexPath}...`);

    if (!fs.existsSync(indexPath)) {
      console.log(`  ✗ index.html not found in ${versionedDir}`);
      console.log(`  📋 Contents of allure-report/${versionedDir}:`);
      try {
        const subContents = fs.readdirSync(`allure-report/${versionedDir}`);
        console.log(
          `     ${subContents.slice(0, 10).join(', ')}${subContents.length > 10 ? '...' : ''}`,
        );
      } catch (e) {
        console.error(`     Error reading directory: ${e.message}`);
      }
      process.exit(1);
    }

    console.log(`  ✓ Found ${indexPath}`);
    console.log('  🔄 Starting flattening process...');

    // Move versioned directory contents to root using Node.js file operations
    const sourceDir = `allure-report/${versionedDir}`;
    const tempDir = 'allure-report-temp';

    console.log(`  Step 1: Copying ${sourceDir} → ${tempDir}...`);
    try {
      copyDir(sourceDir, tempDir);
      console.log(`  ✓ Copy successful`);
    } catch (copyErr) {
      console.error(`  ✗ Copy failed: ${copyErr.message}`);
      process.exit(1);
    }

    console.log(`  Step 2: Removing original allure-report...`);
    try {
      removeDir('allure-report');
      console.log(`  ✓ Removal successful`);
    } catch (removeErr) {
      console.error(`  ✗ Removal failed: ${removeErr.message}`);
      process.exit(1);
    }

    console.log(`  Step 3: Renaming ${tempDir} → allure-report...`);
    try {
      fs.renameSync(tempDir, 'allure-report');
      console.log(`  ✓ Rename successful`);
    } catch (renameErr) {
      console.error(`  ✗ Rename failed: ${renameErr.message}`);
      process.exit(1);
    }

    console.log(`  Step 4: Verifying index.html at root...`);
    if (fs.existsSync('allure-report/index.html')) {
      console.log('  ✓ Index.html verified at root');
      console.log('✅ Report structure flattened successfully');
    } else {
      console.error('✗ Flattening failed - index.html still not found at root');
      console.log('  📁 Current structure:');
      try {
        const finalContents = fs.readdirSync('allure-report');
        console.log(`     ${finalContents.slice(0, 10).join(', ')}`);
      } catch (e) {
        console.error(`     Error: ${e.message}`);
      }
      process.exit(1);
    }
  } else {
    console.error('✗ No valid versioned directory found');
    process.exit(1);
  }
} else {
  console.log('  ✓ index.html found at root - no flattening needed');
}

// Then copy history file if it exists (for future trend data)
const historyDir = 'allure-report/data/history';
const targetFile = path.join(historyDir, 'history.jsonl');

try {
  if (fs.existsSync(sourceFile)) {
    fs.mkdirSync(historyDir, { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✓ Allure history copied to report');
  } else {
    console.log('ℹ History file not found (first run)');
  }
} catch (error) {
  console.error('✗ Error copying history:', error.message);
  process.exit(1);
}

// Save updated history back to .allure/ for next run
try {
  fs.mkdirSync('.allure', { recursive: true });
  if (fs.existsSync(targetFile)) {
    fs.copyFileSync(targetFile, sourceFile);
    console.log('✓ History saved for next run');
  }
} catch (error) {
  console.error('✗ Error saving history:', error.message);
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
