---
title: "Component Extraction Protocol"
sidebar_label: "Component Extraction Protocol"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Component Extraction Protocol

Pattern for extracting React components from large files with props-driven state management.

---

## When to Use

- File exceeds 300 lines with multiple visual sections
- Component has self-contained sections that could be reusable
- Parallel frontend/backend development (mock-first approach)
- Need to improve testability of specific UI sections

---

## 5-Step Protocol

### Step 1: Identify Extraction Candidates

Look for:
- Self-contained visual sections (cards, panels, grids)
- Repeated patterns (list items, form sections)
- Sections with distinct responsibilities
- Code that could be tested independently

**Questions to ask:**
- Does this section have clear boundaries?
- Does it have its own state that could be passed as props?
- Would extracting it improve readability?

### Step 2: Define Interface First

Create the TypeScript interface BEFORE writing the component:

```typescript
interface AgentActivityProps {
  /** Number of agents that have completed analysis (0-100) */
  activeCount: number;
  /** Current analysis state for determining visibility */
  state: "analyzing" | "generating" | "complete" | string;
  /** Optional: Show which agent is currently active */
  currentAgent?: string;
  /** Optional: Time saved calculation */
  timeSaved?: string;
}
```

**Rules:**
- Document each prop with JSDoc comments
- Use union types for state props
- Mark optional props explicitly
- Keep props minimal - only what the component needs

### Step 3: Include Mock Data in Component

Add fallback mock data so component works standalone:

```typescript
// Mock data fallback in component (not parent)
const MOCK_FINDINGS: Record<string, ResearchFindings> = {
  electronics: { bestPractices: [...], lightingTechniques: [...] },
  fashion: { ... },
  default: { ... },
};

export function ResearchPanel({ industry, findings, state }: ResearchPanelProps) {
  // Use provided data or fallback to mock
  const data = findings || MOCK_FINDINGS[industry] || MOCK_FINDINGS.default;

  // ...rest of component
}
```

**Benefits:**
- Component testable without backend
- Demo-ready immediately
- Self-documenting expected data structure
- Smooth SSE integration later (just pass real data)

### Step 4: Replace Inline Code with Import

In parent component:

```typescript
// Before: 150 lines of inline agent grid code

// After: Clean import + usage
import { AgentActivity } from "./agent-activity";

// In render:
<AgentActivity
  activeCount={data.agentCount || 0}
  state={state}
  currentAgent={state === "analyzing" ? "CMO Brand Analysis" : undefined}
  timeSaved={state === "complete" ? "11.5 hrs" : undefined}
/>
```

**State management pattern:**
- Parent owns state (`useState`)
- Parent computes derived values
- Child receives via props only
- No prop drilling beyond 1 level

### Step 5: Validate Immediately

After EACH extraction (not after all):

```bash
pnpm lint && pnpm type-check && pnpm build
```

**Why after each:**
- Catch unused variable warnings immediately
- Identify import issues early
- Prevents accumulating errors
- Easier to pinpoint issues

---

## Mock Data Patterns

### Industry-Specific Fallbacks

```typescript
const MOCK_DATA: Record<string, DataType> = {
  electronics: { /* electronics-specific */ },
  fashion: { /* fashion-specific */ },
  default: { /* generic fallback */ },
};

// Usage
const data = props.data || MOCK_DATA[props.category] || MOCK_DATA.default;
```

### Tier Hierarchies (Agent Swarms)

```typescript
const AGENT_TIERS = {
  csuite: { count: 8, label: "C-Suite", color: "bg-orange-500" },
  vp: { count: 16, label: "VPs", color: "bg-amber-500" },
  director: { count: 24, label: "Directors", color: "bg-yellow-500" },
  specialist: { count: 52, label: "Specialists", color: "bg-emerald-500" },
} as const;
```

### Loading States

```typescript
if (isLoading) {
  return <LoadingSkeleton />;
}

if (!data && state === "idle") {
  return null; // Don't show until relevant
}
```

---

## Common Pitfalls

### 1. State in Child Component

**Wrong:**
```typescript
function ChildComponent({ initialCount }) {
  const [count, setCount] = useState(initialCount); // Creates separate state
}
```

**Right:**
```typescript
function ChildComponent({ count, onCountChange }) {
  // Uses parent's state via props
}
```

### 2. Missing Visibility Control

**Wrong:**
```typescript
function AgentPanel({ data }) {
  return <div>...</div>; // Always renders
}
```

**Right:**
```typescript
function AgentPanel({ data, state }) {
  const isVisible = state === "analyzing" || state === "complete";
  if (!isVisible) return null;
  return <div>...</div>;
}
```

### 3. Overly Complex Props

**Wrong:**
```typescript
interface Props {
  data: ComplexNestedType;
  callbacks: { onA: () => void; onB: () => void; onC: () => void };
}
```

**Right:**
```typescript
interface Props {
  // Only what this component actually needs
  count: number;
  state: string;
  onComplete?: () => void;
}
```

---

## File Size Guidelines

| Component Type | Target | Max |
|----------------|--------|-----|
| Simple display | <100 lines | 150 |
| With interactions | <200 lines | 300 |
| Complex with mock data | <300 lines | 400 |

**If approaching 400 lines:** Consider sub-component extraction.

---

## Integration with Backend (Later)

When SSE/API ready, integration is simple:

```typescript
// Before (mock data)
<ResearchPanel
  industry={data.industry}
  state={state}
  isLoading={state === "researching"}
  // findings prop not passed - uses mock
/>

// After (real data)
<ResearchPanel
  industry={data.industry}
  state={state}
  isLoading={state === "researching"}
  findings={sseData.research} // Now passed from SSE
/>
```

Mock data becomes fallback for error states.

---

## Checklist

Before extraction:
- [ ] Identified clear component boundaries
- [ ] Designed props interface with JSDoc
- [ ] Planned mock data structure

During extraction:
- [ ] Created component file with "use client"
- [ ] Added mock data fallbacks
- [ ] Replaced inline code with import
- [ ] Ran lint + type-check + build

After extraction:
- [ ] Parent file reduced in size
- [ ] Component works standalone (with mocks)
- [ ] All validation passes

---

## Reference Implementation

See Phase 6 Style Transfer components:
- `dyniq-app/apps/demo/src/components/style/agent-activity.tsx` (191 lines)
- `dyniq-app/apps/demo/src/components/style/research-panel.tsx` (341 lines)

---

*Pattern established: Phase 6 Frontend Demo Tasks 6.3-6.4 (2026-02-03)*
*System Review: `.agents/logs/system-reviews/phase6-frontend-tasks-6.3-6.4-review-2026-02-03.md`*
