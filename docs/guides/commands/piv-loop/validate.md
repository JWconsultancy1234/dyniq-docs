---
description: Run comprehensive validation before commit
---

# Validate: Quality Assurance Gate


Run ALL validation checks before any commit.

## Overview

This command runs a comprehensive 5-level validation to ensure code quality and prevent regressions.

---

## Walker-OS Quick Validation (PARALLEL - Required)

**ALWAYS run validation in PARALLEL, never sequential:**

```bash
# Run ALL THREE simultaneously in one message:
pnpm lint        # Tool call 1
pnpm type-check  # Tool call 2
pnpm build       # Tool call 3
```

**Never do this (sequential):**
```bash
# WRONG - wastes time
pnpm lint && pnpm type-check && pnpm build
```

**All three must pass before commit.**

---

## Level 1: Format & Lint (Auto-fix)

### Next.js / TypeScript (apps/web)
```bash
# Run from project root
pnpm lint

# Or with auto-fix (if configured)
pnpm lint --fix

# Or directly in web app
cd apps/web && npx next lint
```

**Expected**: Exit code 0, no ESLint errors

---

## Level 2: Type Checking (Must Pass)

### Next.js / TypeScript
```bash
# Run from project root
pnpm type-check

# Or directly
cd apps/web && npx tsc --noEmit
```

**Expected**: 0 type errors

### Common Type Issues to Fix
- Missing types in Server Actions
- Props type mismatches between Server/Client components
- Supabase types out of sync (regenerate with `supabase gen types`)

---

## Level 3: Unit Tests (Must Pass)

### If tests are configured:
```bash
pnpm test

# Or with coverage
pnpm test:coverage
```

**Note**: Tests are optional in early development but should be added for critical paths.

---

## Level 4: Build Verification

### Next.js Production Build
```bash
# Full monorepo build
pnpm build

# Web app only
pnpm build --filter=web

# Or directly
cd apps/web && npx next build
```

**Expected**: Build succeeds, no errors

### Common Build Issues
- Server/Client component boundary violations
- Missing 'use client' directive
- Import errors in Server Actions
- Environment variable issues

---

## Level 5: Security Audit

### Check for Secrets
```bash
# Search for potential secrets
grep -r "SUPABASE_\|api_key\|secret\|password\|token" apps/web/src --include="*.ts" --include="*.tsx" | grep -v ".env"
```

### Environment Variables Check
Ensure these are in `.env.local` (not committed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Any API keys

### Walker-OS Security Checklist
- [ ] No hardcoded secrets in code
- [ ] Environment variables for sensitive data
- [ ] RLS policies active on all Supabase tables
- [ ] Middleware auth check in place

---

## Validation Report

After running all levels, summarize:

```yaml
validation_report:
  timestamp: "{ISO timestamp}"
  project: "walker-os/apps/web"

  level_1_lint:
    status: "pass" | "fail"
    command: "pnpm lint"

  level_2_types:
    status: "pass" | "fail"
    command: "pnpm type-check"
    errors: 0

  level_3_tests:
    status: "pass" | "skip"
    note: "Tests not configured yet"

  level_4_build:
    status: "pass" | "fail"
    command: "pnpm build"

  level_5_security:
    status: "pass" | "warning" | "fail"
    issues: []

  overall: "PASS" | "FAIL"
  ready_for_commit: true | false
  blockers: []
```

---

## Quick Commands Reference

```bash
# One-liner validation (copy-paste ready)
pnpm lint && pnpm type-check && pnpm build

# With turbo cache (faster on repeat runs)
pnpm turbo lint type-check build

# Check specific file types changed
git diff --name-only | grep -E '\.(ts|tsx)$'
```

---

## Level 6: Runtime Pattern Check

### Infinite Loop Detection (Manual)

Check for patterns that cause infinite loops:

```bash
# Find useEffect with object/array dependencies
grep -rn "useEffect.*\[.*data\." apps/web/src --include="*.tsx"

# Find double revalidation (revalidatePath + router.refresh)
grep -rn "revalidatePath\|router.refresh" apps/web/src --include="*.ts" --include="*.tsx"
```

### Infinite Loop Checklist
- [ ] No useEffect with object/array dependencies (use primitives or refs)
- [ ] No double revalidation (pick revalidatePath OR router.refresh, not both)
- [ ] Initialization code uses ref guard (`hasRun.current`)
- [ ] Server Actions don't trigger client refresh if they already revalidate

**See**: @infinite-loop-patterns.md

### Quick Detection During Dev
Signs of infinite loop:
- Repeated GET/POST in terminal every ~1 second
- Browser DevTools network tab showing continuous requests
- High CPU from dev server

---

## Pre-Commit Checklist

Before running `/commit`:

- [ ] Level 1: Lint - PASS (`pnpm lint`)
- [ ] Level 2: Type Check - PASS (`pnpm type-check`)
- [ ] Level 3: Tests - PASS or N/A (`pnpm test`)
- [ ] Level 4: Build - PASS (`pnpm build`)
- [ ] Level 5: Security - No secrets in code
- [ ] Level 6: No infinite loop patterns
- [ ] Manual test in browser (localhost:3000)
- [ ] Decision Filter applied (is this worth doing?)

---

## If Validation Fails

| Level | Issue | Fix |
|-------|-------|-----|
| Level 1 | ESLint errors | Check error, fix code or disable rule with comment |
| Level 2 | Type errors | Add missing types, check Server/Client boundaries |
| Level 3 | Test failures | Fix code or update tests |
| Level 4 | Build fails | Check imports, 'use client', env vars |
| Level 5 | Security | Remove secrets, use .env.local |
| Level 6 | Infinite loop | Use ref guards, remove unstable deps, pick one revalidation method |

**Do NOT commit with failing validation.**

---

## Auto-Trigger Commit (If Validation Passes)

**When all validation levels pass:**

### 1. Create Automation Event

```sql
INSERT INTO automation_events (
  event_type,
  project_id,
  triggered_by,
  event_data,
  next_command,
  status
) VALUES (
  'validation_pass',
  '{project_id}',
  'Reviewer',
  '{"lint": "pass", "type_check": "pass", "build": "pass"}',
  '/commit',
  'pending'
);
```

### 2. Notify Developer

Send Telegram notification:
```
✅ Validation PASSED: {project_id}

All checks passed:
- ✅ Lint
- ✅ Type Check
- ✅ Build

Auto-triggering /commit...
```

### 3. Trigger Commit

- Auto-invoke `/commit` command within 1 minute
- Commit message generated from execution context
- Includes co-authorship: "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

**If validation fails:**
- Do NOT trigger `/commit`
- Notify Developer with failure details
- Mark automation_events as 'failed'
- Require manual fix and re-validation

**Test mode:** If `AGENT_MODE=test`, log result but don't trigger commit

## Python Project Validation (dyniq-ai-agents)

For Python projects, run these checks:

```bash
# Lint (ruff)
cd dyniq-ai-agents && ruff check tests/ agents/ api/

# Format check
cd dyniq-ai-agents && ruff format --check tests/ agents/ api/

# Unit tests (mocked, fast)
cd dyniq-ai-agents && pytest tests/e2e/ -v -k "not integration"

# Benchmark tests
cd dyniq-ai-agents && pytest tests/benchmark/ -v --benchmark-disable
```

### Python Validation Report

```yaml
python_validation:
  lint:
    status: "pass" | "fail"
    command: "ruff check tests/ agents/ api/"

  format:
    status: "pass" | "fail"
    command: "ruff format --check"

  tests:
    status: "pass" | "fail"
    command: "pytest tests/e2e/ -v -k 'not integration'"
    passed: X
    failed: Y

  benchmarks:
    status: "pass" | "skip"
    command: "pytest tests/benchmark/ --benchmark-disable"
```

### Integration Tests (Separate - Costs Money)

```bash
# Requires AGENTS_API_KEY from Contabo
cd dyniq-ai-agents && pytest -m integration -v
```

---

## Integration with PIV Loop

```
/prime     → Understand context
/plan      → Create implementation plan
/execute   → Build feature
/validate  → ← YOU ARE HERE
/commit    → Create git commit (only if validate passes)
```
