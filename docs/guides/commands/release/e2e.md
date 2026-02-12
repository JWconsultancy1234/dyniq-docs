---
title: "/e2e - Run E2E Tests"
sidebar_label: "/e2e - Run E2E Tests"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# /e2e - Run E2E Tests

Run end-to-end tests using Playwright (Next.js) or pytest (Python).

## Auto-Detection

The command auto-detects project type:
- **Next.js** (apps/web): Run Playwright tests
- **Python** (dyniq-ai-agents): Run pytest tests

## Usage

```
/e2e [optional: test file or pattern]
/e2e theme
/e2e smoke
/e2e --headed
```

## Process

1. Start dev server (if not running)
2. Run Playwright tests
3. Report results with screenshots
4. Show failed test details

## Commands

### Run All Tests
```bash
cd apps/web && pnpm test:e2e
```

### Specific Test File
```bash
cd apps/web && pnpm test:e2e e2e/theme.spec.ts
```

### By Name Pattern
```bash
cd apps/web && pnpm test:e2e --grep "theme"
```

### Interactive UI Mode
```bash
cd apps/web && pnpm test:e2e:ui
```

### With Visible Browser
```bash
cd apps/web && pnpm test:e2e:headed
```

### Debug Mode
```bash
cd apps/web && pnpm test:e2e:debug
```

## Test Structure

### Next.js (apps/web)
```
apps/web/e2e/
├── smoke.spec.ts     # Basic smoke tests
├── theme.spec.ts     # Theme toggle tests
└── [feature].spec.ts # Feature-specific tests
```

### Python (dyniq-ai-agents)
```
dyniq-ai-agents/tests/
├── conftest.py              # Shared fixtures
├── e2e/
│   └── test_content_pipeline.py  # E2E tests
└── benchmark/
    └── test_performance.py  # Performance tests
```

## Python E2E Commands

```bash
# Run all E2E tests (mocked, fast)
cd dyniq-ai-agents && pytest tests/e2e/ -v -k "not integration"

# Run integration tests (requires AGENTS_API_KEY)
cd dyniq-ai-agents && pytest -m integration -v

# Run benchmarks
cd dyniq-ai-agents && pytest tests/benchmark/ --benchmark-only
```

## Writing Tests

### Basic Test
```typescript
import { test, expect } from '@playwright/test';

test('page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Walker-OS/);
});
```

## Using Playwright MCP

Claude can help debug E2E tests using Playwright MCP:

```
# Claude can navigate and interact with pages
browser_navigate → browser_snapshot → browser_click

# Debug failing tests
browser_console_messages → browser_network_requests
```

## Output Format

```markdown
## E2E Test Results

### Summary
- Passed: X
- Failed: Y
- Skipped: Z

### Failures (if any)
1. `test name`
   - Error: [Error message]
   - Screenshot: [link]

### Report
View full report: `cd apps/web && pnpm test:e2e:report`
```
