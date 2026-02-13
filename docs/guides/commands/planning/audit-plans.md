---
title: "Audit Plans"
sidebar_label: "Audit Plans"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Audit Plans

Periodic maintenance of the `` folder to prevent entropy.

## When to Run

- Weekly (during weekly review)
- Before major planning sessions
- When backlog feels cluttered

## Process

### Step 1: Inventory

List all backlog files by type:

```bash
echo "=== EPICS ===" && ls epics/
echo "=== FEATURES ===" && ls features/
echo "=== STORIES ===" && ls stories/
echo "=== DONE ===" && ls done/
```

### Step 2: Check for Misplaced Files

Files should be in correct folders:

| Prefix | Correct Location |
|--------|-----------------|
| `EPIC-*` | `backlog/epics/` |
| `PRD-*` | `backlog/features/` |
| `STORY-*` | `backlog/stories/` |

### Step 2.5: Infrastructure Verification

**BEFORE creating plans or stories, verify deployed infrastructure:**

```bash
# Check n8n workflows
N8N_KEY=$(grep -E "^N8N_API_KEY=" ~/Desktop/Code/dyniq-app/.env | cut -d'=' -f2)
curl -s "https://automation.dyniq.ai/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[] | {id, name, active}'

# Check Contabo services
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Check FastAPI endpoints
curl -s https://ruben-api.dyniq.ai/health
```

**Document findings before planning:**
- Existing workflows that overlap with planned work
- Services already deployed
- Endpoints already available

**Why this matters:** On 2026-01-27, 13 stories were created before discovering an existing morning brief workflow was already running (ID: `5eEX4BgpXY1tGasd`). This caused rework to update STORY-01 and STORY-02.

### Step 3: Classify Each File

For each plan file, determine status:

| Status | Criteria | Action |
|--------|----------|--------|
| ACTIVE | Being worked on this week | Keep |
| COMPLETED | Fully implemented | Move to done/ |
| STALE | Untouched 30+ days | Review with user |
| MISPLACED | Wrong folder | Move to correct location |
| **ALREADY_IMPLEMENTED** | Code exists but plan not updated | Mark COMPLETE, move to done/ |

### Step 3a: Implementation Staleness Check (NEW)

**For each ACTIVE or STALE plan, verify if implementation already exists:**

```bash
# Extract planned file paths from plan (look for code blocks with file paths)
grep -E "^\*\*File:\*\*|^File:|agents/|src/|lib/" [plan_file] | head -10

# For each file path, check if it exists
ls -la [extracted_file_path]

# If file exists, check recent commits
git log --oneline -5 -- [extracted_file_path]
```

**Decision Matrix:**

| Files Exist? | Recent Commits? | Plan Status | Action |
|--------------|-----------------|-------------|--------|
| No | N/A | ACTIVE | Keep for execution |
| Yes | Yes (last 7 days) | ALREADY_IMPLEMENTED | Move to done/ |
| Yes | No (30+ days ago) | Verify | Read files, compare to plan |
| Partial | Any | PARTIAL | Update plan with remaining work |

**Why this check exists:** Pattern detected 4+ times where plans were created for already-implemented code, wasting ~30 min per incident on verification instead of execution.

**Reference:** See `pre-implementation-checklist.md` for detailed verification steps.

### Step 3.5: Cross-EPIC Duplicate Detection

**Search for PBS item IDs across ALL EPICs to find duplicates:**

```bash
# Extract all PBS IDs from each EPIC
for epic in epics/EPIC-*.md; do
  echo "=== $epic ==="
  grep -oE "[A-Z]{2,4}-[0-9]{3}[a-z]?" "$epic" | sort -u | head -20
done

# Check for duplicates across EPICs
grep -rh -oE "[A-Z]{2,4}-[0-9]{3}[a-z]?" epics/*.md | sort | uniq -c | sort -rn | head -20

# Find DEFER items that might be COMPLETE elsewhere
grep -l "DEFER" epics/*.md | while read f; do
  echo "=== DEFER items in $f ==="
  grep -E "DEFER|⏭️" "$f" | head -10
done

# Check for MOVED markers without cleanup
grep -rn "MOVED\|Moved to" epics/*.md
```

**Duplicate Detection Matrix:**

| Situation | Action |
|-----------|--------|
| Same PBS ID in multiple EPICs | Verify which is source of truth, mark others as MOVED |
| DEFER in parent, COMPLETE in child | Update parent with cross-reference |
| MOVED marker but item still active | Remove from source EPIC |

**Why this matters:** On 2026-02-01, R&D Research was DEFER in Board Meeting but COMPLETE in swarm-expansion. UI-to-Code items were in both Board Meeting and Vision Pipeline EPICs.

### Step 3.6: EPIC ↔ PRIORITY-MASTER-LIST Sync Check

**Compare P0 EPIC data with PRIORITY-MASTER-LIST:**

```bash
# Extract P0 section from PRIORITY-MASTER-LIST
grep -A30 "## 🚨 P0:" PRIORITY-MASTER-LIST.md | head -35

# Extract key data from actual EPIC
head -60 epics/EPIC-*.md | grep -E "Timeline:|Hours:|Status:|Sprint"
```

**Check for mismatches:**

| Field | EPIC Value | MASTER Value | Match? |
|-------|------------|--------------|--------|
| Timeline | ? | ? | ✅/❌ |
| Hours | ? | ? | ✅/❌ |
| Sprint status | ? | ? | ✅/❌ |

**If inconsistent:** Run `/sync-epic-to-master` or manually update PRIORITY-MASTER-LIST.

**Why this matters:** Pattern detected 5+ times - EPIC updates without MASTER sync causes next session to start with outdated information. On 2026-01-28, PRIORITY-MASTER-LIST showed 32h/4 weeks when EPIC showed 20h/2 weeks after discovery.

### Step 3.7: Duplicate Code Detection (NEW - 2026-02-01)

**Check for duplicate utility functions before creating new plans:**

```bash
# Check for duplicate function patterns in agents
grep -rh "def _parse\|def parse\|def handle\|def process" \
  /Users/walker/Desktop/Code/dyniq-ai-agents/agents/ \
  | sort | uniq -c | sort -rn | head -10

# Check for duplicate JSON parsing (common issue)
grep -r "json\.loads" /Users/walker/Desktop/Code/dyniq-ai-agents/agents/ \
  | grep -v test | wc -l
```

**Duplicate Detection Matrix:**

| Count | Pattern | Action |
|-------|---------|--------|
| 1 | Function exists once | OK to proceed |
| 2 | Function exists twice | Review - might need refactoring |
| 3+ | Function duplicated | **CREATE SHARED UTILITY** before adding more |

**When duplicates found:**
1. Don't add another implementation
2. Create PRD for centralized utility in `shared/utils/`
3. Refactor existing duplicates to use shared utility
4. Then proceed with new plan

**Incident (2026-02-01):** 7 duplicate JSON parsers found across agents. Same JSON parsing bugs appeared in 4 different files. PRD-robust-json-parsing created to fix.

**Reference:** `features/PRD-robust-json-parsing.md`

---

### Step 4: Update PRIORITY-MASTER-LIST.md

After cleanup, update the priority list with correct paths:

```markdown
| Plan | Location | Status |
|------|----------|--------|
| AI Agent Platform | `epics/EPIC-ai-agent-platform.md` | ✅ ACTIVE |
| SOPs Dashboard | `features/PRD-sops-dashboard.md` | 🔨 In progress |
```

### Step 5: Report Summary

```
## Backlog Audit Summary

**Epics:** X active
**Features:** X active, Y stale
**Stories:** X
**Completed:** X in done/

**Issues Found:**
- [X misplaced files]
- [Y stale files (30+ days)]

**Actions Taken:**
- Moved X files to done/
- Moved X misplaced files
```

## Freedom Filter

Before keeping any plan as ACTIVE, verify:

1. Does it serve Path A (BolScout) or Path B (DYNIQ)?
2. Is it €72+/hr work?
3. Is it blocking other high-priority work?

If no to all → Move to DEFERRED section or done/.

---

## Child EPIC Completion Protocol

**When marking a child EPIC as COMPLETE:**

1. **Update parent EPIC** - Find all PBS items that were implemented via child EPIC
2. **Add cross-reference** - `✅ (via EPIC-{child} {item-id})`
3. **Update status** - Change DEFER → DONE in parent
4. **Move stories** - Move completed stories to `done/` with COMPLETE status

**Example:**
```markdown
# In parent EPIC (EPIC-board-meeting-command.md)
| BM-009 | R&D Research Agent | ✅ (via EPIC-swarm-expansion SW-007) |
```

**Checklist when completing child EPIC:**
- [ ] All tests pass in child EPIC scope
- [ ] Parent EPIC PBS items updated with cross-references
- [ ] Stories moved to done/ with correct status
- [ ] PRIORITY-MASTER-LIST updated

**Incident (2026-02-01):** swarm-expansion EPIC completed R&D Research, but parent Board Meeting EPIC still showed DEFER status.

---

*This command prevents backlog entropy.*
