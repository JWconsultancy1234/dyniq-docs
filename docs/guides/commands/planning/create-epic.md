---
description: Create an Epic (large initiative spanning 2-6 months)
argument-hint: "[epic-name]"
---

# Create Epic: $ARGUMENTS

## Overview

Generate an Epic for large initiatives that span multiple sprints (2-6 months). Epics contain multiple features/PRDs.

## Output File

Write to: `epics/EPIC-$ARGUMENTS.md`

If no argument provided, ask for an epic name (kebab-case).

## When to Use

| Situation | Use |
|-----------|-----|
| 2-6 month initiative | `/create-epic` |
| Sprint-sized feature | `/create-prd` |
| Quick fix (<30 min) | `/quick-fix` |

## Epic Structure (PID-Based)

```markdown
# EPIC: [Name]

**Owner:** Walker | **Status:** PLANNING | **Target:** Q[X] 2026

## Executive Summary

[1-2 sentence elevator pitch]

## Business Case

| Factor | Value |
|--------|-------|
| **Problem** | [What's broken] |
| **Solution** | [What we're building] |
| **€ Value** | [Revenue/savings impact] |
| **Path** | A (BolScout) / B (DYNIQ) / Both |

## Freedom Filter

| Question | Answer |
|----------|--------|
| €72+/hr Value | Yes/No - [justification] |
| WHO not HOW | Can be delegated? To whom? |
| Freedom Impact | High/Medium/Low |

**Decision:** DO_NOW / SCHEDULE / DELEGATE / CUT

---

## Scope (MoSCoW)

### Must Have (MVP)
- [ ] [Requirement 1]
- [ ] [Requirement 2]

### Should Have
- [ ] [Requirement]

### Could Have
- [ ] [Requirement]

### Won't Have (This Release)
- [ ] [Explicitly out of scope]

---

## Product Breakdown (PBS)

| ID | Deliverable | Type | Sprint | Status |
|----|-------------|------|--------|--------|
| E1-001 | [Deliverable] | Feature | S1 | ⬜ |
| E1-002 | [Deliverable] | Story | S1 | ⬜ |

---

## Sprint Plan

| Sprint | Duration | Focus | Deliverables |
|--------|----------|-------|--------------|
| S1 | Week X-Y | [Focus] | E1-001, E1-002 |
| S2 | Week X-Y | [Focus] | E1-003, E1-004 |

---

## Risks & Assumptions

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Action] |

**Assumptions:**
- [Assumption 1]
- [Assumption 2]

---

## Success Criteria

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

---

## Related Documents

| Document | Location |
|----------|----------|
| PRD: [Feature] | `features/PRD-xxx.md` |
| Architecture | `docs/xxx.md` |

---

*Created: [Date] | Last Updated: [Date]*
```

## Instructions

### 1. Apply Freedom Filter FIRST

If epic doesn't pass, discuss before proceeding.

### 2. Delegation & Knowledge Check (CRITICAL)

Before finalizing scope, verify:

| Question | Answer |
|----------|--------|
| Who documents processes from this work? | [Technical Writer / SOP Writer / Both / N/A] |
| How are learnings captured? | [System Review → CLAUDE.md / Reference Doc / SOP] |
| Include Knowledge Management agent? | [Yes - add to scope / No - justified reason] |

**Key Distinction:**
| Role | Question Answered | Audience |
|------|-------------------|----------|
| Technical Writer | "How does this work?" | Developers |
| SOP Writer | "How do I do this?" | VAs, contractors, AI |

**If the epic creates reusable processes or patterns:**
- Add "Documentation" deliverable to PBS
- Consider SOP Writer in Task Force for Level 4+ board meetings
- Schedule `/audit-sops` after implementation

**Incident (2026-01-31):** SAC EPIC initially lacked Knowledge Management agents despite "Buy Back Your Time" philosophy. Added Director of Knowledge Management + writers to Phase 2 after user feedback.

### 3. Define Clear Scope

- MVP must be achievable in 2-3 sprints
- Use MoSCoW to ruthlessly prioritize
- "Won't Have" is as important as "Must Have"

### 4. Create PBS (Product Breakdown)

Break into deliverables that can become PRDs or stories:
- Each deliverable should be sprint-sized or smaller
- Use IDs like `E1-001` for tracking

### 5. Plan Sprints

- 1-week sprints for fast iteration
- Max 12h capacity per sprint (realistic for Path B)
- First sprint should deliver visible value

## After Creating Epic

1. Confirm file path: `epics/EPIC-{name}.md`
2. Update `PRIORITY-MASTER-LIST.md` with new epic
3. **Next step:** Create first PRD with `/create-prd {deliverable-name}`

---

## Auto-Invoked Mode

**When auto-invoked by automation system:**

### Usage
```bash
/create-epic --auto-invoked --project-id={pid} --prd-data={json}
```

### Parameters
- `--auto-invoked`: Flag indicating automation trigger
- `--project-id`: PID identifier from `/create-pid`
- `--prd-data`: JSON with epic requirements from PID

### Automation Flow
```
/create-pid (PM) → automation_events.insert('pid_complete_large')
  → /create-epic (PO, auto-invoked if total_hours >20h)
  → automation_events.insert('epic_created')
  → /create-prd (PO, auto-invoked next)
```

### Auto-Mode Behavior
1. **Load context** from PID file
2. **Extract epic requirements** from PBS (Product Breakdown Structure)
3. **Generate epic file** with MoSCoW priorities
4. **Create automation event** for next command (/create-prd)
5. **Notify COO** via Telegram

**Test mode:** If `AGENT_MODE=test`, generate epic but don't create automation event

## Integration

```
/create-epic → EPIC-*.md (backlog/epics/)
       ↓
/create-prd → PRD-*.md (backlog/features/)
       ↓
/plan-feature → Task breakdown
       ↓
/execute → Implementation
```

---

*Epics are the bridge between strategy and execution.*
