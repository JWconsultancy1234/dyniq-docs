---
title: "System Review Templates"
sidebar_label: "System Review Templates"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# System Review Templates

Reference for divergence classification, analysis frameworks, and output templates used in `/system-review`.

---

## Divergence Classification

### Good Divergence (Justified)

| Reason | Example |
|--------|---------|
| Plan assumed wrong | "File didn't exist" |
| Better approach found | "Discovered simpler pattern" |
| External blocker | "API unavailable" |
| Security/performance | "Original approach had vulnerability" |

### Bad Divergence (Problematic)

| Reason | Example |
|--------|---------|
| Ignored constraints | "Skipped validation step" |
| Created new vs existing | "Built custom instead of using util" |
| Took shortcuts | "Hardcoded instead of config" |
| Misunderstood requirements | "Built wrong feature" |

---

## Root Cause Analysis Template

For each problematic divergence:

```yaml
divergence: [what changed]
root_cause:
  type: unclear_plan | missing_context | missing_validation | repeated_manual
  where: [specific location in plan/command/doc]
  why: [explanation]
  fix: [specific improvement]
```

---

## Pattern Detection Framework

### Check Previous Reviews

```bash
# Find similar issues in past reviews
grep -r "[issue-keyword]" .agents/logs/system-reviews/
```

### Repeated Issue Threshold

| Occurrences | Action |
|-------------|--------|
| 1 | Document |
| 2 | Flag for monitoring |
| 3+ | Create automation |

---

## Asset Update Templates

### CLAUDE.md Updates

**When to update:**
- New universal pattern discovered
- Anti-pattern identified
- File limit or convention change

**Format:**
```markdown
## Suggested CLAUDE.md Addition

[exact text to add]

Location: [section name]
```

### Command Updates

**When to update:**
- Instruction unclear
- Step missing
- Reference outdated

**Format:**
```markdown
## Suggested Command Update

File: `.claude/commands/[path]`
Change: [what to change]
```

### New Command Creation

**When to create:**
- Manual process repeated 3+ times
- Multi-step workflow needs automation

**Format:**
```markdown
## New Command: /[name]

Purpose: [what it does]
Trigger: [when to use]
Steps: [high-level flow]
```

---

## Output Template

**Save to:** `.agents/logs/system-reviews/[feature-name]-review-YYYY-MM-DD.md`

```markdown
# System Review: [Feature Name]

**Date:** YYYY-MM-DD
**Plan:** [path to plan]
**Execution Report:** [path to report]

---

## Alignment Score: __/10

| Score | Meaning |
|-------|---------|
| 10 | Perfect adherence, all divergences justified |
| 7-9 | Minor justified divergences |
| 4-6 | Mix of justified and problematic |
| 1-3 | Major problematic divergences |

---

## Divergence Analysis

### Divergence 1: [Title]

```yaml
planned: [what plan specified]
actual: [what was implemented]
reason: [stated reason]
classification: good | bad
justified: yes | no
root_cause: [unclear plan | missing context | external blocker | etc]
fix_needed: [specific action if any]
```

---

## Pattern Detection

### Issues Seen Before

| Issue | Occurrences | Action Needed |
|-------|-------------|---------------|
| [issue] | X times | [action] |

### New Patterns

- [pattern 1]
- [pattern 2]

---

## Asset Updates

### CLAUDE.md

- [ ] Add: [specific text]
  - Location: [section]
  - Reason: [why]

### Commands

- [ ] Update: `/[command]`
  - Change: [what]
  - Reason: [why]

- [ ] Create: `/[new-command]`
  - Purpose: [what]
  - Reason: [manual process 3+ times]

### Reference Docs

- [ ] Update: `[doc].md`
  - Add: [what]
  - Reason: [why]

### Agents

- [ ] Update: `.claude/agents/[agent].md`
  - Change: [what]
  - Reason: [why]

---

## Key Learnings

### What Worked Well
- [specific thing that went smoothly]

### What Needs Improvement
- [specific process gap]

### For Next Implementation
- [concrete improvement to try]

---

## Action Items

### P0 (Do Now)
- [ ] [critical fix]

### P1 (This Week)
- [ ] [important improvement]

### P2 (Backlog)
- [ ] [nice to have]

---

## Next Steps

1. Apply P0 changes
2. Run `/optimize` to verify system health
3. Update plan status if complete
4. **Executive Assistant:** Schedule T+30 review for process improvements if 3+ patterns detected

---

## Executive Assistant Integration

**EA actions after system review:**
- If 3+ repeated patterns detected → Schedule process review in 30 days
- If new command suggested → Add to EA follow-up dashboard
- If P0 action items → Flag in next `/begin-timeblock`

---

*This review closes the self-improvement loop and triggers EA follow-ups.*
```

---

*Referenced by: `.claude/commands/4-release/system-review.md`*
