---
description: Board meeting decision to Linear initiative + projects + issues
argument-hint: "[board-meeting-id or topic]"
---

# Linear Setup: $ARGUMENTS

## Overview

Automate the creation of Linear project management infrastructure from a board meeting ADOPT or EXPERIMENT (with unanimous consensus) decision. Creates initiative, projects, milestones, cycles, and issues with AI-readable descriptions.

## When to Use

| Trigger | Action |
|---------|--------|
| Board meeting ADOPT decision | Run this command |
| Board meeting EXPERIMENT with unanimous consensus | Run this command |
| New multi-sprint initiative | Run this command |
| Ad-hoc project setup | Use Linear MCP tools directly |

## Prerequisites

- Board meeting log exists (`.agents/logs/board-meetings/`)
- Decision was ADOPT or EXPERIMENT with unanimous consensus (not PASS/DEFER)
- Team exists in Linear (check with `list_teams`)

**Session Planning:** If combining board meeting + linear setup, plan 2 sessions:
- Session 1: Board meeting + PRD/reference doc updates
- Session 2: Linear infrastructure (initiative, projects, milestones, labels, issues, documents)
- Reason: Combined always exceeds context window (3x pattern, 2026-02-06 to 2026-02-11)

## Phase 1: Load Context (2 min)

1. **Find the board meeting log:**
   ```
   .agents/logs/board-meetings/*$ARGUMENTS*
   ```
   If not found, ask user for the board meeting ID or topic.

2. **Extract from board meeting:**
   - Decision topic and summary
   - Action items with owners and deadlines
   - Sprint structure (if defined)
   - Budget/timeline constraints

3. **Load reference:**
   - @linear-gotchas.md (UUID requirements, bulk patterns)
   - Check scratchpad for existing entity cache

## Phase 2: Design Linear Structure (3 min)

Based on board meeting action plan, design:

| Entity | Naming Convention | Example |
|--------|-------------------|---------|
| Initiative | `{Topic} - {Goal}` | "DYNIQ Revenue Sprint - First EUR 10K MRR" |
| Projects | `Sprint N: {Name} (Days X-Y)` | "Sprint 1: Revenue Unblock (Days 1-14)" |
| Milestones | `{Measurable Outcome}` | "First Paying Client" |
| Cycles | 2-week sprints | "Cycle 1" (Feb 9-23) |
| Issues | `{Verb} {Object} {Qualifier}` | "Set up Stripe billing" |

**Present structure to user for approval before creating.**

## Phase 3: Create Linear Infrastructure (5 min)

Execute in order (each step depends on previous):

### Step 1: Initiative
```
create_initiative(name, description, status="Active", owner="me")
```

### Step 2: Projects (parallel)
```
create_project(name, team, initiative, description, startDate, targetDate)
```
Cache all project IDs.

### Step 3: Milestones (parallel per project)
```
create_milestone(project, name, targetDate)
```

### Step 4: Cycles (sequential - dates can't overlap)
```
list_cycles(teamId) → check existing
```
**NOTE:** Linear MCP has NO `create_cycle` endpoint. Provide manual creation steps to user:
1. Open Linear UI: Team Settings > Cycles
2. Create cycles with start/end dates
3. Then assign issues via `update_issue(cycle="Sprint 1")`

### Step 5: Labels (parallel)
```
list_issue_labels(team) → check existing
create_issue_label(name, color) → only for new labels
```

### Step 6: Issues (batches of 4, parallel within batch)

For each issue:
```
create_issue(
  title, team, project, description,
  priority, estimate, labels, cycle,
  blockedBy, blocks
)
```

**CRITICAL:** Cache ALL entity UUIDs after each step. Write to scratchpad:
`/private/tmp/claude-501/.../scratchpad/linear-entity-cache.md`

## Phase 4: AI-Readable Descriptions (5 min)

Apply the standard template to ALL issues. Each issue MUST have ALL sections:

```markdown
## Objective        ← 1-2 sentences
## Context          ← Business context, why it matters, sprint position
## Scope            ← In Scope / Out of Scope lists
## Technical Details ← Components, routes, data sources, libraries
## Tasks            ← Checkbox list (actionable verbs)
## Acceptance Criteria ← Checkbox list (measurable outcomes)
## Dependencies     ← Blocked by / Blocks with issue refs
## Risk             ← Table: Risk | Probability | Impact | Mitigation
## Delegation       ← Table: Task | Delegatable To | Estimate
```

**Full template:** @linear-gotchas.md#ai-readable-issue-description-template

**CRITICAL:** Include Risk + Delegation sections on EVERY issue. These enable VA/contractor execution.

**Batch in groups of 4** (parallel update_issue calls).
**Use full UUIDs** from the entity cache (never short IDs).

## Phase 5: Verify & Report (2 min)

1. **Verify all entities created:**
   ```
   list_issues(project=each_project) → count matches expected
   ```

2. **Generate summary:**

   | Entity | Count | Status |
   |--------|-------|--------|
   | Initiative | 1 | Created |
   | Projects | N | Created |
   | Milestones | N | Created |
   | Cycles | N | Created/Existing |
   | Labels | N | Created/Existing |
   | Issues | N | Created with descriptions |

3. **Save entity cache** to scratchpad for future sessions.

4. **Update daily plan** with Linear setup completion.

5. **Suggest follow-up:** After setup, recommend running `/linear-doc-audit` to verify documentation quality across all created issues.

## Phase 5.5: Completeness Audit (Optional, 5 min)

**When to use:** For initiatives with 15+ issues or "above-industry" quality targets.

Launch 3 parallel agents to verify coverage:

| Agent | Focus | Question Answered |
|-------|-------|-------------------|
| Explore | Issues vs PRD gaps | "Did we miss any PRD requirements?" |
| R&D Research | Industry benchmark | "What do industry leaders include that we don't?" |
| Explore | Cross-repo dependencies | "What existing code/docs should be referenced?" |

**If gaps found:**
1. Classify as P0 (must-have) vs P1 (should-have) vs P2 (nice-to-have)
2. P0/P1 gaps: Create new issues or enhance existing (see decision framework below)
3. Set blocking relationships for new issues
4. Update strategic overview document with final totals

**Enhancement vs New Issue Decision:**
- Addition is a subsection/task within existing issue scope → **enhance existing issue**
- Addition is a standalone deliverable with own acceptance criteria → **create new issue**

**Validated (2026-02-11):** 3 agents caught 5 gaps in Documentation Hub (error docs, GDPR/security, glossary, FAQ, data models) that initial `/explore` missed.

## Phase 6: Strategic Documents (3 min)

For each initiative, create a Linear document with full strategic overview:

```
create_document(title="[Initiative] - Strategic Overview", project="[Sprint 1 project]", content=...)
```

**CRITICAL:** `create_document` requires a `project` or `issue` parameter. Link to first project.

**Content includes:** Vision, goals, metrics, timeline, tech stack, risks, team structure.

**Why:** Initiative descriptions are limited to 255 characters. Strategic documents hold the full context.

For projects with operational needs, also create:
- Architecture documentation (system diagrams, data flows)
- Operational runbooks (incident response, debugging)
- Delegation SOPs (step-by-step for VAs/contractors)

## Reference

- Linear gotchas: @linear-gotchas.md
- AI-readable template: @linear-gotchas.md#ai-readable-issue-description-template
- Doc audit: @.claude/commands/2-planning/linear-doc-audit.md
- Board meeting command: @.claude/commands/2-planning/board-meeting.md

---

*Created: 2026-02-06 | Updated: 2026-02-11 | Owner: COO | Trigger: Board meeting ADOPT/EXPERIMENT (unanimous) decision*
