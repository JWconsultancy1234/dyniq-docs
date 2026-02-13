---
title: "Agent Protocols"
sidebar_label: "Agent Protocols"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Agent Protocols

> Operational protocols for agent spawning, HITL, blocker resolution, and proactive work.

---

## Human-in-the-Loop Matrix

### Auto-Approve (No Human Required)

| Action | Reason |
|--------|--------|
| Read files | No side effects |
| Search codebase | No side effects |
| Fetch safe URLs | Read-only |
| Run tests | Validation only |
| Generate analysis | Read-only |
| Create plans/PRDs | Documentation only |

### Require Human Approval

| Action | Risk Level | Approval Type |
|--------|------------|---------------|
| Create 3+ new files | Medium | Confirm before proceeding |
| Delete any file | High | Explicit confirmation |
| Git push | High | Always confirm |
| Production deploy | Critical | Explicit confirmation |
| External API mutations | High | Confirm payload |
| Access credentials | Critical | Explain need |
| Modify database | Critical | Review changes |

---

## Agent Spawn Protocol

### 1. Assess Task

```markdown
## CEO WALKER: Task Assessment

**Request:** [What was asked]
**Complexity:** [0/1/2]
**Path Alignment:** [A/B/Infrastructure]
**Data Available:** [Yes/No - what data needed]
```

### 2. Dispatch Agents

| Agent | Focus | Priority | Dependencies |
|-------|-------|----------|--------------|
| Head of Data | Gather baseline metrics | P0 | None |
| COO | Define requirements | P0 | Head of Data |
| CTO | Design approach | P1 | COO |
| Developer | Implement | P1 | CTO |

### 3. Coordinate Execution

**Parallel Track 1:** Head of Data + COO
**Parallel Track 2:** CTO (after Track 1 checkpoint)
**Sequential:** Developer → Reviewer

**Checkpoints:**
1. After Data analysis → CTO starts
2. After Design approved → Developer starts
3. After Implementation → Reviewer validates
4. After Validation → CTO deploys

---

## Blocker Resolution Flow

```
Block Detected → 15 min: Self-solve attempt
  │
  └─ Still blocked? → Check if another agent can help
       │
       └─ 30 min: Parallel work on other tasks
            │
            └─ Still blocked? → Escalate to CEO WALKER
                                    │
                                    └─ Decision: Pivot / Defer / Cut
```

---

## Proactive Work Protocol

**Pattern:** When user mentions need for work during conversation, treat as implicit approval to execute if time and context permit.

### When to Be Proactive

| User Signal | Agent Response |
|-------------|----------------|
| "We should do X" | Add to task list OR execute now if simple |
| "Need to Y" | Assess urgency, execute if high-value |
| "I think Z would help" | Analyze value, propose OR execute |

### Execution Criteria

Execute immediately if ALL of:
1. **Clear intent:** User expressed specific need
2. **High value:** Saves >15 min OR prevents future errors
3. **Low risk:** No destructive actions, easily reversible
4. **Time available:** Within current timeblock scope
5. **Context loaded:** All required information gathered

**GOOD proactive work:** Audits, verification scripts, documentation templates
**BAD proactive work:** Vague "maybe", new research, destructive changes

### Documentation

Label as "Bonus Work" or "Proactive", justify value, track separately, get feedback.

---

## Data Validation Checkpoints

### Before Any Feature

```markdown
## Data Validation: [Feature Name]

**Questions:**
1. What data supports this need?
2. How will we measure success?
3. What's the baseline metric?
4. What's the target metric?

**Head of Data Sign-off:** [Yes/No]
```

### Before Deployment

```markdown
## Pre-Deploy Data Check

**Error Rate Baseline:** [X%]
**Performance Baseline:** [Xms]
**Monitoring in Place:** [Yes/No]
**Rollback Criteria Defined:** [Yes/No]
```

---

## C-Suite EPIC Review (Level 2 - 4 Agents Parallel)

**Agents:** CTO (feasibility), CFO (ROI), COO (implementation order), Data (observability)

**Flow:** Launch 4 parallel Task agents → Complete in ~90s → Synthesize → Update EPIC → Commit

**Permission Note:** Background agents cannot access files from other repos. Pre-read required files first.

---

*Reference doc for agent protocols. Parent: @agent-orchestration.md*
