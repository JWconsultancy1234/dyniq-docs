---
title: "Defer Issue"
sidebar_label: "Defer Issue"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Defer Issue

When you discover an issue while working on something else, **DO NOT fix it immediately**.

## Why This Matters

- Scope creep kills focus
- Yesterday's learning: "Fix 1 thing at a time"
- Fixing everything now means finishing nothing well

## Steps

1. **Log the issue** in daily plan under `## DISCOVERED ISSUES`:

```markdown
## DISCOVERED ISSUES

| Issue | File | Severity | Defer To |
|-------|------|----------|----------|
| Button not centered | components/Header.tsx | P2 | Next block |
| Missing error handling | lib/actions/sops.ts | P1 | Today |
```

2. **Acknowledge to user:**
   > "Noted: [issue description]. Adding to backlog for [next block/later today]. Continuing with current task."

3. **Continue with current task.**

## Severity Guide

| Level | Meaning | Action |
|-------|---------|--------|
| P0 | Production broken | Fix immediately |
| P1 | Blocks user workflow | Fix today |
| P2 | Annoying but works | Next session |
| P3 | Nice to have | Backlog |

## When to Break This Rule

Only fix immediately if:
- P0 severity (production broken)
- Issue blocks current task
- User explicitly says "fix this now"

## Anti-Pattern

❌ "Let me also fix this while I'm here..."
❌ "I noticed X, let me quickly..."
❌ Fixing 7 things when plan said 1

✅ "Noted. Adding to backlog. Back to current task."

---

*Defer before fixing. Focus beats thoroughness.*
