---
title: "SOP: Agent Teams Usage & Management"
sidebar_label: "SOP: Agent Teams Usage & Management"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: Agent Teams Usage & Management

**Created:** 2026-02-06
**Owner:** Walker (CEO)
**Purpose:** How to use, manage, and extend Claude Code Agent Teams in walker-os

---

## Quick Start

Agent Teams are Claude Code teammates with YAML frontmatter in `.claude/agents/*.md`. They auto-activate based on task context.

### Natural Language Activation

| Say This | Agent Activates |
|----------|-----------------|
| "Review the architecture" | CTO |
| "Analyze costs" or "ROI?" | CFO |
| "Plan this feature" | COO |
| "What does the data say?" | Head of Data |
| "Write the implementation" | Developer |
| "Review this code" | Reviewer |
| "Create marketing content" | Marketing |
| "Research latest AI models" | R&D Research |
| "Check security" | Security |
| "Deploy this" | DevOps |

### Spawn a Team

```
"Create a team: CTO + CFO + Data analyze this decision"
→ 3 agents spawn in parallel, each provides domain analysis
```

**Sweet spot:** 3-7 agents per team. More agents = more tokens + latency.

---

## Common Team Compositions

| Task | Team | Why |
|------|------|-----|
| Architecture review | CTO + Technical Architect + Security | Full technical coverage |
| Feature planning | COO + CTO + Data | Requirements + feasibility + metrics |
| Strategic decision | CEO + CFO + CTO + COO + Data + Marketing | Full C-Suite board meeting |
| Code implementation | Developer + Reviewer | Build + quality gate |
| Content campaign | Marketing + Brand Strategist + Creative Director | Strategy + voice + visuals |
| Bug investigation | Developer + CTO + Data | Code + infra + metrics |
| Cost analysis | CFO + Data | Financial + data validation |

---

## Agent Frontmatter Reference

Every agent file starts with YAML frontmatter:

```yaml
---
name: agent-name          # How Claude refers to this agent
description: What this agent does and when to use it.
  Multi-line descriptions allowed.
tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, WebFetch
model: sonnet             # sonnet (default) or opus (CEO only)
memory: project           # project = per-repo memory isolation
---
```

### Required Fields

| Field | Purpose | Values |
|-------|---------|--------|
| `name` | Agent identifier | Lowercase, hyphenated |
| `description` | Auto-delegation matching + when-to-use | 1-3 sentences |
| `tools` | Allowed tool access | Comma-separated tool names |
| `model` | LLM model to use | `sonnet` or `opus` |
| `memory` | Memory scope | `project` (recommended) |

### Required Sections (in agent body)

| Section | Purpose |
|---------|---------|
| Bias Disclosure | Self-awareness of agent blind spots |
| Constraints | What the agent must NOT do |
| Output Format | Structured response template |
| Memory Curation | When to summarize/prune memory |

---

## Memory Management

### Location

```
.claude/agent-memory/{agent-name}/MEMORY.md
```

Each agent has its own memory file. Memory is project-scoped (isolated per repo).

### What Agents Should Remember

| Remember | Don't Remember |
|----------|----------------|
| Patterns that recurred 2+ times | One-off debugging steps |
| Decisions and their outcomes | Full conversation transcripts |
| Gotchas and workarounds | Temporary states |
| User preferences discovered | Already-resolved issues |

### Memory Limits

| Threshold | Action |
|-----------|--------|
| 150 lines | Summarize older entries |
| 200 lines | Hard cap - remove lowest-value entries |

### Manual Memory Pruning

```bash
# Check memory sizes
wc -l .claude/agent-memory/*/MEMORY.md

# Review an agent's memory
cat .claude/agent-memory/cto/MEMORY.md

# Edit to prune
# Use Edit tool or open in editor
```

---

## Adding a New Agent

### Checklist

1. [ ] Create `.claude/agents/{agent-name}.md` with YAML frontmatter
2. [ ] Add required sections: Bias, Constraints, Output Format, Memory Curation
3. [ ] Create `.claude/agent-memory/{agent-name}/MEMORY.md` (empty or seeded)
4. [ ] Verify frontmatter: `head -10 .claude/agents/{agent-name}.md`
5. [ ] Verify line count: `wc -l .claude/agents/{agent-name}.md` (< 300)
6. [ ] Test auto-delegation: ask a question in the agent's domain
7. [ ] Test memory: verify agent writes to correct memory file

### Frontmatter Template

```yaml
---
name: new-agent
description: What this agent specializes in.
  When to use this agent (proactive trigger).
tools: Read, Grep, Glob, Bash, Edit, Write
model: sonnet
memory: project
---

# Agent Name

> **Role:** One-line summary

## Bias Disclosure

- **Tendency:** What this agent over/under-values
- **Counter:** How to compensate

## Constraints

- NEVER do X
- NEVER do Y
- ALWAYS defer Z to [other agent]

## Output Format

| Section | Content |
|---------|---------|
| Assessment | Domain-specific analysis |
| Risks | Identified concerns |
| Recommendation | Suggested action |
| Confidence | High/Medium/Low with rationale |

## Memory Curation

- **Summarize at:** 150 lines
- **Cap at:** 200 lines
- **Focus:** [what to remember]
```

---

## Sync Pipeline (Registry <-> Local)

### Overview

```
dyniq-ai-agents/agent_registry.py (81 agents)
    ↓ export script
walker-os/.claude/agents/specialists/ (100 .md files)
    ↓ sync script
Detect drift, update local files
```

### Commands

```bash
# Export registry to local .md files
cd /Users/walker/Desktop/Code/dyniq-ai-agents
python3 scripts/export-agents-to-claude-code.py

# Check for drift without making changes
python3 scripts/sync-registry-to-local.py --dry-run

# Apply sync (overwrites local specialists with registry)
python3 scripts/sync-registry-to-local.py --force

# Sync specific tier only
python3 scripts/sync-registry-to-local.py --tier vp
```

### When to Sync

| Event | Action |
|-------|--------|
| After upgrading prompts in registry | Run export + sync |
| After adding new agents to registry | Run export |
| After modifying local specialist files | Run sync --dry-run to check drift |
| Before board meeting testing | Verify sync is current |

---

## Troubleshooting

### Agent Not Activating

| Symptom | Cause | Fix |
|---------|-------|-----|
| Ask domain question, no agent | Description doesn't match query | Update `description` field |
| Agent activates but wrong one | Overlapping descriptions | Make descriptions more specific |
| "Agent not found" error | Missing/invalid frontmatter | Check `head -10 .claude/agents/{name}.md` |

### Memory Not Persisting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Agent forgets between sessions | Memory dir missing | Create `.claude/agent-memory/{name}/MEMORY.md` |
| Wrong agent's memory loaded | Name mismatch | Verify `name` in frontmatter matches directory name |
| Memory file empty after session | Agent didn't write | Check memory curation rules in agent file |

### Agent Refusing Work

| Symptom | Cause | Fix |
|---------|-------|-----|
| "I can't do this" | Constraints section blocks it | Correct: delegate to right agent |
| "This is outside my domain" | Working as designed | Ask the right agent instead |
| Tool permission denied | Missing tool in frontmatter | Add tool to `tools:` field |

---

## Architecture Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Local agents (26) | `.claude/agents/*.md` | Auto-delegation teammates |
| Agent memory | `.claude/agent-memory/*/MEMORY.md` | Persistent per-agent learning |
| Registry (81) | `dyniq-ai-agents/agent_registry.py` | Board meeting swarm |
| Export script | `dyniq-ai-agents/scripts/export-agents-to-claude-code.py` | Registry → .md files |
| Sync script | `dyniq-ai-agents/scripts/sync-registry-to-local.py` | Drift detection |
| Specialist files | `.claude/agents/specialists/*.md` | Generated from registry |
| Settings | `~/.claude/settings.json` | Agent Teams env config |

---

*SOP created 2026-02-06. Update when adding new agents or changing architecture.*
