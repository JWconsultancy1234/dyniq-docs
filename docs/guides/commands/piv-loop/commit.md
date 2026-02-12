---
description: Create a standardized git commit after validation passes
---

# Commit: Standardized Git Commit

Create a well-formatted git commit after validation passes.

## Prerequisites

**MUST pass before committing:**
- [ ] `/validate` completed successfully
- [ ] All tests pass
- [ ] No lint errors
- [ ] No type errors

---

## Step 1: Check Status

```bash
git status
git diff --stat
```

Review what will be committed.

---

## Step 2: Stage Changes

```bash
# Stage all changes
git add .

# Or stage specific files
git add path/to/file.py
```

---

## Step 2.5: MANDATORY Security Scan (NEVER SKIP)

**Before ANY commit, scan for secrets:**

```bash
# Scan staged files for secrets/credentials
git diff --cached --name-only | xargs grep -l -E \
  "(api[_-]?key|secret|password|token|credential|private[_-]?key|auth)" \
  --include="*.ts" --include="*.tsx" --include="*.py" --include="*.md" \
  --include="*.json" --include="*.yml" --include="*.yaml" 2>/dev/null || echo "✅ No secrets detected"

# Check for hardcoded API keys (common patterns)
git diff --cached | grep -E \
  "(sk-[a-zA-Z0-9]{20,}|xoxb-|ghp_|gho_|AKIA[A-Z0-9]{16}|AIza[a-zA-Z0-9_-]{35})" \
  && echo "🚨 POTENTIAL SECRET FOUND - DO NOT COMMIT" || echo "✅ No API key patterns found"

# Check for .env values accidentally in code
git diff --cached | grep -E "^\\+.*=['\"][^'\"]{20,}['\"]" | head -10
```

### Patterns to Block

| Pattern | Service | Action |
|---------|---------|--------|
| `sk-...` | OpenAI/Stripe | 🚨 BLOCK |
| `xoxb-...` | Slack | 🚨 BLOCK |
| `ghp_...` / `gho_...` | GitHub | 🚨 BLOCK |
| `AKIA...` | AWS | 🚨 BLOCK |
| `AIza...` | Google | 🚨 BLOCK |
| Supabase keys | Supabase | 🚨 BLOCK |
| `Bearer ...` hardcoded | Any | 🚨 BLOCK |

### If Secrets Found

1. **STOP** - Do not commit
2. **Remove** the secret from the file
3. **Use environment variable** instead: `process.env.API_KEY` or `os.environ["API_KEY"]`
4. **Re-stage** and re-scan
5. **If already committed**: Rotate the key immediately (it's compromised)

### Auto-Fix Pattern

```bash
# If .env value found in code, suggest replacement
# Before: const key = "sk-abc123..."
# After:  const key = process.env.OPENAI_API_KEY
```

**Security scan is MANDATORY. Never skip even for "quick fixes".**

---

## Step 3: Create Commit

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types
| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature/fix |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT token refresh"

# Bug fix
git commit -m "fix(api): handle null response in product fetch"

# With body
git commit -m "feat(pricing): add competitor price tracking

- Added PriceTracker service
- Integrated with bol.com API
- Added unit tests for price comparison

Closes #123"
```

---

## Step 4: Verify Commit

```bash
# Check commit was created
git log -1 --oneline

# View full commit
git show HEAD
```

---

## Commit Message Template

For walker-os aligned commits:

```
<type>(<scope>): <description>

Path: [A|B|Both]
Freedom Impact: [High|Medium|Low]

<body - what changed and why>

<footer - references, breaking changes>
```

Example:
```
feat(agent): add AI IT support agent MVP

Path: B
Freedom Impact: High

- Created IT support agent using PydanticAI
- Added RAG pipeline for IT knowledge base
- Integrated Stripe for token billing
- Added basic test suite

Implements Path B MVP for €10k/month goal
```

---

## Do NOT Commit If

- ❌ Security scan not run (Step 2.5 is MANDATORY)
- ❌ Secrets/credentials detected in scan
- ❌ Validation failed
- ❌ Tests are failing
- ❌ Contains debug code (console.log, print statements)
- ❌ Missing type hints
- ❌ Has lint errors
- ❌ API keys hardcoded (use env vars)
- ❌ .env file being committed (should be in .gitignore)

---

## Push (Optional)

After commit:

```bash
# Push to remote
git push origin <branch>

# Or push and set upstream
git push -u origin <branch>
```

---

## Quick Commit Flow

```bash
# Full flow
git add .
git status
git commit -m "type(scope): message"
git push
```

---

## Next Step

After committing, continue with:

| Scenario | Next Command |
|----------|--------------|
| More work to do | Continue implementation |
| Block complete | `/end-timeblock` (session summary) |
| Feature complete | `/execution-report` (document work) |
| Ready to deploy | `/deploy-ruben` or `/deploy-check` |

---

## Log to Project Tracking

**After successful commit:**

### 1. Update Agent Performance

```sql
INSERT INTO agent_performance (
  project_id,
  agent_name,
  task_type,
  predicted_value,
  actual_value
) VALUES (
  '{project_id}',
  'Developer',
  'feature_implementation',
  {estimated_hours},
  {actual_hours}
);
```

### 2. Update Project Tracking Status

```sql
UPDATE project_tracking
SET
  notes = notes || E'\n' || 'Commit: {commit_hash} - {commit_message}',
  updated_at = NOW()
WHERE
  project_id = '{project_id}'
  AND week_start_date = DATE_TRUNC('week', CURRENT_DATE)::DATE
  AND resource_name = 'Developer';
```

### 3. Check for Sprint Complete

```sql
-- Check if this commit completes the sprint
SELECT COUNT(*) AS remaining_tasks
FROM automation_events
WHERE project_id = '{project_id}'
  AND status = 'pending';

-- If remaining_tasks = 0, trigger execution report
```

**If sprint complete:**
```sql
INSERT INTO automation_events (
  event_type,
  project_id,
  triggered_by,
  event_data,
  next_command,
  status
) VALUES (
  'sprint_complete',
  '{project_id}',
  'Developer',
  '{"commit_hash": "{hash}", "sprint_end": "{date}"}',
  '/execution-report',
  'pending'
);
```

**Notify PM:** Send Telegram notification for execution report

**Test mode:** If `AGENT_MODE=test`, log to console but don't modify database
