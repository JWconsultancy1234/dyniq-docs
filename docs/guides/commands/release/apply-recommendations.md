---
title: "Apply Recommendations Command (AUTO if patterns detected)"
sidebar_label: "Apply Recommendations Command (AUTO if patterns detected)"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Apply Recommendations Command (AUTO if patterns detected)

**Command:** `/apply-recommendations`
**Owner:** COO
**Auto-Invoked:** YES - if patterns detected in `/system-review`
**Conditional:** Requires CEO approval if impact ≥8.5

> **Note:** This applies system-review recommendations to files. For general optimization scans, use `/optimize` in maintenance/.

---

## Purpose

Applies improvements from `/system-review` to agent files, templates, and processes. Third pillar of self-learning loop.

---

## When to Use

**Auto-Invoked Conditions:**
1. `/system-review` detects patterns
2. If all recommendations <8.5 impact: Auto-run
3. If any recommendation ≥8.5 impact: Wait for CEO approval

**Manual Invocation:**
```bash
/optimize --scope [planning|commands|agents|templates]
```

---

## Process (1-2 hours depending on number of recommendations)

1. **Load Recommendations** (5 min)
   - Read from latest system-review report
   - Filter by status = 'reviewed'
   - Sort by impact score (highest first)

2. **For Each Recommendation** (10-30 min each)
   - Identify target file (agent, command, template)
   - Apply change (update text, add guidance)
   - Validate change (syntax check, no breaking changes)
   - Document change (what, why, when)

3. **Update Lessons Learned** (10 min)
   - Update `lessons_learned` status: 'reviewed' → 'applied'
   - Add `applied_to` array: which files were updated

4. **Validation** (15 min)
   - Run `pnpm type-check` (if code changes)
   - Verify all agent files <300 lines
   - Check no breaking changes

5. **Log & Notify** (10 min)
   - Save optimization log
   - **Mandatory:** Notify CEO + COO + CTO
   - List all changes applied

---

## Example: Apply OAuth Guidance Update

**Recommendation from system-review:**
- **Impact:** 8.5/10
- **Pattern:** OAuth tasks underestimated by 35%
- **Recommendation:** Add guidance to Developer agent: "OAuth integrations: Add 35% buffer"

**Optimization Steps:**

### 1. Identify Target File
```
.claude/agents/developer.md
```

### 2. Locate Insertion Point
Find section: "Estimation Guidelines" or "Common Patterns"

### 3. Apply Change
```markdown
## Estimation Guidelines

### OAuth Integrations
**Pattern Detected:** OAuth implementations consistently take 30-35% longer than estimated.

**Guidance:**
- Add 35% buffer to OAuth estimates
- Example: 6h OAuth task → estimate 8h
- Reason: OAuth debugging, token handling, and error cases add complexity

**Historical Data:**
- Sprint 2 (2026-01-26): OAuth estimated 6h, actual 8h (+33%)
- [Add future data points here]
```

### 4. Document Change
Update optimization log:
```markdown
# Optimization Log: 2026-02-01

## Change 1: Developer Agent OAuth Guidance
**File:** `.claude/agents/developer.md`
**Section:** Estimation Guidelines (new section added)
**Change:** Added OAuth 35% buffer guidance
**Reason:** Pattern detected across 3 projects: OAuth tasks averaged +32% variance
**Impact:** 8.5/10
**Status:** Applied
**Date:** 2026-02-01
```

### 5. Update Lessons Learned Table
```sql
UPDATE lessons_learned
SET
  status = 'applied',
  applied_to = ARRAY['.claude/agents/developer.md'],
  validated_at = NOW()
WHERE
  lesson_type = 'estimate_accuracy'
  AND pattern_detected LIKE '%OAuth%underestimated%';
```

---

## Optimization Scope Options

### `--scope planning`
**Targets:**
- `/create-prd`, `/plan-feature`
- Epic/Story templates
- Business case template

**Common Changes:**
- Update estimation guidance
- Refine success criteria templates
- Adjust complexity thresholds

### `--scope commands`
**Targets:**
- Command files in `.claude/commands/`
- Automation trigger logic
- Command chaining rules

**Common Changes:**
- Add validation steps
- Update trigger conditions
- Refine approval gates

### `--scope agents`
**Targets:**
- Agent files in `.claude/agents/`
- Agent instructions and guidelines
- Coordination patterns

**Common Changes:**
- Update estimation guidance (like OAuth example)
- Add new patterns/anti-patterns
- Refine delegation logic

### `--scope templates`
**Targets:**
- Document templates
- Report formats
- Checklist templates

**Common Changes:**
- Add missing sections
- Refine criteria definitions
- Update scoring formulas

---

## Approval Workflow

### High-Impact Changes (≥8.5)

**System-review notifications:**
```
⚠️ High-Impact Recommendation (8.5+):
Developer OAuth guidance update. Approve to auto-apply?
Reply GO to run /optimize
```

**If CEO replies "GO":**
- Run `/optimize` immediately
- Apply all pending recommendations

**If CEO replies "REVIEW":**
- Generate detailed impact analysis
- Wait for explicit approval on each change

**If CEO replies "REJECT":**
- Update `lessons_learned` status to 'rejected'
- Document rejection reason
- Do not apply changes

### Medium-Impact Changes (<8.5)

**Auto-apply without approval:**
- Apply changes immediately
- Notify CEO after completion
- Provide rollback instructions

---

## Rollback Procedure

**If optimization introduces issues:**

### 1. Identify Problem
```
# Check git diff
git diff HEAD~1 .claude/agents/developer.md
```

### 2. Revert Change
```bash
git checkout HEAD~1 .claude/agents/developer.md
git commit -m "Revert: OAuth guidance optimization (caused issue X)"
```

### 3. Update Lessons Learned
```sql
UPDATE lessons_learned
SET
  status = 'reviewed',  -- Back to reviewed status
  applied_to = ARRAY[]::TEXT[]  -- Clear applied_to
WHERE id = 'LESSON_ID';
```

### 4. Document Rollback
Add to optimization log:
```markdown
## Rollback 1: Developer Agent OAuth Guidance
**Date:** 2026-02-02
**Reason:** Caused confusion in estimation process
**Impact:** Reverted to previous guidance
**Next Steps:** Refine recommendation before re-applying
```

---

## Optimization Log Format

**Location:** `.agents/logs/optimizations/OPT-YYYY-MM-DD.md`

```markdown
# Optimization Log: 2026-02-01

**Triggered by:** System Review (2026-02-01)
**Total Changes:** 3
**Impact Range:** 7.5-9.0
**Status:** All applied successfully

## Changes Applied

### 1. Developer Agent OAuth Guidance (Impact 8.5)
**File:** `.claude/agents/developer.md`
**Section:** Estimation Guidelines (new)
**Change:** Added OAuth 35% buffer guidance
**Reason:** Pattern: OAuth tasks +32% avg variance
**Evidence:** 3 projects, 65% accuracy on OAuth tasks
**Status:** ✅ Applied
**Validation:** Agent file <300 lines, no syntax errors

### 2. Mandatory ETC Tracking (Impact 9.0)
**Files:**
- `.claude/agents/project-manager.md`
- `.claude/commands/5-project-mgmt/create-pid.md`
**Change:** Made ETC tracking mandatory for projects >10h
**Reason:** ETC tracking prevented 3 scope creep incidents
**Evidence:** 100% scope creep prevention with ETC
**Status:** ✅ Applied
**Validation:** Commands validated, no breaking changes

### 3. Risk Register Probability Scoring (Impact 7.5)
**File:** `board-meeting-internals.md`
**Section:** Risk Register template
**Change:** Updated probability thresholds:
  - L=1 (10%), M=2 (30%), H=3 (60%), K=4 (90%)
**Reason:** 15% false positive rate on risk predictions
**Evidence:** 3/15 risks were false positives
**Status:** ✅ Applied
**Validation:** Template syntax validated

## Rollbacks
None

## Next Steps
- Monitor next 3 projects for effectiveness
- Validate improvements in next system-review
- If effective: Mark lessons as 'validated'
```

---

## Notification

**Telegram to CEO + COO + CTO:**
```
✅ Optimization Complete: 3 changes applied

1. [9.0] Mandatory ETC tracking for projects >10h
2. [8.5] Developer OAuth guidance (+35% buffer)
3. [7.5] Risk probability scoring updated

📝 Files Updated:
- .claude/agents/developer.md
- .claude/agents/project-manager.md
- .claude/commands/5-project-mgmt/create-pid.md
- board-meeting-internals.md

✅ Validation: All files <300 lines, no syntax errors

📝 Full Log: .agents/logs/optimizations/OPT-2026-02-01.md

🎯 Next: Monitor next 3 projects for effectiveness
```

---

## Validation Checklist

Before finalizing optimization:

- [ ] All changed files validated (syntax, length)
- [ ] No breaking changes introduced
- [ ] `lessons_learned` table updated (status = 'applied')
- [ ] Optimization log created
- [ ] Git commit with descriptive message
- [ ] CEO + COO + CTO notified
- [ ] Rollback instructions documented

---

## Integration with Self-Learning Loop

**This command requires:**
- `/system-review` (provides recommendations)

**This command enables:**
- Agent accuracy improvement
- Template refinement
- Process optimization
- Continuous evolution

**Without optimize:**
- Patterns detected but never applied
- No closing of the learning loop
- System doesn't improve over time

---

## Time Estimate: 1-2 hours (depending on number of changes)

---

**Status:** AUTO-INVOKE if patterns detected - CEO APPROVAL if impact ≥8.5

---

*Continuous improvement. Data-driven changes. Institutional evolution.*
