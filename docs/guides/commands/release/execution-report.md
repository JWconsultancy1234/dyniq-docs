---
description: "Generate implementation report for system review (auto-detects changes)"
argument-hint: [feature-name]
---

# Execution Report: $ARGUMENTS

## Purpose

Auto-generate implementation report by scanning git changes and comparing to plan.

**This command:**
1. Auto-detects files changed (git diff)
2. Auto-finds related plan (backlog scan)
3. Generates structured report
4. Feeds into `/system-review` and `/optimize`

---

## Auto-Detection (Parallel)

### Launch 4 Parallel Scans

```
Scan 1: Git changes since last commit/tag
        - Files added, modified, deleted
        - Lines changed (+X -Y)
        - Repos touched

Scan 2: Find related plan
        - Search  for matching PRD/story
        - Check .agents/context/ for related context file
        - Match feature name to epic

Scan 3: Validation results (see @validation-checklist.md)
        - Run: pnpm lint && pnpm type-check && pnpm build
        - Capture pass/fail for each

Scan 4: Observability check (NEW - 2026-01-29)
        - Is Langfuse configured for this feature?
        - Test: trigger feature, check traces appear in Langfuse UI
        - If backend: curl endpoint, verify trace in https://langfuse.dyniq.ai
        - If LangGraph: check OpenTelemetry spans are instrumented
```

---

## Report Template

Save to: `.agents/logs/execution-reports/[feature-name]-YYYY-MM-DD.md`

```markdown
# Execution Report: [Feature Name]

**Date:** YYYY-MM-DD
**Plan:** [auto-detected plan path]
**Context:** [auto-detected context path]

---

## Changes Summary

### Files Changed (Auto-Detected)

| Action | File | Lines |
|--------|------|-------|
| Added | [path] | +X |
| Modified | [path] | +X -Y |
| Deleted | [path] | -Y |

**Total:** +X -Y across N files

### Repos Touched

- [ ] walker-os
- [ ] dyniq-app
- [ ] dyniq-ai-agents
- [ ] dyniq-n8n

---

## Validation Results (Auto-Run)

| Check | Status | Details |
|-------|--------|---------|
| Lint | PASS/FAIL | [errors if any] |
| Type-check | PASS/FAIL | [errors if any] |
| Build | PASS/FAIL | [errors if any] |
| Tests | PASS/FAIL/SKIP | [if applicable] |
| **Observability** | PASS/FAIL/NOT_CONFIGURED | [Langfuse traces verified?] |

---

## Observability Verification (CRITICAL)

**For ANY deployed feature, verify tracing works:**

| Check | Command | Expected |
|-------|---------|----------|
| Langfuse configured | `grep LANGFUSE /opt/dyniq-voice/.env` | Keys present |
| Feature traced | Trigger feature, check Langfuse UI | Trace appears |
| Spans complete | Review trace in Langfuse | All steps visible |

**If NOT traced:** Create follow-up story for instrumentation (don't ship blind).

---

## Plan Adherence

### What Was Planned

[Auto-extracted from PRD/story - key deliverables]

### What Was Implemented

[Summary of actual work done]

### Alignment Score: __/10

---

## Divergences

### [Divergence 1]

| Field | Value |
|-------|-------|
| Planned | [what plan said] |
| Actual | [what was done] |
| Reason | [why] |
| Type | Better approach / Plan wrong / Blocker / Security / Performance |
| Justified | Yes/No |

---

## Challenges

- [Challenge 1: what was difficult and why]
- [Challenge 2: ...]

---

## Skipped Items

| Item | Reason |
|------|--------|
| [what] | [why skipped] |

---

## External Dependencies

| Service | Action | Reference |
|---------|--------|-----------|
| [service] | [what was done] | [ID/URL] |

---

## Recommendations for System Improvement

Based on this implementation:

### Command Improvements
- [ ] [suggestion for existing command]

### New Commands to Create
- [ ] `/[new-command]` for [manual process repeated]

### CLAUDE.md Additions
- [ ] [pattern to document]

### Reference Doc Updates
- [ ] [doc] needs [addition]

---

## Freedom Filter Check

| Question | Answer |
|----------|--------|
| Path served | A / B / Infrastructure |
| €72+/hr work | Yes / No |
| Could delegate | Yes / No - to whom |

---

## Next Steps

1. Run `/system-review` with this report
2. Run `/optimize` to check system health
3. Update plan status (move to done/ if complete)
4. **Executive Assistant:** Check if this work triggers any board meeting follow-ups or action items

---

## Executive Assistant Integration

**EA auto-check after report generation:**
- If work relates to board meeting decision → Update follow-up dashboard
- If milestone achieved → Trigger milestone review
- If action item completed → Update status in tracking

---

*This report auto-feeds into /system-review and EA follow-up tracking.*
```

---

## Auto-Detection Commands

```bash
# Git changes (run this)
git diff --stat HEAD~1
git diff --name-status HEAD~1

# Find related plan
ls features/ | grep -i "[feature-name]"
ls stories/ | grep -i "[feature-name]"

# Validation
pnpm lint && pnpm type-check && pnpm build
```

---

## Integration Points

| Feeds Into | How |
|------------|-----|
| `/system-review` | Pass report path as arg |
| `/optimize` | Patterns detected → command suggestions |
| `/end-timeblock` | Summary included in daily plan |

---

## NEVER Include

- Duration estimates ("~5 hours", "30 min on X")
- Time breakdowns ("3 hours for code")
- Speed claims ("quickly", "fast")

**Why:** Time data comes from `/end-timeblock`, not fabrication.

---

*Run after completing any feature. Feeds the self-improvement loop.*
