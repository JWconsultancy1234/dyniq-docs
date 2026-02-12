---
sidebar_position: 7
title: Linear Workflow
description: Linear project management patterns and API gotchas
doc_owner: COO
review_cycle: 30d
doc_status: published
---

# Linear Workflow

Patterns and gotchas for Linear project management via the MCP API.

## UUID Format

:::danger Full UUIDs Required
Linear MCP tools require **full 36-character UUIDs**, not short IDs.
:::

| Format | Example | Works? |
|--------|---------|--------|
| Full UUID | `4cd24abb-af21-4c92-97c4-aa7faf504044` | Yes |
| Short ID (8 chars) | `4cd24abb` | No |
| Linear identifier | `DYN-5` | Depends on tool |

**Always fetch full UUIDs via `list_issues` before bulk operations.**

## Bulk Operations Pattern

1. Fetch all UUIDs first via `list_issues` per project
2. Pre-generate content in a scratchpad file
3. Batch updates in groups of 4 (parallel API calls)
4. Verify each batch before proceeding

## AI-Readable Issue Template

Standard template for issues that any AI agent can parse and execute:

```markdown
## Objective
[1-2 sentences: what this issue achieves]

## Context
- **Sprint:** [number] ([name], Days X-Y)
- **WBS Code:** [1.x.x]
- **Risk Level:** [High/Medium/Low]

## Scope
### In Scope
- [Specific deliverable 1]

### Out of Scope
- [Explicitly excluded item 1]

## Tasks
- [ ] [Actionable task with verb]

## Acceptance Criteria
- [ ] [Measurable outcome]

## Dependencies
- **Blocked by:** [DYN-X (reason)]
- **Blocks:** [DYN-Y (reason)]
```

## Label Management

- Labels are **workspace-scoped** (not project-scoped)
- Check `list_issue_labels` before creating new ones
- Duplicate names cause errors

## Cycle Gotchas

- Cycles are **team-scoped**
- Issues can only belong to one cycle at a time
- The MCP does **not** have a `create_cycle` tool - create cycles manually in Linear UI

## Initiative Description Limit

| Entity | Description Limit |
|--------|-------------------|
| Issue | Unlimited markdown |
| Project | Unlimited markdown |
| Initiative | **255 characters** |
| Document | Unlimited markdown |

For initiative-level content: use a short summary + a separate Linear document.

## Document Creation

`create_document` requires either a `project` or `issue` parameter. Standalone documents without a linked entity will fail.
