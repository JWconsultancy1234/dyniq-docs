---
title: "Walker-OS Unified System Architecture"
sidebar_label: "Walker-OS Unified System Architecture"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Walker-OS Unified System Architecture

## Overview

This document defines the unified system architecture across all DYNIQ repos for AI-assisted development with self-improvement loops.

## The Four Repos

```
walker-os/        → Personal OS, timeblock system, freedom tracking (CENTRAL)
dyniq-app/        → Landing page, docs, PIV loop commands (TEMPLATE)
dyniq-ai-agents/  → Ruben voice AI (LiveKit)
dyniq-n8n/        → Automation workflows
dyniq-crm/        → NocoDB CRM (legacy)
bolscout-app/     → BolScout product (Path A)
```

## System Layers

### Layer 1: CLAUDE.md (Per-Repo)

Short (<200 lines), uses @imports for details.

```markdown
# CLAUDE.md (template for each repo)
```

### Layer 2: Reference Docs (On-Demand)

`*.md` - Loaded when working on specific areas.

| Doc | Purpose |
|-----|---------|
| `core-rules.md` | Universal rules (KISS, YAGNI, file limits) |
| `freedom-system.md` | Walker-OS specific (Profit First, Quadrants) |
| `voice-ai.md` | Ruben architecture |
| `n8n-workflows.md` | Workflow patterns |

### Layer 3: Commands (Slash Commands)

`.claude/commands/**/*.md` - Executable workflows.

```
commands/
├── timeblock/
│   ├── begin.md       # Start block with context
│   └── end.md         # End block with A-Z summary
├── piv-loop/
│   ├── prime.md       # Load project context
│   ├── plan-feature.md
│   ├── execute.md
│   ├── validate.md
│   └── commit.md
├── create-prd.md      # PRD with Freedom Filter
├── validation/
│   ├── code-review.md
│   ├── execution-report.md
│   └── system-review.md     # Self-improvement
└── daily/
    ├── plan.md        # Generate daily plan
    └── weekly-plan.md # Generate weekly plan
```

### Layer 4: Agents (Specialized Personas)

`.claude/agents/*.md` - 26 local agents with YAML frontmatter (Agent Teams).

**Architecture:**
- Local agents (26): YAML frontmatter → auto-delegation, private memory, web search
- Registry agents (81): `agent_registry.py` in dyniq-ai-agents → board meeting swarm
- Sync: `scripts/sync-registry-to-local.py` keeps local and registry aligned
- Memory: `.claude/agent-memory/{name}/MEMORY.md` (project-scoped, 200-line cap)

### Layer 5: Execution Artifacts

`.agents/` - Crash recovery + learning data.

```
.agents/
├── backlog/                    # All work items
│   ├── PRIORITY-MASTER-LIST.md # Master index
│   ├── epics/                  # Large initiatives (2-6 months)
│   ├── features/               # PRDs, sprint-sized
│   ├── stories/                # User stories (optional)
│   └── done/                   # Completed items
├── docs/                       # Business docs, architecture
├── sops/                       # Delegation SOPs
└── logs/                       # History & reports
    ├── daily-plan/
    ├── weekly-plan/
    ├── execution-reports/
    └── system-reviews/
```

## Self-Improvement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  /create-prd → /plan-feature → /execute → /execution-report │
│       │             │              │              │         │
│       ▼             ▼              ▼              ▼         │
│    PRD.md       Plan.md     Implementation   Report.md      │
│   (Freedom       (Tasks)        (Code)        (Review)      │
│    Filter)           │              │              │        │
│       └──────────────┴──────────────┴──────────────┘        │
│                      │                                      │
│                      ▼                                      │
│              /system-review                                 │
│                      │                                      │
│                      ▼                                      │
│          Update CLAUDE.md / Commands                        │
│                      │                                      │
│                      ▼                                      │
│              Better Next Cycle                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Timeblock System Integration

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  /prime → /begin-timeblock → [WORK] → /end-timeblock        │
│     │            │                          │               │
│     │            │                          ▼               │
│     │            │              Auto-scan ALL repos         │
│     │            │              A-Z summary                 │
│     │            │              Update daily-plan.md        │
│     │            │                          │               │
│     │            ◄──────────────────────────┘               │
│     │            │                                          │
│     │      Load carry-over                                  │
│     │      Load commands                                    │
│     │      Load uncommitted work                            │
│     │                                                       │
│     └── Load project context                                │
│         Load decision filter                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Single Source of Truth

**Daily Plan File:**
```
walker-os/.agents/logs/daily-plan/daily-plan-YYYY-MM-DD.md
```

Contains:
- Today's priorities
- Block-by-block tasks
- Session summaries (A-Z format)
- Carry-over tasks
- Commands for next session
- Learnings

**Read by:** /begin-timeblock
**Written by:** /end-timeblock, /daily-plan

## Cross-Repo Commands

Commands that work across all repos should:
1. Reference walker-os daily plan as source of truth
2. Auto-scan all DYNIQ repos for git activity
3. Use Context7 for external docs (Twilio, n8n, etc.)

### Shared Repos List

```bash
DYNIQ_REPOS=(
  "/Users/walker/Desktop/Code/walker-os"
  "/Users/walker/Desktop/Code/dyniq-app"
  "/Users/walker/Desktop/Code/dyniq-ai-agents"
  "/Users/walker/Desktop/Code/dyniq-n8n"
  "/Users/walker/Desktop/Code/dyniq-crm"
  "/Users/walker/Desktop/Code/bolscout-app"
)
```

## Context7 Integration

Use Context7 for external documentation instead of embedding:

```markdown
When working with [technology], use Context7 to fetch current docs:
- Twilio API → /twilio/twilio-node
- n8n → /n8n/n8n-docs
- LiveKit → /livekit/livekit
- Supabase → /supabase/supabase
```

**Benefits:**
- Always up-to-date
- Saves tokens in CLAUDE.md
- Better accuracy

## File Limits (Universal)

| Type | Max Lines |
|------|-----------|
| CLAUDE.md | 200 |
| Any file | 500 |
| React component | 200 |
| Function | 50 |
| Reference doc | 300 |

## The Freedom Filter (Decision Layer)

Every action should pass:

1. **€72/hr test** - Is this worth my time?
2. **Who not How** - Can someone else do this?
3. **Path alignment** - Does this serve Path A (BolScout) or B (€10k/mo)?
4. **Freedom impact** - Does this move the needle?

Outcomes: `DO_NOW`, `DELEGATE`, `SCHEDULE`, `DEPRIORITIZE`, `CUT`

---

*This architecture enables self-improving AI-assisted development across all DYNIQ repos.*
