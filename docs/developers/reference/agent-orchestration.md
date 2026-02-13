---
title: "Agent Orchestration Architecture"
sidebar_label: "Agent Orchestration Architecture"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Agent Orchestration Architecture

> **Principle:** Data drives all decisions. Parallel execution maximizes time buyback.

## The C-Suite Hierarchy

```
                    CEO WALKER (Master Orchestrator)
                         │
    ┌────────┬───────────┼───────────┬────────────┐
    CFO      COO         CTO        HEAD OF DATA   MARKETING
  Finance  Operations  Technology    & AI          Revenue
              │           │
           DEVELOPER   REVIEWER
```

## Agent Files Reference

| Agent | File | Scope |
|-------|------|-------|
| CEO WALKER | `ceo-walker.md` | Strategic orchestration, buyback filter |
| CFO | `exec-finance.md` | Profit First, cashflow, Zakat, net worth |
| COO | `exec-operations.md` | Planning, product, scrum, project, BA, SOPs |
| CTO | `exec-technology.md` | Architecture, DevOps, security, technical docs |
| Head of Data | `exec-data.md` | Analytics, ML, data validation |
| Developer | `developer.md` | Implementation |
| Reviewer (QA) | `reviewer.md` | Code review, testing |
| Marketing/Sales | `marketing-sales.md` | Revenue generation |
| Freedom Filter | `freedom-filter.md` | Decision validation (standalone) |

### Knowledge Management Team (SAC Phase 2)

| Role | Question Answered | Audience | Output |
|------|-------------------|----------|--------|
| Technical Writer | "How does this work?" | Developers | API docs, architecture |
| SOP Writer | "How do I do this?" | VAs, contractors, AI | Playbooks, checklists |

### Configuration Pattern

All agent config in `agent_registry.py`: AGENT_REGISTRY, AGENT_COUNTS, LEVEL_CONFIG, get_level_* functions.

**Prompt Pattern:** <50 lines inline, >50 lines separate file with @import.

**Security:** `security.py` (secret masking), `rate_limiter.py` (per-level limits).

### Registry Architecture (SAC-016, updated 2026-02-06)

| Registry | Count | Purpose | Access |
|----------|-------|---------|--------|
| `AGENT_REGISTRY` | 82 | Static agents by level | `get_agents_for_level()` |
| `TASK_FORCE_REGISTRY` | 16 | Dynamic on-demand | `task_spawner.py` |

```
AGENT_REGISTRY (82 agents, post-Worker sunset)
├── C-Suite (9) ├── VP (16) ├── Director (24)
├── Industry Advisors (15) └── Specialists (18)

TASK_FORCE_REGISTRY (16) ← Spawned dynamically
```

**Worker Sunset (2026-02-06):** 19 Workers removed. Capabilities covered by Task Force dynamic spawning.

---

## Swarm Hierarchy (SAC-002, updated 2026-02-06)

| Tier | Role | Count | Example Agents |
|------|------|-------|----------------|
| 1 | C-Suite | 9 | CEO, CFO, CTO, COO, CDO, CMO, CHRO, GC, Evaluator |
| 2 | VPs | 16 | VP Finance Controller, VP Engineering Platform |
| 3 | Directors | 24 | Director Infrastructure, Director FP&A |
| 4 | Industry Advisors | 15 | HVAC Advisor, SaaS Advisor |
| 5 | Specialists | 18 | Financial Analyst, Security Expert |
| **Total** | | **82** | Workers sunset → Task Force |

| Term | Meaning |
|------|---------|
| Kimi Swarm | 8-82 agents via LangGraph + Kimi K2.5 (runtime) |
| Task agents | Claude Code exploration agents (planning) |

---

## Data-First Decision Making

**EVERY decision must pass the Data Executive lens.** Head of Data is always consulted, never bypassed.

**Board meeting internals (calibration, spawning, Bayesian tracking, specialist hierarchy):**

---

## Parallel Execution Rules

| Situation | Agents to Spawn |
|-----------|-----------------|
| New feature | COO + CTO + Head of Data |
| Bug report | Developer + Reviewer + Head of Data |
| Strategic decision | CEO + CFO + CTO + COO + Data + Marketing (6) |
| Research task | 5-10 Explore agents |

**Levels:** 0=single agent, 1=2-3 agents, 2=5-7 agents (default), 3=10+ agents.

### C-Suite Board Meeting Timeout Patterns (2026-02-06)

| Agent | Typical Duration | Timeout Risk | Notes |
|-------|------------------|--------------|-------|
| CFO | 30-60s | Low | Financial analysis fast |
| CTO | 30-60s | Low | Technical decisions fast |
| Head of Data | 30-60s | Low | Metrics framework fast |
| Creative Director | 45-90s | Low-Medium | Design system specs can be large |
| Product Owner | 60-120s | Medium | Large decomposition may timeout |
| Tech Architect | 60-120s | Medium | ADR generation is detail-heavy |
| COO | 45-90s | Medium | PM analysis + delegation can timeout |
| Marketing | 45-90s | Medium | GTM strategy + content calendar can timeout |

**Pattern:** In 8-agent board meetings, 6/8 is sufficient for unanimous decision. COO and Marketing most likely to timeout on complex topics. Proceed with available agents rather than waiting.

---

## Agent Teams Integration (2026-02-06)

All 26 walker-os agents have YAML frontmatter for Claude Code Agent Teams:

```yaml
---
name: cto
description: Technical architecture, development, security, and DevOps decisions.
tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, WebFetch
model: sonnet
memory: project
---
```

**Key features:** Auto-delegation, private memory (`.claude/agent-memory/{name}/MEMORY.md`), web search, domain constraints, structured output.

### Memory Architecture

```
.claude/agent-memory/
├── cto/MEMORY.md     ├── cfo/MEMORY.md     ├── coo/MEMORY.md
├── data/MEMORY.md    ├── marketing/MEMORY.md ├── rd-research/MEMORY.md
├── developer/MEMORY.md ├── reviewer/MEMORY.md └── ... (26 total)
```

**Rules:** Summarize at 150 lines, hard cap at 200 lines. Project-scoped isolation.

### Sync Pipeline (dyniq-ai-agents → walker-os)

| Script | Purpose |
|--------|---------|
| `scripts/export-agents-to-claude-code.py` | Generate .md from registry |
| `scripts/sync-registry-to-local.py` | Detect drift, update local files |

---

## Agent Protocols

**HITL matrix, spawn protocol, blocker resolution, proactive work, data validation:**

---

## Command → Agent Mapping

| Command | Primary | Supporting |
|---------|---------|------------|
| `/begin-timeblock` | CEO | COO, Data |
| `/plan-feature` | COO | CTO, Data |
| `/execute` | Developer | Reviewer |
| `/board-meeting` | CEO | Full C-suite (6) |
| `/system-review` | CEO | All agents |
| `/deploy` | CTO | Reviewer |

---

## Freedom Filter Integration

Every agent checks the Freedom Filter before work. See @.claude/agents/freedom-filter.md

**Hierarchy:** ELIMINATE > AUTOMATE > DELEGATE > PARALLEL > MANUAL

---

## Current Master EPIC

**EPIC-dyniq-autonomous-enterprise.md** (DAE-001) - €50K MRR by July 2026

---

> "Does this action buy back my time or build my freedom?"
> "What does the data say?"

---

*C-Suite orchestration for parallel, data-driven freedom building.*
