---
title: "PID Template (Project Initiation Document)"
sidebar_label: "PID Template (Project Initiation Document)"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# PID Template (Project Initiation Document)

> **Purpose:** Standard template for Project Manager to create PID after Business Case approval

**Location:** `.agents/templates/PID-template.md`

**Created by:** Project Manager

**Inputs:**
- Business Case (from BA)
- Technical feasibility assessment (from Tech Architect)
- Resource availability (from COO)

---

## Template

```markdown
# Project Initiation Document: [Project Name]

**Date:** [YYYY-MM-DD]
**Author:** Project Manager
**Business Case Reference:** `.agents/projects/[project]/business-case.md`
**Sponsor:** CEO WALKER

---

## Project Overview

**Project Name:** [Name]
**Project Code:** [BM-XXX or similar]
**Duration:** [Start date] to [End date] ([X] weeks)
**Budget:** [X] hours @ Euro 72/hr = Euro [Y]
**Complexity Level:** [0-4 from board meeting]

**Project Purpose:**
[1 paragraph - why are we doing this?]

**Project Scope:**
[2-3 paragraphs - what's included, what's excluded]

**Success Criteria:**
[Copy from Business Case, prioritized]

---

## Project Organization

### Governance (Dual PM Model)

**ICT PM Methodology:** Walker-OS uses a **hybrid dual PM model** combining ICT PM rigor with agile delivery.

| Role | Name | Type | Responsibility | Commitment |
|------|------|------|----------------|------------|
| **Sponsor** | CEO WALKER | Strategic | Final decisions, strategic direction, escalations | 2h/week |
| **Business PM** | COO Agent | Strategic | Business case ownership, stakeholder management, strategic alignment | 10% |
| **ICT PM** | Project Manager Agent | Tactical | Day-to-day coordination, risk management, budget tracking, ETC updates, weekly status reports | 20h total |
| **Product Owner** | PO Agent | Delivery | Backlog prioritization, acceptance criteria, user stories | 10% |
| **Scrum Master** | SM Agent | Delivery | Sprint facilitation, blockers removal, team velocity | 10% |
| **Tech Lead** | Technical Architect | Technical | System design, code reviews, architecture decisions | 20% |
| **Developer** | Developer Agent | Technical | Implementation, coding | 100% |

**Dual PM Responsibilities:**

| Activity | Business PM (COO) | ICT PM (Project Manager) |
|----------|-------------------|--------------------------|
| **Business Case** | Creates, owns, validates ROI | Reviews for feasibility |
| **PID Creation** | Approves budget & resources | Creates, maintains, updates |
| **Stakeholder Management** | C-suite, external stakeholders | Team, specialists, daily coordination |
| **Risk Management** | Strategic risks (Path A/B impact) | Tactical risks (timeline, budget, technical) |
| **Budget** | Approves overall budget | Tracks actuals, ETC, variance reporting |
| **Timeline** | Approves milestones | Tracks daily progress, updates ETC |
| **Quality** | Defines acceptance criteria | Enforces quality gates |
| **Escalations** | Receives from ICT PM | Escalates to Business PM |
| **Reporting** | Receives weekly status | Creates weekly status reports |
| **Change Control** | Approves major/scope changes | Approves minor changes |

**Escalation Thresholds (ICT PM -> Business PM):**
- Budget variance >10%
- Timeline slip >1 week
- Scope change requests
- Strategic risks identified
- Resource conflicts
- Quality gate failures

### Communication Channels

| Channel | Purpose | Frequency | Participants |
|---------|---------|-----------|--------------|
| Telegram (CEO) | Blockers, decisions | As needed | PM + CEO |
| Daily standup | Progress updates | Daily | SM + Developer + Specialists |
| Sprint review | Demo + retrospective | Every 2 weeks | Full team |
| Weekly status | Metrics, risks | Weekly | PM + COO + CEO |

---

## Project Timeline

### Product Breakdown Structure (PBS)

**Hybrid Agile + ICT PM Approach:**

```
Project: [Name]
|
+-- 1. Technical Products
|   +-- 1.1 Infrastructure
|   |   +-- OAuth setup (CTO)
|   |   +-- Docker deployment (DevOps)
|   |   +-- Database schema (Data Engineer)
|   +-- 1.2 Core Features
|   |   +-- EA workflows (Developer)
|   |   +-- MoltBot integration (Developer)
|   |   +-- Task management (Developer)
|   +-- 1.3 Integrations
|       +-- Google Calendar (Developer)
|       +-- Things 3 sync (Developer)
|       +-- Telegram notifications (Developer)
|
+-- 2. Management & Quality Products
|   +-- 2.1 Project Management
|   |   +-- Weekly status reports (PM)
|   |   +-- Risk register updates (PM)
|   |   +-- Change log (PM)
|   +-- 2.2 Quality Assurance
|   |   +-- Test plan (QA Agent)
|   |   +-- Test cases (QA Agent)
|   |   +-- Test reports (QA Agent)
|   +-- 2.3 Documentation
|       +-- System design (Tech Architect)
|       +-- API documentation (Developer)
|       +-- User guide (Product Owner)
|
+-- 3. Delivery Products
    +-- 3.1 Deployment package
    +-- 3.2 Training materials (if needed)
    +-- 3.3 Handover documentation
```

**PBS mapped to Sprints:**
- Sprint 0: Products 2.3.1 (System design), 1.1 setup
- Sprint 1: Products 1.2 (Core features)
- Sprint 2: Products 1.3 (Integrations)
- Sprint 3: Products 2.2 (QA), 3.1-3.3 (Delivery)

---

### Sprint Breakdown

| Sprint | Dates | Focus | Deliverables (PBS Products) | Owner |
|--------|-------|-------|----------------------------|-------|
| **Sprint 0 (Setup)** | Week 1 | Architecture + planning | 2.3.1 System design, 1.1 Infrastructure setup | Tech Architect + PO |
| **Sprint 1** | Week 2-3 | Core features | 1.2.1-1.2.3 EA + MoltBot + Tasks | Developer |
| **Sprint 2** | Week 4-5 | Integrations | 1.3.1-1.3.3 Calendar + Things 3 + Telegram | Developer |
| **Sprint 3** | Week 6 | Testing + delivery | 2.2 QA products, 3.1-3.3 Delivery | Developer + QA |

### Key Milestones (Quality Gates)

| Gate | Date | Success Criteria | Decision | Owner |
|------|------|------------------|----------|-------|
| **Gate 1: OAuth Validation** | Day 2 Sprint 1 | OAuth flow working end-to-end | GO / NO-GO / PIVOT | CTO |
| **Gate 2: Sprint 1 Review** | End Sprint 1 | Core features demo'd and accepted | PROCEED / FIX / STOP | PM + PO |
| **Gate 3: Integration Test** | End Sprint 2 | All services connected, E2E test passes | PROCEED / FIX | Tech Architect |
| **Gate 4: Production Ready** | End Sprint 3 | All acceptance criteria met, QA passed | DEPLOY / DELAY | CTO + PM |

**Quality Gate Protocol:**
- **GO:** Proceed to next phase
- **NO-GO:** Stop project, execute contingency
- **PIVOT:** Change approach, update PID
- **FIX:** Address issues before proceeding
- **DELAY:** Extend timeline, re-forecast

---

## Resource Allocation & TCO

### Team Assignments (with ETC Tracking)

| Resource | Role | Allocation | Duration | Initial Estimate | Actuals | ETC | Re-forecast | Cost |
|----------|------|-----------|----------|------------------|---------|-----|-------------|------|
| Technical Architect | System design | 20% | 2 weeks | 8h | [TBD] | [TBD] | [TBD] | Euro 576 |
| Developer | Implementation | 100% | 4 weeks | 22h | [TBD] | [TBD] | [TBD] | Euro 1,584 |
| DevOps Agent | Deployment | 10% | 1 week | 2h | [TBD] | [TBD] | [TBD] | Euro 144 |
| QA Agent | Testing | 30% | 1 week | 2h | [TBD] | [TBD] | [TBD] | Euro 144 |
| **Total** | | | | **34h** | **[TBD]** | **[TBD]** | **[TBD]** | **Euro 2,448** |

**ETC Methodology (ICT PM Standard):**
- **Initial Estimate:** Original effort estimate from board meeting/BA
- **Actuals:** Hours spent to date (tracked weekly by team)
- **ETC** (Estimate To Complete): Updated estimate of remaining work
- **Re-forecast:** Actuals + ETC = New total estimate
- **Variance:** Re-forecast - Initial Estimate (flag if >10%)

**Weekly Updates Required:**
- Team members update Actuals every Monday
- PM updates ETC based on progress
- Re-forecast calculated automatically
- Variance >10% triggers COO notification

---

### TCO Analysis (Total Cost of Ownership)

**CAPEX (Capital Expenditure) - One-Time Costs:**

| Item | Category | Cost | Notes |
|------|----------|------|-------|
| Development (34h) | Labor | Euro 2,448 | Initial build |
| System design | Labor | Included | Part of 34h |
| Testing setup | Labor | Included | Part of 34h |
| **Total CAPEX** | | **Euro 2,448** | |

**OPEX (Operational Expenditure) - Recurring Costs:**

| Item | Category | Monthly | Annual | 3-Year Total |
|------|----------|---------|--------|--------------|
| MoltBot hosting | Infrastructure | Euro 0 | Euro 0 | Euro 0 |
| OpenRouter API | Services | Euro 5 | Euro 60 | Euro 180 |
| Tavily API | Services | Euro 7.65 | Euro 91.80 | Euro 275.40 |
| Maintenance (5h/year) | Labor | Euro 30 | Euro 360 | Euro 1,080 |
| **Total OPEX** | | **Euro 42.65** | **Euro 511.80** | **Euro 1,535.40** |

**TCO Summary (3-Year Horizon):**

```
TCO = CAPEX + (OPEX * Years)
TCO = Euro 2,448 + Euro 1,535.40
TCO = Euro 3,983.40

Time Value Created (3 years):
= 12.3 hrs/week * 52 weeks * 3 years * Euro 72/hr
= Euro 138,240

ROI = (Value - TCO) / TCO * 100
ROI = (Euro 138,240 - Euro 3,983.40) / Euro 3,983.40 * 100
ROI = 3,370%
```

---

## Risk Register (ICT PM Standard)

**Risk Scoring Methodology:**
- **Kans (Probability):** Laag (L=1), Medium (M=2), Hoog (H=3), Kritiek (K=4)
- **Impact:** Laag (L=1), Medium (M=2), Hoog (H=3), Kritiek (K=4)
- **Risico-score:** Kans * Impact = 1-16
- **Priority:** Score 1-4 = Low, 5-8 = Medium, 9-12 = High, 13-16 = Critical

| ID | Risk | Kans | Impact | Score | Priority | Trigger | Mitigation | Contingency | Owner | Status |
|----|------|------|--------|-------|----------|---------|------------|-------------|-------|--------|
| **R1** | OAuth setup fails | M (2) | H (3) | **6** | Medium | Day 2 - OAuth test fails | Milestone gate Day 2, CTO pairing | Pivot to manual EA | CTO | MONITORED |
| **R2** | API rate limits hit | L (1) | M (2) | **2** | Low | Usage >80% of free tier | Cache strategy, monitor usage | Manual research fallback | Tech Arch | MONITORED |
| **R3** | Developer blocked | M (2) | M (2) | **4** | Low | Dev reports blocker in standup | Daily standups, SM removes blockers | Parallel work on other tasks | SM | MONITORED |

### Risk Status Definitions

| Status | Meaning | Action Required |
|--------|---------|------------------|
| MONITORED | Risk identified, mitigation in place | Track weekly |
| RESEARCH | Risk needs investigation | Complete research by [date] |
| ACTIVE | Risk triggered, executing contingency | Daily monitoring, PM escalates |
| CRITICAL | Project blocker, immediate escalation | CEO involvement |
| CLOSED | Risk retired | Archive to lessons learned |

---

## Quality Management

### Quality Standards

| Area | Standard | Validation Method | Responsible |
|------|----------|-------------------|-------------|
| **Code Quality** | Pass `/validate` | TypeScript + lint + build | CTO |
| **Security** | OAuth + GDPR compliant | Security Agent review | Security Agent |
| **Performance** | <2s API response time | Load testing | Tech Architect |
| **Test Coverage** | >80% for critical paths | Automated tests | QA Agent |

### Review Gates

**Gate 1: Security Review (BLOCKING)**
- Trigger: Any OAuth, API key, or external service integration
- Checklist:
  - [ ] OAuth flows use secure token storage
  - [ ] API keys in environment variables
  - [ ] GDPR data handling compliant

**Gate 2: Architecture Review (BLOCKING)**
- Trigger: 3+ services integration
- Checklist:
  - [ ] Service boundaries clear
  - [ ] Error handling across services
  - [ ] Retry logic for external APIs

---

## Change Control

### Change Request Process

| Change Type | Impact | Approval | Process |
|-------------|--------|----------|---------|
| **Minor** | No scope/timeline impact | PM | Document in sprint notes |
| **Major** | Scope or timeline change | COO | Update PID, notify stakeholders |
| **Scope** | Change project objectives | CEO | BA revises Business Case |

### Change Log

| Date | Change Description | Type | Approver | Impact |
|------|--------------------|------|----------|--------|
| [Date] | [Description] | Minor/Major/Scope | [Name] | [X] days added |

---

## Weekly Status Report Template

```markdown
# Weekly Status Report: [Project Name]

**Report Date:** [YYYY-MM-DD]
**Week:** [X] of [Y]
**Overall Status:** ON TRACK / AT RISK / BLOCKED

## Executive Summary
- [Key achievement 1]
- [Key achievement 2]
- [Key blocker or decision needed]

## Progress vs Plan

### Completed This Week
| Task | Owner | Status |
|------|-------|--------|
| [Task 1] | Developer | Complete |

### In Progress
| Task | Owner | Progress | ETC | Blockers |
|------|-------|----------|-----|----------|
| [Task 3] | Developer | 60% | 2h | None |

## Budget Tracking
| Resource | Planned | Actual | ETC | Re-forecast | Variance |
|----------|---------|--------|-----|-------------|----------|
| Total | 34h | 16h | 16h | 32h | -2h |

## Risks & Issues
| ID | Risk | Status | Notes |
|----|------|--------|-------|
| R1 | OAuth complexity | CLOSED | Gate 1 passed |

## Next Week Priorities
1. [Priority 1]
2. [Priority 2]
```

---

## Stakeholder Management

### Communication Plan

| Stakeholder | Interest | Influence | Method | Frequency |
|-------------|----------|-----------|--------|-----------|
| **CEO WALKER** | High | High | Telegram + Weekly review | Daily + Weekly |
| **COO** | High | High | Daily standup summary | Daily |
| **Developer** | High | Medium | Daily standup | Daily |

### Escalation Path

| Level | Owner | Scope | Response Time |
|-------|-------|-------|---------------|
| 1 | Scrum Master | Blockers, daily issues | Same day |
| 2 | Project Manager | Resource conflicts, timeline | <24 hours |
| 3 | COO | Major changes, budget | <48 hours |
| 4 | CEO | Scope changes, strategic pivots | Next board meeting |

---

## Approvals & Sign-Off

### Pre-Project Approvals

- [ ] **Business Analyst** - Business Case validated
- [ ] **Project Manager** - PID complete and reviewed
- [ ] **Technical Architect** - Technical feasibility confirmed
- [ ] **COO** - Resources allocated and approved
- [ ] **CFO** - Budget approved
- [ ] **CEO WALKER** - Final approval to proceed

**Approval Date:** [Date]

### Post-Project Sign-Off

- [ ] **Product Owner** - All acceptance criteria met
- [ ] **QA Agent** - All tests passing
- [ ] **CTO** - Deployed and stable
- [ ] **CEO WALKER** - Project outcomes accepted

**Completion Date:** [Date]

---

**Document Control:**
- Version: 1.0
- Created: [Date]
- Last Updated: [Date]
- Owner: Project Manager
- Status: [DRAFT / APPROVED / IN PROGRESS / COMPLETE]
```

---

*Extracted from board-meeting-complete-hierarchy.md on 2026-01-30*
