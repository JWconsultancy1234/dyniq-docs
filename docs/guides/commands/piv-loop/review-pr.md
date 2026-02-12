---
description: "Review pull request with automated checks and feedback"
argument-hint: "[pr-number-or-url]"
---

# Review PR: $ARGUMENTS

## Purpose

Systematic pull request review with automated checks before merging.

**Use for:**
- Code review before merging
- Ensuring quality standards
- Catching issues pre-merge

---

## Prerequisites

- [ ] PR exists and is ready for review
- [ ] CI/CD checks have run
- [ ] Tests are passing

---

## Review Process

### Phase 1: Fetch PR Details

```bash
# If PR number provided
gh pr view $1

# If URL provided
gh pr view $1
```

**Extract:**
- PR title
- Description
- Files changed
- Base branch (usually `develop`)
- Linked issues

---

### Phase 2: Automated Checks

Run these checks in parallel:

```bash
# Lint check
pnpm lint

# Type check
pnpm type-check

# Build check
pnpm build

# Tests (if applicable)
pnpm test
```

**Status Matrix:**

| Check | Status | Action |
|-------|--------|--------|
| Lint | PASS/FAIL | Block if FAIL |
| Type-check | PASS/FAIL | Block if FAIL |
| Build | PASS/FAIL | Block if FAIL |
| Tests | PASS/FAIL/SKIP | Block if FAIL |

---

### Phase 3: Code Review Checklist

**General Quality:**
- [ ] Code follows KISS, YAGNI, DRY principles
- [ ] No `any` types (use proper typing or `unknown`)
- [ ] No hardcoded secrets (use env vars)
- [ ] File size limits respected (<500 lines, components <200)
- [ ] Functions under 50 lines

**Security:**
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] No command injection
- [ ] Input validation present
- [ ] Secrets not logged

**Architecture:**
- [ ] Follows existing patterns
- [ ] No premature abstraction
- [ ] Backwards-compatibility not needed (Fix Forward principle)
- [ ] No duplicate functionality

**Testing:**
- [ ] Tests included for new features
- [ ] Edge cases covered
- [ ] Error paths tested

**Documentation:**
- [ ] CLAUDE.md updated if patterns changed
- [ ] Reference docs updated if needed
- [ ] Comments only where logic isn't self-evident

---

### Phase 4: Diff Review

```bash
# Show detailed diff
gh pr diff $1
```

**Check for:**
- Unintended changes (whitespace, formatting)
- Debug code (console.log, breakpoints)
- Commented-out code
- Large file additions (should those be external?)

---

### Phase 5: Breaking Changes Check

**Critical questions:**
- Does this change API contracts?
- Does this affect database schema?
- Does this break existing features?
- Does this require migration?

If YES to any:
- [ ] Migration plan documented
- [ ] Rollback plan exists
- [ ] Stakeholders notified

---

### Phase 6: Generate Review Comment

```markdown
## Review Summary

**Status:** APPROVE | REQUEST_CHANGES | COMMENT

### Automated Checks

| Check | Result |
|-------|--------|
| Lint | ✅/❌ |
| Type-check | ✅/❌ |
| Build | ✅/❌ |
| Tests | ✅/❌/⏭️ |

### Code Quality: __/10

**Strengths:**
- [What was done well]

**Issues Found:**
- [ ] **P0 (Block merge):** [critical issue]
- [ ] **P1 (Should fix):** [important issue]
- [ ] **P2 (Nice to have):** [minor issue]

### Specific Feedback

**File:** `[path]`
**Line:** [num]
**Issue:** [description]
**Suggestion:** [how to fix]

---

**Overall:** [LGTM / Needs changes / Blocked]
```

---

## Review Outcomes

### APPROVE ✅
```bash
gh pr review $1 --approve --body "[review comment]"
```

**Then:**
- Merge PR if no other reviewers needed
- Or notify team PR is approved

### REQUEST_CHANGES ❌
```bash
gh pr review $1 --request-changes --body "[review comment with specific issues]"
```

**Include:**
- Specific file/line references
- Clear fix suggestions
- Priority (P0/P1/P2)

### COMMENT 💬
```bash
gh pr review $1 --comment --body "[review comment]"
```

**Use when:**
- Non-blocking suggestions
- Questions for clarification
- Acknowledging good work

---

## Fast-Track Criteria

**Skip deep review if ALL true:**
- [ ] Typo fix only
- [ ] Documentation update only
- [ ] All automated checks pass
- [ ] < 10 lines changed

**Fast-track approval:**
```bash
gh pr review $1 --approve --body "LGTM - fast-track (typo/docs)"
```

---

## Integration Points

| After PR Review | Do |
|-----------------|-----|
| APPROVE | Merge to develop |
| REQUEST_CHANGES | Author fixes, re-review |
| COMMENT | Author responds, optional re-review |

---

## Quality Criteria

- [ ] All automated checks passed
- [ ] Security issues checked
- [ ] No backwards-compatibility hacks
- [ ] File limits respected
- [ ] Specific feedback provided (not generic)

---

## Examples

### Review PR by Number

```bash
/review-pr 123
# Fetches PR #123, runs checks, generates review
```

### Review PR by URL

```bash
/review-pr https://github.com/walker/repo/pull/123
# Same as above
```

---

## Anti-Patterns

- **Generic feedback** - "Looks good" is not helpful
- **Nitpicking** - Don't block for formatting if lint passes
- **Gatekeeping** - Don't require perfection, require "good enough"
- **Scope creep** - Review what's in the PR, not what's missing

---

## The Only Question

> "Does this PR buy back time or build freedom?"

If NO → Should this even be merged?

---

*Review thoroughly but ship fast. Perfect is the enemy of done.*
