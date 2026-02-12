---
title: "SOP: Self-Improvement Loop"
sidebar_label: "SOP: Self-Improvement Loop"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [sops, auto-synced]
---

# SOP: Self-Improvement Loop

**Purpose:** Capture learnings from implementation and feed them back into the system
**Trigger:** After completing any feature implementation or bug fix
**Time:** 15-30 minutes
**Delegatable:** Yes (with Claude Code access)

---

## When to Use

Run this loop after:
- Completing a feature (any size)
- Fixing a bug
- Any implementation where you learned something
- Sessions with divergences from the original plan

---

## The Loop

```
/validate → /execution-report → /system-review → Update Assets
```

---

## Step 1: Validate (2 min)

Run validation to ensure code is clean:

```bash
# In walker-os
pnpm lint && pnpm type-check && pnpm build
```

Or use the command:
```
/piv-loop:validate
```

**Exit criteria:** All checks pass (or document failures)

---

## Step 2: Execution Report (5-10 min)

Run:
```
/validation:execution-report
```

**What it captures:**
- Files added/modified with line counts
- Validation results (lint, types, build)
- What went well
- Challenges encountered
- Divergences from plan (if any)
- External dependencies touched

**Output:** `.agents/execution-reports/[feature]-[date].md`

---

## Step 3: System Review (10-15 min)

Run:
```
/validation:system-review
```

**What it does:**
1. Reads the execution report
2. Analyzes divergences
3. Identifies patterns (what keeps happening)
4. Scores alignment (1-10)
5. Proposes system improvements

**Key outputs:**
- Alignment score with rationale
- Divergence analysis (good vs bad)
- Pattern identification
- **Action items** (updates to CLAUDE.md, commands, reference docs)

**Output:** `.agents/system-reviews/[feature]-review-[date].md`

---

## Step 4: Update Assets (5-10 min)

Based on system review action items, update:

| Asset | When to Update |
|-------|----------------|
| `CLAUDE.md` | New rules, clarification triggers |
| `.claude/commands/*.md` | Command improvements |
| `*.md` | New patterns, thresholds |
| `.claude/agents/*.md` | Agent behavior changes |

**Quick action pattern:** If action item is:
- HIGH priority
- Single file change
- Atomic (self-contained)

→ Implement immediately, don't defer.

---

## Example Flow

```
1. Just fixed "Fix with AI" dialog bug

2. /piv-loop:validate
   → All passed

3. /validation:execution-report
   → Created: .agents/execution-reports/fix-ai-dialog-2026-01-17.md

4. /validation:system-review
   → Score: 8/10
   → Finding: "Should have tested in browser before marking complete"
   → Action: Add "browser test" to bug fix checklist in CLAUDE.md

5. Update CLAUDE.md
   → Added browser test reminder to bug fix section
```

---

## Quality Checklist

- [ ] Validation passed before starting
- [ ] Execution report captures all files changed
- [ ] System review has specific action items (not vague)
- [ ] At least one asset updated (or documented why not)
- [ ] Learnings are concrete and actionable

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Skip when "nothing went wrong" | Always run - even successes have learnings |
| Write vague learnings ("be more careful") | Write specific triggers ("when X, do Y") |
| Defer all action items | Implement atomic items immediately |
| Update without re-reading existing | Read current content, then edit |

---

## Delegation Notes

**For VA/Assistant:**
- Can run steps 1-3 independently
- Step 4 requires review before merging
- Provide them the commands and expected outputs

**For Claude Code:**
- Full delegation possible
- Just say: "Run the self-improvement loop for [feature]"

---

*This SOP itself was created through the self-improvement loop.*
