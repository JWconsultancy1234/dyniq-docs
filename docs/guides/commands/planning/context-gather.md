---
description: "Systematic context gathering for multi-repo or complex work"
argument-hint: [project-name]
---

# Context Gather: $ARGUMENTS

## Purpose

Systematically gather context before planning or implementation. Prevents "sloppiness" by ensuring ALL relevant repos and business context are captured.

**Use before:**
- PRD creation
- Architecture design
- Multi-repo feature work
- Any work spanning 2+ repos

---

## vs /explore

| Aspect | /context-gather | /explore |
|--------|-----------------|----------|
| **Goal** | Gather context for decided work | Make a decision |
| **Question** | "We're doing this, what do we need?" | "Should we? How?" |
| **Output** | Context summary file | Recommendation |
| **Scope** | Multi-repo comprehensive scan | Single decision/evaluation |
| **Use when** | Approach decided, need full picture | Uncertain about approach |

**Example:** "/context-gather" to gather all context before building MoltBot integration. "/explore" to decide if MoltBot is worth adopting.

---

## Step 1: Identify Related Repos

For DYNIQ projects, scan these repos (in parallel):

| Repo | Path | Focus |
|------|------|-------|
| walker-os | `/Users/walker/Desktop/Code/walker-os` | Commands, timeblock, reference |
| dyniq-app | `/Users/walker/Desktop/Code/dyniq-app` | Business docs, landing, templates |
| dyniq-ai-agents | `/Users/walker/Desktop/Code/dyniq-ai-agents` | Ruben Voice AI |
| dyniq-n8n | `/Users/walker/Desktop/Code/dyniq-n8n` | Automation workflows |
| dyniq-crm | `/Users/walker/Desktop/Code/dyniq-crm` | NocoDB CRM |
| bolscout-app | `/Users/walker/Desktop/Code/bolscout-app` | BolScout (Path A) |

**Launch parallel Task agents:**
```
Task 1: "Scan [repo] for [relevant docs/code]. Focus on [specific area]."
Task 2: "Scan [repo] for [relevant docs/code]. Focus on [specific area]."
...
```

---

## Step 2: Business Docs First

Read in this order (do NOT skip):

1. **Business plan** - Revenue model, targets
2. **Pricing architecture** - Tiers, unit economics
3. **GTM playbook** - Market, ICP, sales process
4. **SOPs** - Operational procedures
5. **THEN** technical documentation

**Why:** Technical complexity ≠ business priority. The most documented component may be a cross-sell, not the core product.

---

## Step 3: User Context Questions

Ask the user (don't assume):

### Customer Pipeline
- "Do you have existing customers or beta users?"
- "What's your current revenue/MRR?"
- "Any deals in progress?"

### Constraints
- "Timeline pressures?"
- "Budget constraints?"
- "Technical limitations?"
- "Dependencies on third parties?"

### Priorities
- "What's the ONE thing that matters most right now?"
- "What would make you say 'this session was worth it'?"

### Security Constraints (For External Integrations)

If the feature involves external systems, explicitly confirm:

**Communication:**
- "Should the system send emails automatically, or create drafts for you to review?"
- "Should the system post to social media automatically, or create drafts?"

**Data Operations:**
- "Should the system be able to delete data, or only soft-delete/archive?"
- "Should the system modify production data, or read-only?"

**Default:** If user hasn't specified, default to most restrictive (draft-only, read-only, confirm-first)

---

## Step 4: Create Context Summary

Output a single context file:

**Path:** `_output/context/[project]-context-YYYY-MM-DD.md`

### Template:

```markdown
# [Project] Context Summary

**Generated:** YYYY-MM-DD
**Repos Scanned:** [list]
**Business Docs Read:** [list]

---

## Business Model

| Component | Type | Price |
|-----------|------|-------|
| [Product 1] | Core | €X/mo |
| [Product 2] | Cross-sell | €Y/mo |

## Current State

- MRR: €X
- Customers: X (Y paying, Z beta)
- Pipeline: [description]

## Key Constraints

- Timeline: [deadline if any]
- Technical: [limitations]
- External: [dependencies]

## Repos Summary

### [repo-name]
- Key files: [list]
- Status: [working/in-progress/planned]
- Relevant for: [what this work needs from it]

## Next Steps

Based on this context, the recommended approach is:
1. [step]
2. [step]

---

*This context file should be referenced by PRD, architecture, and planning work.*
```

---

## Step 5: Auto-Sync Check (Post-Context)

**After creating context file, verify document consistency:**

### EPIC vs PRIORITY-MASTER-LIST Check

```bash
# Extract P0 EPIC info from PRIORITY-MASTER-LIST
grep -A20 "## 🚨 P0:" PRIORITY-MASTER-LIST.md | head -25

# Compare to actual EPIC
head -60 epics/EPIC-*.md | grep -E "Timeline:|Hours:|Status:"
```

**If inconsistencies found:**
1. Flag immediately: "⚠️ EPIC and PRIORITY-MASTER-LIST are out of sync"
2. Show specific differences (timeline, hours, sprint status)
3. Update PRIORITY-MASTER-LIST as part of this session

**Why this matters:** Pattern detected 5+ times - EPIC updates without PRIORITY-MASTER-LIST sync causes next session to start with outdated information.

---

## Quality Criteria

- [ ] All related repos scanned (not just the obvious ones)
- [ ] Business docs read BEFORE technical docs
- [ ] User asked about customers/pipeline
- [ ] Single context file created for next steps
- [ ] No assumptions about business model without verification
- [ ] **EPIC ↔ PRIORITY-MASTER-LIST consistency verified**

---

## Anti-Patterns (Avoid)

- **Partial scanning** - Missing a repo means missing context
- **Technical-first** - Reading code before business docs
- **Assumption-based** - Guessing customer pipeline instead of asking
- **No summary** - Gathering context without creating reusable output

---

*This command prevents the "you are sloppy" feedback by ensuring systematic context gathering.*
