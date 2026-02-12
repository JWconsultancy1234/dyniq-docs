---
description: "Self-learning story execution with automatic post-execution cleanup"
argument-hint: "[story-or-plan-file] [--parallel PLAN-2.md PLAN-3.md]"
---

# Execute Story: Complete Self-Learning Loop

Execute stories/plans with **automatic post-execution cleanup**. One command does everything.

---

## CRITICAL: Agent Behavior Requirements

**YOU (Claude) MUST:**

1. **After implementation is done** - Use `AskUserQuestion` tool to prompt for each post-execution step
2. **Carry forward EPIC context** - Read previous learnings before starting
3. **Run the full loop** - Never stop after just implementation

**If user says "done", "finished", "complete", or similar → START THE POST-EXECUTION LOOP IMMEDIATELY.**

---

## Phase 0: Load EPIC Context (FIRST!)

**Before any work, load learnings from previous stories in this EPIC:**

```bash
# Find EPIC context file
ls .agents/context/EPIC-*.md

# Read latest learnings
cat .agents/context/EPIC-[name]-context.md
```

If context file exists, apply learnings to current story execution.

---

## Phase 1: Pre-Implementation Scan

Check if code already exists:

```bash
ls -la [planned_file_path]
grep -r "class ClassName" path/ -l
```

| Files Exist? | Matches Plan? | Action |
|--------------|---------------|--------|
| No | N/A | Proceed to implementation |
| Yes | >80% | SKIP to validation |

---

## Phase 1.5: Target Repository Verification (Pattern hit 3x)

**CRITICAL:** Verify target repo BEFORE implementing:

```bash
# Check plan for target repo
grep -E "target.*repo|apps/|location" [plan_file]
```

| Target | Path | Framework |
|--------|------|-----------|
| Landing page | `dyniq-app/apps/landing/` | Astro |
| Demo app | `dyniq-app/apps/demo/` | Next.js 16 |
| Walker-OS | `walker-os/apps/web/` | Next.js |
| Agent API | `dyniq-ai-agents/` | FastAPI |

**If unclear, ASK user:** "Target repo is [X]? Confirm?"

**Incident 2026-02-03:** 10 min wasted on wrong repo in Phase 6 Frontend Demo.

---

## Phase 2: Implementation

Execute plan tasks. Document issues as they occur.

---

## Phase 2.5: Definition of Done Checklist (MANDATORY)

### RULE #1 CHECKPOINT: No Claims Without Proof

**Before saying ANYTHING is "done", "fixed", or "working":**

| Claim | Required Proof |
|-------|---------------|
| "Fixed" | Actual test output showing it works |
| "Working" | Real E2E response pasted in message |
| "Complete" | List of what works + what doesn't |
| "Deployed" | Health check URL output |

**If you cannot show proof → say "I need to verify" instead.**

### Plan Item Verification (DO THIS BEFORE MOVING ON)

```markdown
1. **Read the plan step-by-step**
2. **For EACH item, mark:**
   - ✅ DONE - implemented as specified + proof shown
   - ⏳ DEFERRED - not done, needs user approval
   - 🔄 MODIFIED - done differently, document why

**If ANY item is DEFERRED:**
- ASK user: "Plan item [X] not implemented. Defer or implement now?"
- Document user decision in execution report
- NEVER silently defer plan items
```

### E2E Test Requirement

**Run E2E test if story has ANY of these tags/touches:**

| Trigger | E2E Required | Test Level |
|---------|--------------|------------|
| "swarm" or "agent" | YES | Level 2+ |
| "API" or "endpoint" | YES | curl + verify |
| "deploy" or "runtime" | YES | health + smoke |
| "Director" or "VP" | YES | Level 3 |
| "Industry Advisor" | YES | Level 4 |
| "Task Force" or "spawn" | YES | Level 4-5 |

**E2E must pass BEFORE proceeding to post-execution loop.**

### Full Test Suite Requirement (SAC-026 Pattern)

**Run FULL test suite before marking phase/EPIC complete:**

```bash
# Unit tests
pytest tests/unit/ -v

# E2E tests (mocked, fast)
pytest tests/integration/ -v

# All tests summary
pytest --tb=short
```

| Test Type | When Required | Pass Threshold |
|-----------|---------------|----------------|
| Unit tests | Every story | 100% |
| E2E tests | Agent/API changes | 100% |
| Full suite | Phase completion | 100% |

**Incident (2026-02-02):** E2E tests were silently failing due to API key validation. Only discovered when adding new tests. Run full suite to catch infrastructure bugs.

**If tests fail:** Fix before declaring complete. Document in execution report.

---

## Phase 2.7: Issue Documentation (MANDATORY per issue)

**For EACH issue marked Done, create documentation entry with:**

| Section | Content |
|---------|---------|
| What was done | Technical summary of changes |
| File output | Path to created/modified files |
| How to use | Step-by-step for Walker/VA/delegate |
| How to modify | Where to edit, how to deploy |
| Template variables | If applicable, list all `{{vars}}` |

**Save to:** `.agents/docs/execution-logs/[parent-issue]-[wave]-execution-log-[date].md`
**Also:** Add Linear comment to each completed issue with completion details.

**Why:** User explicitly requires documentation/SOP/playbook per closed issue. Pattern 2x (2026-02-08).

---

## Phase 3: Post-Execution Loop (MANDATORY)

**WHEN USER SAYS "DONE" → RUN THIS LOOP USING AskUserQuestion:**

### Step 1: Validation
```
ASK: "Run validation? (lint, type-check, tests, build)"
If YES → Run validation commands
If NO → Skip, note in report
```

### Step 2: Deploy
```
ASK: "Deploy to production?"
If YES → Run deploy + health check
If NO → Skip
```

### Step 3: Execution Report
```
ASK: "Generate execution report?"
If YES → Create .agents/logs/execution-reports/[feature]-[date].md
         - Files changed (git diff)
         - Lines added/removed
         - Alignment score
         - Divergences with justification
```

### Step 4: System Review
```
ASK: "Run system review?"
If YES → Create .agents/logs/system-reviews/[feature]-review-[date].md
         - Divergence analysis
         - Pattern detection (check against previous reviews)
         - Recommendations
```

### Step 5: Apply Recommendations
```
ASK: "Apply recommendations to reference docs?"
If YES → Update *.md with patterns
         Create/update .agents/logs/optimizations/OPT-[date].md
```

### Step 6: Update Docs
```
ASK: "Update EPIC, sprint plan, and daily plan?"
If YES → Mark story complete in:
         - EPIC (update progress %)
         - Sprint plan (mark done)
         - Daily plan (add summary)
```

### Step 7: Archive
```
ASK: "Move completed plans/stories to done/?"
If YES → mv to done/
```

### Step 8: Next Story Prep + EPIC Context Update
```
ASK: "Prepare next story with learnings?"
If YES →
  1. Update EPIC context file with learnings
  2. Update PLAN-MASTER-EXECUTION.md (mark completed, update time analysis)
  3. Add learnings to next story's plan
  4. Show: "Next story: [STORY-ID] - ready with [X] learnings applied"
```

### Step 8b: Master Plan Auto-Update (NEW)

**Always update these files after story completion:**

| File | What to Update |
|------|----------------|
| `.agents/context/EPIC-*-context.md` | Add learnings, update stories completed |
| `plans/PLAN-MASTER-EXECUTION.md` | Mark story COMPLETE, update time analysis |
| EPIC file | Update phase progress %, mark stories done |

**Why:** Prevents context drift. Next session has accurate status.

### Step 8c: Document Verification (MANDATORY - Pattern 6+ times)

**CRITICAL:** Before claiming ANY work complete, run this verification:

```bash
# Find all related docs (replace "phase6" with your feature name)
find .agents -name "*[feature-name]*" -type f | head -20

# Verify each doc has today's date or status update
for f in $(find .agents -name "*[feature-name]*" -type f); do
  echo "=== $f ==="
  grep -E "Status:|DONE|COMPLETE|2026-02-" "$f" | head -3
done
```

**8-Document Checklist (verify ALL 8, not from memory):**

| # | Document | Location | Verify |
|---|----------|----------|--------|
| 1 | EPIC file | `epics/` | `grep "STORY-XX" EPIC*.md` |
| 2 | Context file | `.agents/context/` | `grep "Last Updated" *context*.md` |
| 3 | PLAN-MASTER-EXECUTION | `plans/` | `grep "[feature]" PLAN-MASTER*.md` |
| 4 | Sprint log | `.agents/logs/sprints/` | `grep "STORY-XX" SPRINT*.md` |
| 5 | **PLAN (feature plan)** | `plans/` | Status updated, not just at completion |
| 6 | STORY | `stories/` | Moved to done/ if complete |
| 7 | PRD | `features/` | Moved to done/ if complete |
| 8 | Execution reports | `.agents/logs/execution-reports/` | Created |

**Anti-pattern:** Saying "done" based on memory. Always verify actual file state.

**Incident (2026-02-03):** PLAN-phase6-style-transfer.md missed in audit. User asked 2x "are you sure everything updated?". Pattern has occurred 6+ times (threshold: 3).

**IF ANY DOC MISSING:** Fix before claiming complete.

---

## EPIC Context Carry-Over System

### Location

```
.agents/context/EPIC-[name]-context.md
```

### Structure

```markdown
# EPIC Context: [EPIC-NAME]

**Last Updated:** [date]
**Stories Completed:** [list]

## Cumulative Learnings

| Story | Learning | Application |
|-------|----------|-------------|
| SAC-001 | Inline prompts in agent_registry.py | Follow existing pattern |
| SAC-002 | VP tier uses list pattern not dict | Match CSUITE_AGENTS format |
| SAC-003 | LEVEL_CONFIG belongs in registry | All configs in one file |

## Recurring Patterns (Apply to ALL Stories)

1. **Pattern:** [description]
   **Apply:** [how to apply in future stories]

## Blockers Resolved

| Story | Blocker | Resolution |
|-------|---------|------------|

## Open Questions for Remaining Stories

- [question for SAC-005]
```

### Agent Responsibility

**After EACH story completion:**
1. Read existing context file
2. Append new learnings
3. Update "Stories Completed" list
4. Add any patterns that occurred 2+ times to "Recurring Patterns"

**Before EACH story start:**
1. Read context file
2. Apply recurring patterns proactively
3. Reference previous learnings in implementation

---

## Parallel Execution Support

```bash
/execute-story PLAN-001.md --parallel PLAN-002.md PLAN-003.md
```

All post-execution steps run ONCE for all plans combined.

---

## Signals That Trigger Post-Execution Loop

| User Says | Action |
|-----------|--------|
| "done" | Start post-execution loop |
| "finished" | Start post-execution loop |
| "complete" | Start post-execution loop |
| "that's it" | Start post-execution loop |
| "deploy" | Start at deploy step |

---

## Context Window Continuation Rule (Pattern 4x - 2026-02-06)

**When story execution spans context window summarization:**
- The 8-doc checklist may lose state across the boundary
- **After ANY context continuation:** Re-read the story file to check DoD status
- If execution report is missing, generate it immediately before proceeding
- System review catches this, but execution report should be proactive

**Front-Load Strategy (NEW - 4th occurrence):**
- When context is approaching limit (~80% used), generate execution report BEFORE continuation
- Execution report is the artifact most often lost during context compression
- Priority order: (1) execution report, (2) doc updates, (3) system review

**Incident history:** SAC Phase 2, STORY-04, STORY-08, STORY-09 all had execution reports forgotten due to context boundaries.

---

## Anti-Pattern: What NOT To Do

❌ Stop after implementation without prompting
❌ Wait for user to manually invoke `/execution-report`
❌ Forget learnings from previous stories
❌ Skip EPIC context check
❌ **Silently defer plan items without user approval**
❌ **Skip E2E when story touches runtime/agents/swarm**
❌ **Declare "complete" before checking ALL plan items**
❌ **Deploy without verifying code is on server**
❌ **Declare "done" without running completion audit (Step 9)**
❌ **Skip execution report after context window continuation** (Pattern 3x)

---

## Incident Log

| Date | Issue | Fix |
|------|-------|-----|
| 2026-02-01 | User had to manually invoke post-execution commands | Added mandatory AskUserQuestion loop |
| 2026-02-01 | No context carry-over between SAC stories | Added EPIC context system |
| 2026-02-01 | PLAN-MASTER-EXECUTION.md not updated after completions | Added Step 8b auto-update requirement |
| 2026-02-01 | SAC context file missing BM-P2 completion | Context should include related work, not just numbered stories |
| 2026-02-01 | E2E testing skipped, user had to request | Added Phase 2.5 DoD with E2E trigger tags |
| 2026-02-01 | Plan items silently deferred | Added "NEVER silently defer" rule |
| 2026-02-01 | Execution report/learnings not generated | Added to anti-patterns list |
| 2026-02-01 | False "done" claims (4-5 times) | Added mandatory completion audit (Step 9) |
| 2026-02-02 | **P0: Hallucination - claiming "fixed" without proof** | Added RULE #1 checkpoint in Phase 2.5 |
| 2026-02-02 | E2E tests silently failing (API key validation) | Added full test suite requirement before phase completion |
| 2026-02-06 | Execution report forgotten 4th time (STORY-09 context continuation) | Added front-load strategy + updated pattern count to 4x |

---

## Step 9: Completion Audit (MANDATORY)

**Before declaring ANY story complete, run this audit:**

### 9a. Launch Parallel Audit Agents

```
Task 1: Check EPIC file - does agent count, phase status match reality?
Task 2: Check PRIORITY-MASTER-LIST - does status match EPIC?
Task 3: Check PLAN-MASTER-EXECUTION - does status match EPIC?
Task 4: Verify completed plans are in done/ folder
```

### 9b. Cross-Check Consistency

| Document | Check |
|----------|-------|
| EPIC | Agent counts, phase status, story checkmarks |
| PRIORITY-MASTER-LIST | Phase status, investment hours |
| PLAN-MASTER-EXECUTION | Group status, next command |
| Context file | Learnings, stories completed list |

### 9c. Document Update Checklist (ALL 7 REQUIRED)

**When user says "update all documents", update EXACTLY these 7:**

| # | Document | Location | Action |
|---|----------|----------|--------|
| 1 | EPIC file | `epics/` | Mark story ✅ COMPLETE |
| 2 | Context file | `.agents/context/` | Add learnings |
| 3 | PLAN-MASTER-EXECUTION | `plans/` | Update status table |
| 4 | Sprint log | `.agents/logs/sprints/` | Mark story complete |
| 5 | PLAN | `plans/` | Move to `done/` |
| 6 | STORY | `stories/` | Move to `done/` |
| 7 | PRD | `features/` | Move to `done/` |
| 8 | Execution report | `.agents/logs/execution-reports/` | Create with changes, alignment, velocity |

### 9d. Run Automated Verification

**Before declaring complete, run:**

```
/verify-story-complete {STORY-ID}
```

This command checks all 8 items (7 document types + execution report) and reports what's missing.

### 9e. Only Declare Complete When

- [ ] `/verify-story-complete` shows 8/8 ✅ (7 docs + execution report)
- [ ] Git status is clean
- [ ] Execution report saved
- [ ] No uncommitted fixes

**Anti-pattern:** "I'm done" without running `/verify-story-complete` = NOT DONE

**Incident (2026-02-01):** Agent claimed "done" 4-5 times. Each time user pushed back, more issues found.
**Incident (2026-02-02):** Agent said "done" but missed PLAN-MASTER-EXECUTION, Sprint, PLANs, STORYs, PRDs.

**Root cause:** "All documents" is vague. Must enumerate exactly 7 document types.

---

## Files to Auto-Update After Each Story

1. **EPIC context file** (`.agents/context/EPIC-*-context.md`)
   - Stories completed list
   - Cumulative learnings
   - Next story prep

2. **Master execution plan** (`plans/PLAN-MASTER-EXECUTION.md`)
   - Quick Reference table (mark COMPLETE)
   - Time analysis (add actual times)
   - Dependency unlock status

3. **EPIC file** (`epics/EPIC-*.md`)
   - Phase progress percentage
   - Story status checkmarks

---

*One command. Complete loop. Learnings preserved. Ready for next story.*
