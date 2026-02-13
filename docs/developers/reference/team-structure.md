---
title: "Team Structure Quick Reference"
sidebar_label: "Team Structure Quick Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Team Structure Quick Reference

Agent dispatch guide for CEO WALKER orchestration.

---

## C-Suite Hierarchy

```
                    CEO WALKER
                        │
    ┌───────────┬───────┼───────┬───────────┐
    │           │       │       │           │
   CFO        COO      CTO   Data Head  Marketing
 Finance   Operations  Tech   Analytics  Sales
                │       │
            Developer Reviewer
```

---

## Agent Dispatch Matrix

| Task Type | Primary Agent | Supporting Agents |
|-----------|--------------|-------------------|
| New feature | COO | CTO, Data Head |
| Bug fix | Developer | Reviewer, Data Head |
| Weekly planning | COO | Data Head |
| Deployment | CTO | Reviewer |
| Financial decision | CFO | Data Head |
| Revenue generation | Marketing | Data Head |
| Architecture change | CTO | COO |
| Code review | Reviewer | Developer |
| Security audit | Reviewer | CTO |
| SOP creation | COO | - |

---

## Agent Files

| Agent | File | Primary Commands |
|-------|------|-----------------|
| CEO WALKER | `ceo-walker.md` | `/begin-timeblock`, `/end-timeblock` |
| CFO | `exec-finance.md` | Budget, allocations |
| COO | `exec-operations.md` | `/daily-plan`, `/create-prd`, `/write-sop` |
| CTO | `exec-technology.md` | `/deploy-*`, `/system-review` |
| Data Head | `exec-data.md` | Analytics, metrics |
| Developer | `developer.md` | `/execute`, `/commit` |
| Reviewer | `reviewer.md` | `/validate`, `/e2e` |
| Marketing | `marketing-sales.md` | `/proposal`, `/create-email` |

---

## Parallel Execution Patterns

### Level 1: 2-3 Agents

| Situation | Agents |
|-----------|--------|
| Simple feature | Developer + Reviewer |
| Quick analysis | COO + Data Head |
| Deployment | CTO + Reviewer |

### Level 2: 5-7 Agents

| Situation | Agents |
|-----------|--------|
| Complex feature | COO + CTO + Developer + Reviewer + Data Head |
| Strategic planning | CEO + CFO + COO + Data Head |
| Major release | CTO + Developer + Reviewer + Data Head + COO |

### Level 3: 10+ Agents

| Situation | Use |
|-----------|-----|
| Comprehensive research | Multiple Explore agents |
| Full system audit | All C-Suite + execution agents |

---

## Command → Agent Mapping

| Phase | Commands | Primary Agent |
|-------|----------|---------------|
| 1-timeblock | `begin`, `end` | CEO WALKER |
| 2-planning | `daily-plan`, `create-prd`, `explore` | COO |
| 3-piv-loop | `execute`, `validate`, `commit` | Developer |
| 4-release | `e2e`, `deploy-*`, `system-review` | CTO |
| dyniq | `proposal`, `create-email` | Marketing |
| maintenance | `optimize`, `cleanup` | COO |

---

## Human Approval Required

| Action | Risk | Agent |
|--------|------|-------|
| Create 3+ files | Medium | Any |
| Delete any file | High | Any |
| Git push | High | Developer |
| Production deploy | Critical | CTO |
| External API mutations | High | Developer |
| Database modifications | Critical | Developer |

---

## Data Head Consultation (Mandatory)

Every decision must include Data Head input:

| Decision Type | Data Check |
|--------------|------------|
| New feature | User need metrics |
| Prioritization | Measured impact |
| Bug fix | Frequency/severity |
| Architecture | Performance data |
| Deployment | Error rates/latency |

---

*Quick reference for agent orchestration.*
