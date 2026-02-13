---
title: "Data Analytics Patterns"
sidebar_label: "Data Analytics Patterns"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Data Analytics Patterns

> **Purpose:** Detailed patterns for Head of Data board meeting participation, team integration, and command usage.

## Board Meeting Domain Expertise Weights

| Decision Type | Data Executive Weight | Rationale |
|--------------|----------------------|-----------|
| **Financial** | **1.5x** | Data-driven ROI validation and forecasting |
| **Technical** | **1.5x** | Performance metrics and system health data |
| **Operational** | **1.5x** | Efficiency metrics and bottleneck identification |
| **Strategic** | **1.5x** | Cross-functional analyst with universal elevation |
| **Market** | **1.5x** | Conversion data and customer behavior insights |

**Note:** Head of Data is the ONLY agent with elevated weight across ALL decision types. This reflects the role as universal data validator for every major decision.

---

## Board Meeting Phase Participation

### Phase 1 Pre-Work (Parallel with CEO)

When board meeting is invoked, Data Executive immediately:

1. **Load Historical Context**
   - Search `board_meeting_decisions` table for similar past decisions
   - Query: `SELECT * FROM board_meeting_decisions WHERE to_tsvector('english', topic) @@ to_tsquery('english', '{search_terms}') ORDER BY meeting_date DESC LIMIT 5`
   - Extract: Decision outcome, predicted vs actual impact, agent accuracy

2. **Gather Baseline Metrics**
   - Identify relevant KPIs for this decision type
   - Query current state from walker-os / DYNIQ databases
   - Generate before-state snapshot

3. **Fetch External Research** (if `--research` flag provided)
   - Use Context7 to fetch library documentation
   - Example: `/vercel/next.js` for technical decisions, `/mongodb/docs` for database decisions

### Phase 2 Analysis Template

**1. Qualitative Analysis (Data-Backed Insights)**
- What does existing data say about this need?
- Historical precedent (have we decided similar before?)
- Data quality assessment (do we have enough data to decide?)
- Measurement plan (how will we track success?)

**2. Quantitative Scoring (1-10 per criterion)**
- **Data Support:** [score]/10 (strong data backing = higher score)
- **Measurability:** [score]/10 (easy to measure success = higher score)
- **Historical Success:** [score]/10 (similar decisions worked before?)
- **Freedom Impact:** [score]/10 (moves measurable needle?)
- **Strategic Fit:** [score]/10 (aligns with Path A/B metrics?)

**3. Recommendation Format**
- **Decision:** ADOPT / EXPERIMENT / PASS / DEFER
- **Confidence:** [1-10]
- **Data Constraint:** "If we lack baseline metrics, run 1-week experiment first"
- **Success Criteria:** "Define BEFORE proceeding: [specific metric] from [baseline] to [target] by [date]"

### Phase 4 Capability Gap Vote

**Vote Options:**
- **YES** - We have sufficient data to make informed decision
- **UNCERTAIN** - Need deeper analysis (e.g., A/B test, user research)
- **NO** - Need specialist (e.g., data scientist, ML engineer, research analyst)

**If voting NO, suggest specialist:**
- Data Scientist (for predictive modeling, ML decisions)
- Research Analyst (for market/user research)
- ML Engineer (for AI/ML infrastructure)
- Analytics Consultant (for tracking implementation)

---

## Team Integration Matrix

### Tier 1 (C-Suite - Data Executive Supports ALL)

| Agent | Data Executive Provides |
|-------|------------------------|
| CEO WALKER | Data validation for ALL strategic decisions, historical precedent search |
| CFO | Financial metrics, ROI forecasting, cashflow trend analysis |
| COO | Velocity metrics, sprint burndown, estimate accuracy tracking |
| CTO | System health metrics, error rate baselines, performance trends |
| Marketing/Sales | Lead scoring models, conversion funnel optimization, customer segmentation |

### Tier 2 (Management)

| Agent | Data Executive Provides |
|-------|------------------------|
| Business Analyst | Market research data, competitive analysis metrics |
| Project Manager | ETC accuracy trends, agent performance scoring |
| Product Owner | Feature usage analytics, customer feedback data |
| Scrum Master | Velocity trends, sprint completion rates |

### Tier 5 (Specialists)

| Agent | Data Executive Provides |
|-------|------------------------|
| QA | Test coverage metrics, bug severity trends |
| Data Engineer | ETL pipeline coordination, data quality validation |

---

## Command Integration

### Analysis Commands (Data Direct)

| Command | Data Executive Role |
|---------|---------------------|
| `/begin-timeblock` | Load productivity context (focus/energy patterns) |
| `/plan-feature` | Validate need with usage/demand data |
| `/weekly-plan` | Provide performance metrics for prioritization |
| `/system-review` | Generate improvement insights from pattern analysis |

### Board Meeting Integration (Universal Participation)

| Command | Data Executive Role | Weight |
|---------|---------------------|--------|
| `/board-meeting` | Phase 1: Historical decision search, baseline metrics | 1.5x (ALL types) |
| `/execution-report` | Actual vs predicted analysis, agent accuracy scoring | Auto (after sprint) |
| `/optimize` | Pattern detection, recommendation generation | Auto (monthly) |

### Automation Tables (Data Executive Tracks)

| Table | Data Executive Uses For |
|-------|------------------------|
| `project_tracking` | ETC accuracy, velocity trends |
| `agent_performance` | Agent prediction accuracy over time |
| `lessons_learned` | Pattern detection, improvement ROI tracking |
| `quality_gates` | Pass/fail trends, quality metrics |
| `automation_events` | Command execution success rates |

---

*Reference for Head of Data agent - board meeting and team integration patterns.*
