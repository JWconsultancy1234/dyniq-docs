---
title: "Verify Story Complete"
sidebar_label: "Verify Story Complete"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Verify Story Complete

Automated verification that all 7 document types are updated for a completed story.

## Usage

```
/verify-story-complete STORY-ID
```

Example: `/verify-story-complete SAC-010`

## Verification Script

Run these checks in parallel:

```bash
STORY_ID="$ARGUMENTS"

# 1. EPIC file - check for story marked complete
grep -r "$STORY_ID.*COMPLETE\|$STORY_ID.*✅" epics/*.md

# 2. Context file - check for story in learnings
grep -r "$STORY_ID" .agents/context/*.md

# 3. PLAN-MASTER-EXECUTION - check status updated
grep -r "$STORY_ID.*DONE\|$STORY_ID.*COMPLETE\|$STORY_ID.*✅" plans/PLAN-MASTER-EXECUTION.md

# 4. Sprint log - check story marked complete
grep -r "$STORY_ID.*COMPLETE\|$STORY_ID.*✅" .agents/logs/sprints/*.md

# 5. PLAN moved to done/
ls done/*$STORY_ID* 2>/dev/null || ls done/*$(echo $STORY_ID | tr '[:upper:]' '[:lower:]')* 2>/dev/null

# 6. STORY moved to done/
ls done/STORY-*$STORY_ID* 2>/dev/null

# 7. PRD moved to done/
ls done/PRD-*$STORY_ID* 2>/dev/null
```

## Output Format

```markdown
## Story Completion Verification: {STORY_ID}

| # | Document | Status | Location |
|---|----------|--------|----------|
| 1 | EPIC file | ✅/❌ | path or "NOT FOUND" |
| 2 | Context file | ✅/❌ | path or "NOT FOUND" |
| 3 | PLAN-MASTER-EXECUTION | ✅/❌ | line number or "NOT FOUND" |
| 4 | Sprint log | ✅/❌ | path or "NOT FOUND" |
| 5 | PLAN in done/ | ✅/❌ | path or "NOT FOUND" |
| 6 | STORY in done/ | ✅/❌ | path or "NOT FOUND" |
| 7 | PRD in done/ | ✅/❌ | path or "NOT FOUND" |

**Result:** X/7 documents verified

### Missing Documents
- [ ] {list any missing}
```

## Automation Integration

This command is called automatically by `/execute-story` Step 9 before declaring complete.

If ANY document is missing:
1. List what's missing
2. Ask user: "Fix now or defer?"
3. If fix: update the missing documents
4. If defer: add to next session carry-over

## Quick Fix Commands

If documents are missing, run these to fix:

```bash
# Move PLAN to done/
mv plans/PLAN-{story}.md done/

# Move STORY to done/
mv stories/STORY-{story}.md done/

# Move PRD to done/
mv features/PRD-{story}.md done/
```

---

*Automation threshold exceeded (6+ false "done" claims). This script prevents the pattern.*
