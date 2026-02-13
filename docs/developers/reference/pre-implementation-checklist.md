---
title: "Pre-Implementation Checklist"
sidebar_label: "Pre-Implementation Checklist"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Pre-Implementation Checklist

Verify implementation state before executing any plan. Pattern detected 4+ times where plans were created for already-implemented code.

---

## When to Use

Before `/execute-story` or `/execute` on any plan:
1. New plans from backlog
2. Plans that haven't been touched in >24 hours
3. After context switches between repos

---

## Quick Check Commands

### Python Projects (dyniq-ai-agents)

```bash
# Check if planned files exist
ls -la agents/pydantic_ai/board_meeting/*.py | head -10

# Search for planned class/function
grep -r "class MeetingCostTracker" agents/ -l
grep -r "def calculate_savings" agents/ -l

# Check recent commits
git log --oneline -10 | grep -i "[feature-keyword]"
```

### Database Column Type Check (NEW - 2026-02-02)

**Before INSERT/UPSERT to new tables, verify column types:**

```sql
-- Check expected column types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

**Critical columns to verify:**
| Column | Expected | Common Mistake |
|--------|----------|----------------|
| `source_id` | UUID | Passing string like "bm-xxxxx" |
| `metadata` | JSONB | Passing Python dict without serialization |
| `embedding` | vector(1536) | Wrong dimension count |

**Incident (2026-02-02):** `universal_embeddings.source_id` is UUID type, but code passed string thread_id. Fixed with UUID5 deterministic conversion.

### Column Existence Check via REST API (NEW - 2026-02-12)

**Before running ALTER TABLE, check if column already exists:**

```bash
# Returns 200 with data if column exists, 400 with error if not
curl -s "${SUPABASE_URL}/rest/v1/leads?select=column_name&limit=1" \
  -H "apikey: ${SUPABASE_KEY}"
```

**Faster than DDL and works without direct DB access.** Use when Supabase CLI is not authenticated or DB password unavailable.

**Incident (2026-02-12):** DYN-200 planned ALTER TABLE for `key_moments` column, but REST API check showed it already existed. Saved migration time.

### CHECK Constraint Verification (NEW - 2026-02-12)

**Before writing new enum values to existing columns:**

```bash
# Check CHECK constraint on column
curl -s "${DYNIQ_SUPABASE_URL}/rest/v1/leads?select=call_outcome&call_outcome=not.is.null&limit=10" \
  -H "apikey: ${DYNIQ_SUPABASE_KEY}"
```

| Column | Constraint | Common Mistake |
|--------|-----------|----------------|
| `call_outcome` | `leads_call_outcome_check` (8 values) | Adding new enum values not in constraint |
| `urgency` | CHECK (valid enum) | Passing empty string instead of null |

**Incident (2026-02-12):** `_classify_call_outcome()` returned `"engaged"` but `leads_call_outcome_check` only allows 8 specific values. Runtime error on Supabase INSERT. Fixed with OUTCOME_DB_MAP.

### PyPI Version Verification (NEW - 2026-02-12)

**Before pinning dependency versions in requirements.txt:**

```bash
pip index versions livekit-plugins-noise-cancellation 2>/dev/null || \
  pip install livekit-plugins-noise-cancellation== 2>&1 | grep "from versions"
```

**Incident (2026-02-12):** Plan specified `>=1.0` but package maxes at `0.2.5`. Docker build failed.

### LiveKit Plugin Param Verification (NEW - 2026-02-12)

**LiveKit plugins wrap raw provider APIs with different param names:**

| Raw API Param | LiveKit Plugin Param | Plugin |
|---------------|---------------------|--------|
| `endpointing` | `endpointing_ms` | deepgram |
| `interim_results` | Default `True` (omit) | deepgram |

**Always check plugin source, not raw provider docs.**

**Incident (2026-02-12):** `endpointing=500` crashed with `TypeError: unexpected keyword argument`. Correct: `endpointing_ms=500`.

### Function Signature Verification (NEW - 2026-02-05)

**Before writing orchestration code that calls extraction/analysis functions:**

```bash
# 1. Check actual function signatures
grep -n "def extract_icp_profile\|def extract_keywords\|def extract_usps" agents/pydantic_ai/style_transfer/*.py

# 2. Verify kwargs in caller match function definition
grep -n "extract_icp_profile(" api/routes/style_transfer.py
# Compare parameter names with step 1 output
```

**Common mistakes:**

| Error | Root Cause | Prevention |
|-------|-----------|------------|
| `TypeError: unexpected keyword argument` | Caller uses wrong param name | Grep function def before calling |
| `NoneType has no attribute 'get'` | Agent returns None, not dict | Add `isinstance(x, dict)` check |
| `list indices must be integers` | Agent returns list, not dict | Filter with `if isinstance(x, dict)` |

**Pattern:** When iterating over agent analysis results, always filter:
```python
for name, analysis in agent_analyses.items():
    if isinstance(analysis, dict):
        # Safe to use analysis.get(...)
```

**Incident (2026-02-05):** `extract_icp_profile()` called with `product_name=`, `industry=` but actual params are `usps=`, `title=`, `description=`. 5-min grep would have caught this.

### Duplicate Code Check (NEW - 2026-02-01)

**Before creating utility functions, check if similar exists:**

```bash
# Check for existing implementations
grep -r "def parse.*json\|_parse_json" agents/ shared/
grep -r "json\.loads" agents/ | grep -v test | head -20

# Check for duplicate utility functions
grep -r "def _parse\|def handle" agents/ | sort | uniq -c | sort -rn | head -10
```

**If 2+ similar implementations exist → refactor to shared utility, don't add another.**

**Incident (2026-02-01):** 7 duplicate JSON parsers found across agents. Same bug appeared in multiple files. PRD-robust-json-parsing created to fix.

### Node.js Projects (walker-os)

```bash
# Check if planned files exist
ls -la src/components/*.tsx | head -10
ls -la src/lib/*.ts | head -10

# Search for planned exports
grep -r "export function" src/lib/*.ts | head -10
grep -r "export const" src/components/*.tsx | head -10

# Check recent commits
git log --oneline -10 | grep -i "[feature-keyword]"
```

### Migration Target Path Check (NEW - 2026-02-12)

**Before writing migrated content to target paths, verify targets don't already exist:**

```bash
# Check ALL planned target paths exist or not
for f in docs/path/file1.md docs/path/file2.md; do
  [ -f "$f" ] && echo "EXISTS: $f" || echo "NEW: $f"
done
```

**If file EXISTS:** Read it first, then decide: skip (content already good), extend, or replace.

**Incident (2026-02-12):** brand-voice.md Write failed because file already existed from Sprint 1/2. Caused 3 sibling parallel writes to also fail. 3rd occurrence of Write-before-Read pattern.

---

## Decision Matrix

| Files Exist? | Implementation % | Action |
|--------------|------------------|--------|
| No | 0% | Proceed with full execution |
| Partial | <50% | Execute remaining tasks only |
| Yes | 50-80% | Execute gaps, mark partial complete |
| Yes | >80% | **Skip to validation**, mark COMPLETE |

## Estimation Calibration (Pattern 10x+ - 2026-02-08)

| Task Type | Estimate Multiplier | Examples |
|-----------|---------------------|---------|
| Template-driven (exact format in PRD) | 0.08-0.20x | STORY-04: 4h→0.5h, STORY-08: 4h→0.33h, STORY-11: 5h→0.5h |
| AI-delegatable content generation | 0.02-0.05x | DYN-7 Wave 1: 7 SP (~14h) in ~15 min. GDPR/brochure/roadmap via specialist agents |
| Deploy-only (no code changes) | 0.15-0.25x | STORY-06: 0.17x, STORY-09 deploy: ~0.25x |
| Reuse-based (extending prior tools) | 0.10-0.15x | STORY-09 sync script: L est→10 min (reused export parser) |
| Parallel agent execution on single file | 0.08-0.12x | STORY-08: 3 agents on agent_registry.py |
| Pre-existing work (>80%) | 0.10-0.20x | STORY-01: 0.5h→0.25h |
| Linear PM setup (board meeting → issues) | 0.20-0.30x | DYNIQ Premium: 3h actual vs ~10h waterfall for 32 issues |
| Novel implementation | 1.0-1.5x | Standard |
| Cross-repo integration | 1.5-2.0x | Per infrastructure docs |

**Pattern (10x+):** Template-driven tasks are 5-12x faster. AI content generation with specialist agents is 20-50x faster (0.02x multiplier). Linear PM setup from board meeting: 3h for 32 issues. Cumulative Agent Teams: 2.83h actual vs 20h estimated (0.14x).

## Net-Zero Line Budget Rule (2026-02-06)

**When modifying a file already over its line limit:**

1. Count lines you're ADDING
2. Extract at least that many lines to a reference doc
3. Result: net-zero or net-negative line change

| File Limit | Action When Over |
|------------|-----------------|
| CLAUDE.md (200) | Extract sections to `@` docs |
| Agent files (300) | Extract details to reference docs, keep summary tables |
| Reference docs (300) | Split into sub-docs with @import |
| Any file (500) | Mandatory split before adding content |

**Pattern (10+ stories):** agent-orchestration.md grew from ~300 to 789 lines across 10+ stories. Each story added 20-50 "within scope" lines without extraction. Fixed 2026-02-06 by extracting to `board-meeting-internals.md` and `agent-protocols.md`.

---

## Verification Steps

### Step 1: Check Git History for Feature Keywords

**CRITICAL:** Search recent commits for feature-related keywords BEFORE checking files.

```bash
# Extract keywords from plan (e.g., "timeout", "cache", "alert")
git log --oneline -20 | grep -iE "(timeout|budget|cache|alert|[plan-keyword])"
```

If feature keyword found in recent commits:
1. Read those commit diffs: `git show [SHA]`
2. Compare to plan requirements
3. If >80% match → **SKIP to validation**

**Incident (2026-02-01):** Task 1.1 (timeout budget) was already in commit `d6334c3` but Phase 0 didn't check git log, causing duplicate implementation attempt.

### Step 2: Check File Existence

For each file listed in plan's "Files to Create/Modify":

```bash
ls -la [file_path]
```

- If file doesn't exist → Plan to create
- If file exists → Read and compare to requirements

### Step 2: Compare to Requirements

For each existing file:

1. Read the file content
2. Check for key functions/classes mentioned in plan
3. Verify feature completeness:
   - [ ] Core logic implemented
   - [ ] Error handling present
   - [ ] Integration with other modules
   - [ ] Tests (if specified in plan)

### Step 3: Score Implementation

| Score | Meaning | Action |
|-------|---------|--------|
| 0-25% | Skeleton only | Execute plan |
| 25-50% | Partial implementation | Execute remaining |
| 50-80% | Most features done | Fill gaps |
| 80-100% | Fully implemented | Skip to validation |

### Step 4: Update Plan Status

If implementation >80%:

```markdown
## Status Update

**Status:** COMPLETE (Pre-Implementation Check)
**Discovery:** Code already implemented in prior session
**Next:** Run validation only
```

---

## Common Patterns That Trigger This

### Pattern 1: Same-Day Implementation

Plans created in morning session, implemented in afternoon session, then re-planned next day.

**Prevention:** Check git log for same-day commits on related files.

### Pattern 2: Cross-Session Context Loss

Implementation done in Session A, plan created in Session B without Session A context.

**Prevention:** Always check recent commits before creating plans.

### Pattern 3: Parallel Work Streams

Multiple agents/sessions working on related features.

**Prevention:** Check for PRs and branches before executing.

### Pattern 4: Cross-EPIC Duplicate Scope

Items marked DEFER in one EPIC but already COMPLETE in related EPIC. Or items moved to new EPIC but not removed from old.

**Prevention:** Run cross-EPIC scope check before executing.

---

## Cross-EPIC Scope Check

**When auditing or executing EPIC-related work:**

```bash
# 1. Search for PBS item IDs across ALL EPICs
grep -r "BM-009\|SW-007\|VP-004" epics/

# 2. Check for DEFER items that might be COMPLETE elsewhere
grep -r "DEFER" epics/*.md | head -20

# 3. Look for MOVED markers without cleanup
grep -r "MOVED\|Moved to" epics/*.md

# 4. Verify parent EPIC updated when child EPIC completes
# If EPIC-X embeds EPIC-Y, check both have consistent status
```

**Checklist:**

- [ ] Search for PBS item IDs across ALL EPICs in `backlog/epics/`
- [ ] Check if DEFER items exist as COMPLETE in related EPICs
- [ ] Verify no duplicate scope between parent/child EPICs
- [ ] Confirm MOVED items removed from source EPIC

**Incident (2026-02-01):** R&D Research marked DEFER in Board Meeting but COMPLETE in swarm-expansion. UI-to-Code items in both Board Meeting and Vision Pipeline EPICs.

---

## Integration with Commands

### `/execute-story`

Phase 0 now runs this checklist automatically. If >80% complete, skips to Phase 3 (validation).

### `/create-prd` and `/plan-feature`

Should include "Implementation State" check before finalizing plan:

```markdown
## Implementation State Check

- [ ] Checked for existing files
- [ ] Checked recent git commits
- [ ] Verified no parallel work in progress
- [ ] Implementation %: ____%
```

### `/audit-plans`

Should flag plans where implementation might already exist:

```bash
# For each plan, check if files exist
for plan in plans/*.md; do
  # Extract file paths from plan
  # Check if they exist in codebase
done
```

---

## Historical Incidents

| Date | Incident | Time Wasted | Root Cause |
|------|----------|-------------|------------|
| 2026-01-27 | Obsidian installation | ~30 min | Agent proposed execution for completed work |
| 2026-01-30 | Board meeting S5-02 | ~15 min | Discovered already done via /explore |
| 2026-01-30 | OpenRouterClient | ~20 min | Client already existed in codebase |
| 2026-01-30 | Token management | ~30 min | All 4 layers already implemented |
| 2026-02-01 | Board Meeting EPIC cleanup | ~20 min | Cross-EPIC duplicates not detected (R&D, UI-to-Code) |
| 2026-02-01 | BM-P2 Task 1.1 | ~5 min | Git log not checked, feature already in `d6334c3` |

**Total pattern occurrences:** 6+
**Automation threshold:** 3 (exceeded)

---

## Automation Status

- [x] Phase 0 added to `/execute-story` (2026-01-30)
- [x] Pattern added to anti-patterns table
- [x] Reference doc created (this file)
- [x] CLAUDE.md updated with quick reference
- [x] Cross-EPIC scope check added (2026-02-01)
- [x] `/audit-plans` cross-EPIC duplicate detection (2026-02-01)
- [x] `/audit-plans` Child EPIC Completion Protocol (2026-02-01)
- [ ] `/audit-plans` staleness check automation (P3 backlog)

---

**Post-implementation verification, completion audits, integration checks, and agent execution patterns:**

---

*Pattern detected 4+ times -> automation applied. Prevents ~30 min waste per incident.*
