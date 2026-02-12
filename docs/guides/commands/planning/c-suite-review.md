---
description: "Parallel C-Suite agent review for EPICs and strategic documents"
argument-hint: "[epic-path]"
---

# C-Suite Review: $ARGUMENTS

## Purpose

Launch **4 parallel C-Suite agents** to comprehensively review and optimize an EPIC or strategic document.

**Use for:**
- EPIC optimization before implementation
- Strategic document review
- Multi-perspective analysis
- ROI validation

**Not for:** Quick fixes, single-perspective tasks, or research (use `/explore`).

---

## Process

### 1. Load Target Document

```bash
# Auto-detect if no argument provided
ls -t epics/*.md | head -1
```

Read the EPIC/document and identify key sections for review.

### 2. Pre-Grant Permissions (CRITICAL)

**Background agents cannot access cross-repo files.** Before launching:

```bash
# If EPIC references external repos, read key files first
# This grants permission for background agents
```

**Repos to check:**
- `dyniq-ai-agents/` - Agent infrastructure
- `dyniq-app/` - Landing, docs
- `bolscout-app/` - Path A product

### 3. Launch 4 Parallel C-Suite Agents

Use Task tool with `run_in_background=true` for parallel execution:

| Agent | Focus | Prompt Template |
|-------|-------|-----------------|
| **CTO** | Technical feasibility | "Review EPIC for architecture gaps, model selection, technical risks. Identify missing steps. Estimate accuracy." |
| **CFO** | Cost/ROI analysis | "Calculate detailed cost breakdown per stage. Validate ROI claims. Identify break-even point. Set budget thresholds." |
| **COO** | Implementation order | "Optimize task order for parallel execution. Identify dependencies and critical path. Add risk mitigation matrix." |
| **Data** | Observability & metrics | "Define Langfuse metrics. Create quality measurement taxonomy. Design feedback loop. Set baseline metrics." |

**Execution time:** ~90 seconds parallel (vs 30+ min sequential)

### 4. Synthesize Agent Outputs

After all 4 agents complete:

1. **Read each agent's output** using TaskOutput tool
2. **Identify conflicts** - Where agents disagree
3. **Merge recommendations** - Combine non-conflicting suggestions
4. **Resolve conflicts** - Use domain expertise (CFO wins on cost, CTO wins on tech)

### 5. Apply Changes to EPIC

Update the EPIC with:
- [ ] Architecture fixes (CTO)
- [ ] ROI validation section (CFO)
- [ ] Optimized implementation order (COO)
- [ ] Observability framework (Data)
- [ ] Updated estimates (all agents)

### 6. Generate Execution Report

Save to: `.agents/logs/execution-reports/[epic-name]-c-suite-review-YYYY-MM-DD.md`

Include:
- Agent contributions table
- Changes applied
- Conflicts resolved
- Updated estimates

---

## Agent Prompt Templates

### CTO Agent

```
You are the CTO reviewing this EPIC for technical feasibility.

EPIC: [paste EPIC content]

Analyze:
1. **Architecture gaps** - Missing steps, wrong model choices, integration issues
2. **Model selection** - Are the right AI models chosen for each task?
3. **Technical risks** - What could fail? What's underestimated?
4. **Estimate accuracy** - Is the time estimate realistic?

Output format:
- Architecture Issues: [list]
- Model Recommendations: [table]
- Risk Matrix: [table]
- Revised Estimate: [hours] (was: [original])
- Specific Changes: [list of exact edits to make]
```

### CFO Agent

```
You are the CFO validating the financial case for this EPIC.

EPIC: [paste EPIC content]

Analyze:
1. **Cost breakdown** - Per-stage costs (API calls, compute, etc.)
2. **ROI calculation** - Is the claimed ROI accurate?
3. **Break-even point** - How many uses to recover investment?
4. **Budget thresholds** - At what cost should we alert?

Output format:
- Cost Breakdown Table: [per stage]
- ROI Analysis: [calculation]
- Break-even: [X units/uses]
- Budget Thresholds: [table]
- Recommendation: APPROVE / REVISE / REJECT
```

### COO Agent

```
You are the COO optimizing implementation order for this EPIC.

EPIC: [paste EPIC content]

Analyze:
1. **Task dependencies** - What blocks what?
2. **Parallel opportunities** - What can run simultaneously?
3. **Critical path** - What's the minimum time?
4. **Risk mitigation** - What if key tasks fail?

Output format:
- Dependency Graph: [ASCII or description]
- Parallel Tracks: [numbered list]
- Critical Path: [hours]
- Risk Mitigation Matrix: [table]
- Optimized Order: [numbered steps]
```

### Data Agent

```
You are the Head of Data designing observability for this EPIC.

EPIC: [paste EPIC content]

Analyze:
1. **Metrics to track** - What KPIs measure success?
2. **Quality taxonomy** - How do we measure "good" output?
3. **Feedback loop** - How does the system learn?
4. **Baseline metrics** - What do we measure before launch?

Output format:
- Langfuse Metrics: [table with name, type, threshold]
- Quality Taxonomy: [categories with weights]
- Feedback Loop Design: [steps]
- Baseline Metrics: [table]
- Span Hierarchy: [tree structure]
```

---

## Output

| Result | Save to | Next |
|--------|---------|------|
| EPIC optimized | Update EPIC in place | `/commit` |
| Execution report | `.agents/logs/execution-reports/` | `/system-review` |

---

## Example Session

```
/c-suite-review epics/EPIC-vision-pipeline.md

1. Reading EPIC...
2. Pre-granting permissions for dyniq-ai-agents...
3. Launching 4 C-Suite agents in parallel...
   - CTO: Analyzing technical feasibility
   - CFO: Validating ROI
   - COO: Optimizing implementation order
   - Data: Designing observability
4. All agents complete (~90s)
5. Synthesizing outputs...
6. Applying changes to EPIC...
7. Generating execution report...

✅ EPIC optimized with C-Suite review
   - Architecture: +1 step (Mockup Interpreter)
   - ROI: Validated 20,000%+
   - Order: 4 parallel tracks identified
   - Observability: 8 Langfuse metrics added
   - Estimate: 5h → 8h (realistic)
```

---

## Permission Handling

**If agents get blocked:**

```
Agent blocked on: /Users/walker/Desktop/Code/dyniq-ai-agents/...
```

**Fix:** Cancel blocked agent, read the file from main session, then re-run.

**Prevention:** Always pre-read critical external files before launching agents.

---

## Freedom Filter

| Question | Must Answer |
|----------|-------------|
| Path alignment | A / B / Both / Infrastructure |
| €72+/hr potential | Yes (saves 2-4h per optimized EPIC) |
| Could be delegated | No - requires agent orchestration |

---

## Reference

- Pattern documentation: `agent-orchestration.md`
- Example review: `.agents/logs/system-reviews/vision-pipeline-c-suite-optimization-review-2026-01-30.md`

---

*"4 perspectives, 90 seconds, comprehensive analysis."*
