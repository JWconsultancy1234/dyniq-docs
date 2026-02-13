---
title: "Plan Feature Procedures Reference"
sidebar_label: "Plan Feature Procedures Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Plan Feature Procedures Reference

Detailed procedures and templates for `/plan-feature` command.

---

## Walker-OS Decision Filter (Level 2)

### 1. BUY BACK TIME (€72/hr Threshold)
- €/hr value = revenue potential ÷ hours required
- Below €72/hr → Consider delegation

### 2. WHO NOT HOW
- Can someone else own this?
- Score: Values, Competence, Energy, Cost, Ownership (35/50 min)

### 3. PATH ALIGNMENT
- Path A (BolScout) or Path B (€10k/mo)?
- Neither → **STOP**

### 4. FREEDOM IMPACT
- Moves €10k/month needle?
- Creates recurring revenue?

**Output:**
```yaml
task: "[Description]"
evaluation:
  buyback_value: "€X/hr"
  who: "Walker Only" | "Delegate to [WHO]"
  path: "A" | "B" | "BOTH"
  freedom_impact: "high" | "medium" | "low"
final_decision: "PLAN" | "DELEGATE" | "REJECT"
```

---

## Level 0: Quick Fix Template

```markdown
## Quick Fix: [Title]

**Freedom Filter:** [Path] | [€72+/hr: Yes/No]
**File:** `path/to/file.ts:123`
**Change:** [One sentence]
**Test:** [How to verify]
```

---

## Level 1: Standard Template

```markdown
## Feature: [Title]

### Freedom Filter
- Path: [A/B/Infrastructure]
- €72+/hr Value: [Yes - why]

### Tasks
| # | Task | File | Size |
|---|------|------|------|
| 1 | [Description] | `path/file.ts` | S |

### Success Criteria
- [ ] [What must work]

### Validation
`pnpm lint && pnpm type-check && pnpm build`
```

---

## Level 2: Deep Plan Template

```markdown
# Feature: {name}

## Walker-OS Alignment
- **Path**: A / B / Both
- **Value**: €X/hr
- **Freedom Impact**: High / Medium / Low

## User Story
As a {user}, I want to {action}, so that {benefit}

## Files to Read BEFORE Implementing
- `path/file.py` (lines X-Y) - Why: {reason}

## Implementation Plan

### Phase 1: Foundation
- Tasks with validation

### Phase 2: Core Implementation
- Tasks with validation

### Phase 3: Testing
- Tasks with validation

### Phase 4: Documentation (Level 2 MANDATORY)
- Architecture doc with C4 diagrams
- SOP if new pattern

## Step-by-Step Tasks

### Task 1: {ACTION}
- **IMPLEMENT**: {detail}
- **PATTERN**: {file:line}
- **VALIDATE**: `{command}`

## Acceptance Criteria
- [ ] All validation passes
- [ ] Documentation complete
```

---

## Marketing Task Checks (MANDATORY)

- [ ] External tools listed
- [ ] API availability verified
- [ ] Assets verified
- [ ] Copy cascade checked: `grep -r "TEXT" --include="*.tsx" .`
- [ ] Time estimate 3x'd

**Quiz sanity:** Duration = questions × 12 seconds

---

## Multi-Repo Pre-Planning

- [ ] All repos scanned (parallel)
- [ ] Business docs read first
- [ ] Customer questions asked
- [ ] Constraints confirmed

---

## n8n Workflow Planning (MANDATORY for n8n features)

**Added 2026-01-29 after S5 HITL incident (15+ debugging iterations)**

### 1. Identify Correct API

| Use Case | API | Port |
|----------|-----|------|
| Voice calls, dispatch | ruben-api.dyniq.ai | 8080 |
| Content/HITL/Leads | agents-api.dyniq.ai | 8000 |

### 2. Data Flow Mapping (REQUIRED)

Before ANY n8n deployment, create this table:

```markdown
| Node | $json Contains | Notes |
|------|----------------|-------|
| Webhook | { body: { callback_query: {...} } } | Raw Telegram |
| Parse Callback | { decision: "edit", thread_id: "..." } | Parsed data |
| HTTP Request | { ok: true } | ⚠️ RESPONSE, not input! |
| Downstream IF | Use $('Parse Callback').item.json.X | NOT $json.X |
```

**Rule:** After ANY HTTP Request node, `$json` = response. Use `$('Node Name').item.json.field` for upstream data.

### 3. Credential Specification

Always document WHERE to get credentials:

```markdown
| Credential | Source | Retrieval |
|------------|--------|-----------|
| AGENTS_API_KEY | Contabo | `ssh contabo "grep AGENTS_API_KEY /opt/dyniq-voice/.env"` |
| N8N_API_KEY | dyniq-app | `grep N8N_API_KEY ~/Desktop/Code/dyniq-app/.env` |
```

### 4. Pre-Deploy Checklist

Reference: `n8n-gotchas.md` → "Pre-Deploy Checklist"

---

## Effort Estimation

| Size | Time | Description |
|------|------|-------------|
| XS | <15 min | Single line |
| S | 15-30 min | Single function |
| M | 30-60 min | Multiple functions |
| L | 1-2 hours | Multiple files |
| XL | 2+ hours | Use /create-prd |

---

*Reference doc for /plan-feature command.*
