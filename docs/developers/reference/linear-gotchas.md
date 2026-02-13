---
title: "Linear MCP Development Gotchas"
sidebar_label: "Linear MCP Development Gotchas"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Linear MCP Development Gotchas

Platform-specific patterns for Linear API operations via MCP tools.

---

## UUID Format Requirement (CRITICAL)

**Linear MCP tools require FULL UUIDs, not short IDs.**

| Format | Example | Works? |
|--------|---------|--------|
| Full UUID (36 chars) | `4cd24abb-af21-4c92-97c4-aa7faf504044` | Yes |
| Short ID (8 chars) | `4cd24abb` | **NO — "Entity not found"** |
| Linear identifier | `DYN-5` | Depends on tool |

**Pattern:** Always fetch full UUIDs via `list_issues` before bulk update operations.

```
# Step 1: Get full UUIDs
list_issues(project="Sprint 1: Revenue Unblock")
# Returns full UUIDs for each issue

# Step 2: Use full UUID in update
update_issue(id="4cd24abb-af21-4c92-97c4-aa7faf504044", description="...")
```

**Incident (2026-02-06):** First batch of 6 parallel `update_issue` calls failed with "Entity not found" because short IDs were used. All calls in the batch failed due to sibling error cascade.

---

## Bulk Operations Pattern

For updating >10 issues:

1. **Fetch all UUIDs first** — `list_issues` per project
2. **Pre-generate content** in scratchpad file (reduces context pressure)
3. **Batch updates in groups of 4** — parallel API calls
4. **Verify each batch** before proceeding to next

**Context window risk:** 16 structured descriptions (~80 lines each) + input context (~2,000 lines) can exceed context limits. Pre-generate to scratchpad.

---

## Tool Capabilities

| Tool | Accepts `DYN-X`? | Accepts Short ID? | Requires Full UUID? |
|------|-------------------|-------------------|---------------------|
| `get_issue` | Yes | No | Yes |
| `update_issue` | No | No | **Yes (full UUID only)** |
| `list_issues` | N/A | N/A | Returns full UUIDs |
| `create_issue` | N/A | N/A | Returns full UUID |

---

## Entity ID Reference Pattern

For multi-session work, cache entity IDs in scratchpad:

```markdown
## Linear Entity IDs (Session Cache)
| Entity | ID |
|--------|-----|
| Initiative | f9ddf9a4-... |
| Project: Sprint 1 | cc809c34-... |
| Team | 5fd98ac1-... |
```

Prevents re-fetching across context window continuations.

---

## Markdown in Descriptions

Linear renders Markdown in issue descriptions. Supported:
- Checkboxes: `- [ ] Task`
- Tables: `| Col1 | Col2 |`
- Headers: `## Section`
- Code blocks: triple backticks
- Bold/italic/links

**Gotcha:** Linear auto-converts URLs to links. Bare URLs in table cells may break rendering.

---

## Label Management

- Labels are workspace-scoped (not project-scoped)
- Creating a label with the same name as existing = error
- Check `list_issue_labels` before creating
- Labels can be assigned by name (not just ID) in `update_issue`

---

## Cycle Gotchas

- Cycles are team-scoped
- Issue can only belong to one cycle at a time
- Moving issue between cycles requires `update_issue(cycle="...")`
- Cycle dates cannot overlap within same team

### No create_cycle Endpoint (MCP Limitation)

**The Linear MCP does NOT provide a `create_cycle` tool.**

| Available | Not Available |
|-----------|--------------|
| `list_cycles` | `create_cycle` |
| Assign issue to cycle via `update_issue(cycle=...)` | Create new cycle |

**Workaround:** Provide manual creation steps to user:
1. Open Linear UI: Settings > Team > Cycles
2. Create cycles with start/end dates
3. Then assign issues via MCP: `update_issue(id="...", cycle="Sprint 1")`

**Incident (2026-02-06):** Two `/linear-setup` sessions required manual cycle creation. Always document this step in UUID cache output.

---

## AI-Readable Issue Description Template

Standard template for Linear issues that any AI agent can read and execute directly.

```markdown
## Objective
[1-2 sentences: what this issue achieves]

## Context
- **Sprint:** [number] ([name], Days X-Y)
- **WBS Code:** [1.x.x]
- **PBS Reference:** [1.x Category → Leaf Node]
- **Milestone:** [name] ([date])
- **Risk Level:** [High/Medium/Low] ([category] — [brief explanation])

## Scope

### In Scope
- [Specific deliverable 1]
- [Specific deliverable 2]

### Out of Scope
- [Explicitly excluded item 1]

## Technical Details
- **Platform/tools:** [specific technologies]
- **Key configs:** [important settings]

## Tasks
- [ ] [Actionable task with verb]
- [ ] [Next task]

## Acceptance Criteria
- [ ] [Given/When/Then or checklist item with measurable outcome]

## Dependencies
- **Blocked by:** [DYN-X (reason)]
- **Blocks:** [DYN-Y (reason)]

## Risk & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [specific risk] | X% | [level] | [specific action] |

## Delegation
| Task | RACI | Delegatable To | Estimate |
|------|------|----------------|----------|
| [task] | R: Walker | [AI/VA/Not delegatable] | Xh |
```

**Usage:** Apply this template when creating or updating Linear issues. Ensures any AI agent (Claude, Kimi, etc.) can parse the issue and execute without additional context.

**Validated (2026-02-07):** Applied to 66 DYNIQ issues across 2 initiatives (DYN-5 to DYN-66). Template confirmed readable by AI agents. All issues now have Objective, Context, Scope, Technical Details, Tasks, AC, Dependencies, Risk table, and Delegation table.

---

## Background Agent Context Limit

**Pattern (2x):** Background agents hang when fed >2,000 lines of context across 4+ files.

| Context Size | Agent Behavior | Mitigation |
|-------------|----------------|------------|
| <500 lines | Works reliably | Direct file reads |
| 500-1500 lines | Usually works | Monitor for timeout |
| >1500 lines | May hang indefinitely | **Pre-summarize** context |

**Mitigation for large-context tasks:**
1. Pre-summarize input files to <500 lines total
2. Write summary to scratchpad
3. Point agent at summary, not full files
4. Set max_turns limit on agent

**Incident (2026-02-06):** Agent ad4cea5 read 4 deliverable files (~2,000 lines total), then hung without producing output. Stopped after 5+ minutes. Manual execution was faster.

---

## Background Agents Cannot Use Linear MCP (CRITICAL)

**Linear MCP tools are ALWAYS auto-denied in background agents.** This is not a context size issue — it's a fundamental permission limitation.

| Agent Type | Linear MCP Access | Workaround |
|-----------|-------------------|------------|
| Main session | Yes (interactive prompts) | N/A |
| Background agent (Task tool) | **NO — auto-denied** | Run in main session |
| Subagent (any type) | **NO — auto-denied** | Run in main session |

**Never attempt Linear MCP operations from background agents.** Always process in the main session, even if sequential.

**Incidents:**
- 2026-02-06: Agent ad4cea5 hung (context overload, not MCP denial)
- 2026-02-07: 7 background agents ALL failed with "Permission to use mcp__linear__get_issue has been auto-denied (prompts unavailable)"
- Pattern: 3x occurrence → automation threshold exceeded

---

## create_document Requires Project or Issue

**`create_document` always needs a `project` or `issue` parameter.** Standalone documents without a linked entity fail.

| Parameter | Required | Notes |
|-----------|----------|-------|
| `title` | Yes | Document title |
| `content` | No | Markdown content |
| `project` | **One required** | Project name or UUID |
| `issue` | **One required** | Issue ID or identifier |

**Error without link:** "Either project or issue must be specified"

**Pattern:** Link strategic overview documents to the first project in the initiative.

**Incident (2026-02-11):** `create_document` for AI Notetaker strategic overview failed. Fixed by adding `project` parameter linking to Sprint 1 project.

---

## Board Meeting + Linear Setup = 2 Sessions

**Combined board-meeting + linear-setup ALWAYS exceeds context window.** Plan as 2 sessions from the start.

| Session | Content | Context Usage |
|---------|---------|---------------|
| Session 1 | Board meeting (agents) + PRD update + reference docs | ~40-60% |
| Session 2 | Linear infrastructure (initiative, projects, milestones, labels, issues, documents) | ~60-80% |

**Occurrences:** 3x (2026-02-06 DYNIQ Revenue, 2026-02-06 DYNIQ Premium, 2026-02-11 AI Notetaker)

**Pattern exceeded 3x threshold.** New rule: Always split into planned sessions.

---

## Initiative Description 255-Char Limit

**Linear initiative `description` field is limited to 255 characters.** Rich markdown content will fail with "Argument Validation Error".

| Entity | Description Limit | Workaround |
|--------|-------------------|------------|
| Issue | Unlimited markdown | N/A |
| Project | Unlimited markdown | N/A |
| Initiative | **255 characters** | Use short summary + separate Linear document |
| Document | Unlimited markdown | Use for long-form content |

**Pattern:** For initiative-level strategic content:
1. Set initiative description to short summary (< 255 chars)
2. Create a Linear document titled "[Initiative Name] - Strategic Overview"
3. Put full content (goals, metrics, timeline, tech stack) in the document

**Incident (2026-02-07):** `update_initiative` returned "description must be shorter than or equal to 255 characters" when trying to set rich markdown. Fixed with short summaries + 2 strategic overview documents.

---

## Enhancement vs New Issue Decision Framework

When a completeness audit identifies gaps, decide whether to enhance an existing issue or create a new one:

| Criteria | Enhance Existing | Create New Issue |
|----------|-----------------|-----------------|
| Scope | Subsection/task within existing issue | Standalone deliverable |
| AC | No new acceptance criteria needed | Has its own acceptance criteria |
| Estimate | Adds <2 SP to existing issue | Needs 2+ SP independently |
| Dependencies | Same dependency chain as host issue | Different blocking relationships |

**Examples from practice (2026-02-11):**
- Rate limiting → enhanced DYN-167 (API reference docs) - it's a subsection
- Webhook event catalog → enhanced DYN-171 (client integration guide) - it's a subsection
- Postman collection → enhanced DYN-180 (auto-gen API docs) - same toolchain
- Error & troubleshooting guide → NEW DYN-189 - standalone deliverable with own AC
- Security & GDPR docs → NEW DYN-190 - compliance requires dedicated scope

**Rule of thumb:** If the addition doubles the issue's scope or introduces unrelated acceptance criteria, it deserves its own issue.

---

*Last updated: 2026-02-11*
*Reference this doc before ANY bulk Linear operations.*
