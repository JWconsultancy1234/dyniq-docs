---
title: "Business Case Template"
sidebar_label: "Business Case Template"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Business Case Template

> **Purpose:** Standard template for Business Analyst to create Business Case after board decision

**Location:** `.agents/templates/business-case-template.md`

**Created by:** Business Analyst

**Inputs:**
- Board meeting decision log
- CEO decision rationale
- Success criteria from board meeting
- CFO cost analysis
- Head of Data metrics baseline

---

## Template

```markdown
# Business Case: [Project Name]

**Date:** [YYYY-MM-DD]
**Author:** Business Analyst
**Board Decision Reference:** `.agents/logs/board-meetings/[date]-[topic].md`
**CEO Decision:** [ADOPT / EXPERIMENT / PASS / DEFER]

---

## Executive Summary

**Problem Statement:**
[1-2 paragraphs - what problem are we solving?]

**Proposed Solution:**
[1-2 paragraphs - CEO's decision from board meeting]

**Expected Benefits:**
- Time buyback: [X] hours/week
- Revenue impact: [Euro X/year or N/A]
- Strategic value: [Path A/B alignment]

**Investment Required:**
- Development: [X] hours @ Euro 72/hr = Euro [Y]
- Tools/Services: Euro [Z]/year
- Total: Euro [Y+Z]

**ROI:**
[Benefit/Cost ratio - e.g., 50,196% = Euro 46,080 value / Euro 91.80 cost]

---

## Stakeholder Analysis

| Stakeholder | Role | Interest | Influence | Engagement Strategy |
|-------------|------|----------|-----------|---------------------|
| Walker (CEO) | Sponsor | High | High | Weekly updates via Telegram |
| COO | Manager | High | High | Daily coordination |
| Developer | Implementer | Medium | Medium | Sprint planning |
| End Users | Beneficiary | High | Low | Beta testing |

**Key Stakeholder Concerns:**
1. [Stakeholder 1]: [Concern] -> [Mitigation]
2. [Stakeholder 2]: [Concern] -> [Mitigation]

---

## Requirements Summary

### Functional Requirements

From board meeting success criteria:

1. **[Requirement 1]**
   - Acceptance criteria: [How we know it's done]
   - Priority: P0 / P1 / P2
   - Source: [Phase of board meeting]

2. **[Requirement 2]**
   - Acceptance criteria: [...]
   - Priority: P0 / P1 / P2

### Non-Functional Requirements

1. **Performance:**
   - Target: [Response time, throughput]
   - Measurement: [How we'll track]

2. **Security:**
   - OAuth flows required: [Yes/No]
   - GDPR compliance: [Yes/No]
   - API security: [Key management approach]

3. **Scalability:**
   - Expected growth: [Users, requests, data]
   - Capacity planning: [Infrastructure needs]

---

## Cost-Benefit Analysis (with CFO)

### Costs

| Item | Type | Amount | Frequency | Annual Cost |
|------|------|--------|-----------|-------------|
| Development | One-time | [X]h @ Euro 72/hr | Once | Euro [Y] |
| MoltBot hosting | Recurring | Self-hosted | Monthly | Euro 0 |
| API costs (Tavily) | Variable | $0.008/query | Per use | Euro [Z] |
| **Total** | | | | **Euro [Total]** |

### Benefits

| Benefit | Type | Amount | Frequency | Annual Value |
|---------|------|--------|-----------|--------------|
| Time buyback | Recurring | [X] hrs/week | 52 weeks | [X*52] hrs = Euro [Y] |
| Revenue increase | Recurring | Euro [Z]/month | 12 months | Euro [Z*12] |
| **Total** | | | | **Euro [Total]** |

### ROI Calculation

```
ROI = (Annual Benefit - Annual Cost) / Annual Cost * 100
ROI = (Euro [Benefit] - Euro [Cost]) / Euro [Cost] * 100
ROI = [X]%
```

**Payback Period:** [Months to break even]

---

## Risk Assessment

| ID | Risk | Probability | Impact | Score | Mitigation Strategy | Owner |
|----|------|-------------|--------|-------|---------------------|-------|
| R1 | OAuth setup complexity | Medium | High | 6 | Milestone gate at Day 2, pivot to manual if fails | CTO |
| R2 | API rate limits hit | Low | Medium | 2 | Cache strategy, monitor usage, budget buffer | Tech Architect |
| R3 | Vendor lock-in (MoltBot) | Low | Medium | 2 | Document alternatives, keep portable architecture | CTO |

**Risk Score:** Probability (1-3) * Impact (1-3) = 1-9

**Mitigation Plans:**
- **R1:** If OAuth not working by Day 2 -> Fallback to manual EA + scheduled reviews
- **R2:** Set up alerts at 80% rate limit -> Review caching strategy
- **R3:** Maintain abstraction layer -> Can swap to open-source alternative

---

## Success Criteria (with Head of Data)

### Quantitative Metrics

| Metric | Baseline | Target | Measurement Method | Review Frequency |
|--------|----------|--------|--------------------|------------------|
| Time buyback | 0 hrs/week | 12.3 hrs/week | Weekly review logs | T+7, T+30 |
| Task automation | 0% | 80% | EA automation rate | T+7, T+30 |
| Decision quality | N/A | 8+/10 confidence | Board meeting votes | Per decision |

### Qualitative Metrics

| Metric | Success Criteria |
|--------|------------------|
| User satisfaction | Walker reports "saves significant time" |
| System reliability | <5% error rate in automated tasks |
| Integration success | OAuth working without manual intervention |

### Measurement Plan

- **T+7 Quick Check:** EA reports on metrics, blockers, timeline
- **Milestone Reviews:** 25%, 50%, 75% completion -> validate on track
- **T+30 Comprehensive:** Full outcome review, predicted vs actual

---

## Dependencies

| Dependency | Type | Status | Impact if Blocked | Mitigation |
|------------|------|--------|-------------------|------------|
| Contabo VPS access | Infrastructure | Available | CRITICAL | Local dev environment |
| OAuth credentials | External | Pending | HIGH | Milestone gate Day 2 |
| Things 3 API | Integration | Research needed | MEDIUM | Manual task entry fallback |

---

## Alternatives Considered

From board meeting Phase 5 (Options Matrix):

### Option A: [Chosen Solution]
- **Pros:** [From board meeting]
- **Cons:** [From board meeting]
- **Score:** [X]/10 (domain-weighted)

### Option B: [Alternative]
- **Pros:** [...]
- **Cons:** [...]
- **Score:** [Y]/10
- **Why not chosen:** [CEO decision rationale]

---

## Recommendation

**Business Analyst Recommendation:** PROCEED to Project Manager for PID creation.

**Rationale:**
1. [Strong ROI: X% return]
2. [Aligned with Path A/B strategy]
3. [Acceptable risk profile with mitigation plans]
4. [Clear success criteria and measurement plan]

**Conditions:**
- Milestone gate at Day 2 (OAuth validation)
- Weekly progress reviews with CEO
- Rollback plan if OAuth fails

---

## Sign-Off

- [ ] **Business Analyst** - Business case complete and reviewed
- [ ] **CFO** - Cost-benefit analysis validated
- [ ] **Head of Data** - Success criteria and measurement plan approved
- [ ] **COO** - Ready for PM to create PID

**Next Steps:**
1. Project Manager receives this Business Case
2. PM creates PID (Project Initiation Document)
3. PM schedules Non-C-Suite Workshop for sprint planning

---

**Document Control:**
- Version: 1.0
- Created: [Date]
- Last Updated: [Date]
- Owner: Business Analyst
```

---

## Problem Statement SMART Format

When writing the problem statement, use SMART format:

| Element | Description |
|---------|-------------|
| **Specific** | Exact problem being solved |
| **Measurable** | Current baseline metrics |
| **Achievable** | Realistic solution scope |
| **Relevant** | Path A/B alignment |
| **Time-bound** | Target completion date |

---

## TCO Calculation (3-Year Horizon)

For larger projects, calculate Total Cost of Ownership over 3 years:

### CAPEX (Capital Expenditure)
| Item | Cost | Notes |
|------|------|-------|
| Development labor | €XXX | XX hours @ €72/hr |
| Infrastructure setup | €XXX | One-time costs |
| Software licenses | €XXX | Perpetual licenses |
| **Total CAPEX** | **€XXX** | |

### OPEX (Operational Expenditure)
| Item | Monthly | Annual | 3-Year Total |
|------|---------|--------|--------------|
| Hosting | €XX | €XXX | €XXX |
| API costs | €XX | €XXX | €XXX |
| Maintenance | €XX | €XXX | €XXX |
| **Total OPEX** | **€XX** | **€XXX** | **€XXX** |

### Full TCO ROI Calculation
```
TCO = CAPEX + (OPEX × 3 years)
TCO = €XXX + €XXX = €XXX

Value Created (3 years):
= [Hours saved/week] × 52 weeks × 3 years × €72/hr
= €XXX

ROI = (Value - TCO) / TCO × 100
ROI = X,XXX%
```

---

## Strategic Alignment Check

| Criterion | Assessment | Evidence |
|-----------|-----------|----------|
| **Path A (BolScout)** | High / Medium / Low / None | Explain fit |
| **Path B (€10k/mo)** | High / Medium / Low / None | Revenue impact |
| **Infrastructure** | Yes / No | Foundation for future work? |
| **Freedom Filter** | Buy back time? | Hours/week saved |

---

## Validation Checklist

Before submitting Business Case to COO:

- [ ] Executive Summary is 1 paragraph, <150 words
- [ ] Problem Statement is SMART format
- [ ] TCO calculated (over 3 years for major projects)
- [ ] ROI calculation includes time value (€72/hr)
- [ ] Path alignment is explicitly stated
- [ ] Top 3 risks identified with mitigation
- [ ] Stakeholder matrix complete
- [ ] Success criteria are measurable
- [ ] Alternatives considered and explained
- [ ] Clear recommendation (PROCEED/REVISE/REJECT)
- [ ] File saved to correct location
- [ ] COO notified via Telegram

---

## File Naming Convention

**Business Cases:** `.agents/docs/business-cases/BC-YYYY-MM-DD-topic.md`

**Example:**
```
BC-2026-01-26-board-meeting-sprint2-ea-moltbot.md
```

---

*Extracted from board-meeting-complete-hierarchy.md on 2026-01-30*
*Merged with business-case-templates.md on 2026-01-30*
