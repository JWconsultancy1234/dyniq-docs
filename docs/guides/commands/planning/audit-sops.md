---
description: "Scan recent activity and identify SOP opportunities"
---

# Audit SOPs: Check What Should Be Documented

## Load Agent


## Purpose

Scan recent activity (commits, execution reports, timeblocks, board meetings) to identify:
1. Patterns that repeat and should be documented
2. Fixes/solutions that should become playbooks
3. Knowledge gaps (things Walker knows but aren't written down)

## Process

### 1. Scan Recent Activity

**Check these sources in parallel:**

```bash
# Recent commits (last 7 days)
git log --since="7 days ago" --oneline --all | head -20

# Recent execution reports
ls -lt .agents/logs/execution-reports/ | head -10

# Recent daily plans (learnings field)
ls -lt .agents/logs/daily-plan/ | head -7

# Recent system reviews (patterns identified)
ls -lt .agents/logs/system-reviews/ | head -5

# Recent board meetings
ls -lt .agents/context/ | grep -i board | head -5
```

### 2. Existing SOP Check

```bash
# List existing SOPs
ls -la .agents/sops/
```

### 3. Pattern Detection

Look for these signals:

| Signal | SOP Type | Priority |
|--------|----------|----------|
| Same fix applied 2+ times | Troubleshooting playbook | P0 |
| "How to" in commit messages | Step-by-step SOP | P0 |
| Onboarding/setup in learnings | Getting started guide | P1 |
| "Workaround" or "hack" | Best practices doc | P1 |
| External tool configuration | Integration SOP | P1 |
| Recurring timeblock patterns | Process SOP | P2 |

### 4. Gap Analysis

For each pattern found, check:
- [ ] Does an SOP already exist?
- [ ] Is it up to date?
- [ ] Is it complete enough to delegate?

### 5. Generate Report

## Output Format

```markdown
## SOP Audit Report - {date}

### Scan Summary
- Commits scanned: X
- Execution reports: X
- Daily plans: X
- Existing SOPs: X

---

### 🔴 P0: Create Immediately (Repeated 2+ times)

| Pattern | Source | Suggested SOP | Est. Time |
|---------|--------|---------------|-----------|
| {pattern} | {source} | `SOP-{name}.md` | {time} |

### 🟡 P1: Create This Week

| Pattern | Source | Suggested SOP | Est. Time |
|---------|--------|---------------|-----------|
| {pattern} | {source} | `SOP-{name}.md` | {time} |

### 🟢 P2: Backlog

| Pattern | Source | Suggested SOP | Est. Time |
|---------|--------|---------------|-----------|
| {pattern} | {source} | `SOP-{name}.md` | {time} |

---

### Existing SOPs Status

| SOP | Last Updated | Status |
|-----|--------------|--------|
| {sop} | {date} | ✅ Current / ⚠️ Stale / ❌ Outdated |

---

### Knowledge Gaps Identified

Things Walker explained that aren't documented:

1. {topic} - mentioned in {source}
2. {topic} - mentioned in {source}

---

### Next Actions

1. **Run now:** `/write-sop {highest-priority-sop}`
2. **Schedule:** Add {count} SOPs to sprint backlog
3. **Update:** Refresh {stale-sop} with current info

### Time Investment

| SOPs to Create | Est. Total Time | Time Saved/Month |
|----------------|-----------------|------------------|
| {count} | {hours}h | {saved}h |

**ROI:** Creating these SOPs saves €{amount}/month at €72/hr
```

## Quick Patterns to Check

These patterns almost always need SOPs:

| Pattern | Check For | SOP Template |
|---------|-----------|--------------|
| Deployment | "deploy", "push", "release" | Deployment runbook |
| Debugging | "fix", "bug", "error" | Troubleshooting playbook |
| Setup | "install", "configure", "setup" | Getting started guide |
| Integration | "webhook", "API", "connect" | Integration SOP |
| Client work | "client", "onboard", "deliver" | Client playbook |
| Content | "post", "publish", "content" | Content creation SOP |

## Automation Hooks

After running this command:

1. **If P0 SOPs found:** Immediately ask if user wants to create highest priority
2. **If stale SOPs found:** Add update task to daily plan
3. **If knowledge gaps found:** Schedule `/write-sop` for each

## Example Run

```
/audit-sops

## SOP Audit Report - 2026-01-31

### 🔴 P0: Create Immediately

| Pattern | Source | Suggested SOP | Est. Time |
|---------|--------|---------------|-----------|
| Docker deploy commands | 5 commits | `SOP-contabo-deployment.md` | 30 min |
| Board meeting setup | 3 daily plans | `SOP-run-board-meeting.md` | 20 min |

### Next Actions
1. **Run now:** `/write-sop contabo-deployment`
```

## Integration with Knowledge Management

When SAC-021 (Director of Knowledge Management) is implemented:
- This command triggers automatically weekly (Sunday)
- Results feed into knowledge gap tracking
- P0 items auto-create draft SOPs

---

*"If you do it twice, document it. This command finds the patterns."*
