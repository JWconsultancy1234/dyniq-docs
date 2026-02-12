---
description: "Master optimization command - parallel scan all planning docs, commands, and agents for improvements"
argument-hint: "<scope> (all | planning | commands | agents)"
---

# Optimize: $ARGUMENTS

## Purpose

**Master command for continuous improvement.** Runs all optimization checks in parallel and surfaces actionable improvements.

**Default scope:** `all` (run everything)

---

## Parallel Execution Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         /optimize [scope]                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PLANNING SCAN   │    │ COMMANDS SCAN   │    │ AGENTS SCAN     │
│ (Task Agent 1)  │    │ (Task Agent 2)  │    │ (Task Agent 3)  │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Epic ↔ PRD ↔    │    │ Duplicate cmds  │    │ Agent file size │
│ Story alignment │    │ Missing cmds    │    │ Missing agents  │
│ Context freshness│   │ Outdated docs   │    │ Overlap/gaps    │
│ Backlog entropy │    │ Broken refs     │    │ Role clarity    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                    ┌───────────────────────┐
                    │  OPTIMIZATION REPORT  │
                    │  Actionable items     │
                    └───────────────────────┘
```

---

## Execution

### Launch 3 Parallel Scans

**Use Task tool with 3 parallel agents:**

```
Agent 1 (Planning): "Scan  for Epic ↔ PRD ↔ Story alignment,
                    check context file freshness, identify stale plans"

Agent 2 (Commands): "Scan .claude/commands/ for duplicate functionality,
                    outdated references, missing commands for repeated manual work"

Agent 3 (Agents):   "Scan .claude/agents/ for role clarity, file size limits,
                    missing agent types, overlap between agents"
```

---

## Scan 1: Planning Documents

### Files to Check (Parallel)

| Path | Check |
|------|-------|
| `epics/` | Active epics have PRDs |
| `features/` | PRDs link to stories |
| `stories/` | Stories link back to epic |
| `.agents/context/` | Context files < 7 days old |
| `PRIORITY-MASTER-LIST.md` | Matches actual backlog state |

### Alignment Check

For each ACTIVE epic:

```yaml
epic: EPIC-{name}.md
  prds:
    - PRD-{name}.md (exists: yes/no)
  stories:
    - STORY-{epic}-{num}.md (exists: yes/no)
  context: {date} (fresh: yes/no)
  priority_list: (listed: yes/no)
```

### Issues to Flag

- [ ] Epic without PRD
- [ ] PRD without stories
- [ ] Story not linked to epic
- [ ] Context file > 7 days old
- [ ] PRIORITY-MASTER-LIST out of sync
- [ ] Stale plans (30+ days untouched)

---

## Scan 2: Commands

### Files to Check

| Folder | Check |
|--------|-------|
| `1-timeblock/` | Session management |
| `2-planning/` | Planning commands |
| `3-piv-loop/` | Implementation commands |
| `4-release/` | Release/validation commands |
| `dyniq/` | DYNIQ-specific commands |
| `infrastructure/` | DevOps commands |
| `maintenance/` | Cleanup commands |

### Issues to Flag

- [ ] **Duplicate functionality** - Two commands doing similar things
- [ ] **Missing command** - Manual process repeated 3+ times (check execution reports)
- [ ] **Outdated references** - Commands referencing old file paths
- [ ] **Broken @imports** - References to non-existent files
- [ ] **File size > 200 lines** - Extract to reference doc
- [ ] **Missing integration** - Command doesn't link to next step
- [ ] **Orphaned folders** - Folders not in README (see Archive Protocol below)

### Pattern Detection

Look for manual work patterns in:
- `.agents/logs/execution-reports/`
- `.agents/logs/system-reviews/`
- Recent git commits

If same manual step appears 3+ times → Suggest new command.

### Archive Protocol (CRITICAL)

**When a folder appears unused/orphaned:**

1. Check README.md references
2. Check CLAUDE.md references
3. Check recent git history (any commits in 30 days?)
4. Check backlog for planned integration

**ALWAYS ASK USER before archiving:**
```
Found [folder] with [X] files. Not referenced in README.
Options:
A) Archive to .claude/archive/
B) Document properly in README
C) Leave as-is for now

NEVER archive without user confirmation.
```

**Why:** On 2026-01-27, 5-project-mgmt folder (10 commands) was archived without asking, requiring user intervention to restore. Folders may contain valuable commands awaiting integration.

---

## Scan 3: Agents

### Files to Check

| File | Role |
|------|------|
| `ceo-walker.md` | Strategic orchestration |
| `exec-finance.md` | CFO - Profit First |
| `exec-operations.md` | COO - Planning |
| `exec-technology.md` | CTO - Architecture |
| `exec-data.md` | Head of Data |
| `developer.md` | Implementation |
| `reviewer.md` | QA/Code review |
| `marketing-sales.md` | Revenue |
| `freedom-filter.md` | Decision validation |

### Issues to Flag

- [ ] **File > 300 lines** - Extract to reference doc
- [ ] **Role overlap** - Two agents with same responsibility
- [ ] **Missing agent** - Work type without clear owner
- [ ] **Unclear scope** - Agent file doesn't define boundaries
- [ ] **Missing @imports** - Agent not using shared reference docs

### Role Coverage Check

| Work Type | Agent Owner | Defined? |
|-----------|-------------|----------|
| Strategic decisions | CEO WALKER | ✓/✗ |
| Financial analysis | CFO | ✓/✗ |
| Planning | COO | ✓/✗ |
| Architecture | CTO | ✓/✗ |
| Data/Analytics | Head of Data | ✓/✗ |
| Implementation | Developer | ✓/✗ |
| Quality | Reviewer | ✓/✗ |
| Revenue | Marketing/Sales | ✓/✗ |

---

## Output

### Optimization Report

Save to: `.agents/logs/optimization/optimization-YYYY-MM-DD.md`

```markdown
# Optimization Report

**Date:** YYYY-MM-DD
**Scope:** [all | planning | commands | agents]

---

## Summary

| Area | Issues | Actions |
|------|--------|---------|
| Planning | X | [list] |
| Commands | X | [list] |
| Agents | X | [list] |

---

## Planning Issues

### [Issue Title]
- **Location:** [file path]
- **Problem:** [what's wrong]
- **Fix:** [specific action]
- **Priority:** P0/P1/P2

---

## Command Issues

### [Issue Title]
- **Location:** [file path]
- **Problem:** [what's wrong]
- **Fix:** [specific action]
- **Priority:** P0/P1/P2

---

## Agent Issues

### [Issue Title]
- **Location:** [file path]
- **Problem:** [what's wrong]
- **Fix:** [specific action]
- **Priority:** P0/P1/P2

---

## Recommended Actions

### Immediate (P0)
- [ ] [action]

### This Week (P1)
- [ ] [action]

### Backlog (P2)
- [ ] [action]

---

*Run /optimize weekly to prevent entropy.*
```

---

## Integration with Other Commands

| After | Run | Why |
|-------|-----|-----|
| `/end-timeblock` | `/optimize planning` | Check planning docs stay aligned |
| `/system-review` | `/optimize commands` | Surface command improvements |
| Weekly review | `/optimize all` | Full system check |

---

## Quick Modes

| Command | Does |
|---------|------|
| `/optimize` | Full scan (all) |
| `/optimize planning` | Only backlog/context |
| `/optimize commands` | Only .claude/commands |
| `/optimize agents` | Only .claude/agents |

---

---

## Next Step

After optimization scan:

| Priority | Action |
|----------|--------|
| P0 issues found | Fix immediately, then `/commit` |
| P1 issues found | Schedule for this week |
| P2 issues found | Add to backlog for later |
| No issues | System healthy - continue work |

**Common follow-ups:**
- `/commit` - After fixing issues
- `/execution-report` - If significant changes made
- `/system-review` - If patterns detected need process changes

---

*This command replaces: context-gather + audit-plans + manual checks. Run weekly.*
