---
description: Create a Product Requirements Document with Freedom Filter alignment
argument-hint: [feature-name]
---

# Create PRD: Generate Product Requirements Document

## Overview

Generate a focused PRD for walker-os features. Every PRD must pass the Freedom Filter before implementation.

## Output File

Write to: `features/PRD-$ARGUMENTS.md`

If no argument provided, ask for a feature name (kebab-case).

## PRD Structure (11 Sections)

### 1. Freedom Filter (MANDATORY)

**This section must be completed first. If the feature fails, stop and discuss with user.**

```markdown
## Freedom Filter Assessment

| Question | Answer |
|----------|--------|
| **Path Alignment** | Path A (BolScout) / Path B (€10k/mo) / Infrastructure |
| **€72/hr Value** | Yes/No - [justification] |
| **WHO not HOW** | Can this be delegated? To whom? |
| **Freedom Impact** | High/Medium/Low - [why] |

**Decision**: DO_NOW / SCHEDULE / DELEGATE / DEPRIORITIZE / CUT
```

If Decision is CUT or DEPRIORITIZE, explain why and suggest alternatives.

### 2. Executive Summary

- Problem statement (1-2 sentences)
- Solution overview (1-2 sentences)
- MVP goal statement
- Success metric (one measurable outcome)

### 3. Target Users

- Primary user (usually: Walker)
- Use context (timeblock, review, decision-making)
- Key pain point being solved

### 4. MVP Scope

```markdown
### In Scope
- [ ] Core feature 1
- [ ] Core feature 2

### Out of Scope (Future)
- [ ] Deferred feature 1
- [ ] Deferred feature 2
```

Keep MVP ruthlessly minimal. Apply YAGNI.

### 5. User Stories

3-5 stories maximum in format:
```
As [user], I want to [action], so that [freedom benefit].
```

Each story should connect to Path A, Path B, or time buyback.

### 6. Existing Capability Check (MANDATORY - 3x pattern)

**Before proposing ANY new infrastructure, verify existing tools can't handle it:**

```markdown
## Existing Capability Check

| Existing Tool | Can It Do This? | Checked? |
|---------------|-----------------|----------|
| Claude Code WebSearch (€0, subscription) | | [ ] |
| Claude Code Read/Grep/Bash | | [ ] |
| Existing agents-api endpoints | | [ ] |
| Existing n8n workflows | | [ ] |
| Command file change only? | | [ ] |

| Question | Answer |
|----------|--------|
| **Over-engineering risk?** | High/Medium/Low - [justification] |
| **Newer alternatives available?** | Check benchmarks |

**If ANY existing tool = yes → justify why new infra is still needed.**

**Conclusion:** Use existing / Simplify / Proceed with new infra / CUT
```

**Pattern (3x, automated):**
- 2026-01-29: Kimi K2.5 already had web research → CUT Multi-API Ensemble (saved 12h)
- 2026-01-29: Claude subscription unlimited → no need for API cost planning
- 2026-02-06: Claude WebSearch → replaced agents-api+Tavily+Kimi (€0, 10x simpler)

### 7. Architecture

**Target Repository (REQUIRED for frontend features):**

```markdown
**Target Repository:** [repo/path] | **Framework:** [framework] | **Entry Point:** [file path]
```

| Target | Path | Framework |
|--------|------|-----------|
| Landing page | `dyniq-app/apps/landing/` | Astro |
| Demo/interactive | `dyniq-app/apps/demo/` | Next.js 16 |
| Walker-OS | `walker-os/apps/web/` | Next.js |
| Agent API | `dyniq-ai-agents/` | FastAPI |

**Incident 2026-02-03:** 10 min wasted due to unspecified target repo. Always specify.

- Where does this fit in the existing structure?
- Which existing files/patterns to follow?
- Data flow (if touching Supabase)
- Key technical decisions

Reference existing patterns:
```
page.tsx (Server) → fetch data → Client Component → Server Actions → revalidate
```

**For n8n/API features (MANDATORY):**

```markdown
### API Endpoints
| Use Case | API | Port |
|----------|-----|------|
| Voice calls | ruben-api.dyniq.ai | 8080 |
| Content/HITL/Leads | agents-api.dyniq.ai | 8000 |

### Credentials Required
| Credential | Source | Retrieval Command |
|------------|--------|-------------------|
| [KEY_NAME] | [location] | `[command to retrieve]` |
```

**Why:** S5 incident (2026-01-29) showed missing credential source = debugging cycles.

### 8. Persistence Audit (MANDATORY for Stateful Features)

**Pattern (2026-02-09):** DYN-113 discovered in-memory singleton lost Bayesian weights on container restart. This audit catches persistence gaps during PRD creation, not execution.

```markdown
## Persistence Audit

| State | Storage | Survives Restart? | Survives Redeploy? |
|-------|---------|-------------------|-------------------|
| [state_1] | In-memory / DB / File | Yes/No | Yes/No |
| [state_2] | In-memory / DB / File | Yes/No | Yes/No |

**If ANY state is in-memory and must survive restart:**
- [ ] Plan database table/column for persistence
- [ ] Plan load-on-startup logic
- [ ] Plan migration script
```

**Skip if:** Feature is purely stateless (read-only endpoints, UI components, static content).

### 9. Implementation Phases

Break into 2-3 phases maximum:

```markdown
### Phase 1: [Name]
**Goal**: [One sentence]
- [ ] Task 1
- [ ] Task 2
**Validation**: How to verify it works

### Phase 2: [Name]
...
```

### 10. Testing Strategy

**Required for every PRD.** Defines how changes will be validated.

```markdown
## Testing Strategy

**Change Type**: Code / Command / Both

**For code changes:**
- Unit tests: [specific test files to add/modify]
- Integration tests: [API endpoints, data flows to test]
- E2E tests: [user flows in Playwright]

**For command changes:**
- Validate during: [specific timeblock/session type]
- Observable behavior: [what should happen when command runs]
- Rollback trigger: [conditions that would cause revert]

**Phase gates:**
- Phase 1 validated when: [specific criteria]
- Phase 2 starts after: [dependency on Phase 1 validation]
```

If skipping tests, justify explicitly (e.g., "markdown-only change, no testable code").

### 11. Success Criteria

- [ ] Functional: What must work?
- [ ] Quality: No lint/type errors, passes build
- [ ] Freedom: How does this move the needle?

## Instructions

### 0. Pre-Creation Check

**Before creating any PRD, confirm these:**

1. **Scope alignment** - Does this align with stated session/task goals?
   - If discovered during research (not explicitly requested), ASK first
   - "Should I create a PRD for [X] now or note it for later?"

2. **Priority check** - Review `PRIORITY-MASTER-LIST.md`
   - If this would be Priority 3+ (deferred), confirm before creating

3. **Infrastructure changes** - For architectural/tool changes:
   - Always present "keep current" as valid option
   - Don't assume change is needed

### 1. Extract Requirements
- Review conversation for explicit and implicit needs
- Identify which dashboard route this affects
- Note any existing code to modify vs. create

### 2. Apply Freedom Filter FIRST
- If feature doesn't pass, discuss before proceeding
- Be honest about Path alignment
- Challenge "nice to have" features

### 3. Write Focused PRD
- Prefer brevity over comprehensiveness
- Use checkboxes for scope items
- Include file paths for existing code to modify
- Reference CLAUDE.md patterns

### 4. Quality Checks
- [ ] Freedom Filter completed with clear decision
- [ ] MVP scope is minimal and achievable
- [ ] User stories connect to freedom goals
- [ ] Implementation phases are actionable
- [ ] Testing strategy defined (or justified if skipped)
- [ ] Success criteria are measurable

## Style Guidelines

- **Tone**: Direct, action-oriented
- **Length**: 1-2 pages maximum
- **Specificity**: Include file paths, component names
- **Checkboxes**: Use for all scope and task items

## Output Confirmation

After creating the PRD:

1. Confirm file path: `features/PRD-{feature-name}.md`
2. Summarize Freedom Filter decision
3. List key files that will be modified
4. **Suggest next step**: "Run `/plan-feature` to break this into executable tasks"

---

## Auto-Invoked Mode

**When auto-invoked by automation system:**

### Usage
```bash
/create-prd --auto-invoked --epic-id={epic} --deliverable-id={id}
```

### Parameters
- `--auto-invoked`: Flag indicating automation trigger
- `--epic-id`: Epic identifier from `/create-epic`
- `--deliverable-id`: PBS deliverable ID (e.g., E1-001)

### Automation Flow
```
/create-epic (PO) → automation_events.insert('epic_created')
  → /create-prd (PO/COO, auto-invoked for each deliverable)
  → automation_events.insert('prd_complete')
  → /sprint-planning (SM, auto-invoked)
```

### Auto-Mode Behavior
1. **Load epic context** from epic file
2. **Extract deliverable requirements** from PBS
3. **Generate PRD** with Freedom Filter assessment
4. **Check for keywords** (#oauth, #api, #auth) → trigger security/integration reviews
5. **Create automation event** for next command (/sprint-planning)
6. **Notify Scrum Master** via Telegram

### Keyword Detection

**Auto-trigger specialist reviews:**
- `#oauth`, `#auth`, `#payment`, `#pii` → `/security-review` (Security Agent)
- `#multi-service`, `#api`, `#event-driven` → `/review-integration` (Integration Architect)

**Test mode:** If `AGENT_MODE=test`, generate PRD but don't create automation events

## Integration with PIV-Loop

```
/create-prd → /plan-feature → /execute → /validate → /commit
     ↓              ↓             ↓           ↓          ↓
   PRD.md      Plan.md      Code changes   Lint/Build  Git
```

This PRD becomes input for `/plan-feature` which creates the detailed task breakdown.
