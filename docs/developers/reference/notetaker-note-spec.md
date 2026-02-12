---
title: "Meeting Note Output Specification"
sidebar_label: "Meeting Note Output Specification"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Meeting Note Output Specification

Detailed output format for the AI Notetaker meeting intelligence system.
Parent PRD: `features/PRD-ai-notetaker-meeting-intelligence.md`

---

## 6 Structured Outputs Per Meeting

Every processed meeting produces these 6 outputs:

| # | Output | Content | Senior PM Differentiator |
|---|--------|---------|--------------------------|
| 1 | Executive Summary | 3-5 bullets, key outcomes, metrics | CFO-readable, 30-second brief |
| 2 | Decisions Log | Decision + rationale + alternatives rejected + reversibility | Tracks WHY, not just WHAT |
| 3 | Action Items | Owner + deadline + dependencies + risk flags + blockers | 4-element actions with cross-meeting tracking |
| 4 | Risks & Issues | Severity + escalation trigger + mitigation + owner | Auto-maintained risk register |
| 5 | Intelligence Notes | Political signals, tone shifts, hedging, silence-as-data | $300k/year Chief of Staff insights |
| 6 | Cross-Meeting Links | Related meetings, recurring topics, promise tracking | "Discussed Jan 15, here's the outcome" |

---

## Action Item Format

**Industry standard:** "John will check the timeline"

**Our format:**

```
ACT-047 | Validate Q3 timeline against regulatory submission dates
Owner: John van Dijk (Regulatory)
Due: 2026-02-18 (inferred: "by end of next week")
Dependencies: Blocks ACT-048 (Budget approval)
Risk: HIGH - 3rd mention without progress (stalled since Jan 28)
Blocker: Awaiting FDA feedback (external)
Source: "[exact quote from transcript]"
```

**Formula:** `[VERB] [deliverable] by [date/milestone] -- [owner] (blocker: [if any])`

---

## Decision Format

```
DECISION: Approved Q3 budget at 2.1M (14% above initial ask)
Rationale: Accelerated timeline requires parallel workstreams
Alternatives rejected: (1) Phase approach at 1.8M, (2) Defer to Q4
Reversibility: LOW - contracts signed upon approval
Decided by: Sarah (VP Finance), endorsed by steering committee
Impact: Unblocks ACT-041, ACT-042, ACT-043
Source: "[exact quote]"
```

---

## Risk Format

```
RISK: Timeline compression from 18 to 14 weeks
Impact: Regulatory submission may slip to Q4 (revenue impact ~2M)
Likelihood: HIGH - Sarah hedged ("we'll try") - non-committal
Severity: HIGH
Mitigation: None proposed (escalation recommended)
Owner: Program Manager
Escalation trigger: If no mitigation plan by Feb 21
Source: "[exact quote showing hedging language]"
```

---

## Writing Quality Standards

Target: "$300k/year Chief of Staff" level writing.

| Bad (Industry Standard) | Good (Our System) |
|------------------------|-------------------|
| "Budget was discussed" | "Budget: Q3 allocation approved at 2.1M (14% above ask). Rationale: parallel workstreams. CFO flagged cash flow risk if Q2 misses >10%." |
| "John will follow up" | "ACT-047: John to validate Q3 timeline vs regulatory dates by Feb 18. Blocks budget approval. Risk: 3rd mention without progress." |
| "Some timeline concerns" | "RISK: Timeline compression 18->14 weeks. Sarah hedged ('we'll try'). Impact: Q4 slip. Mitigation: none proposed." |
| "Meeting went well" | "Effectiveness: 7/10. 3 decisions made, 5 actions assigned. Duration: 48 min (under 60 target). Recurring topic: resource allocation (4th meeting)." |

### Intelligence Signals to Capture

- **Tone shifts**: "Enthusiastic at start, defensive when budget discussed"
- **Hedging language**: "we'll try", "hopefully", "if all goes well" = low confidence
- **Non-committal responses**: Track who avoids giving firm dates
- **Silence as data**: "Sarah said nothing when asked about Q3 readiness"
- **Political signals**: Disagreements, alliance patterns, who defers to whom

---

## Per-Meeting-Type Extraction

### J&J Corporate Template

| Extract | Example | Why |
|---------|---------|-----|
| Compliance flags | FDA/EMA submission dates, regulatory mentions | Pharma-specific risk tracking |
| Stakeholder commitments | "John committed to deliver by..." | Formal accountability |
| Budget references | "2.1M approved", "15% over budget" | Financial tracking |
| Timeline milestones | "Phase 3 start date: March 15" | Critical path monitoring |
| Escalation items | "Needs VP approval", "blocked by legal" | Remove blockers fast |

### Snaprev Agile Template

| Extract | Example | Why |
|---------|---------|-----|
| Sprint goals | "Complete user auth by end of sprint" | Velocity tracking |
| Blockers | "API not ready, blocks frontend" | Blocker resolution |
| Story points | "Estimated at 8 points" | Sprint planning |
| Client feedback | "Client wants dark mode" | Requirement capture |
| Tech debt mentions | "We should refactor auth later" | Debt register |

### Personal/Path B Template

| Extract | Example | Why |
|---------|---------|-----|
| Revenue mentions | "€500/month from new client" | Path B tracking |
| Freedom Filter items | "Should I do this myself?" | Decision alignment |
| Delegation candidates | "VA could handle this" | WHO not HOW |
| BolScout updates | "Adam confirmed equity split" | Path A tracking |

---

## Cross-Meeting Intelligence (Sprint 3+)

### Algorithms (Nightly Cron)

| Algorithm | What It Does | Output |
|-----------|-------------|--------|
| **Recurring Topic Detection** | Topics appearing 3+ meetings → flag | "Resource allocation discussed in 4 of last 5 meetings" |
| **Promise Tracking** | Who promised what, kept/broken/renegotiated | Reliability score per stakeholder |
| **Stalled Action Detection** | Action mentioned 3+ meetings without progress | Auto-escalate to blocker status |
| **Dependency Chain Tracker** | networkx DAG of action dependencies | "ACT-048 blocked by ACT-047 blocked by FDA" |
| **Stakeholder Sentiment** | Per-person sentiment trajectory over time | "John's sentiment declining over 3 meetings" |
| **Scope Creep Detection** | Feature count increasing without timeline change | "Scope increased 40% but deadline unchanged" |

### Stakeholder Reliability Scoring

```
reliability_score = (on_time_delivered * 0.6 + total_delivered/promised * 0.4) * 100
```

Categories: Reliable (>80), At Risk (60-80), Unreliable (<60)

### Pre-Meeting Briefing (Telegram, 15 min before)

Auto-generated from last meeting with same participants:
- Outstanding actions from last meeting (by owner)
- Unresolved topics
- Suggested agenda items
- Stakeholder reliability flags

---

## Auto-Generated Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| **Weekly Status** | Friday 5 PM (auto) | All decisions, open actions by owner, blockers, risks, effectiveness scores |
| **Monthly Executive** | 1st of month (auto) | Topic trends week-by-week, stakeholder reliability, SOP candidates |
| **Follow-Up Tracker** | Live dashboard | Escalation: 3d remind -> 7d flag -> 14d escalate -> 21d exec alert |
| **Risk Register** | Auto-maintained | Risk evolution timeline, pattern alerts, trend detection |

### Follow-Up Escalation Ladder

| Days Past Due | Action | Channel |
|---------------|--------|---------|
| 3 days | Reminder to Walker | Telegram |
| 7 days | Flag as overdue | Dashboard + Telegram |
| 14 days | Escalate to manager | Dashboard highlight |
| 21 days | Mark as stalled | Weekly report red flag |

---

## Auto-Redaction Pipeline

Before storing any transcript/note:

| Method | What It Catches | Example |
|--------|----------------|---------|
| **Regex patterns** | Passwords, API keys, credit cards, IBANs | `sk-proj-...`, `BE71 0000 0000 0000` |
| **Presidio NER** | Names (optional), emails, phone numbers | `walker@dyniq.ai` -> `[EMAIL]` |
| **Never-appear list** | Clinical data, patient info, proprietary formulas | Hard-coded exclusions per meeting type |

### Redaction Levels

| Level | When | What's Redacted |
|-------|------|----------------|
| **Auto** | All meetings | Credentials, financial PII, health data |
| **Manual review** | J&J meetings flagged "confidential" | Full PII review before storage |
| **Full anonymize** | Export/share scenarios | All names -> role-based labels |

---

## Language Handling

| Scenario | Behavior |
|----------|----------|
| Meeting in English | Notes in English |
| Meeting in Dutch | Notes in English (translated) |
| Mixed Dutch/English | Notes in English, preserve Dutch terms where no clean translation |
| Dutch quotes | Translate with context: *"Definitieve goedkeuring (final approval) was given"* |

---

## Meeting Effectiveness Scoring

```
effectiveness = (decisions_made * 3 + actions_assigned * 2 + (60 - duration_min)) / 10
```

| Score | Rating | Auto-Recommendation |
|-------|--------|---------------------|
| 8-10 | Efficient | None |
| 5-7 | Acceptable | Suggest tighter agenda |
| 1-4 | Ineffective | "3 consecutive low scores - suggest splitting meeting" |

---

*Specialist agents: COO (template), Head of Data (intelligence), Product Owner (UI), Content Director (quality), Business Analyst (reports), Security (redaction)*
*Created: 2026-02-11 | Parent PRD: PRD-notetaker*
