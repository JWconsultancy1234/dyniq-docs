---
description: "Fast-track fix for trivial tasks (bugs, typos, small tweaks)"
argument-hint: [description]
---

# Quick Fix: $ARGUMENTS

## Purpose

Skip full PIV-loop for trivial tasks. Use when:
- Single file change
- <30 minutes work
- Clear fix, no ambiguity
- No architectural decisions

## Process

### 1. Rapid Assessment (30 seconds)

| Check | Answer |
|-------|--------|
| Single file? | Yes / No |
| Clear fix? | Yes / No |
| <30 min? | Yes / No |
| Path aligned? | A / B / Infra |

**If any "No" or unclear → Use `/plan-feature` instead.**

### 2. Quick Fix Template

```markdown
## Quick Fix: [Title]

**Path:** [A / B / Infrastructure]
**File:** `path/to/file.ts:123`
**Change:** [One sentence]
**Test:** [How to verify]
```

### 3. Implement

1. Read the target file
2. Make the minimal change
3. Verify lint/types (see @validation-checklist.md)
4. Test manually
5. Done

### 4. Optional Commit

If standalone fix:
```bash
git add [file]
git commit -m "fix: [brief description]"
```

If part of larger work: batch with feature commit.

## Examples

### Good Quick Fixes

- Fix typo in error message
- Update hardcoded value
- Remove unused import
- Fix off-by-one error
- Add missing null check

### NOT Quick Fixes (Use /plan-feature)

- Add new component
- Change data flow
- Modify multiple files
- Unclear root cause
- Needs investigation

## Output

After completion:

```markdown
**Fixed:** `path/to/file.ts:123`
**Change:** [What was done]
**Validated:** lint ✓ types ✓
```

## Integration

This is Level 0 of the PIV-loop:

```
/quick-fix (Level 0) → Direct implementation
/plan-feature --level=1 (Standard) → Brief plan → /execute
/plan-feature --level=2 (Deep) → Full PRD → /execute
```
