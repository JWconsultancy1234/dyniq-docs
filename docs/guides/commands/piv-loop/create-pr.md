---
description: Create GitHub PR from current branch to develop with auto-generated description
argument-hint: "[base-branch] (default: develop)"
---

# Create Pull Request

Create a GitHub PR with auto-generated title and description from branch name, commits, and Linear issue.

## Variables

- Base branch: $ARGUMENTS (default: develop)

## Instructions

**Step 1: Prerequisites (Parallel)**

Run all three checks simultaneously:

```bash
gh auth status
git branch --show-current
git rev-parse --git-dir
```

Block if: not authenticated, on `main`/`develop`, not a git repo.

**Step 2: Gather Context (Parallel)**

```bash
BRANCH=$(git branch --show-current)
BASE="${1:-develop}"

# Commits ahead of base
git log $BASE..$BRANCH --pretty=format:"- %s"

# Files changed
git diff --stat $BASE...$BRANCH

# Check remote exists
git rev-parse --verify origin/$BRANCH 2>/dev/null
```

If branch not pushed: `git push -u origin $BRANCH`
If PR already exists: `gh pr list --head $BRANCH` → return existing URL.

**Step 3: Generate PR Title**

Convert branch name to conventional commit format:

- `feature/dyn-6-fix-voice-pipeline` → `feat(DYN-6): fix voice pipeline`
- `fix/login-bug` → `fix: login bug`
- `docs/update-readme` → `docs: update readme`

Rules:
- Extract `DYN-XX` from branch → use as scope in parentheses
- `feature/` → `feat:`, `fix/` → `fix:`, `docs/` → `docs:`, `chore/` → `chore:`
- Remove hyphens, capitalize first letter after colon
- Max 72 characters

**Step 4: Generate PR Body**

Auto-detect context sources (in order):
1. If `DYN-XX` in branch → use Linear MCP `get_issue` to fetch issue title + description
2. Search `.agents/logs/execution-reports/` for matching report
3. Fall back to git commit messages

Use this template with HEREDOC:

```bash
gh pr create --title "$PR_TITLE" --base "$BASE" --head "$BRANCH" --body "$(cat <<'EOF'
## Summary
[1-3 bullets: what this PR does, from Linear issue or execution report]

## Changes
[git log output: deduplicated commit messages as bullet list]

## Linear Issue
[Link: https://linear.app/dyniq/issue/DYN-XX if detected, otherwise omit section]

## Testing
- [ ] Validation passed (lint + type-check + build)
- [ ] E2E tests (if applicable)
- [ ] Manual testing completed

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

**IMPORTANT:**
- Default base is `develop` (workflow: feature → develop → main)
- NEVER create PR to `main` unless user explicitly requests it
- If base branch doesn't exist, fall back to `main` and warn

**Step 5: Verify**

```bash
PR_URL=$(gh pr view --json url -q .url)
```

## Report

Output in this format (plain text, no extra markdown):

```
PR: https://github.com/JWconsultancy1234/walker-os/pull/XXX
Base: develop ← feature/dyn-6-fix-voice-pipeline
Linear: DYN-6
Files: X files changed
```

## Error Handling

| Error | Action |
|-------|--------|
| PR already exists | Return existing URL: `gh pr list --head $BRANCH --json url -q '.[0].url'` |
| Branch not pushed | Auto-push: `git push -u origin $BRANCH`, then retry |
| No commits ahead | Abort: "No changes to create PR for" |
| gh not authenticated | Abort: "Run: gh auth login" |

## Quick Flow

```
/validate → /commit → /create-pr → /review-pr → merge
```
