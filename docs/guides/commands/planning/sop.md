---
description: "Quick reference: when to use which command"
---

# SOP: Command Guide

## Quick Decision Tree

```
What do you need?
│
├── Start working? ──────────────► /begin-timeblock
│
├── Stop working? ───────────────► /end-timeblock
│
├── Plan tomorrow? ──────────────► /daily-plan
│
├── Research/explore something? ─► /explore
│   (new tool, architecture decision)
│
├── Fix something small? ────────► /quick-fix
│   (typo, bug, <30 min)
│
├── Build a feature? ────────────► Which size?
│   │
│   ├── Simple (1-2 files) ──────► /plan-feature --level=1
│   │
│   └── Complex (3+ files) ──────► /create-prd → /plan-feature
│
├── Write code? ─────────────────► /execute
│
├── Check code quality? ─────────► /validate
│
├── Save changes? ───────────────► /commit
│
├── Just shipped a feature? ────► /execution-report → /system-review
│   (self-improvement loop)
│
├── Added database tables? ─────► /regenerate-types
│   (Supabase type errors)
│
├── Create SOP for delegation? ──► /write-sop
│
├── Clean up codebase? ─────────► /cleanup
│   (duplicates, stale files, docs)
│
└── Not sure? ───────────────────► /prime (get context first)
```

---

## Command Reference

### Daily Flow

| When | Command | Output |
|------|---------|--------|
| Morning | `/begin-timeblock` | Load context, start tracking |
| End of block | `/end-timeblock` | A-Z summary, update daily plan |
| Evening | `/daily-plan` | Tomorrow's priorities |
| Sunday | `/weekly-plan` | Week overview |

### Development Flow

| Task Size | Commands | Time |
|-----------|----------|------|
| **Tiny** (typo, 1 line) | `/quick-fix` | ~5 min |
| **Small** (1-2 files) | `/plan-feature --level=1` → `/execute` | ~30 min |
| **Medium** (3-5 files) | `/plan-feature --level=2` → `/execute` | ~1 hr |
| **Large** (new feature) | `/create-prd` → `/plan-feature` → `/execute` | ~2+ hrs |

### Always Before Commit

```
/validate → /commit
```

### Self-Improvement Loop

| When | Command | Output |
|------|---------|--------|
| After shipping feature | `/execution-report` → `/system-review` | Process improvements |
| After project completion | `/system-review` | CLAUDE.md updates |
| Monthly maintenance | `/cleanup` | Cleaner codebase |
| After database migration | `/regenerate-types` | Fixed TypeScript types |

**SOP:** See `.agents/sops/post-feature-review.md` for full checklist.

**The Loop:**
```
Feature Complete → /execution-report → /system-review → Implement fixes → Commit
```

Every feature ships twice: once as code, once as learning.

### Discovery Flow

| When | Command |
|------|---------|
| Evaluate new tool/framework | `/explore` |
| Make architecture decision | `/explore` |
| Research before planning | `/explore` |

---

## Session Types

| Type | Commands | Output |
|------|----------|--------|
| **Implementation** | `/plan-feature` → `/execute` | Code changes |
| **Exploration** | `/explore` → questions → decision | Strategy/PRD |
| **Delegation** | `/write-sop` | SOP document |
| **Quick fix** | `/quick-fix` | Direct implementation |
| **Maintenance** | `/cleanup` → review → `/quick-fix` | Cleaner codebase |
| **Self-improvement** | `/execution-report` → `/system-review` | Process improvements |

---

## Delegation Flow

### When to Create an SOP

Use the **DRIP Matrix** (Buy Back Your Time):

| | Low Energy | High Energy |
|---|---|---|
| **Low Value (<€72/hr)** | **DELEGATE** | Delegate with care |
| **High Value (>€72/hr)** | Avoid | **DO** |

If task is **Low Value** → Create SOP → Delegate

### SOP Creation

```
/write-sop [task-name]
```

Creates a step-by-step guide for:
- Wife
- Virtual Assistant
- Future team members

---

## Examples

### "I need to fix a typo in the error message"
```
/quick-fix "fix typo in login error message"
```

### "I want to add a new dashboard widget"
```
/plan-feature dashboard-widget --level=1
/execute
/validate
/commit
```

### "I need to build a complete new feature"
```
/create-prd user-analytics
/plan-feature user-analytics
/execute
/validate
/commit
```

### "My wife needs to do the weekly invoice"
```
/write-sop weekly-invoice
```
→ Creates SOP in `.agents/sops/weekly-invoice.md`
→ Future: Shows in dashboard `/sops` route

### "Should we use this new framework?"
```
/explore bmad-method
```
→ Research, questions, pros/cons analysis
→ Outputs decision doc or PRD

### "I just finished a feature and want to capture learnings"
```
/execution-report
/system-review
```
→ Documents what happened and why
→ Identifies process improvements
→ Updates CLAUDE.md, commands, or creates new commands
→ See `.agents/sops/post-feature-review.md` for full checklist

### "I'm getting TypeScript 'never' type errors after adding tables"
```
/regenerate-types
```
→ Regenerates Supabase types from database schema
→ Removes need for `as any` workarounds

---

## The Only Question

Before any command, ask:

> "Does this action buy back my time or build my freedom?"

- **Yes** → Proceed
- **No** → Delegate or Cut

---

*167 days. Work the system. Get free.*
