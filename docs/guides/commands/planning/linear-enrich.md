---
description: Enhance a single Linear issue with missing documentation sections
argument-hint: "[DYN-X or issue UUID]"
---

# Linear Enrich: $ARGUMENTS

## Overview

Take a single Linear issue and add any missing documentation sections (Context, Technical Details, Risk, Delegation) to bring it to above-industry-standard quality.

## When to Use

| Trigger | Action |
|---------|--------|
| Single issue needs enhancement | Run with issue identifier |
| Before starting work on an issue | Enrich to ensure complete context |
| After creating issue manually | Add standard sections |

## Steps

### 1. Fetch Issue
```
get_issue(id="$ARGUMENTS")
```

### 2. Assess Missing Sections

Check for all 9 required sections:

| # | Section | Present? |
|---|---------|----------|
| 1 | Objective | |
| 2 | Context | |
| 3 | Scope (In/Out) | |
| 4 | Technical Details | |
| 5 | Tasks (checkboxes) | |
| 6 | Acceptance Criteria (checkboxes) | |
| 7 | Dependencies (Blocked by/Blocks) | |
| 8 | Risk table | |
| 9 | Delegation table | |

### 3. Generate Missing Content

For each missing section, generate contextually appropriate content based on issue title, existing description, project context, and labels.

### 4. Update Issue

Preserve existing content. Append missing sections at the end.

```
update_issue(id=FULL_UUID, description=existing + new_sections)
```

### 5. Confirm

Show user what was added and link to updated issue.

## Important

- **Main session only.** Linear MCP auto-denied in background agents.
- **Full UUIDs required** for `update_issue`.
- **Never overwrite** existing content.

---

*Created: 2026-02-07 | Owner: COO | Trigger: Single issue documentation enhancement*
