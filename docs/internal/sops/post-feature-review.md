---
title: "SOP: Post-Feature Review (Self-Improvement Loop)"
sidebar_label: "SOP: Post-Feature Review (Self-Improvement Loop)"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [sops, auto-synced]
---

# SOP: Post-Feature Review (Self-Improvement Loop)

**Owner:** Claude AI + Walker
**Frequency:** After every shipped feature
**Time Required:** 15-30 minutes
**Tools Needed:**
- Access to codebase
- Git for checking changes
- `/execution-report` and `/system-review` commands

---

## Purpose

Turn every feature implementation into a learning opportunity. Capture what worked, what didn't, and improve the system so the same problems don't recur.

## When to Trigger

Run this SOP after:
- Any feature that required `/plan-feature` or `/create-prd`
- Any implementation that hit unexpected issues
- Any work that took longer than planned
- End of a significant timeblock with code changes

**Skip for:** Quick-fixes, typos, documentation-only changes

---

## Checklist

### Phase 1: Execution Report (~10 min)

- [ ] Run `/execution-report` or create manually at `.agents/execution-reports/[feature]-YYYY-MM-DD.md`
- [ ] Document what was implemented:
  - [ ] Files added (list paths)
  - [ ] Files modified (list paths)
  - [ ] Lines changed (+X -Y)
- [ ] Document validation results:
  - [ ] Lint: PASS/FAIL
  - [ ] Type-check: PASS/FAIL
  - [ ] Build: PASS/FAIL (if run)
- [ ] Document challenges encountered:
  - [ ] What was difficult?
  - [ ] What workarounds were needed?
  - [ ] What took longer than expected?
- [ ] Document divergences from plan:
  - [ ] What was planned vs actual?
  - [ ] Why did divergence happen?
  - [ ] Was it justified?
- [ ] Document skipped items:
  - [ ] What wasn't implemented?
  - [ ] Why was it skipped?

### Phase 2: System Review (~15 min)

- [ ] Run `/system-review` or create manually at `.agents/system-reviews/[feature]-review-YYYY-MM-DD.md`
- [ ] Score plan adherence (1-10)
- [ ] Classify each divergence:
  - [ ] **Good:** Better approach found, external blocker, plan assumption wrong
  - [ ] **Bad:** Ignored constraints, took shortcuts, misunderstood requirements
- [ ] Identify patterns:
  - [ ] Did similar issues happen before?
  - [ ] Will this issue recur?
- [ ] Generate improvement actions:
  - [ ] CLAUDE.md updates needed?
  - [ ] Reference docs updates needed?
  - [ ] Commands updates needed?
  - [ ] New commands to create?

### Phase 3: Implement Improvements (~5-15 min)

- [ ] Apply CLAUDE.md updates (if any)
- [ ] Apply command updates (if any)
- [ ] Create new commands (if needed)
- [ ] Fix technical debt identified:
  - [ ] Files exceeding size limits?
  - [ ] Type workarounds (`any`) that should be fixed?
  - [ ] Missing tests?
- [ ] Commit improvements with descriptive message

### Phase 4: Code Quality Check

- [ ] Check file sizes:
  - [ ] Components < 200 lines?
  - [ ] Files < 500 lines?
  - [ ] If over limit: split into sub-components
- [ ] Check for workarounds:
  - [ ] Any `as any` casts?
  - [ ] Any `// @ts-ignore`?
  - [ ] Any eslint-disable comments?
  - [ ] If found: document as tech debt or fix now
- [ ] Check for missing pieces:
  - [ ] Types regenerated after migrations?
  - [ ] Loading states added?
  - [ ] Error handling complete?

---

## Output Files

| File | Location | Purpose |
|------|----------|---------|
| Execution Report | `.agents/execution-reports/[feature]-YYYY-MM-DD.md` | What happened |
| System Review | `.agents/system-reviews/[feature]-review-YYYY-MM-DD.md` | Why + improvements |
| Updated CLAUDE.md | `/CLAUDE.md` | Permanent learnings |
| New/Updated Commands | `.claude/commands/` | Process automation |

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Don't know what diverged | Compare PRD checklist to actual implementation |
| Not sure if divergence is good/bad | Ask: "Would the plan author have approved this change?" |
| No patterns identified | Focus on: "Will this issue happen again?" |
| Improvement seems too small | Small improvements compound; document anyway |
| Takes too long | Time-box to 30 min; capture most important items first |

---

## When to Escalate

Ask Walker for guidance if:
- Divergence impacts multiple systems
- Improvement requires architectural decision
- Technical debt would take > 2 hours to fix
- Unsure if issue is one-time or recurring

---

## Done Criteria

Task is complete when:
- [ ] Execution report exists and is accurate
- [ ] System review exists with scored divergences
- [ ] At least ONE improvement action is implemented (if any were identified)
- [ ] All changes are committed
- [ ] No open technical debt without documented reason

---

## The Loop

```
Feature Complete
      │
      ▼
/execution-report ────► Document what happened
      │
      ▼
/system-review ───────► Analyze why, identify improvements
      │
      ▼
Implement fixes ──────► Update CLAUDE.md, commands, code
      │
      ▼
Commit ───────────────► Permanent improvement
      │
      ▼
Next Feature ─────────► System is smarter
```

---

## Freedom Filter Check

| Question | Answer |
|----------|--------|
| Value per hour | **>€72** (prevents future wasted time) |
| Energy | **Gives** (satisfying to improve the system) |
| Quadrant | **Produce** (keep doing yourself) |

**Note:** This is NOT a task to delegate. The insights come from doing the work yourself. The VALUE is that future work becomes easier.

---

*Every feature ships twice: once as code, once as learning.*
