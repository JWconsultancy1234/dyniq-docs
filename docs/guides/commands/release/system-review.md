---
description: "Analyze implementation against plan for process improvements"
argument-hint: [plan-path] [execution-report-path]
---

# System Review

## Purpose

**Meta-level analysis** - You're not looking for bugs in the code, you're looking for bugs in the process.

**Your job:**
- Analyze plan adherence and divergence patterns
- Identify justified vs problematic divergences
- Surface process improvements
- Update Layer 1 assets (CLAUDE.md, commands, agents)

---

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Plan | $1 or auto-detect from `` | Yes |
| Execution Report | $2 or auto-detect from `.agents/logs/execution-reports/` | Yes |

### Auto-Detection

If args not provided:
```bash
# Find most recent execution report
ls -t .agents/logs/execution-reports/*.md | head -1

# Extract plan path from report
grep "^**Plan:**" [report] | cut -d' ' -f2
```

---

## Analysis Workflow (Parallel)

### Launch 3 Parallel Analysis Streams

```
Stream 1: Divergence Analysis
          - Extract divergences from report
          - Classify each as good/bad
          - Trace root causes

Stream 2: Pattern Detection
          - Compare to previous reviews
          - Identify repeated issues
          - Flag automation opportunities

Stream 3: Asset Impact Analysis
          - What CLAUDE.md updates needed
          - What command updates needed
          - What agent updates needed
```

---

## Analysis Steps

**Complete templates and frameworks:** @system-review-templates.md

**Quick summary:**
1. **Divergence Classification** - Good (justified) vs Bad (problematic)
2. **Root Cause Analysis** - Trace why divergence happened
3. **Pattern Detection** - Check for repeated issues (3+ = create automation)
4. **Asset Updates** - Update CLAUDE.md, commands, reference docs, agents

---

## Output Template

**See:** @system-review-templates.md for full output template

**Save to:** `.agents/logs/system-reviews/[feature-name]-review-YYYY-MM-DD.md`

**Includes:**
- Alignment Score (1-10)
- Divergence Analysis
- Pattern Detection
- Asset Update Suggestions
- Key Learnings
- P0/P1/P2 Action Items
- EA Integration Points

---

## Self-Improvement Loop

```
/plan-feature → /execute → /execution-report → /system-review
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                      Update Assets    /optimize
                                              │               │
                                              └───────┬───────┘
                                                      ▼
                                              Better Next Cycle
```

---

## Integration Points

| After System Review | Do |
|---------------------|-----|
| P0 action items | Apply immediately |
| Command suggestions | Run `/optimize commands` |
| Agent suggestions | Run `/optimize agents` |
| Pattern detected 3x | Create new command |

---

## P0 Verification Gate (MANDATORY)

**Pattern detected 3x (2026-01-23, 2026-01-30, 2026-02-04):** Fixes documented in reviews but never applied to production.

**BEFORE closing any system review:**

1. **List P0 Items:** Extract all P0 action items from review
2. **Verify Applied:** For each P0 item:
   - Code fix? → Show commit SHA
   - Config fix? → Show `curl` or `grep` proof from production
   - Doc fix? → Show file updated
3. **Check Previous Reviews:** Search last 3 reviews for unresolved P0s
   ```bash
   grep -l "P0\|🚨" .agents/logs/system-reviews/*.md | tail -3 | xargs grep -A5 "P0"
   ```
4. **Block if Unverified:** Do NOT close review until all P0s have proof

**Incident (2026-02-04):** Caddy routing fix documented 2026-01-30 was never applied. Issue recurred 5 days later.

---

## Important Guidelines

- **Be specific:** Don't say "plan unclear" - say "plan didn't specify webhook path"
- **Focus on patterns:** One-off issues aren't actionable
- **Action-oriented:** Every finding needs concrete fix
- **Actually update:** Don't just suggest - provide exact text

---

*Each review makes the system smarter. Run after every feature.*
