---
description: "Resume a timed-out board meeting using thread ID"
argument-hint: <thread_id>
---

# Resume Board Meeting

**Command:** `/resume-board-meeting {thread_id}`
**Owner:** CEO-WALKER
**Purpose:** Resume board meetings that timed out due to Cloudflare 100s limit

---

## Quick Reference

```bash
# Resume a timed-out meeting
/resume-board-meeting bm-89cb1480

# Check status only
/resume-board-meeting bm-89cb1480 --status-only
```

---

## Why This Command Exists

**Cloudflare enforces 100s timeout** on all proxied requests.

| Agent Count | Typical Duration | Timeout Risk |
|-------------|------------------|--------------|
| 6 (Level 0-1) | 30-60s | Low |
| 24 (Level 2) | 60-90s | Low |
| 43 (Level 4) | 134s | **HIGH** |
| 75 (Level 5) | 200s+ | **CERTAIN** |

**Incident (2026-01-30):** 43-agent swarm took 134s, causing Cloudflare 524 timeout.

---

## What It Does

### Step 1: Check Meeting Status

```bash
curl -s "https://agents-api.dyniq.ai/api/board-meeting/status/{thread_id}" \
  -H "X-API-Key: $AGENTS_API_KEY"
```

**Possible Responses:**

| Status | Meaning | Action |
|--------|---------|--------|
| `processing` | Still running | Wait and retry |
| `completed` | Finished successfully | Fetch result |
| `failed` | Error occurred | Check error message |
| `not_found` | Invalid thread ID | Verify ID |

### Step 2: Poll Until Complete (if processing)

```python
while status == "processing":
    sleep(15)  # Wait 15 seconds
    status = check_status(thread_id)
    print(f"Status: {status} ({elapsed}s)")
```

### Step 3: Fetch Result

```bash
curl -s "https://agents-api.dyniq.ai/api/board-meeting/result/{thread_id}" \
  -H "X-API-Key: $AGENTS_API_KEY"
```

### Step 4: Continue Planning Cycle

If called from `/full-planning-cycle`:
- Extract decision (ADOPT/EXPERIMENT/PASS/DEFER)
- Continue with Phase 2 (Create EPIC)

---

## Example Output

```
Resume Board Meeting: bm-89cb1480
=================================

1. Checking Status...
   Status: processing (elapsed: 45s)

2. Polling (every 15s)...
   [+60s] Status: processing
   [+75s] Status: processing
   [+90s] Status: completed ✅

3. Fetching Result...
   Decision: ADOPT
   Agents: 43 (39 ADOPT, 3 EXPERIMENT, 1 PASS)
   Confidence: HIGH
   Processing Time: 134s

4. Board Meeting Complete
   Thread: bm-89cb1480
   Ready for Phase 2: Create EPIC

✅ Board meeting resumed successfully
```

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `thread_id` | Yes | Thread ID from initial request (e.g., `bm-89cb1480`) |
| `--status-only` | No | Only check status, don't fetch result |
| `--timeout` | No | Max wait time in seconds (default: 300) |

---

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `not_found` | Invalid thread ID | Check original request logs |
| `failed` | Agent errors | Check Langfuse traces |
| Timeout exceeded | Unusually long processing | Retry with `--timeout 600` |

---

## Integration

**Called after:**
- `/board-meeting` times out with 524 error
- `/full-planning-cycle` Phase 1 timeout

**Continues to:**
- Phase 2: Create EPIC (if ADOPT/EXPERIMENT)
- Stop cycle (if PASS/DEFER)

---

## Finding Thread ID

If you lost the thread ID:

```bash
# Check Langfuse for recent board meetings
# Filter by: trace_name = "board_meeting"

# Or check n8n workflow logs if triggered via webhook
```

---

*Created: 2026-01-30 | Pattern: Cloudflare 524 timeout on Level 4+ meetings*
