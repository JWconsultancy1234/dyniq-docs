---
title: "Post-Implementation Verification"
sidebar_label: "Post-Implementation Verification"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Post-Implementation Verification

> Verification steps AFTER implementation and deployment. Companion to pre-implementation-checklist.md.

---

## Post-Deploy Verification (Pattern 3+ times - 2026-02-01)

**Pattern detected:** E2E testing not done proactively after deploy.

After implementation AND deploy, run this verification:

### 1. Verify Code on Server

```bash
# Check for key pattern in deployed code
ssh contabo "grep 'KEY_PATTERN' /opt/dyniq-voice/agents/pydantic_ai/board_meeting/*.py"

# Example: Verify Director agents deployed
ssh contabo "grep 'Director_' /opt/dyniq-voice/agents/pydantic_ai/board_meeting/agent_registry.py | head -5"
```

### 2. Verify Container Restarted

```bash
# Check container status and uptime
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep agents"

# Expected: docker-agents-api-1   Up X minutes (recent)
```

### 3. Run E2E Test (Based on Change Level)

| Change Type | E2E Level | Agent Count | Command |
|-------------|-----------|-------------|---------|
| VP changes | Level 2 | 24 | `skip_research: true` |
| Director changes | Level 3 | 48 | `skip_research: true` |
| Industry Advisor changes | Level 4 | 63+ | Use async polling |
| Worker/Specialist changes | Level 3 | 48 | `skip_research: true` |

```bash
# Level 2 test (24 agents, ~80s)
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic": "Test decision", "level": 2, "decision_type": "operational", "options": ["A", "B"], "skip_research": true}'

# Level 3 test (48 agents, ~120s)
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic": "Test decision", "level": 3, "decision_type": "strategic", "options": ["A", "B"], "skip_research": true}'
```

### 4. Verify Agent Counts

```bash
# Check response for expected agent counts
jq '.agents | length' response.json

# Level 2 expected: 24
# Level 3 expected: 46-48 (some timeouts acceptable)
```

### E2E Trigger Tags

**Run E2E if story touches ANY of these:**
- `swarm` or `agent`
- `API` or `endpoint`
- `deploy` or `runtime`
- `Director` or `VP`
- `Industry Advisor`

**Incident (2026-02-01):** SAC Phase 2 Batch 1 E2E was done only after user intervention. Added to mandatory DoD checklist.

---

## Completion Audit Checklist (Pattern 4+ times - 2026-02-01)

**Pattern:** "I'm done" without audit = more issues found later.

Before declaring ANY work complete, verify ALL of these:

### Document Types to Update (ALL 7 REQUIRED)

| # | Document | Location | Action |
|---|----------|----------|--------|
| 1 | EPIC file | `epics/` | Mark story COMPLETE |
| 2 | Context file | `.agents/context/` | Add learnings |
| 3 | PLAN-MASTER-EXECUTION | `plans/` | Update status table |
| 4 | Sprint log | `.agents/logs/sprints/` | Mark story complete |
| 5 | PLAN (feature plan) | `plans/` | **Update status** during execution; Move to `done/` when ALL stories complete |
| 6 | STORY | `stories/` | Move to `done/` |
| 7 | PRD | `features/` | Move to `done/` |

**CRITICAL (2026-02-03):** PLAN files need status updates DURING execution, not just moved to done/ when complete.

### Archival & Git Verification

- [ ] Execution report saved to `logs/execution-reports/`
- [ ] System review saved to `logs/system-reviews/` (if applicable)
- [ ] Git status clean - No uncommitted changes
- [ ] All fixes committed - No pending work

### Verification Method

**Run parallel audit agents:**
```
Task 1: Audit EPIC vs actual state
Task 2: Audit PRIORITY-MASTER-LIST vs EPIC
Task 3: Audit PLAN-MASTER-EXECUTION vs EPIC
Task 4: Verify completed plans in done/
```

**Anti-pattern:** Relying on memory of what was done instead of checking actual file state.

---

## Integration Verification Step (Pattern - 2026-02-05)

**Pattern:** Components/modules exist but aren't wired together. Feature "appears" complete but doesn't work.

### After Implementation, Before "Complete"

1. **Trace data flow:** Input -> Processing -> Output
   ```bash
   grep -r "def.*input" [module] | head -5
   grep -r "return.*output" [module] | head -5
   ```

2. **Check for hardcoded placeholder values:**
   ```bash
   grep -rE "TODO|FIXME|HARDCODE|\bnaive\b|ALWAYS" [module_dir] --include="*.py"
   ```

3. **Verify different inputs produce different outputs:**
   - Test with 2 different inputs, compare outputs
   - If outputs are identical -> likely hardcoded

4. **Check modules are WIRED not just EXIST:**
   ```bash
   grep -r "from.*import.*[module_name]" . --include="*.py" | grep -v test
   grep -r "[module_name]\." . --include="*.py" | grep -v test | head -5
   ```

### Integration Red Flags

| Red Flag | What It Means | Action |
|----------|---------------|--------|
| Module exists but no imports | Not wired to pipeline | Find where it should be called |
| Function defined but never called | Dead code | Wire it or remove it |
| Same output for different inputs | Hardcoded values | Implement real logic |
| Tests pass but E2E fails | Unit tests don't cover integration | Add integration tests |

---

## Tier/Registry Modification Checklist (2026-02-06)

**When removing/adding agent tiers or restructuring agent_registry.py:**

| Cascading Change | What to Update |
|------------------|----------------|
| Agent counts | `AGENT_COUNTS` dict, total count |
| Level config | `LEVEL_CONFIG` names, agent_count per level |
| Level functions | `get_agents_for_level()` docstrings, comments |
| Helper functions | `get_workers_for_csuite()` -> deprecation notice |
| Type definitions | `AgentRole` Literal type |
| Swarm summary | `get_swarm_summary()` counts |
| Tests | Level names, timeouts, agent counts, valid ranges |

---

## Parallel Agent Execution on Single File (Validated 3x - 2026-02-06)

**Safe when:** Non-overlapping line ranges, clear section boundaries, no shared state.

| Story | Agents | File | Sections | Conflicts |
|-------|--------|------|----------|-----------|
| STORY-02 | 6 | exec-*.md (6 files) | Independent files | 0 |
| STORY-04 | 1 | agent_registry.py | All Directors (single batch) | 0 |
| STORY-08 | 3 | agent_registry.py | VPs / Specialists / Workers | 0 |

**When NOT safe:** Multiple agents adding/removing lines in overlapping sections, or modifying shared functions.

### Post-Agent Write Verification

After parallel agents complete, ALWAYS verify before proceeding:

1. **Check all target files exist:** `ls -la [each_target_file]`
2. **Check file has content:** `wc -l [each_target_file]` (not 0 lines)
3. **Do cross-reference edits LAST** (sequential, after all parallel writes confirmed)

**Scope constraint pattern:** Include in every agent prompt:
```
ONLY modify: [file1.md, file2.md]. DO NOT touch any other files.
```

---

*Extracted from pre-implementation-checklist.md (2026-02-06). Parent: @pre-implementation-checklist.md*
