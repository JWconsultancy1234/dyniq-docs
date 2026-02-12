---
description: "Refactor large file into modular structure (components, hooks, utils)"
argument-hint: "<file-path>"
---

# Refactor File: $ARGUMENTS

## Purpose

Automated refactoring of large files (>500 lines) into modular structure following established patterns.

**Patterns Applied:**
- React components → `components/`, `hooks/`, `utils/` structure
- Server actions → `{domain}/` directory with barrel exports
- Any large file → logical modules with clear responsibilities

---

## Process

### 1. Analyze File

```bash
# Get line count
wc -l "$ARGUMENTS"

# Identify file type
```

| Line Count | Action |
|------------|--------|
| <300 | No refactoring needed |
| 300-500 | Optional - consider if touching soon |
| >500 | **Refactor required** per core-rules.md |

### 2. Identify Structure

**For React Components:**
```
Scan for:
- Constants/config (lines 1-X)
- Types/interfaces
- Helper functions (pure utilities)
- Custom hooks (useState, useEffect patterns)
- Sub-components (function X() { return <JSX> })
- Main component
```

**For Server Actions:**
```
Scan for:
- Types/interfaces
- Shared utilities
- CRUD operations (get, create, update, delete)
- Domain-specific operations
```

### 3. Create Extraction Plan

**Output structure for React:**
```
{page}/
├── {page}-client.tsx     (<300 lines - orchestrator)
├── hooks/
│   └── use-{feature}.ts  (state + handlers)
├── components/
│   └── {component}.tsx   (presentational)
└── utils/
    └── {utility}.ts      (pure functions)
```

**Output structure for Server Actions:**
```
lib/actions/{domain}/
├── index.ts       (barrel re-exports, NO "use server")
├── types.ts       (interfaces, NO "use server")
├── crud.ts        (CRUD operations, WITH "use server")
├── {feature}.ts   (domain-specific, WITH "use server")
└── shared.ts      (shared utilities)
```

### 4. Extraction Order

**CRITICAL: Follow this order to minimize iterations:**

1. **Utilities first** - Pure functions with no dependencies
2. **Types second** - Interfaces, type definitions
3. **Hooks third** - State + handlers (depend on utilities)
4. **Simple components fourth** - Presentational only
5. **Complex components last** - Depend on all above

### 5. Execute Refactoring

For each extracted module:

1. Create new file with proper directive:
   - `"use client"` for React components
   - `"use server"` for async server actions ONLY
   - No directive for types, utils, barrel exports

2. Move code to new file

3. Add imports to original file

4. Validate after each extraction:
   ```bash
   pnpm type-check
   ```

### 6. Create Barrel Export (if server actions)

```typescript
// lib/actions/{domain}/index.ts (NO "use server")
export * from './crud'
export * from './types'
export type { SomeType } from './types'
```

**Benefit:** Existing imports continue working.

### 7. Clear Build Cache (Next.js)

**For Next.js projects:** Clear `.next` cache after large refactoring sessions to prevent ENOTEMPTY errors.

```bash
# Clear .next cache (do this BEFORE starting OR if build errors occur)
rm -rf .next
```

**When to clear:**
- Before starting large refactoring (>3 component extractions)
- If ENOTEMPTY or cache-related build errors occur
- After extracting components from files >400 lines

**Pattern detected:** 2 occurrences of .next cache issues during refactoring (large-file-refactoring, phase6-frontend). Proactive clearing prevents debugging time.

### 8. Final Validation

```bash
pnpm lint && pnpm type-check && pnpm build
```

---

## Rules

### "use server" Directive

| Can Export | Cannot Export |
|------------|---------------|
| `async function foo()` | Types/interfaces |
| Named async exports | Barrel re-exports |
| Server actions | Sync utility functions |

**Pattern:** Split into `types.ts` (no directive) + `actions.ts` (with directive).

### File Size Targets

| File Type | Target | Max |
|-----------|--------|-----|
| Main orchestrator | <200 lines | 300 |
| Hook | <150 lines | 200 |
| Component | <150 lines | 200 |
| Utility | <100 lines | 150 |

### Backwards Compatibility

- Use barrel exports (`index.ts`) to maintain import paths
- Don't change external API signatures
- Run type-check after each change

---

## Example: React Component

**Input:** `cashflow-client.tsx` (2015 lines)

**Output:**
```
cashflow/
├── cashflow-client.tsx          (429 lines)
├── cashflow-chart-utils.ts      (145 lines)
├── cashflow-tooltip.tsx         (22 lines)
├── cashflow-day-tick.tsx        (55 lines)
├── metric-card.tsx              (35 lines)
├── last-modified-banner.tsx     (78 lines)
├── bank-balance-card.tsx        (155 lines)
├── income-input-card.tsx        (124 lines)
├── cashflow-chart.tsx           (176 lines)
├── budget-overview-card.tsx     (113 lines)
└── expense-entry-card.tsx       (255 lines)
```

---

## Example: Server Actions

**Input:** `lib/actions/sops.ts` (1116 lines)

**Output:**
```
lib/actions/sops/
├── index.ts       (66 lines - re-exports)
├── types.ts       (126 lines - interfaces)
├── crud.ts        (271 lines - CRUD ops)
├── executions.ts  (201 lines)
├── suggestions.ts (259 lines)
├── roles.ts       (153 lines)
└── health.ts      (190 lines)
```

---

## Parallel Execution

For multiple large files, use background agents:

1. Complete one refactoring in main session (establishes permissions)
2. Launch remaining as background agents with `run_in_background=true`
3. Assign non-overlapping files to avoid conflicts

**Note:** Background agents cannot handle permission prompts.

---

## After Refactoring

1. Update any refactoring plan in `plans/`
2. Move completed plan to `done/plans/`
3. Run `/validate` to confirm all checks pass

---

*Automates the patterns from large-file-refactoring-2026-01-30.*
