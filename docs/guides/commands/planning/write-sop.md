---
description: "Create a delegatable SOP for a recurring task"
argument-hint: "[task-name]"
---

# Write SOP: $ARGUMENTS

## Load Agent


## Process

### 1. DRIP Matrix Check

Before writing, verify this task belongs in Delegate/Replace quadrant:

| Question | Answer |
|----------|--------|
| Value per hour | < €72 or > €72? |
| Energy | Drains or Gives? |
| Frequency | How often? |
| Time per occurrence | How long? |

**If >€72/hr and gives energy → Don't delegate. Stop here.**

### 2. Gather Information

Ask user:
- What triggers this task?
- What are all the steps?
- What tools/logins are needed?
- What can go wrong?
- How do you know it's done correctly?

### 3. Write SOP

Create file at: `.agents/sops/$ARGUMENTS.md`

Use template from sop-writer agent.

### 4. Review with User

- Walk through each step
- Identify missing details
- Add screenshots if helpful
- Set owner and frequency

## Output

```markdown
## SOP Created

**File:** `.agents/sops/[task-name].md`
**Owner:** [Suggested owner]
**Frequency:** [How often]
**Est. Time Saved:** [X hours/month]

### Next Steps
1. Review SOP with [owner]
2. Do task together once (training)
3. Let them do it, you observe
4. Full handoff

### Delegation ROI
- Your time freed: X hours/month
- At €72/hr = €[X] saved
- Delegation cost: €[Y]/month
- Net gain: €[Z]/month
```

## Quick SOPs (Common Tasks)

If user says one of these, auto-suggest template:

| Task | Template |
|------|----------|
| "invoice" | Weekly invoice processing |
| "email" | Email inbox management |
| "calendar" | Calendar/scheduling management |
| "social" | Social media posting |
| "backup" | Data backup routine |
