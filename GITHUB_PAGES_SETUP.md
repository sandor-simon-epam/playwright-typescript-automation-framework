# GitHub Pages Setup for Allure Reports

This guide explains how to set up and access Allure test reports automatically hosted on GitHub Pages.

## Overview

The GitHub Actions workflow automatically:
- Runs Playwright tests on push/PR to `main` or `master` branches
- Generates Allure reports from test results
- Deploys reports to GitHub Pages (on main branch pushes only)

## Prerequisites

- Repository with Playwright tests configured with `allure-playwright` reporter
- GitHub Actions enabled
- GitHub Pages configured in repository settings

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under **Build and deployment**:
   - Set **Source** to: **GitHub Actions**
   - The setting applies immediately (no Save button)

### 2. Verify Workflow Configuration

The workflow in [.github/workflows/playwright.yml](.github/workflows/playwright.yml) is pre-configured to:
- Generate Allure reports after test runs
- Deploy to GitHub Pages on main branch pushes
- Archive reports as artifacts for PR/non-main runs

### 3. Access Your Reports

Once workflow completes successfully on the main branch:

1. Check the **Actions** tab for workflow runs
2. Find the "Deploy to GitHub Pages" step in the successful run
3. The deployment URL will be shown in that step
4. Or visit: `https://<username>.github.io/<repository-name>/`

Example: `https://sandor-simon-epam.github.io/playwright-typescript-automation-framework/`

## Workflow Details

### Test Job

```bash
npm ci                    # Install dependencies
npx playwright test       # Run all tests
npx allure generate      # Generate HTML report
```

### Deployment Job

- Triggered only on main branch pushes
- Uploads `allure-report/` directory to GitHub Pages
- Uses official `actions/deploy-pages@v4`

### Artifacts

All runs create test artifacts (retained 30 days):
- **playwright-report**: HTML test report
- **allure-report**: Allure test report (also deployed to Pages on main)

## Local Development

Test reports locally:

```bash
# Run tests and generate report
npm test

# Serve Allure report locally
npm run allure:serve

# Or generate static report
npm run allure:generate
```

## Report Features

- ✅ Test execution summary (pass/fail counts)
- 📊 Pie charts and statistics
- 📝 Detailed test steps and logs
- 🖼️ Screenshots and attachments
- ⏱️ Execution time metrics
- 📈 Historical trends across runs (cached between workflows)

## Troubleshooting

### Reports not deploying

- ✓ GitHub Pages must be enabled (Settings → Pages)
- ✓ Source must be set to "GitHub Actions"
- ✓ Workflow only deploys on main branch (PRs don't deploy)
- ✓ Check Actions tab for workflow errors

### Report shows old data

- GitHub Pages may cache content
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Wait a few minutes for cache to clear

### Workflow permission errors

Ensure these permissions exist in [.github/workflows/playwright.yml](.github/workflows/playwright.yml):

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Maintenance

### Report Retention

- **Artifacts**: Stored for 30 days
- **GitHub Pages**: Latest deployment replaces previous
- **Allure History**: Cached between workflow runs for trend tracking
- **Historical data**: Persisted via GitHub Actions cache, can be cleared manually

### Customize Report Generation

Edit [package.json](package.json) scripts to adjust Allure generation:

```bash
"allure:generate": "npx allure@latest generate allure-results -o allure-report"
```

## References

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
