---
title: "Knowledge Management Roles"
sidebar_label: "Knowledge Management Roles"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Knowledge Management Roles

Reference for knowledge creation and documentation roles in the Strategic Advisory Council.

---

## The Two Knowledge Roles

| Role | Tier | Question Answered | Audience | Output Type |
|------|------|-------------------|----------|-------------|
| **Technical Writer** | 5 | "How does this work?" | Developers, engineers | Architecture docs, API docs, README, code comments |
| **SOP Writer** | 5 | "How do I do this?" | VAs, contractors, AI, future self | Playbooks, checklists, runbooks, step-by-step procedures |

---

## Why Two Roles?

The roles serve different purposes and produce different outputs:

### Technical Writer

**Purpose:** Explain systems for understanding and modification.

**Audience:**
- Internal developers
- Future engineers joining the project
- Open source contributors

**Output Examples:**
- API reference documentation
- Architecture decision records (ADRs)
- README files
- Code comments
- System design docs

**Key Questions:**
- How is this component structured?
- What are the dependencies?
- Why was this approach chosen?
- How do the pieces fit together?

### SOP Writer / Delegation Specialist

**Purpose:** Enable someone else to execute a task without further explanation.

**Audience:**
- Virtual assistants (Fiverr, Upwork)
- AI agents executing tasks
- Contractors
- Future self (forgotten context)

**Output Examples:**
- Step-by-step playbooks
- Checklists with checkboxes
- Runbooks for operations
- Troubleshooting guides
- Video walkthroughs with scripts

**Key Questions:**
- What exact steps do I follow?
- What does success look like?
- What common errors might occur?
- How do I know I'm done?

---

## When to Use Each

| Situation | Use | Example |
|-----------|-----|---------|
| New API endpoint | Technical Writer | Document endpoints, request/response formats |
| Deploy process | SOP Writer | Step-by-step deploy checklist |
| System architecture | Technical Writer | How the board meeting swarm works |
| Onboard new VA | SOP Writer | "Here's exactly how to post to LinkedIn" |
| Debug production issue | Both | Tech Writer: "why this happens", SOP Writer: "how to fix" |

---

## Integration with Agent System

### Director of Knowledge Management (Tier 3)

Reports to: VP Operations - Excellence

**Role:**
- Detects when something should be documented
- Decides: Technical doc or SOP?
- Assigns to appropriate writer
- Reviews outputs for delegation-readiness

**Triggers for Documentation:**
- Same question asked twice in 7 days → SOP candidate
- Bug fixed → Playbook candidate
- New feature launched → Technical doc required
- Onboarding moment → Capture as SOP

### `/audit-sops` Command

Scans recent activity to identify SOP opportunities:
- Git commits (fixes become playbooks)
- Daily plans (repeated tasks become SOPs)
- Board meeting decisions (implementation patterns)
- System reviews (learnings become docs)

---

## Quality Criteria

### Good Technical Doc

- [ ] Explains the "why" not just the "what"
- [ ] Includes diagrams where helpful
- [ ] Stays updated with code changes
- [ ] Linkable sections for quick reference

### Good SOP

- [ ] A complete beginner can follow it
- [ ] Each step is a single action
- [ ] Includes expected outcome per step
- [ ] Has troubleshooting section
- [ ] Specifies time estimate
- [ ] Lists required access/tools

---

## The Buyback Test

From "Buy Back Your Time" by Dan Martell:

> "If you explain it twice, it should be an SOP."

**Process:**
1. First time explaining → Just do it
2. Second time explaining → Create SOP
3. Third time needed → SOP should exist, delegate

---

## Examples from This Project

| Type | Document | Path |
|------|----------|------|
| Technical | Agent Orchestration | `agent-orchestration.md` |
| Technical | Infrastructure Architecture | `infrastructure-architecture.md` |
| SOP | Deploy to Production | `.agents/sops/deploy-production.md` |
| SOP | Add Scorecard Field | `scorecard-checklist.md` |
| Both | n8n Gotchas | `n8n-gotchas.md` (explains + checklist) |

---

## Incident Reference

**2026-01-31:** During SAC EPIC planning, user clarified distinction:

> "There is difference between a technical writer and a SOP for delegate later"

This led to:
- Adding SOP Writer role separate from Technical Writer
- Creating Director of Knowledge Management
- Adding `/audit-sops` command
- Creating this reference document

---

*"Technical docs explain. SOPs enable delegation. Different roles, different value."*
