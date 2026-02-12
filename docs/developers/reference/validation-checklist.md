---
title: "Validation Checklist"
sidebar_label: "Validation Checklist"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Validation Checklist

> **Purpose:** Single source of truth for all validation logic. Referenced by `/validate`, `/quick-fix`, `/execute`, `/execution-report`.

---

## Quick Validation (PARALLEL - Always Required)

**Run ALL THREE simultaneously in one message - never sequential:**

```bash
pnpm lint        # Bash tool call 1
pnpm type-check  # Bash tool call 2
pnpm build       # Bash tool call 3
```

**All three must pass before commit.**

---

## 7-Level Validation Framework

| Level | Check | Command | Exit Criteria |
|-------|-------|---------|---------------|
| 1 | Lint | `pnpm lint` | 0 errors |
| 2 | Types | `pnpm type-check` | 0 type errors |
| 3 | Tests | `pnpm test` | All pass (or N/A) |
| 4 | Build | `pnpm build` | Build succeeds |
| 5 | Security | Manual check | No secrets in code |
| 6 | Runtime | Pattern check | No infinite loops |
| 7 | Observability | Langfuse check | Traces appear (backend only) |

---

## Level 5: Security Quick Check

```bash
# Search for potential secrets in TypeScript
grep -r "SUPABASE_\|api_key\|secret\|password\|token" apps/web/src --include="*.ts" --include="*.tsx" | grep -v ".env"

# Search for hardcoded credentials in ALL file types (CRITICAL)
grep -r "SUPABASE_PROJECT_ID\|eyJhbGci\|postgres://" apps/api --include="*.py" --include="*.sh" --include="*.md" --include="*.sql" | grep -v ".env" | grep -v "YOUR_"
```

**CRITICAL:** Always check shell scripts (`.sh`), Python (`.py`), and documentation (`.md`) for hardcoded credentials.

**Cautionary Example (SEC-2026-01-26-001):**
In January 2026, a shell script (`apply_automation_tables.sh`) passed all validation checks with hardcoded service role key, database password, and project ID. The issue was caught only by user review before commit. Root cause: Security validation only checked TypeScript files, completely missing automation scripts. **Lesson:** "All checks passed" can mask gaps in what you're checking.

**Must verify:**
- [ ] No hardcoded secrets in source code
- [ ] No hardcoded secrets in shell scripts
- [ ] No hardcoded secrets in documentation
- [ ] Sensitive data in `.env.local` only
- [ ] RLS policies active on Supabase tables

---

## Level 6: Infinite Loop Detection

**Patterns to avoid:**
- `useEffect` with object/array dependencies
- Double revalidation (`revalidatePath` + `router.refresh`)
- Missing ref guards in initialization code

**Quick detection:**
- Repeated GET/POST every ~1 second
- High CPU from dev server
- Network tab showing continuous requests

**See:** @infinite-loop-patterns.md

---

## Level 7: Observability Check (Backend Features Only)

**When to run:** After deploying backend features with LangGraph, AI agents, or API endpoints.

**Verification steps:**
```bash
# 1. Check Langfuse is configured
ssh contabo "grep LANGFUSE /opt/dyniq-voice/.env" | grep -q KEY && echo "✅ Configured"

# 2. Trigger the feature (example: board meeting)
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_KEY" \
  -d '{"topic": "Test", "level": 1}'

# 3. Verify traces in Langfuse API
curl -s -u "$PUBLIC_KEY:$SECRET_KEY" \
  "https://langfuse.dyniq.ai/api/public/traces?limit=5" | jq '.data | length'
```

**Must verify:**
- [ ] Feature creates trace in Langfuse
- [ ] Key spans visible (not just POST)
- [ ] No silent failures (check for error spans)

### Cost Tracking Verification (Board Meeting / LLM Features)

**When to run:** After changes to board meeting, agent factory, or OpenRouter client.

**Verification steps:**
```bash
# 1. Run test board meeting
AGENTS_API_KEY=$(grep -E '^AGENTS_API_KEY=' ~/Desktop/Code/walker-os/apps/api/.env | cut -d'=' -f2)
curl -s -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic": "Test", "level": 0, "decision_type": "technical", "options": ["A", "B"]}' \
  | jq '.cost_summary'

# 2. Verify cost_summary.total_cost_usd > 0
# 3. Compare with Langfuse trace totalCost (should match within $0.001)
```

**Must verify:**
- [ ] `cost_summary.total_cost_usd` is non-zero in API response
- [ ] `model_distribution` shows expected models (Sonnet/Kimi)
- [ ] Langfuse trace `totalCost` matches API response

**Incident (2026-02-01):** `record_llm_call()` was never invoked because response cost data was discarded after JSON parsing. OpenRouter showed costs but Langfuse showed $0.

**Skip if:** Frontend-only changes, no LLM/agent modifications.

---

**Skip if:** Frontend-only changes, documentation, no backend deployment.

---

## Failure Matrix

| Level | Issue | Fix |
|-------|-------|-----|
| 1 | ESLint errors | Fix code or disable rule with comment |
| 2 | Type errors | Add types, check Server/Client boundaries |
| 3 | Test failures | Fix code or update tests |
| 4 | Build fails | Check imports, 'use client', env vars |
| 5 | Security | Remove secrets, use .env.local |
| 6 | Infinite loop | Use ref guards, remove unstable deps |
| 7 | No traces | Add @observe decorators, check Langfuse config |

---

## Validation Report Format

```yaml
validation_report:
  timestamp: "YYYY-MM-DDTHH:MM:SS"
  project: "walker-os/apps/web"

  level_1_lint: "pass" | "fail"
  level_2_types: "pass" | "fail"
  level_3_tests: "pass" | "skip"
  level_4_build: "pass" | "fail"
  level_5_security: "pass" | "warning" | "fail"
  level_6_runtime: "pass" | "warning"

  overall: "PASS" | "FAIL"
  ready_for_commit: true | false
  blockers: []
```

---

## Python Project Validation

### FastAPI (apps/api)

```bash
cd apps/api
ruff format .
ruff check --fix .
mypy app --strict
pytest -v
```

### dyniq-ai-agents

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents
ruff check agents/ api/ shared/
mypy agents/ --ignore-missing-imports
python3 -m pytest tests/unit/ -v --tb=short
```

**Board Meeting specific:**
```bash
python3 -m pytest tests/unit/board_meeting/ -v  # 54 tests
```

**Logger Pattern Check (CRITICAL):**
```bash
# Should return 0 results - all modules must use get_logger()
grep -r "logging.getLogger(__name__)" agents/ --include="*.py"
```

**Why:** Standard Python `logging.getLogger()` is invisible in server logs. Only `get_logger()` from `shared.utils.logging` produces visible output.

**Incident 2026-02-03:** R&D research debugging took extra time because logs were invisible.

### Quick Python Check (Any Project)

```bash
ruff check .                    # Lint
mypy . --ignore-missing-imports # Types (lenient)
pytest -v                       # Tests
```

---

## Integration Points

| Command | Uses Validation |
|---------|-----------------|
| `/validate` | Full 6-level validation |
| `/quick-fix` | Level 1-4 (quick pass) |
| `/execute` | Level 1-4 after implementation |
| `/commit` | Requires validation pass |
| `/execution-report` | Reports validation status |

---

*Do NOT commit with failing validation.*
