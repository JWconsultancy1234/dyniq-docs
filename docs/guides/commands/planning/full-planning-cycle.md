---
description: "Full autonomous planning cycle: Board Meeting → EPIC → PRDs → Stories → Sprint → Plans (NO EXECUTE)"
argument-hint: "[topic] [--level=0-5] [--agents=3|8|24|48|63|100+]"
---

# Full Planning Cycle: $ARGUMENTS

**Command:** `/full-planning-cycle`
**Owner:** CEO-WALKER
**Purpose:** The machine that builds the machine. Autonomous planning from strategic decision to implementation-ready plans.

---

## Phase 0: Infrastructure Smoke Test

**CRITICAL:** Run BEFORE any board meeting to avoid wasting tokens on broken infrastructure.

```bash
# Quick health check (all services)
curl -s https://agents-api.dyniq.ai/health | jq -e '.status == "ok"' || echo "❌ agents-api DOWN"
curl -s https://langfuse.dyniq.ai/api/public/health | jq -e '.status == "OK"' || echo "❌ langfuse DOWN"

# Verify API key is set
[[ -z "$AGENTS_API_KEY" ]] && echo "❌ Run /infrastructure:setup-agents-api first" || echo "✅ API key ready"

# Optional: Quick board meeting test (dry run)
curl -s -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{"topic": "smoke test", "level": 0, "dry_run": true}' | jq '.status'
```

**If ANY check fails:** Stop and run `/smoke-test` for detailed diagnostics.

**Why this exists:** 2026-01-31 P0 incident - wrong model IDs and JSON parsing failures burned tokens before detection. Pre-flight check prevents this.

See: `board-meeting-debug-checklist.md` for troubleshooting.

---

## Quick Reference

```bash
# Quick pulse (3 agents - CEO, CFO, CDO)
/full-planning-cycle "Should we buy this tool?" --level=0

# Standard run (8 C-suite agents)
/full-planning-cycle "Build new feature X" --level=1

# Important decision (24 agents - C-Suite + VPs)
/full-planning-cycle "Expand to new market" --level=2

# Strategic decision (48 agents - + Directors)
/full-planning-cycle "Major architecture change" --level=3

# Major initiative (63 agents - + Industry Advisors)
/full-planning-cycle "Launch new product line" --level=4

# War Room (100+ agents - full council, dynamic Task Force)
/full-planning-cycle "Critical pivot decision" --level=5
```

---

## What This Command Does

| Phase | Command Triggered | Output | Parallel |
|-------|-------------------|--------|----------|
| 1 | `/board-meeting` (Kimi) | Strategic analysis + decision | 3-100+ agents |
| 2 | `/create-epic` | `EPIC-{topic}.md` | Sequential |
| 3 | `/create-prd` | Multiple PRD files | **Parallel** |
| 4 | `/create-story` | Multiple story files | **Parallel** |
| 5 | `/sprint-planning` | Sprint backlog | Sequential |
| 6 | `/plan-feature` | Implementation plans | **Parallel** |
| **STOP** | No `/execute` | Human checkpoint | - |

**Total time:** ~30-45 min (with parallel execution)
**Cost:** ~$2-6 depending on agent count

---

## Parameters

| Parameter | Default | Options | Description |
|-----------|---------|---------|-------------|
| `topic` | Required | String | Strategic decision topic |
| `--level` | 1 | 0-5 | Council depth (0=pulse, 5=war room) |
| `--context` | None | File path | Additional context file |
| `--dry-run` | false | true/false | Generate plan only, no API calls |

---

## Agent Scaling (Strategic Advisory Council)

| Level | Flag | Agents | Who | Use Case |
|-------|------|--------|-----|----------|
| 0 | `--level=0` | 3 | CEO, CFO, CDO | Quick pulse |
| 1 | `--level=1` | 8 | C-Suite | Standard decisions |
| 2 | `--level=2` | 24 | + VPs | Important decisions |
| 3 | `--level=3` | 48 | + Directors | Strategic decisions |
| 4 | `--level=4` | 63 | + Industry Advisors | Major initiatives |
| 5 | `--level=5` | 100+ | + Task Force (dynamic) | Critical/complex (War Room) |

**Current infrastructure status:**
- Level 0-1 (8 agents): ✅ Production ready
- Level 2 (24 agents): ✅ Production ready (SAC Phase 1)
- Level 3 (48 agents): ✅ Production ready (SAC Phase 2)
- Level 4-5 (63-100+ agents): ✅ Production ready (SAC Phase 3)

**Reference:** `EPIC-strategic-advisory-council.md`

---

## Execution Flow

### Phase 1: Board Meeting (Kimi Swarm)

**API Call:**
```bash
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{
    "topic": "{topic}",
    "level": {level},
    "agent_count": {agents},
    "voting_weights": "domain",
    "output_format": "full"
  }'
```

**Expected output:**
- Decision: ADOPT / EXPERIMENT / PASS / DEFER
- Recommendations from all agents
- Weighted scores
- Risk assessment
- Implementation priorities

**Gate:** If decision is PASS or DEFER, stop and report. Only ADOPT/EXPERIMENT continues.

---

### Phase 2: Create EPIC

**Triggered when:** Board meeting decision is ADOPT or EXPERIMENT

**Input:** Board meeting output
**Output:** `epics/EPIC-{topic-kebab}.md`

**Template expansion:**
- Executive summary from board meeting
- Scope from agent recommendations
- Sprint plan from COO analysis
- Risks from CTO + CFO analysis
- Success criteria from Data analysis

---

### Phase 3: Create PRDs (Parallel)

**Input:** EPIC scope sections (Must Have items)
**Output:** Multiple PRD files

**Parallelization logic:**
```python
# For each Must Have scope item in EPIC:
parallel_tasks = []
for item in epic.scope.must_have:
    parallel_tasks.append(
        create_prd(
            name=item.name,
            requirements=item.details,
            parent_epic=epic.id
        )
    )
# Execute all PRD creation in parallel
results = await asyncio.gather(*parallel_tasks)
```

**Expected output:**
- 3-7 PRD files per EPIC
- Each PRD linked to parent EPIC
- Freedom Filter applied to each

---

### Phase 4: Create Stories (Parallel)

**Input:** All PRD files from Phase 3
**Output:** Story files in `stories/`

**Parallelization logic:**
```python
# For each PRD, generate stories from user stories section
parallel_tasks = []
for prd in prd_files:
    for story_template in prd.user_stories:
        parallel_tasks.append(
            create_story(
                epic=epic.id,
                prd=prd.id,
                template=story_template
            )
        )
# Execute all story creation in parallel
results = await asyncio.gather(*parallel_tasks)
```

**Expected output:**
- 3-5 stories per PRD
- 10-25 total stories per EPIC
- Auto-numbered: STORY-{epic}-01, STORY-{epic}-02, etc.

---

### Phase 5: Sprint Planning

**Input:** All stories from Phase 4
**Output:** Sprint backlog in `.agents/logs/sprints/`

**Process:**
1. Calculate total story points
2. Group by dependency
3. Allocate to sprints (12h capacity each)
4. Define sprint goals
5. Create sprint files

**Expected output:**
- 2-4 sprint definitions
- Stories allocated to sprints
- Dependencies mapped

---

### Phase 6: Plan Features (Parallel)

**Input:** All stories from Phase 4
**Output:** Implementation plans (NO CODE)

**Parallelization logic:**
```python
# For each story, create Level 1 or Level 2 plan
parallel_tasks = []
for story in all_stories:
    level = 2 if story.complexity == "high" else 1
    parallel_tasks.append(
        plan_feature(
            story=story,
            level=level,
            execute=False  # CRITICAL: No execution
        )
    )
# Execute all planning in parallel
results = await asyncio.gather(*parallel_tasks)
```

**Expected output:**
- Implementation plan per story
- Task breakdown with file paths
- Validation criteria
- **NO CODE WRITTEN**

---

### Phase 7: Human Checkpoint (STOP)

**Output summary:**

```markdown
## Full Planning Cycle Complete

### Topic: {topic}
### Decision: {ADOPT/EXPERIMENT}

### Generated Artifacts

| Type | Count | Location |
|------|-------|----------|
| EPIC | 1 | `epics/EPIC-{topic}.md` |
| PRDs | {n} | `features/PRD-*.md` |
| Stories | {n} | `stories/STORY-*.md` |
| Sprint Plans | {n} | `.agents/logs/sprints/SPRINT-*.md` |
| Feature Plans | {n} | `plans/PLAN-*.md` |

### Next Steps

1. **Review** all generated artifacts
2. **Adjust** scope/priorities if needed
3. **Approve** to start execution

### Commands to Execute (when ready)

```bash
# Execute first sprint
/execute STORY-{topic}-01

# Or batch execute sprint 1
/execute --sprint=1 --epic={topic}
```

**Awaiting human approval before any code execution.**
```

---

## Error Handling

| Phase | Error | Recovery |
|-------|-------|----------|
| 1 | API timeout (521/502) | Retry 3x, then fallback to local mode |
| 1 | Cloudflare 524 (>100s) | Use async status polling (see below) |
| 1 | Decision = PASS/DEFER | Stop cycle, report decision |
| 2-6 | File write error | Retry, then manual intervention |
| 3-6 | Parallel task failure | Continue others, report failures |

### Cloudflare Timeout Handling (Level 4+)

**Important:** Level 4+ (63-100+ agents) may exceed Cloudflare's 100s limit.

**Async polling pattern:**
```bash
# 1. Start board meeting (returns immediately)
POST /api/board-meeting/analyze → {"thread_id": "bm-xxxxx", "status": "processing"}

# 2. If 524 timeout, poll status endpoint
GET /api/board-meeting/status/{thread_id}
# Returns: {"status": "processing"} or {"status": "completed", "result": {...}}

# 3. Resume when complete
# Continue with Phase 2 using result from status endpoint
```

**Note:** Use `/resume-board-meeting {thread_id}` command for convenient async polling.

---

## Dry Run Mode

```bash
/full-planning-cycle "Build 50 agents" --dry-run=true
```

**Dry run behavior:**
- Phase 1: Skip API call, use mock board meeting output
- Phase 2-6: Generate plans but don't write files
- Output: Preview of all artifacts that WOULD be created

---

## Integration with Existing Commands

```
/full-planning-cycle
    │
    ├─► /board-meeting --mode=kimi --level={level}
    │       │
    │       └─► agents-api.dyniq.ai/api/board-meeting/analyze
    │
    ├─► /create-epic {topic}
    │       │
    │       └─► epics/EPIC-{topic}.md
    │
    ├─► /create-prd {scope-item-1} (parallel)
    ├─► /create-prd {scope-item-2} (parallel)
    ├─► /create-prd {scope-item-n} (parallel)
    │       │
    │       └─► features/PRD-*.md
    │
    ├─► /create-story --batch --epic={topic} (parallel)
    │       │
    │       └─► stories/STORY-*.md
    │
    ├─► /sprint-planning --project-id=EPIC-{topic}
    │       │
    │       └─► .agents/logs/sprints/SPRINT-*.md
    │
    └─► /plan-feature {story} (parallel, NO EXECUTE)
            │
            └─► plans/PLAN-*.md

    ══════════════════════════════════════════════
    ▼▼▼ HUMAN CHECKPOINT - NO AUTO-EXECUTE ▼▼▼
    ══════════════════════════════════════════════
```

---

## Example Run

**Input:**
```bash
/full-planning-cycle "Build Strategic Advisory Council Phase 1" --level=1
```

**Expected Output Timeline:**

| Time | Phase | Output |
|------|-------|--------|
| 0:00-0:05 | Board Meeting (8 C-Suite) | Decision: ADOPT |
| 0:05-0:10 | Create EPIC | `EPIC-sac-phase1.md` |
| 0:10-0:16 | Create PRDs | 3 PRDs (C-Suite, VPs, Bias System) |
| 0:16-0:22 | Create Stories | 9 stories (3 per PRD) |
| 0:22-0:27 | Sprint Planning | 2 sprints |
| 0:27-0:35 | Plan Features | 9 implementation plans |
| 0:35 | **STOP** | Human checkpoint |

**Total:** 35 minutes → Sprint-ready backlog with 9 implementation plans

**Level 3 Example (48 agents):**
```bash
/full-planning-cycle "Major platform migration" --level=3
```
Time: ~45 min (more agents = more analysis = slightly longer)

---

## Phase Completion Verification (CRITICAL)

**After sprint creation, verify before declaring cycle complete:**

```markdown
## Verification Checklist

1. **Phase Coverage:**
   - [ ] Count phases in EPIC: ___
   - [ ] Count sprint plans created: ___
   - [ ] All phases have sprints: YES/NO

2. **Artifact Parity:**
   - [ ] PRD count: ___
   - [ ] Story count: ___
   - [ ] Plan count: ___
   - [ ] PRD = Story = Plan: YES/NO

3. **Cross-Reference:**
   - [ ] Each EPIC deliverable has a story
   - [ ] Each story has a plan
   - [ ] No orphan artifacts
```

**If ANY verification fails:** Continue creating missing artifacts before declaring complete.

**Incident (2026-01-31):** Phase 1 only created 7 stories. User caught missing Phase 2-3 (12 additional stories). This verification step prevents that gap.

---

## Success Criteria

- [ ] Board meeting completes with clear decision
- [ ] EPIC captures all board meeting insights
- [ ] PRDs cover all Must Have scope items
- [ ] Stories are sprint-sized (1-3 days each)
- [ ] Sprint plans have realistic capacity (12h/sprint)
- [ ] Feature plans have clear task breakdowns
- [ ] **Phase Verification passed** (all phases have artifacts)
- [ ] **NO CODE EXECUTED** until human approval

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `/board-meeting` | Phase 1 (called internally) |
| `/create-epic` | Phase 2 (called internally) |
| `/create-prd` | Phase 3 (called in parallel) |
| `/create-story` | Phase 4 (called in parallel) |
| `/sprint-planning` | Phase 5 (called internally) |
| `/plan-feature` | Phase 6 (called in parallel) |
| `/execute` | **NOT CALLED** - awaits human approval |

---

## Future Enhancements

| Enhancement | Description | Status | EPIC |
|-------------|-------------|--------|------|
| Level 2-5 agents | 100 static + 16 dynamic (VPs, Directors, Industry, Task Force) | ✅ Complete | `EPIC-strategic-advisory-council.md` |
| Professional biases | C-Suite agents with documented perspectives | ✅ Complete | `EPIC-strategic-advisory-council.md` |
| R&D Research | Real-time intelligence in board meeting | ✅ Complete | (skip_research param) |
| Map-Reduce PM | 5x faster document generation | ⏳ Backlog | `EPIC-board-meeting-swarm-expansion.md` |
| Auto-execute | Optional flag for trusted patterns | ❌ Not planned | - |

---

*Created: 2026-01-30 | Owner: CEO-WALKER*
*"The machine that builds the machine. Autonomous planning, human-gated execution."*
