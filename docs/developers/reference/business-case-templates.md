---
title: "Business Case Templates"
sidebar_label: "Business Case Templates"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Business Case Templates

Reference templates for Business Analyst `/create-business-case` command.

---

## Full Template Structure

### 1. Executive Summary (1 paragraph)

**Format:**
```markdown
## Executive Summary

[Project Name] addresses [problem statement] by [solution approach],
delivering [key benefits] within [timeline] at a cost of [total investment].
Expected ROI: [X%] over [Y years]. Strategic alignment: [Path A/B/Infrastructure].
```

### 2. Problem Statement (SMART format)

| Element | Description |
|---------|-------------|
| **Specific** | Exact problem being solved |
| **Measurable** | Current baseline metrics |
| **Achievable** | Realistic solution scope |
| **Relevant** | Path A/B alignment |
| **Time-bound** | Target completion date |

### 3. Proposed Solution

**Components:**
- High-level approach
- Key features/capabilities
- Technology stack (if relevant)
- Integration points
- Resource requirements

### 4. Cost-Benefit Analysis

**TCO Calculation (3-Year Horizon):**

#### CAPEX (Capital Expenditure)
| Item | Cost | Notes |
|------|------|-------|
| Development labor | €XXX | XX hours @ €72/hr |
| Infrastructure setup | €XXX | One-time costs |
| Software licenses | €XXX | Perpetual licenses |
| **Total CAPEX** | **€XXX** | |

#### OPEX (Operational Expenditure)
| Item | Monthly | Annual | 3-Year Total |
|------|---------|--------|--------------|
| Hosting | €XX | €XXX | €XXX |
| API costs | €XX | €XXX | €XXX |
| Maintenance | €XX | €XXX | €XXX |
| **Total OPEX** | **€XX** | **€XXX** | **€XXX** |

#### ROI Calculation
```
TCO = CAPEX + (OPEX × 3 years)
TCO = €XXX + €XXX = €XXX

Value Created (3 years):
= [Hours saved/week] × 52 weeks × 3 years × €72/hr
= €XXX

ROI = (Value - TCO) / TCO × 100
ROI = X,XXX%
```

### 5. Strategic Alignment

| Criterion | Assessment | Evidence |
|-----------|-----------|----------|
| **Path A (BolScout)** | High / Medium / Low / None | Explain fit |
| **Path B (€10k/mo)** | High / Medium / Low / None | Revenue impact |
| **Infrastructure** | Yes / No | Foundation for future work? |
| **Freedom Filter** | Buy back time? | Hours/week saved |

### 6. Risk Assessment (High-Level)

**Top 3 Risks:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | L/M/H/K | L/M/H/K | [Strategy] |
| [Risk 2] | L/M/H/K | L/M/H/K | [Strategy] |
| [Risk 3] | L/M/H/K | L/M/H/K | [Strategy] |

### 7. Stakeholder Analysis

| Stakeholder | Interest | Influence | Engagement Strategy |
|-------------|----------|-----------|---------------------|
| CEO WALKER | Final decision | High | Weekly updates |
| COO | Delivery ownership | High | Daily coordination |
| CFO | Budget approval | Medium | Financial reports |
| [Other] | [Role] | [Level] | [Approach] |

### 8. Success Criteria

**SMART Objectives:**

| Objective | Baseline | Target | Measurement Method |
|-----------|----------|--------|-------------------|
| Time buyback | 0 hrs/week | XX hrs/week | Timeblock tracking |
| Cost reduction | €X/mo | €Y/mo | Expense reports |
| Revenue impact | €X/mo | €Y/mo | Cashflow tracking |
| Quality improvement | X% | Y% | Error rate metrics |

### 9. Alternatives Considered

| Alternative | Pros | Cons | Why Not Selected |
|-------------|------|------|------------------|
| Do nothing | No cost | No benefits | Misses strategic opportunity |
| Manual process | Low upfront cost | High ongoing cost | Doesn't scale |
| [Option B] | [Pros] | [Cons] | [Rationale] |

### 10. Recommendation

**BA Recommendation:** PROCEED / REVISE / REJECT

**Rationale:**
[3-5 sentences explaining why this project should proceed, be revised, or be rejected based on the analysis above]

**Next Steps:**
1. COO reviews business case
2. If approved → PM creates PID
3. If revision needed → BA updates based on feedback
4. If rejected → Document lessons learned

---

## Validation Checklist

Before submitting Business Case to COO:

- [ ] Executive Summary is 1 paragraph, <150 words
- [ ] Problem Statement is SMART format
- [ ] TCO calculated over 3 years
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

*Referenced by: `.claude/agents/business-analyst.md`*
