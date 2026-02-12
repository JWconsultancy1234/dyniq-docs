---
description: Manually refresh context files across all EPICs
---

# Sync Context: Refresh EPIC Context Files

## Purpose

Manually synchronize all EPIC context files with current execution state. Use when:
- Starting a new day/session
- After completing multiple stories
- When context feels stale
- Before major planning sessions

---

## Process

### Step 1: Find All Context Files

```bash
# List all EPIC context files with last modified date
find .agents/context/ -name "EPIC-*-context.md" -exec ls -la {} \;
```

### Step 2: Check for Stale Files

**Stale threshold:** 2 days since last update

```bash
# Find context files older than 2 days
find .agents/context/ -name "EPIC-*-context.md" -mtime +2
```

### Step 3: For Each Stale File

1. **Read the corresponding EPIC** (in `epics/`)
2. **Check PLAN-MASTER-EXECUTION.md** for completion status
3. **Check recent execution reports** in `.agents/logs/execution-reports/`
4. **Update context file** with:
   - Stories completed (from EPIC or master plan)
   - Stories remaining
   - Next story (first unblocked)
   - Recent learnings (from execution reports)
   - Any blockers discovered

### Step 4: Update Freshness Header

Each context file should have:

```markdown
**Last Updated:** YYYY-MM-DD HH:MM
**Days Since Update:** (auto-calculated)
```

---

## Context File Template

```markdown
# EPIC Context: [Name]

**Last Updated:** [date]
**Stories Completed:** [list]
**Stories Remaining:** [list or "Phase X complete"]
**Next Story:** [ID and name]

---

## Recent Completions

| Story | Date | Key Learning |
|-------|------|--------------|
| [ID] | [date] | [learning] |

---

## Cumulative Learnings

[Table of all learnings from this EPIC]

---

## Blockers

[Any active blockers]

---

## Quick Start for Next Session

1. [First action]
2. [Second action]

---

*Context file last synced: [date]*
```

---

## Integration

| Trigger | Action |
|---------|--------|
| `/begin-timeblock` Phase 3b | Checks freshness, suggests sync |
| After `/execute-story` Step 8 | Auto-updates relevant context |
| Manual `/sync-context` | Full refresh across all EPICs |

---

## Example Usage

```bash
# Sync all context files
/sync-context

# Sync specific EPIC
/sync-context EPIC-strategic-advisory-council
```

---

## Output

After running, displays:

```
📊 Context Sync Complete

Updated:
✅ EPIC-strategic-advisory-council-context.md (was 3 days stale)
✅ EPIC-board-meeting-command-context.md (was 1 day stale)

Already Fresh:
✓ EPIC-vision-pipeline-context.md (updated today)

Summary:
- 2 files updated
- 1 file already fresh
- 0 errors
```

---

*Use when context feels stale or after batch story completions.*
