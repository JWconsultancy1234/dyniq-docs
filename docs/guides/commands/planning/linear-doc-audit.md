---
description: Audit and enhance Linear issue documentation quality across a project
argument-hint: [project-name or initiative-name]
---

# Linear Doc Audit: $ARGUMENTS

## Overview

Scan all issues in a Linear project/initiative, identify missing documentation sections, and batch-enhance to above-industry-standard quality. Run this after `/linear-setup` or when documentation quality needs improvement.

## When to Use

| Trigger | Action |
|---------|--------|
| After `/linear-setup` completes | Run to verify + enhance issue quality |
| User requests documentation upgrade | Run on specified project/initiative |
| Before delegating work to VA/contractor | Run to ensure issues are self-contained |
| Periodic quality audit | Run quarterly on active projects |

## Prerequisites

- Project/initiative exists in Linear
- Issues have been created (via `/linear-setup` or manually)
- **CRITICAL:** Run in main session only. Linear MCP tools are auto-denied in background agents.

## Phase 1: Scan Issues (2 min)

1. **Identify target:** Find project or initiative from `$ARGUMENTS`
   ```
   list_projects(query="$ARGUMENTS") OR list_initiatives(query="$ARGUMENTS")
   ```

2. **Fetch all issues:**
   ```
   list_issues(project="...", limit=250)
   ```

3. **Cache UUIDs** in scratchpad for session continuity.

## Phase 2: Assess Quality (3 min)

For each issue, check for the 9 required sections:

| Section | Check For | Required? |
|---------|-----------|-----------|
| Objective | `## Objective` | Yes |
| Context | `## Context` | Yes |
| Scope | `## Scope` with In/Out | Yes |
| Technical Details | `## Technical Details` | Yes |
| Tasks | `## Tasks` with checkboxes | Yes |
| Acceptance Criteria | `## Acceptance Criteria` with checkboxes | Yes |
| Dependencies | `## Dependencies` with Blocked by/Blocks | Yes |
| Risk | `## Risk` with table (Risk/Probability/Impact/Mitigation) | Yes |
| Delegation | `## Delegation` with table (Task/Delegatable To/Estimate) | Yes |

**Strategy: Spot-check first.** Fetch 4 issues, assess quality. If all excellent, spot-check 4 more. If gaps found, batch-process all.

**Assessment output:**
```
| Issue | Obj | Ctx | Scope | Tech | Tasks | AC | Deps | Risk | Deleg | Action |
|-------|-----|-----|-------|------|-------|----|----- |------|-------|--------|
| DYN-X | Y   | Y   | Y     | N    | Y     | Y  | Y    | N    | N     | UPDATE |
| DYN-Y | Y   | Y   | Y     | Y    | Y     | Y  | Y    | Y    | Y     | SKIP   |
```

## Phase 3: Batch Enhance (5-10 min)

For issues needing updates:

1. **Fetch issue** (get current description)
2. **Add missing sections** (preserve existing content, append new sections)
3. **Update issue** via `update_issue(id=FULL_UUID, description=...)`

**Batch in groups of 4** (parallel fetch, then parallel update).

**Section content guidelines:**

### Context Section
- Business justification (why this matters)
- Sprint position and timeline
- Relationship to initiative goals

### Technical Details Section
- Components/routes/files to create or modify
- Data sources and APIs
- Libraries and frameworks
- Design system references

### Risk Table
```markdown
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Specific technical/business risk] | Low/Medium/High | Low/Medium/High/Critical | [Concrete action] |
```
Include 3-4 risks per issue. Consider: data integrity, performance, security, UX, dependencies.

### Delegation Table
```markdown
| Task | Delegatable To | Estimate |
|------|---------------|----------|
| [Specific subtask] | Junior/Mid/Senior Dev, QA, VA, Designer | Xh |
```
Break issue into 3-5 delegatable subtasks with skill level and time estimate.

## Phase 4: Verify & Report (2 min)

1. **Re-scan sample:** Fetch 4 updated issues, verify sections present
2. **Generate summary:**

   | Metric | Value |
   |--------|-------|
   | Issues assessed | N |
   | Issues updated | N |
   | Issues skipped (already excellent) | N |
   | Sections added | Risk: N, Delegation: N, Context: N |

3. **Report to user** with completion status.

## Important Notes

- **Never overwrite existing content.** Append missing sections after existing description.
- **Skip excellent issues.** If all 9 sections present and well-written, SKIP.
- **Use full UUIDs only.** Short IDs cause "Entity not found" errors.
- **Main session only.** Background agents CANNOT use Linear MCP tools.

## Reference

- Linear gotchas: @linear-gotchas.md
- AI-readable template: @linear-gotchas.md#ai-readable-issue-description-template
- Linear setup: @.claude/commands/2-planning/linear-setup.md

---

*Created: 2026-02-07 | Owner: COO | Trigger: After /linear-setup or documentation quality audit*
