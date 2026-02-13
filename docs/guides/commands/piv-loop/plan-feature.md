---
description: "Create feature plan with complexity-based depth (Quick/Standard/Deep)"
argument-hint: "[feature-name] [--level=0|1|2]"
---

# Plan Feature: $ARGUMENTS

## Mission

Transform a feature request into an **implementation plan** with appropriate depth based on complexity.

**Core Principle**: We do NOT write code in this phase. Plan first, then execute.

## Detailed Procedures


---

## Prerequisites

**BEFORE planning, run infrastructure verification:**

```bash
# Check for existing n8n workflows, Contabo services, FastAPI endpoints
/verify-infra [feature-keyword]
```

**Why:** On 2026-01-27, 13 stories were created before discovering existing infrastructure. Always verify deployed state first.

---

## Pre-Plan Pattern Check (SAC-003/004 Pattern)

Before specifying file locations in plans:

1. [ ] **Check existing similar files:** `ls -la path/to/similar/`
2. [ ] **Grep for existing patterns:** `grep -r "PATTERN" agents/`
3. [ ] If existing pattern differs from plan → **use existing pattern**
4. [ ] Note in plan: "Following existing pattern from [file]"

**Pattern detected 4x (SAC-001 through SAC-004):** Plans specified new file structures, but execution followed existing inline patterns. This check prevents the divergence upfront.

| Pattern Type | Current Standard | Location |
|--------------|------------------|----------|
| Agent configs | Inline in registry | `agent_registry.py` |
| Prompts < 50 lines | Inline constants | `agent_registry.py` |
| Level configs | LEVEL_CONFIG dict | `agent_registry.py` |

### API Automation Check (3x Pattern - 2026-02-09)

**Before flagging ANY external service work as "manual":**

| Service | Has REST API? | API Key Location | Default |
|---------|---------------|------------------|---------|
| n8n | Yes | `dyniq-app/.env` → `N8N_API_KEY` | API automation |
| Metabase | Yes | `walker-os/apps/api/.env` → `METABASE_API_KEY` | API automation |
| Supabase | Yes | `walker-os/apps/api/.env` → `Dyniq_Supabase_*` | API automation |
| Langfuse | Yes | `walker-os/apps/api/.env` → `LANGFUSE_*` | API automation |

**Rule:** If a service has a REST API and we have credentials, default to API automation. Never flag as "manual UI work."

**Patterns:** See `n8n-gotchas.md` (workflow import), `metabase-gotchas.md` (card creation)

**Incident log (3x):** n8n flagged as manual (2026-02-02, 02-07, 02-09), Metabase flagged as manual (2026-02-08, 02-09). User corrected every time.

### Verify Assumptions Gate (Voice Pipeline Wave 1 Pattern - 3 hotfixes/5 commits)

**Before finalizing any plan that involves external dependencies:**

| Assumption Type | Verification | Tool |
|----------------|--------------|------|
| Package version | `pip show pkg` or PyPI check | Terminal |
| Plugin wrapper params | Read plugin source, not raw API docs | Grep/Read |
| DB column constraints | `curl Supabase REST ?select=col&limit=1` | Terminal |
| Existing columns/tables | Supabase REST API check | Terminal |

**Why:** Wave 1 had 3/5 commits as hotfixes (NC version wrong, Deepgram param wrong, CHECK constraint missed). All were assumption failures catchable in 5 min.

**Add to Level 1+ plans:**
```markdown
### Assumptions to Verify Before Execute
| # | Assumption | Verification Command | Verified? |
|---|-----------|---------------------|-----------|
```

### LangGraph State Schema Check (SAC-025 Pattern)

**When adding new LangGraph nodes that return new state keys:**

1. [ ] **List new state fields** your node will return
2. [ ] **Update TypedDict in state.py FIRST** before implementing node
3. [ ] **Verify field types** match what node returns

```python
# Example: If node returns {"spawned_task_force": [...], "task_force_results": {...}}
# FIRST add to state.py:
class BoardMeetingState(TypedDict, total=False):
    spawned_task_force: list[str]
    task_force_results: dict[str, dict[str, Any]]
```

**Why:** LangGraph TypedDict state is strict - arbitrary keys cause runtime errors.

**Incident (2026-02-02):** SAC-025 node returned `spawned_task_force` but field wasn't in TypedDict → runtime type error.

---

## Complexity Level

| Level | Name | Criteria | Output |
|-------|------|----------|--------|
| **0** | Quick | Single file, clear fix | Inline task list |
| **1** | Standard | 2-5 files, clear requirements | Brief plan file |
| **2** | Deep | 5+ files, architecture decisions | Full PRD |

### Auto-Detection

- Bug fix / typo / small tweak → **Level 0**
- Single feature, known scope → **Level 1**
- New capability, multi-phase → **Level 2**

---

## Level 0: Quick Flow

```markdown
## Quick Fix: [Title]

**Freedom Filter:** [Path A/B/Infra] | [€72+/hr: Yes/No]
**File:** `path/to/file.ts:123`
**Change:** [One sentence]
**Test:** [How to verify]
```

---

## Level 1: Standard Flow

```markdown
## Feature: [Title]

### Metadata
- **Created:** YYYY-MM-DD
- **Last Verified:** YYYY-MM-DD
- **Implementation State:** [ ] Not Started / [ ] Partial / [ ] Complete

### Freedom Filter
- Path: [A/B/Infrastructure]
- €72+/hr Value: [Yes - why]

### Tasks
| # | Task | File | Size |
|---|------|------|------|
| 1 | [Description] | `path/file.ts` | S |

### Success Criteria
- [ ] [What must work]

### Validation
`pnpm lint && pnpm type-check && pnpm build`
```

---

## Level 2: Deep Flow

**MANDATORY PREREQUISITES:**

1. **Run `/context-gather [feature-name]`** - Creates comprehensive context file
2. **Run `/explore [feature-name]`** - Research and learnings

```
Before Level 2 planning:
1. Run /context-gather [feature-name] → Creates .agents/context/{feature}-context-{date}.md
2. Run /explore [feature-name]
3. **CURRENT STATE VERIFICATION:** Check if similar functionality exists (see below)
4. Research industry standards
5. **CRITICAL: Decide "Extend existing" vs "Create new"** (see below)
6. Document S2-S5+ learnings table
7. Define IN scope and NOT in scope
8. Add pre-execute checklist
```

**Step 3: Current State Verification (NEVER SKIP)**

| Check | Command | Example |
|-------|---------|---------|
| Similar files exist? | `grep -r "pattern" --include="*.py"` | Check for existing implementations |
| Module already built? | `ls -la path/to/module/` | Verify module structure |
| Tests exist? | `pytest --collect-only -q` | Don't duplicate test coverage |

**Step 3b: Cross-Platform Compatibility Check (Phase 6 Pattern)**

**When plan involves system libraries, flag potential cross-platform issues:**

| Library | Cross-Platform Issue | Mitigation |
|---------|---------------------|------------|
| WeasyPrint | Requires GTK (macOS brew install) | Use lazy import pattern |
| Pillow w/ ImageMagick | System deps vary by OS | Use lazy import pattern |
| Playwright | Chromium download on first run | Document in prerequisites |
| pdfkit | Requires wkhtmltopdf binary | Document in prerequisites |

**If ANY of these libraries are in plan:**
1. [ ] Add "System dependencies" section to prerequisites
2. [ ] Plan for lazy import pattern in code
3. [ ] Plan for sys.modules mock pattern in tests
4. [ ] Document OS-specific installation steps

**Pattern detected (Phase 6 Story 07):** WeasyPrint import failed on macOS CI without GTK. Fixed with lazy import, but could have been planned upfront.

**Reference:** `pytest-mock-patterns.md`

**Incident (2026-01-30):** PLAN-multi-trace-fusion proposed 7 new files (~900 lines). Exploration revealed `rd_research.py` already implemented 90% of the pattern. Result: Extended existing with ~140 lines instead of creating duplicates.

**Extend vs Create Decision (Step 4):**

| If exploration finds... | Then... | Example |
|------------------------|---------|---------|
| Existing module with similar patterns | Extend existing code | Map-reduce PM: Extended `pm_pipeline/` instead of creating 8 new files |
| No existing infrastructure | Create new module | New integration from scratch |

**Incident (2026-01-30):** Original plan proposed 8 new files. `/explore` found existing `pm_pipeline/` with proven patterns. Extended instead → **57% time savings** (1.5h vs 3.5h).

**Evidence - Why Context-Gather is Mandatory:**

| Sprint | Context Gathering | Result |
|--------|-------------------|--------|
| S3 API HITL | `/context-gather` used | 10/10 plan-to-execution alignment |
| S5 HITL Buttons | Skipped context phase | 15+ debugging iterations, 6/10 alignment |

The S3 context file captured API endpoints, existing workflows, and architectural decisions upfront. S5 skipped this and spent 3x longer debugging because the plan referenced wrong APIs (`ruben-api` vs `agents-api`).

**Time investment:** 15-20 minutes for context-gather saves 60+ minutes debugging during execution.

Run full Walker-OS Decision Filter (see reference doc), then generate plan with:
- Feature understanding + user story
- Codebase intelligence gathering
- Strategic planning
- Phase-by-phase tasks with validation
- **Mandatory Phase 5: Documentation** (C4, SOPs, onboarding)

Save to: `plans/PLAN-{feature-name}.md`

> **CRITICAL FOLDER CONVENTION:**
> - PLANs → `backlog/plans/` (NOT features/)
> - PRDs → `backlog/features/` (NOT plans/)
> - Stories → `backlog/stories/`
> - EPICs → `backlog/epics/`

---

## When NOT to Use This Command

| Situation | Use Instead |
|-----------|-------------|
| Research/discovery | `/explore` |
| Quick fixes | `/quick-fix` |
| Delegation setup | `/write-sop` |
| Unknown scope | `/explore` first |

---

## Quality Criteria

- [ ] Walker-OS filter applied and passed
- [ ] Tasks ordered by dependency
- [ ] Every task has validation command
- [ ] Serves Path A or Path B
- [ ] Documentation complete (Level 2)

---

## Approval Gate Notification

**After generating plan, send approval notification:**

### For Level 2 (Deep) Plans

1. **Generate plan file** in `plans/PLAN-{feature-name}.md`
2. **Create quality gate record:**
   ```sql
   INSERT INTO quality_gates (
     project_id,
     gate_name,
     gate_type,
     status,
     criteria
   ) VALUES (
     'PRD-{feature}',
     'Plan Approval',
     'GO_NO_GO',
     'PENDING',
     'Architectural decisions, task breakdown, resource estimates'
   );
   ```

3. **Send approval request via Telegram:**
   ```
   🟡 APPROVAL REQUIRED: Feature Plan

   Feature: {feature-name}
   Complexity: Level 2 (Deep)
   Estimated Effort: {hours}h

   Review plan: plans/PLAN-{feature-name}.md

   Reply:
   - GO to approve and start /execute
   - NO-GO to revise plan
   - PIVOT to change approach
   ```

4. **Wait for approval** before triggering `/execute`

### Approval Flow

```
/plan-feature (Level 2) → quality_gates.insert('PENDING')
  → Telegram notification to CEO/COO
  → User replies "GO"
  → quality_gates.update('GO')
  → automation_events.insert('plan_approved')
  → /execute (auto-invoked)
```

### For Level 0/1 Plans

- No approval gate required (low complexity)
- Proceed directly to `/execute`

**Test mode:** If `AGENT_MODE=test`, log approval request but don't send notification
