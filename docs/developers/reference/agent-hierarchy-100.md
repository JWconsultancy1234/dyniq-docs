---
title: "Agent Hierarchy: 100-Agent Swarm Design"
sidebar_label: "Agent Hierarchy: 100-Agent Swarm Design"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Agent Hierarchy: 100-Agent Swarm Design

> **Purpose:** Complete hierarchical agent swarm for autonomous planning and decision-making.
> **Status:** DESIGN | **Target:** Phase 3 Implementation

---

## Hierarchy Overview

```
Level 1:  6 C-Suite Executives           (voting weight: 1.0x base)
Level 2: 18 Specialists                   (voting weight: 0.8x parent)
Level 3: 19 Task Workers                  (voting weight: 0.5x)
Level 4: 26 Domain Experts [NEW]          (voting weight: 0.6x)
Level 5: 31 Task Specialists [NEW]        (voting weight: 0.4x)
─────────────────────────────────────────────────────────────────
TOTAL:  100 Agents
```

---

## Current State (43 Agents) ✅

### Level 1: C-Suite (6)

| Agent | Role | Domain Weight | Prompt Focus |
|-------|------|---------------|--------------|
| CEO WALKER | Master Orchestrator | 1.5x strategic | Freedom filter, final decisions |
| CFO | Finance | 2.0x financial | Profit First, ROI, cashflow |
| CTO | Technology | 2.0x technical | Architecture, security, DevOps |
| COO | Operations | 2.0x operational | Planning, SOPs, processes |
| Head of Data | Analytics | 1.5x universal | Metrics, ML, data validation |
| Marketing/Sales | Revenue | 2.0x market | Positioning, revenue, customers |

### Level 2: Specialists (18)

| Parent | Specialists (3 each) |
|--------|---------------------|
| CFO | Financial Analyst, Tax Advisor, Budget Analyst |
| CTO | Security Expert, DevOps Engineer, ML Engineer |
| COO | Process Analyst, Supply Chain, QA Lead |
| Data | ML Specialist, Analytics Expert, BI Analyst |
| Marketing | Brand Strategist, Content Expert, SEO Specialist |
| CEO | Strategy Consultant, M&A Advisor, Risk Analyst |

### Level 3: Task Workers (19)

| Worker Type | Count | Parent | Function |
|-------------|-------|--------|----------|
| Data Collector | 3 | Data | Fetch metrics, benchmarks |
| Report Generator | 2 | CFO/Data | Format analysis |
| Code Reviewer | 2 | CTO | Validate technical recs |
| Benchmark Runner | 1 | CTO | Performance tests |
| Checklist Validator | 2 | COO | Process compliance |
| SOP Writer | 2 | COO | Draft documentation |
| Competitor Researcher | 3 | Marketing | Competitive intel |
| Market Researcher | 2 | CEO | Industry trends |
| Risk Validator | 2 | CEO | Validate assumptions |

---

## Level 4: Domain Experts (26 New) 🆕

### CFO Domain (4 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-F01 | Pricing Strategist | Value-based pricing, Hormozi models | 0.6x financial |
| DE-F02 | Cash Flow Manager | Weekly cashflow, runway, Profit First | 0.6x financial |
| DE-F03 | Investment Analyst | Path A equity, ROI projections | 0.6x financial |
| DE-F04 | Zakat/Compliance Advisor | Islamic finance, tax compliance | 0.6x financial |

### CTO Domain (4 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-T01 | API Architect | REST/GraphQL design, versioning | 0.6x technical |
| DE-T02 | Database Expert | PostgreSQL, Supabase, migrations | 0.6x technical |
| DE-T03 | Frontend Specialist | Next.js, React, UI/UX patterns | 0.6x technical |
| DE-T04 | Infrastructure Engineer | Docker, Caddy, Contabo, CI/CD | 0.6x technical |

### COO Domain (4 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-O01 | Automation Specialist | n8n, Zapier, workflow design | 0.6x operational |
| DE-O02 | Customer Success Lead | Onboarding, retention, NPS | 0.6x operational |
| DE-O03 | Support Operations | Ticket triage, escalation, SLAs | 0.6x operational |
| DE-O04 | Vendor Manager | Contract negotiation, SaaS stack | 0.6x operational |

### Data Domain (4 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-D01 | Data Engineer | Pipelines, ETL, data modeling | 0.6x data |
| DE-D02 | Privacy Officer | GDPR, data retention, consent | 0.6x data |
| DE-D03 | Metrics Designer | KPI definition, dashboards | 0.6x data |
| DE-D04 | A/B Test Specialist | Experiment design, significance | 0.6x data |

### Marketing Domain (4 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-M01 | Social Media Manager | LinkedIn, platform algorithms | 0.6x market |
| DE-M02 | Copywriter | Headlines, hooks, persuasion | 0.6x market |
| DE-M03 | Growth Hacker | Viral loops, referral programs | 0.6x market |
| DE-M04 | Partnership Manager | Affiliates, resellers, co-marketing | 0.6x market |

### CEO Domain (6 new experts)

| ID | Agent | Domain Focus | Voting Weight |
|----|-------|--------------|---------------|
| DE-C01 | Legal Counsel | Contracts, liability, IP | 0.6x strategic |
| DE-C02 | HR Advisor | Hiring, culture, delegation | 0.6x strategic |
| DE-C03 | Product Manager | Roadmap, prioritization, user needs | 0.6x strategic |
| DE-C04 | Industry Expert (HVAC) | HVAC market, regulations, players | 0.6x market |
| DE-C05 | Industry Expert (Plumbing) | Plumbing market, certifications | 0.6x market |
| DE-C06 | Regional Expert (Benelux) | BE/NL/LU regulations, culture | 0.6x strategic |

**Level 4 Total: 26 agents → Running total: 69 agents**

---

## Level 5: Task Specialists (31 New) 🆕

### Legal/Compliance Cluster (3)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-L01 | Contract Reviewer | Legal Counsel | Parse contracts, flag risks |
| TS-L02 | GDPR Specialist | Privacy Officer | Data processing assessments |
| TS-L03 | IP Researcher | Legal Counsel | Patent search, trademark checks |

### HR/People Cluster (3)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-H01 | Recruiter Agent | HR Advisor | Source candidates, screen CVs |
| TS-H02 | Culture Assessor | HR Advisor | Team dynamics, fit analysis |
| TS-H03 | Performance Analyst | HR Advisor | OKR tracking, feedback synthesis |

### Product Cluster (3)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-P01 | UX Researcher | Product Manager | User interviews, journey mapping |
| TS-P02 | Feature Prioritizer | Product Manager | RICE scoring, backlog ranking |
| TS-P03 | User Feedback Analyst | Product Manager | Review mining, sentiment analysis |

### Industry Knowledge Cluster (4)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-I01 | HVAC Knowledge Base | Industry Expert HVAC | Technical specs, regulations |
| TS-I02 | Plumbing Knowledge Base | Industry Expert Plumbing | Certifications, standards |
| TS-I03 | Electrical Knowledge Base | Industry Expert HVAC | Related trades knowledge |
| TS-I04 | Solar/Green Energy Expert | Industry Experts | Sustainability, incentives |

### Technical Execution Cluster (5)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-T01 | Code Generator | CTO Specialists | Boilerplate, scaffolding |
| TS-T02 | Test Writer | QA Lead | Unit/integration test generation |
| TS-T03 | Documentation Writer | SOP Writer | API docs, README generation |
| TS-T04 | Migration Specialist | Database Expert | Schema migrations, data moves |
| TS-T05 | Performance Optimizer | Benchmark Runner | Profiling, optimization recs |

### Content Creation Cluster (5)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-C01 | Hook Writer | Copywriter | Headlines, first lines |
| TS-C02 | Visual Designer | Brand Strategist | Image prompts, layouts |
| TS-C03 | Video Script Writer | Content Expert | Script structure, CTAs |
| TS-C04 | Email Copywriter | Copywriter | Sequences, subject lines |
| TS-C05 | Landing Page Specialist | Growth Hacker | Page structure, conversion |

### Data Operations Cluster (4)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-D01 | Dashboard Builder | BI Analyst | Metric visualization |
| TS-D02 | Alert Designer | Metrics Designer | Threshold definitions |
| TS-D03 | Report Automator | Report Generator | Scheduled report generation |
| TS-D04 | Data Quality Monitor | Data Engineer | Validation rules, anomalies |

### Finance Operations Cluster (4)

| ID | Agent | Parent | Function |
|----|-------|--------|----------|
| TS-F01 | Invoice Processor | Budget Analyst | Invoice parsing, categorization |
| TS-F02 | Expense Tracker | Cash Flow Manager | Spend categorization |
| TS-F03 | Forecast Modeler | Investment Analyst | Scenario projections |
| TS-F04 | Pricing Calculator | Pricing Strategist | Quote generation, discounts |

**Level 5 Total: 31 agents → Running total: 100 agents**

---

## Complete Hierarchy Visualization

```
                              ┌─────────────────────┐
                              │    CEO WALKER       │
                              │   (Orchestrator)    │
                              └──────────┬──────────┘
                                         │
        ┌────────────┬───────────┬───────┴───────┬───────────┬────────────┐
        │            │           │               │           │            │
   ┌────▼────┐ ┌─────▼─────┐ ┌───▼───┐ ┌────────▼────────┐ ┌▼─────┐ ┌────▼────┐
   │   CFO   │ │    CTO    │ │  COO  │ │  Head of Data   │ │ Mkt  │ │CEO Staff│
   │ Finance │ │ Technology│ │  Ops  │ │    Analytics    │ │Sales │ │Strategic│
   └────┬────┘ └─────┬─────┘ └───┬───┘ └────────┬────────┘ └──┬───┘ └────┬────┘
        │            │           │               │             │          │
   L2: 3 specs  L2: 3 specs L2: 3 specs    L2: 3 specs   L2: 3 specs L2: 3 specs
        │            │           │               │             │          │
   L3: workers  L3: workers L3: workers    L3: workers   L3: workers L3: workers
        │            │           │               │             │          │
   L4: 4 experts L4: 4 experts L4: 4 experts L4: 4 experts L4: 4 experts L4: 6 experts
        │            │           │               │             │          │
   L5: 4 tasks  L5: 5 tasks L5: 3 tasks    L5: 4 tasks   L5: 5 tasks L5: 10 tasks
```

---

## Voting Weight Matrix

| Level | Base Weight | Domain Multiplier | Example |
|-------|-------------|-------------------|---------|
| L1 C-Suite | 1.0 | 1.5-2.0x on domain | CFO = 2.0x on financial |
| L2 Specialists | 0.8 | Inherits parent domain | Financial Analyst = 1.6x financial |
| L3 Task Workers | 0.5 | None | Data Collector = 0.5x |
| L4 Domain Experts | 0.6 | 1.2x on narrow domain | Pricing Strategist = 0.72x pricing |
| L5 Task Specialists | 0.4 | None | Hook Writer = 0.4x |

### Vote Aggregation Flow

```
L5 Task Specialists → Average → L4 Domain Expert score modifier
L4 Domain Experts → Weighted average → L2 Specialist score modifier
L3 Task Workers → Average → L2 Specialist validation
L2 Specialists → Weighted average → L1 C-Suite score
L1 C-Suite → Domain-weighted vote → Final recommendation
```

---

## Agent Spawning Rules

### Level-Based Spawning

| Decision Level | Agents Spawned | Token Budget |
|----------------|----------------|--------------|
| 0 (Instant) | CEO only | 5K |
| 1 (Quick) | 6 C-suite | 15K |
| 2 (Standard) | + 12 key specialists | 40K |
| 3 (Strategic) | + 18 all specialists | 80K |
| 4 (Critical) | + 19 task workers (43 total) | 150K |
| **5 (Full Swarm)** | **+ 57 new agents (100 total)** | **300K** |

### Dynamic Spawning Triggers

```python
def determine_spawn_level(topic: str, context: dict) -> int:
    """Auto-detect appropriate agent level."""

    # Financial keywords → spawn CFO cluster
    if any(kw in topic.lower() for kw in ["budget", "roi", "cost", "price"]):
        spawn_cluster("CFO", depth=3)  # CFO + specialists + experts + tasks

    # Technical keywords → spawn CTO cluster
    if any(kw in topic.lower() for kw in ["api", "database", "deploy", "infra"]):
        spawn_cluster("CTO", depth=3)

    # Industry keywords → spawn Industry experts
    if any(kw in topic.lower() for kw in ["hvac", "plumbing", "installer", "trades"]):
        spawn_agents(["DE-C04", "DE-C05", "TS-I01", "TS-I02", "TS-I03", "TS-I04"])

    # Legal keywords → spawn Legal cluster
    if any(kw in topic.lower() for kw in ["contract", "gdpr", "compliance", "legal"]):
        spawn_agents(["DE-C01", "TS-L01", "TS-L02", "TS-L03"])

    return calculated_level
```

---

## Implementation Phases

### Phase 1: Foundation (COMPLETE ✅)
- 6 C-suite agents
- 18 specialists
- 19 task workers
- **Total: 43 agents**

### Phase 2: Domain Experts (5h)

| Task | Est | Dependencies |
|------|-----|--------------|
| Define 26 expert prompts | 2h | None |
| Add to agent_registry.py | 1h | Prompts |
| Implement domain weight inheritance | 1h | Registry |
| Unit tests | 1h | Implementation |

### Phase 3: Task Specialists (5h)

| Task | Est | Dependencies |
|------|-----|--------------|
| Define 31 specialist prompts | 2h | None |
| Add to agent_registry.py | 1h | Prompts |
| Implement aggregation logic | 1h | Registry |
| Integration tests | 1h | Implementation |

### Phase 4: Dynamic Spawning (3h)

| Task | Est | Dependencies |
|------|-----|--------------|
| Keyword-based spawning | 1h | Phase 2-3 |
| Token budget enforcement | 1h | Spawning |
| Level 5 board meeting tests | 1h | All above |

**Total: 13h for complete 100-agent swarm**

---

## Prompt Templates (Examples)

### Level 4: Domain Expert

```python
_PRICING_STRATEGIST_PROMPT = """You are a Pricing Strategist supporting the CFO.

DOMAIN: Value-based pricing, Hormozi pricing models, competitor analysis.

FOCUS:
- Analyze pricing power and willingness-to-pay
- Identify value metrics (per seat, per usage, per outcome)
- Recommend pricing tiers and packaging
- Calculate price elasticity estimates

OUTPUT FORMAT:
{
  "pricing_recommendation": "string",
  "value_metric": "string",
  "suggested_tiers": [{"name": "X", "price": N, "features": [...]}],
  "competitor_comparison": {...},
  "confidence": 0.0-1.0
}

CONSTRAINTS:
- Always justify with data or industry benchmarks
- Consider Profit First implications
- Flag any cannibalization risks
"""
```

### Level 5: Task Specialist

```python
_HOOK_WRITER_PROMPT = """You are a Hook Writer supporting the Copywriter.

MISSION: Generate compelling first lines that stop the scroll.

FRAMEWORKS:
- Number + Benefit: "7 ways to [benefit] without [pain]"
- Contrarian: "[Common belief] is wrong. Here's why."
- Story: "Last week I [dramatic event]..."
- Question: "What if you could [dream outcome]?"

OUTPUT FORMAT:
{
  "hooks": [
    {"text": "string", "framework": "string", "expected_ctr": 0.0-1.0}
  ],
  "top_recommendation": "string",
  "reasoning": "string"
}

CONSTRAINTS:
- Max 150 characters per hook
- No clickbait that doesn't deliver
- Match brand voice (Everyman+Caregiver: simpel, betrouwbaar, gegarandeerd)
"""
```

---

## Cost Estimates

| Level | Agents | Input Tokens | Output Tokens | Est. Cost |
|-------|--------|--------------|---------------|-----------|
| 1 | 6 | 15K | 6K | $0.50 |
| 2 | 18 | 40K | 15K | $1.50 |
| 3 | 24 | 80K | 30K | $3.00 |
| 4 | 43 | 150K | 60K | $5.00 |
| **5** | **100** | **300K** | **120K** | **$10.00** |

**Break-even:** If Level 5 analysis prevents 1 bad decision worth €500+, it pays for itself 50x.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Coverage | 100% of decision domains | Checklist audit |
| Accuracy | >75% prediction accuracy | T+30 reviews |
| Speed | <25 min for Level 5 | Langfuse traces |
| Cost | <$12 per Level 5 meeting | Token tracking |
| Utilization | >50% agents contribute | Vote participation |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `agent-orchestration.md` | Current 43-agent patterns |
| `EPIC-board-meeting-swarm-expansion.md` | Phase 2-3 implementation |
| `PRD-board-meeting-full-swarm-expansion.md` | Technical PRD |
| `full-planning-cycle.md` | Command that uses swarm |

---

*Created: 2026-01-30 | Status: DESIGN*
*"100 specialized minds, one unified decision."*
