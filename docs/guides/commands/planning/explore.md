---
description: "Exploration mode for discovery and decision-making"
argument-hint: [topic]
---

# Explore: $ARGUMENTS

## Purpose

Use for **discovery and decision-making sessions**:
- Evaluating new frameworks or tools
- Making architectural decisions
- Research before planning
- Comparing approaches

**Not for:** Known implementation tasks (use `/plan-feature`) or quick fixes (use `/quick-fix`).

---

## vs /context-gather

| Aspect | /explore | /context-gather |
|--------|----------|-----------------|
| **Goal** | Make a decision | Gather context for decided work |
| **Question** | "Should we? How?" | "We're doing this, what do we need?" |
| **Output** | Recommendation | Context summary file |
| **Scope** | Single decision/evaluation | Multi-repo comprehensive scan |
| **Use when** | Uncertain about approach | Approach decided, need full picture |

**Example:** "/explore" to decide if MoltBot is worth adopting. "/context-gather" to gather all context before building the MoltBot integration.

---

## Process

### 1. Context Gathering (~5 min)

**What do we know?**
- Existing relevant code/patterns
- Related past decisions
- User's initial understanding

**What don't we know?**
- Technical feasibility
- Integration points
- Tradeoffs

### 2. Research (if needed)

Use Context7 for external docs:
```bash
# Example
mcp__plugin_context7_context7__resolve-library-id [framework-name]
mcp__plugin_context7_context7__query-docs [library-id] [question]
```

Use WebFetch for specific resources:
```bash
WebFetch [url] [prompt]
```

**AI Model Research (Critical):**

When researching AI capabilities, always verify:
- Input modalities (text, image, video, audio)
- Output modalities (text, image, video) - **these often differ!**
- Pricing per unit (token, image, second of video)
- Rate limits and quotas

**Example gotcha:** Gemini 3 Pro can ANALYZE video but CANNOT GENERATE video. Don't assume multimodal = all modalities both ways.

### 3. Question Rounds (max 3)

Ask clarifying questions using AskUserQuestion:
- Round 1: High-level requirements
- Round 2: Specific preferences
- Round 3: Edge cases (if needed)

**Stop after 3 rounds** - If still unclear, document unknowns and proceed with recommendation.

### 4. Decision Checkpoints

**Pause and confirm at these points:**

1. **Scope expansion** - Before creating deliverables for newly-discovered opportunities:
   - "Should I create [X] now or note it for later?"

2. **Reference vs request** - When user shares examples or templates:
   - "Is this a request to create similar content, or reference material?"

3. **Architectural choices** - Before recommending changes to existing tools:
   - Present "keep current" as Option A
   - Wait for user selection before detailing chosen path

### 5. Options Analysis

Present 2-4 options with clear tradeoffs:

| Option | Pros | Cons | Effort |
|--------|------|------|--------|
| A (Keep Current) | ... | ... | None |
| B | ... | ... | S/M/L |
| C | ... | ... | S/M/L |

**Always include "keep current" or "do nothing" as valid option.**

### 6. Recommendation

Provide clear recommendation with rationale:
- Why this option?
- What are the risks?
- What's the next step?

---

## Output

Depending on outcome:

| Result | Save to | Next Command |
|--------|---------|--------------|
| Build it | `features/PRD-[topic].md` | `/plan-feature` |
| Decision made | `.agents/decisions/[topic].md` | Document only |
| Don't build | No file | Explain why |

### Post-Creation Checklist

If exploration leads to implementation:

- [ ] Update CLAUDE.md if creating new command or route
- [ ] Run `/validate` to ensure no breaks
- [ ] Consider if this pattern should be documented

---

## Freedom Filter Check

Even exploration should pass the filter:

| Question | Must Answer |
|----------|-------------|
| Path alignment | A / B / Infrastructure / Neither |
| €72+/hr potential | Yes / No / Unknown |
| Could be delegated | Yes / No |

If **Neither** path and **No** value → Recommend cutting exploration short.

---

## Examples

### Good Use Cases

- "Should we use BMAD-METHOD or build our own?"
- "What's the best approach for real-time notifications?"
- "How should we structure the delegation system?"

### Bad Use Cases (Use Other Commands)

- "Fix the typo in login page" → `/quick-fix`
- "Add dark mode toggle" → `/plan-feature --level=1`
- "Create SOP for invoicing" → `/write-sop`
- "Optimize this EPIC" → `/c-suite-review` (4 parallel agents)

---

## Auto-Suggest: PRD Audit Mode

**When exploring a PRD file**, automatically suggest industry comparison:

```
Detected: PRD file (features/PRD-*.md)

Suggestion: Run PRD audit against industry standards.
   - 3 parallel agents (Claude Code docs, industry patterns, current state)
   - Checks: orchestration pattern, memory design, delegation, prompt quality, anti-patterns
   - Output: scorecard + specific optimizations
   - Reference: agent-quality-audit.md for prompt standards

Proceed with industry audit? [Recommended] or continue manual exploration?
```

**Trigger conditions:**
- File path matches `features/PRD-*.md`
- User mentions "optimize", "review", "industry standard", or "best practice"

**Proven value (2026-02-05):** PRD-agent-teams-world-class scored 7.3/10 before audit, 9/10 after. 10 specific optimizations identified in ~30 min.

---

## Auto-Suggest: C-Suite Review for EPICs

**When exploring an EPIC file**, automatically suggest C-Suite review:

```
Detected: EPIC file (epics/*.md)

💡 Suggestion: Use `/c-suite-review` for comprehensive EPIC optimization.
   - 4 parallel agents (CTO, CFO, COO, Data)
   - ~90 seconds vs 30+ min manual review
   - Architecture + ROI + Operations + Observability

Proceed with /c-suite-review? [Recommended] or continue manual exploration?
```

**Trigger conditions:**
- File path contains `epics/`
- File name starts with `EPIC-`
- User mentions "optimize", "review", or "improve" with EPIC

---

## Session Flow

```
/explore [topic]
    │
    ├── Research + Questions (max 3 rounds)
    │
    ├── Options Analysis
    │
    └── Decision
        │
        ├── Build → /create-prd or /plan-feature
        ├── Document → .agents/decisions/
        └── Cut → Explain rationale, move on
```

---

## Auto-Suggest: Parallel Agents for Large Audits

**When exploring 10+ files**, automatically suggest parallel agent scan:

```
Detected: Search/audit scope includes 10+ files

💡 Suggestion: Use parallel Task agents for comprehensive analysis.
   - Launch 3-5 agents across different aspects/repos
   - ~90 seconds vs 15+ min sequential search
   - Prevents shallow initial analysis pattern

Launch parallel agents? [Recommended] or continue sequential exploration?
```

**Trigger conditions:**
- Glob/Grep returns 10+ file matches
- User mentions "audit", "all", "deep dive", or "comprehensive"
- Cross-repo exploration detected

**Agent distribution pattern:**
- Agent 1: Search repo A (e.g., walker-os planning docs)
- Agent 2: Search repo B (e.g., dyniq-ai-agents code)
- Agent 3: Search repo C (e.g., infrastructure/config)
- Agent 4: Cross-reference check across all

**Incident (2026-02-01):** Initial shallow analysis missed R&D completion and Vision EPIC overlap. 3 parallel agents found all 130+ relevant files in ~90s.

**Pattern detected:** 21+ system reviews mention shallow search pattern. Automation threshold exceeded.
