---
description: "Full audit: find duplicate code, overlapping docs, stale files, over-engineering"
argument-hint: "[scope: all | code | docs | folders]"
---

# Cleanup Audit: $ARGUMENTS

## Purpose

Generate a cleanup report identifying:
- **Code**: Unused files, exports, dependencies (via Knip analysis patterns)
- **Docs**: Overlapping documentation, repeated concepts
- **Folders**: Misplaced files, stale directories, poor organization
- **Over-engineering**: Unnecessary abstractions, files exceeding limits

**This command reports only. You review and approve all changes.**

---

## Process

### 1. Determine Scope

| Argument | What Gets Scanned |
|----------|-------------------|
| `all` (default) | Everything below |
| `code` | TypeScript/JS files only |
| `docs` | Markdown files only |
| `folders` | Directory structure only |

### 2. Run Analysis

#### A. Code Analysis (if scope includes code)

Scan for:

```markdown
## Unused Code

| Type | Count | Impact |
|------|-------|--------|
| Unused files | ? | Safe to delete |
| Unused exports | ? | Safe to remove |
| Unused dependencies | ? | Remove from package.json |
| Dead code blocks | ? | Review before delete |
```

**Detection patterns:**
- Files not imported anywhere
- Exports not used outside their module
- Dependencies in package.json but not imported
- Functions/variables defined but never called

#### B. Documentation Analysis (if scope includes docs)

Scan these locations:
- `CLAUDE.md`, `README.md`, `GUIDE.md`, `SOP.md`
- `*.md`
- `.claude/agents/*.md`
- `.claude/commands/**/*.md`
- `epics/*.md`
- `features/*.md`
- `stories/*.md`
- `templates/email/**/*.html` (brand colors in inline CSS)

Report:

```markdown
## Documentation Overlap

| Concept | Files Where Repeated | Consolidation Target |
|---------|---------------------|---------------------|
| [concept] | file1.md, file2.md | Single source |

## Stale Documentation

| File | Last Modified | Issue |
|------|--------------|-------|
| [file] | [date] | Not referenced / Outdated |
```

**Detection patterns:**
- Same concept (e.g., "Freedom Filter", "Dashboard Routes") in 3+ files
- Files older than 14 days with newer duplicates
- Agent files with overlapping responsibilities
- Plans in wrong folders
- Brand color hex values in email template inline CSS (grep `#[0-9A-Fa-f]{6}` in `templates/email/`)

#### C. Folder Analysis (if scope includes folders)

Scan:
- `epics/` - Check naming convention (EPIC-*)
- `features/` - Check naming convention (PRD-*)
- `stories/` - Check naming convention (STORY-*)
- `.claude/agents/` - Check for duplicate agent roles
- `apps/web/src/` - Check for orphan directories

Report:

```markdown
## Folder Issues

| Path | Issue | Recommendation |
|------|-------|----------------|
| [path] | Misplaced | Move to [location] |
| [path] | Empty | Delete |
| [path] | Duplicate content | Consolidate |
```

#### D. Over-Engineering Check

Check against core-rules.md limits:

| Type | Limit | Violations |
|------|-------|------------|
| Any file | 500 lines | List violators |
| React component | 200 lines | List violators |
| Function | 50 lines | List violators |
| Agent file | 200 lines | List violators |
| Reference doc | 300 lines | List violators |

Also flag:
- Agents with >90% overlapping responsibility
- Commands that could be merged
- Abstractions used only once

---

### 3. Generate Report

Output format:

```markdown
# Cleanup Report - [Date]

## Summary

| Category | Issues Found | Est. Lines Recoverable |
|----------|-------------|----------------------|
| Code | X | ~Y lines |
| Docs | X | ~Y lines |
| Folders | X | N/A |
| Over-engineering | X | ~Y lines |

## Priority Actions

### Critical (Fix Now)
1. [Issue] - [File] - [Why critical]

### High (Fix This Week)
1. [Issue] - [File]

### Low (Backlog)
1. [Issue] - [File]

## Detailed Findings

[Full analysis per category]

## Recommended Order

1. [First action - lowest risk]
2. [Second action]
3. ...
```

---

### 4. Save Report

Save to: `.agents/cleanup-reports/cleanup-[YYYY-MM-DD].md`

---

## Known Patterns in walker-os

From previous audits, common issues:

### Duplicate Agent Pairs
- `reviewer.md` vs `code-reviewer.md` (keep reviewer.md)
- `tester.md` vs `test-runner.md` (keep tester.md)
- `planner.md` vs `planning-agent.md` (keep planner.md)
- `freedom-filter.md` vs `os-agent.md` (keep freedom-filter.md)

### Repeated Concepts
- Freedom Filter: 7 locations (consolidate to freedom-filter.md)
- Dashboard Routes: 4 locations (consolidate to CLAUDE.md)
- Profit First buckets: 4 locations (consolidate to freedom-system.md)

### Large Files
- `end-timeblock.md`: 343 lines (consider splitting)
- `finance-agent.md`: 290 lines (exceeds 200-line limit)
- `planning-agent.md`: 222 lines (exceeds 200-line limit)

---

## After Report

User reviews report and decides:

| Action | Command |
|--------|---------|
| Delete file | Manual or `/quick-fix delete [file]` |
| Consolidate docs | Manual edit |
| Move file | `git mv [src] [dest]` |
| Split large file | `/plan-feature --level=1` |

**Never auto-delete without explicit approval.**

---

## Integration

This command is part of the maintenance cycle:

```
Weekly: /cleanup all → Review report → Fix critical items
Monthly: Deep cleanup → Consolidate docs → Archive stale plans
```

Pairs well with:
- `/system-review` - Process improvements
- `/validate` - Ensure changes don't break build
