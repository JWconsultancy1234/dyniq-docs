---
title: "Core Development Rules"
sidebar_label: "Core Development Rules"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Core Development Rules

Universal rules that apply to ALL DYNIQ repos.
Technical patterns: @technical-patterns.md

---

## RULE #1: NEVER Claim Without Proof (Hallucination Prevention)

**This is the most important rule. All other rules are secondary.**

### The Rules

| NEVER Say | ALWAYS Say Instead |
|-----------|-------------------|
| "Fixed" | "Here's the test output showing it works: [output]" |
| "Working" | "E2E test returned: [actual response]" |
| "You're right" | "Let me verify that first..." then show evidence |
| "100% complete" | "X of Y items verified. Here's what works: [list]" |
| "Should work now" | "Test shows: [actual result]" |

### Verification Requirements

Before ANY claim of completion:

1. **Run actual E2E test** - Not "the code looks right", but actual `curl` output
2. **Show the output** - Paste real response, not "it returned success"
3. **List what works AND what doesn't** - Never hide failures
4. **If uncertain, say so** - "I need to verify" is always acceptable

### When User Questions Results

**STOP. Don't defend. Investigate.**

```
User: "This doesn't work"
WRONG: "It should work, let me check..."
RIGHT: "Let me run the actual test and show you the output."
```

### Checklist Before Saying "Done"

- [ ] Ran actual E2E test (not just type-check/build)
- [ ] Pasted real output in response
- [ ] Listed any failures or edge cases
- [ ] If deployment: verified on production URL, not just local

### Incident History

| Date | Claim | Reality | Root Cause |
|------|-------|---------|------------|
| 2026-02-01 | "Phase 1 complete" | Fields were null | No E2E verification |
| 2026-02-01 | "100% fixed" | Still failing | Defended instead of investigating |
| 2026-02-02 | "SAC-004 bias complete" | Not in API response | No E2E curl |
| 2026-02-02 | "CFO/COO working" | ~20% fallback rate | Didn't check server logs |

---

## Philosophy

**THE FIRST FILTER: Does this buy back my time?**
- If no -> Eliminate, delegate, or automate
- If yes -> Build a system, run parallel, ship fast

See @.claude/agents/freedom-filter.md for complete decision framework.

**Time management hierarchy:**
- **Eliminate first** - Don't do tasks that add no value
- **Automate second** - Build systems for recurring work
- **Delegate third** - Find WHO, not HOW
- **Parallel fourth** - Run 5-10 independent tasks simultaneously

**Execution principles:**
- **Trust but verify** - ALWAYS check plans step-by-step, never assume
- **Fix forward** - No backwards compatibility, remove deprecated code immediately
- **Fail fast** - Detailed errors over graceful failures
- **Pivot fast** - Don't debug endlessly. (1) Ask user, (2) Summarize blocker, (3) Explain next
- **KISS** - Keep it simple, avoid over-engineering
- **DRY** - Don't repeat yourself (when appropriate)
- **YAGNI** - Don't implement features not yet needed
- **Always ask** - Never assume user's subjective values

**Trust but Verify - The Core Rule:**
1. **Read the full plan** - Don't skim, read every step
2. **Check each item** - Verify before marking complete
3. **Report gaps immediately** - If something can't be done, say so
4. **Capture learnings** - Update context after each story

**Continuous improvement:**
- Run `/optimize` weekly to prevent entropy
- Run `/optimize planning` after creating PRD/stories
- Run `/optimize commands` after system-review identifies issues

---

## The 5 Questions (Before ANY Feature)

1. **What problem are we solving?**
2. **Is there existing code that does this?**
2.5. **Can the NEXT task be automated by THIS task?**
3. **What's the simplest solution?**
4. **What could break?**
5. **How will we test it?**

---

## File Limits

| Type | Max Lines |
|------|-----------|
| CLAUDE.md | 200 |
| Agent files | 300 |
| Reference docs | 300 |
| React component | 200 |
| Function | 50 |
| Any file | 500 |

### 500-Line Exceptions

| Document Type | Max Lines | Condition |
|---------------|-----------|-----------|
| C-Suite reviewed EPICs | 600 | Verified by 4+ agent analysis |
| Planning EPICs with ROI | 550 | Contains financial validation |

### Enforcement

When agent file exceeds limit:
1. Identify extractable detailed content
2. Create reference doc in ``
3. Replace detail with quick-reference table + `@import`

### Large File Refactoring

1. **Create refactoring plan** -> `plans/PLAN-{filename}-refactor.md`
2. **Execute opportunistically** - Apply when next touching that file

### Two-Phase Refactoring

**Phase 1: Extract** - Create component files, add imports, verify compiles
**Phase 2: Integrate** - Replace JSX, pass props, remove duplicates

**Component Extraction Order:** Utilities -> Hooks -> Presentational -> Complex

### "use server" Directive Rules (Next.js)

Files with `"use server"` can ONLY export async functions.
**Split into:** `types.ts` (no directive), `index.ts` (barrel), `{feature}.ts` (server actions)

### Barrel Export Pattern

```typescript
// lib/actions/{domain}/index.ts (NO "use server")
export * from './crud'
export type { SomeType } from './types'
```

---

## Code Quality (Non-Negotiable)

1. **NEVER use `any`** - Use proper typing or `unknown`
2. **NEVER hardcode secrets** - Use environment variables (.env.local)
3. **NEVER exceed file limits** - Split into modules
4. **ALWAYS validate input** - Use Zod for runtime validation
5. **ALWAYS run validation before commit** - `pnpm lint && pnpm type-check && pnpm build`
6. **ALWAYS verify package APIs before using** - Check imports exist in installed version

---

## Human-in-the-Loop for External Actions

| Action Type | Default Behavior | Auto-Execute Requires |
|-------------|------------------|----------------------|
| Send email | Draft only | Explicit user request |
| Post to social media | Draft only | Explicit user request |
| Delete data | Confirm first | Explicit user request |
| External API writes | Confirm first | Explicit user request |
| Financial transactions | Always confirm | Never auto-approve |

**Pattern:** Create -> Review -> Approve -> Execute (never skip Review/Approve)

---

## Git Workflow

```
feature/xxx -> PR -> develop -> PR -> main
```

- Never push directly to main or develop
- Create feature branch from develop
- PR feature -> develop
- PR develop -> main (releases only)

---

## NEVER DO

- Create files/folders without verifying they're needed
- Trust conversation summaries over actual codebase
- Use `any` type
- Skip workspace validation in multi-tenant code
- Hardcode API keys or secrets
- Use `@ts-ignore` or `@ts-expect-error`
- Create YAML/JSON data files (use database)
- Exceed file limits
- **useEffect with unstable deps** - Objects/arrays as deps cause infinite loops
- **Double revalidation** - Don't use both `revalidatePath()` AND `router.refresh()`
- **Archive or delete folders without user confirmation**
- **Auto-commit without security scan** - Use `/commit` with mandatory scanning
- **Print or expose API keys in output** - Show key NAMES only, never VALUES

See: @infinite-loop-patterns.md

## ALWAYS DO

- Verify codebase structure before creating files
- Read existing code before modifying
- Check for existing utilities before creating new ones
- Validate ALL input with Zod
- Use environment variables for config
- Run validation before commit
- Ask questions when uncertain

---

## Background Agent Limitations

Task agents running in background cannot:
- Request interactive permissions (auto-denied)
- Handle permission prompts

**Pattern:** Complete one task in main session first, then launch background agents on non-overlapping files.

**Write-heavy tasks (4th occurrence 2026-02-08):** Background agents for **research/generation only**. All file writing must happen in main session. Recovery: read `TaskOutput`, write files from main session. Content generation agents produce excellent output but cannot save it.

**Pre-flight for write operations:**
```bash
touch /path/to/new/file.py    # Create empty file first
# Read the file in main session (establishes context)
# NOW launch background agent
```

**Post-write verification:** After parallel agents complete, verify all target files exist before proceeding. Agents may report "file written" when the write silently failed.

**Task tool mode parameter:** Use `mode: "bypassPermissions"` for trusted content generation agents that only need Write access. Test before relying on this in production workflows.

**Scope constraints:** Always include explicit file lists in agent prompts: "ONLY modify [file1, file2]. DO NOT touch any other files." Agent scope creep is a recurring pattern (25+ incidents).

**Cross-repo access:** Background agents cannot read from other repos. Pre-read required files from main session first.

---

## Task Blocker Escalation Protocol

```
Day 1: 30 min attempt -> document blocker
Day 2: 30 min attempt -> if no progress -> ESCALATE
Day 3+: Don't touch without user decision
```

**ESCALATE means:** Pivot (alternative approach), Cut (remove from plan), or Alternative (workaround)

---

*Universal rules. Technical patterns: @technical-patterns.md*
*Repo-specific rules are in separate reference docs.*
