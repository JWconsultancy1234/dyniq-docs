---
description: "Auto-sync EPIC changes to PRIORITY-MASTER-LIST"
argument-hint: [epic-name]
---

# Sync EPIC to Master: $ARGUMENTS

## Purpose

Automatically sync EPIC changes to PRIORITY-MASTER-LIST to prevent document drift.

**Pattern Detected:** 5+ times, document sync lag after EPIC discovery/updates caused next session to start with outdated information.

**Evidence:**
- 2026-01-28: PRIORITY-MASTER-LIST showed 32h when EPIC showed 20h
- 2026-01-27: Stories created before discovering existing n8n workflow
- 2026-01-23: Documents across repos get out of sync
- 2026-01-20: Outdated information in planning docs
- 2026-01-15: CLAUDE.md drifts out of sync

---

## When to Use

- After modifying any EPIC file
- During `/audit-plans` if inconsistencies detected
- At start of session if EPIC was updated in prior session
- Before `/commit` if EPIC was changed

---

## Process

### Step 1: Extract EPIC Data

Read the target EPIC and extract:

```bash
# Key fields to extract from EPIC
grep -E "^##|Timeline:|Hours:|Status:|Sprint|COMPLETE|PENDING" epics/EPIC-$ARGUMENTS.md
```

**Extract:**
- Timeline (weeks)
- Total hours
- Sprint structure (S1, S2, etc.)
- Sprint status (✅ COMPLETE, ⬜ PENDING, etc.)
- Next actions

### Step 2: Extract PRIORITY-MASTER-LIST Data

Read the P0 section of PRIORITY-MASTER-LIST:

```bash
# Extract P0 section
sed -n '/## 🚨 P0/,/## 🎯 PRIORITY 1/p' PRIORITY-MASTER-LIST.md
```

**Extract:**
- Timeline listed
- Hours listed
- Sprint table
- Next actions

### Step 3: Compare & Generate Diff

| Field | EPIC | PRIORITY-MASTER-LIST | Match? |
|-------|------|---------------------|--------|
| Timeline | [from EPIC] | [from MASTER] | ✅/❌ |
| Hours | [from EPIC] | [from MASTER] | ✅/❌ |
| Sprint Count | [from EPIC] | [from MASTER] | ✅/❌ |
| S0-S1 Status | [from EPIC] | [from MASTER] | ✅/❌ |
| Next Sprint | [from EPIC] | [from MASTER] | ✅/❌ |

### Step 4: Generate Update

If inconsistencies found, generate the exact edit needed:

```markdown
## Required Update to PRIORITY-MASTER-LIST.md

**Section:** P0: [EPIC Name]

**Current (outdated):**
[exact text from MASTER]

**Should be:**
[exact text from EPIC]

**Changes:**
- Timeline: [old] → [new]
- Hours: [old] → [new]
- Sprint status: [old] → [new]
```

### Step 5: Apply or Prompt

**If impact < 8.5 (minor sync):**
- Auto-apply the changes
- Log the sync

**If impact ≥ 8.5 (major scope change):**
- Present diff to user
- Wait for approval: "Sync these changes? [Y/n]"

---

## Output Format

```markdown
## EPIC-to-Master Sync Report

**EPIC:** [name]
**Date:** YYYY-MM-DD

### Inconsistencies Found

| Field | EPIC Value | Master Value | Action |
|-------|------------|--------------|--------|
| [field] | [value] | [value] | ✅ Synced |

### Changes Applied

- [change 1]
- [change 2]

### Validation

- [ ] PRIORITY-MASTER-LIST updated
- [ ] Decision log entry added
- [ ] No breaking references

---

*Sync complete. Documents aligned.*
```

---

## Integration Points

| Triggered By | Action |
|--------------|--------|
| `/audit-plans` | Auto-check EPIC ↔ MASTER consistency |
| `/context-gather` | Step 5 consistency check |
| `/end-timeblock` | Flag if EPIC modified but MASTER not synced |
| Pre-commit hook | Warn if EPIC changed without MASTER sync |

---

## Validation

After sync, verify:

- [ ] PRIORITY-MASTER-LIST P0 section matches EPIC
- [ ] Sprint table reflects actual sprint structure
- [ ] Status indicators consistent (✅/⬜/⏸️)
- [ ] No orphaned references to old sprint numbers

---

## Anti-Patterns

- **Partial sync** - Updating timeline but not sprint structure
- **Stale references** - Old sprint numbers in next actions
- **Status drift** - EPIC shows complete, MASTER shows pending

---

*This command addresses the "Discovery-then-sync" lag pattern detected 5+ times in system reviews.*
