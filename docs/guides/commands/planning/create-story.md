---
description: "Create user story from epic or PRD"
argument-hint: "[epic-name] [story-title]"
---

# Create Story: $ARGUMENTS

## Purpose

Generate user story file from epic or PRD with proper numbering and tracking.

**Use for:**
- Breaking down epics into manageable stories
- Creating sprint-sized work items
- Tracking implementation progress

---

## Prerequisites

- [ ] Epic or PRD exists in `epics/` or `features/`
- [ ] Story title is clear and actionable
- [ ] Acceptance criteria understood

---

## Process

### 1. Find Parent Epic/PRD

```bash
# Auto-detect epic
ls epics/EPIC-$1.md
# Or PRD
ls features/PRD-$1.md
```

### 2. Determine Story Number

```bash
# Count existing stories for this epic
ls stories/STORY-$1-*.md 2>/dev/null | wc -l
# Next number = count + 1
```

### 3. Generate Story File

**Path:** `stories/STORY-{epic}-{num}.md`

**Template:**

```markdown
# User Story: {title}

**Epic:** {epic-name}
**Story ID:** STORY-{epic}-{num}
**Created:** YYYY-MM-DD
**Status:** ⬜ TODO

---

## User Story

**As a** [persona]
**I want** [capability]
**So that** [benefit]

---

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Technical Notes

### Implementation Approach

[High-level approach]

### Files to Change

| File | Change Type | Notes |
|------|-------------|-------|
| [path] | Add/Modify/Delete | [what] |

### Dependencies

- [ ] Dependency 1
- [ ] Dependency 2

---

## Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Validated with `/validate`
- [ ] Committed with `/commit`

---

## Related Work

- **Epic:** `epics/EPIC-{epic}.md`
- **PRD:** `features/PRD-{epic}.md` (if applicable)

---

*Story created: YYYY-MM-DD*
```

---

## Story Numbering Convention

| Pattern | Example | Use |
|---------|---------|-----|
| `STORY-{epic}-{num}` | STORY-board-meeting-01 | Standard stories |
| `STORY-{prd}-{num}` | STORY-social-media-01 | Stories from PRD |

**Auto-increment:** Find highest number in `stories/STORY-{epic}-*.md` and add 1

---

## Update Epic/PRD Status

After creating story, update parent epic:

```markdown
## Stories

- [ ] STORY-{epic}-01: {title} - Status: ⬜ TODO
- [ ] STORY-{epic}-02: {title} - Status: ⬜ TODO
```

---

## Quality Criteria

- [ ] Story follows "As a/I want/So that" format
- [ ] Acceptance criteria are testable
- [ ] Story is sprint-sized (can complete in 1-3 days)
- [ ] Dependencies identified
- [ ] Related epic/PRD linked

---

## Integration with Other Commands

| After Creating Story | Run This |
|----------------------|----------|
| Story created | `/plan-feature STORY-{epic}-{num}` for detailed plan |
| Ready to implement | `/execute STORY-{epic}-{num}` |
| Story completed | Update epic with ✅, move story to `done/` |

---

## Batch Generation Mode

**When auto-invoked for multiple stories:**

### Usage
```bash
/create-story --batch --epic-id={epic} --count={n}
```

### Parameters
- `--batch`: Flag for batch generation
- `--epic-id`: Epic identifier
- `--count`: Number of stories to generate

### Batch Generation Flow
1. **Read epic file** and PBS (Product Breakdown Structure)
2. **For each PBS deliverable:**
   - Generate story file with auto-incremented numbering
   - Extract acceptance criteria from PBS
   - Map dependencies
3. **Update epic file** with story references
4. **Create automation events** (optional, for sprint planning)

### Example
```bash
# Generate 5 stories from epic PBS
/create-story --batch --epic-id=board-meeting --count=5

# Output:
# - STORY-board-meeting-01.md
# - STORY-board-meeting-02.md
# - STORY-board-meeting-03.md
# - STORY-board-meeting-04.md
# - STORY-board-meeting-05.md
```

### Automation Integration

**If triggered after `/sprint-planning`:**
- SM determines which deliverables go into sprint
- Auto-generate stories for selected deliverables
- Stories auto-numbered and linked to epic
- Notify Developer for `/plan-feature` approval

**Test mode:** If `AGENT_MODE=test`, generate stories but don't notify

---

## Examples

### Create Story from Epic

```bash
/create-story board-meeting "Phase 3 Database Integration"
# Creates: stories/STORY-board-meeting-04.md
```

### Create Story from PRD

```bash
/create-story social-media "LinkedIn Post Automation"
# Creates: stories/STORY-social-media-01.md
```

---

## Anti-Patterns

- **Too large** - Story should be completable in 1-3 days
- **Vague criteria** - "Works well" is not testable
- **No epic link** - Always link back to parent

---

*Stories are the unit of work. Keep them small, clear, and testable.*
