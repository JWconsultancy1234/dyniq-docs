---
title: "Operations Templates Reference"
sidebar_label: "Operations Templates Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Operations Templates Reference

Detailed templates and methods for the Operations Executive (COO).

---

## Requirements Template

```markdown
## Requirements: [Feature Name]

**Stakeholder:** [Who needs this]
**Problem:** [What problem does this solve]
**Current State:** [How it works now]
**Desired State:** [How it should work]

### Functional Requirements
1. System shall [requirement]
2. System shall [requirement]

### Non-Functional Requirements
- Performance: [response time, throughput]
- Security: [authentication, authorization]

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
```

---

## User Story Template

```markdown
**As a** [user type]
**I want to** [goal]
**So that** [value/benefit]

**Acceptance Criteria:**
- [ ] Given X, when Y, then Z
```

---

## Epic Template

```markdown
# EPIC: [Name]

**Owner:** Walker | **Status:** PLANNING/ACTIVE/COMPLETE
**Target:** [Sprint X-Y]

## MVP Scope (Ship Fast)
- [ ] Must-have 1
- [ ] Must-have 2

## Post-MVP (Later)
- [ ] Nice-to-have

## Stories
| ID | Story | Priority | Sprint | Status |
|----|-------|----------|--------|--------|
| E1-001 | [Story] | P0 | S1 | ⬜ |
```

---

## PID Template (Project Initiation Document)

For large initiatives (epics):

```markdown
# EPIC: [Name]

## Executive Summary
[1-2 sentence elevator pitch]

## Business Case
- **Problem:** [What's broken]
- **Solution:** [What we're building]
- **Value:** [€ impact or time saved]

## Scope (MoSCoW)
### Must Have
### Should Have
### Could Have
### Won't Have (this release)

## Product Breakdown (PBS)
| ID | Deliverable | Owner | Sprint |
|----|-------------|-------|--------|

## Risks & Assumptions
| Risk | Impact | Mitigation |

## Success Criteria
- [ ] [Measurable outcome]
```

---

## SOP Template

```markdown
# SOP: [Task Name]

**Owner:** [Who should do this]
**Frequency:** [Daily/Weekly/Monthly]
**Time Required:** [X minutes]

## Checklist
- [ ] Step 1: [Action verb] [specific detail]
- [ ] Step 2: [Action verb] [specific detail]

## When to Escalate
Contact Walker if: [conditions]

## Done Criteria
- [Measurable outcome]
```

---

## Standup Template

```markdown
## Standup: [Block] - [Date]

**Yesterday:** [What was done]
**Today:** [Focus for this block]
**Blockers:** [Issues and resolution plan]
**Sprint Progress:** [X/Y points] - [X%]
```

---

## Project Management Methods Reference

### MoSCoW Prioritization

| Priority | Meaning | Action |
|----------|---------|--------|
| **Must** | Critical for MVP, no workarounds | Do first |
| **Should** | Important but has workarounds | Do if time |
| **Could** | Nice-to-have, enhances value | Defer to later sprint |
| **Won't** | Out of scope for this release | Document for future |

**Rule:** 60% Must, 20% Should, 20% Could. If >60% Must, scope is too big.

### PERT Estimation

```
Expected = (Optimistic + 4×Likely + Pessimistic) / 6
```

### Devil's Triangle

```
SCOPE ←→ TIME ←→ MONEY ←→ QUALITY
```

**Rule:** Fix at most TWO. The third must flex.

### Key Methods Quick Reference

| Method | Use |
|--------|-----|
| **PERT** | (O + 4×L + P) / 6 estimation |
| **MoSCoW** | Must/Should/Could/Won't prioritization |
| **RACI** | Responsible/Accountable/Consulted/Informed |
| **RAG** | Red/Amber/Green status |
| **PBS** | Product Breakdown Structure (deliverables) |
| **WBS** | Work Breakdown Structure (tasks) |

### DRIP Matrix (Delegation)

| Quadrant | Energy | Value | Action |
|----------|--------|-------|--------|
| **Delegate** | Drains | <€72/hr | Create SOP |
| **Replace** | Gives | <€72/hr | Create SOP, find WHO |
| **Invest** | Drains | >€72/hr | Improve process first |
| **Produce** | Gives | >€72/hr | Keep doing yourself |

---

## Quality Gates

| Gate | Approval |
|------|----------|
| Requirements complete | Product (COO) |
| Design reviewed | Technology Executive |
| Code reviewed | Reviewer |
| Tests pass | Reviewer |
| Deploy ready | Technology Executive |

---

## Velocity Tracking Template

```markdown
| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| W1 | 20 | 18 | 90% |
```

---

*Templates for COO operations. See exec-operations.md for agent behavior.*
