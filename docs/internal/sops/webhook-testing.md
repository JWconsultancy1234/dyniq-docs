---
title: "SOP: Webhook Integration Testing"
sidebar_label: "SOP: Webhook Integration Testing"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: Webhook Integration Testing

**Created:** 2026-01-19

---

## Overview

Step-by-step procedure for testing webhook-based integrations (Voiceflow → n8n → downstream services).

---

## Pre-Test Checklist

- [ ] Webhook URL confirmed active
- [ ] API keys/credentials accessible
- [ ] Downstream services running (Supabase, NocoDB, etc.)
- [ ] Telegram/notification channel available for verification

---

## Test Procedure

### Step 1: Direct Webhook Test (5 min)

Test the webhook endpoint directly, bypassing the source system:

```bash
curl -X POST "https://automation.dyniq.ai/webhook/voiceflow-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+31612345678",
    "company": "Test Company",
    "lead_score": "85",
    "callback_time": "morgen om 14u",
    "industry": "installateur"
  }'
```

**Expected:** JSON response with `success: true`

**If 404:** Workflow not active → activate via API or UI

### Step 2: Verify Execution (2 min)

```bash
N8N_KEY="your-key"
WORKFLOW_ID="DP0wfYBh8SJK33Ue"

curl -s "https://automation.dyniq.ai/api/v1/executions?workflowId=$WORKFLOW_ID&limit=1" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
e=d.get('data',[])[0] if d.get('data') else {}
print(f'Status: {e.get(\"status\")}')
print(f'Time: {e.get(\"stoppedAt\",\"\")[:19]}')"
```

**Expected:** `Status: success`

### Step 3: Check Node Statuses (3 min)

```bash
EXEC_ID="latest-execution-id"

curl -s "https://automation.dyniq.ai/api/v1/executions/$EXEC_ID?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
data = d.get('data', {}).get('resultData', {}).get('runData', {})
for node, runs in data.items():
    if runs:
        status = runs[0].get('executionStatus', 'unknown')
        print(f'{node}: {status}')"
```

**Expected:** All nodes show `success`

### Step 4: Verify Downstream Storage (5 min)

#### NocoDB
```bash
NOCODB_KEY="your-key"
TABLE_ID="mo6zko3dzsu1xrk"

curl -s "https://crm.dyniq.ai/api/v2/tables/$TABLE_ID/records?limit=1&sort=-CreatedAt" \
  -H "xc-token: $NOCODB_KEY" | python3 -m json.tool | head -30
```

#### Supabase
```bash
SUPABASE_KEY="your-key"

curl -s "https://ahseakobsxrtzkikbtxi.supabase.co/rest/v1/leads?select=*&order=created_at.desc&limit=1" \
  -H "apikey: $SUPABASE_KEY" | python3 -m json.tool
```

### Step 5: Verify Notifications (1 min)

Check Telegram for the notification card with:
- Lead name and score
- AI-generated sales briefing
- Contact details

---

## Test Data Templates

### Minimal Test
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "phone": "+31600000000",
  "lead_score": "50"
}
```

### Full Test (with booking)
```json
{
  "name": "Full Test User",
  "email": "fulltest@test.com",
  "phone": "+31612345678",
  "company": "Test BV",
  "lead_score": "85",
  "callback_time": "morgen om 14u",
  "industry": "installateur",
  "location": "Amsterdam",
  "urgency": "urgent",
  "pain_points": "needs automation",
  "buying_signals": "ready to buy"
}
```

### Edge Cases to Test
- Missing optional fields
- Non-Dutch phone format
- No callback_time (should skip booking)
- Low score (should route differently)

---

## Troubleshooting

| Symptom | Likely Cause | Check |
|---------|--------------|-------|
| 404 on webhook | Workflow inactive | Activate via API |
| Execution fails | Node error | Get execution details |
| No Telegram | Credential issue | Check n8n credentials |
| No storage | API error in node | Check node output data |
| Wrong data | Webhook format mismatch | Use optional chaining |

---

## Webhook Format Compatibility

Handle both flat and nested JSON:

```javascript
// In n8n expressions
{{ $json.body?.name || $json.name || "Unknown" }}

// In Code nodes
const name = $json.body?.name || $json.name;
```

---

## Related SOPs

- `.agents/sops/n8n-debugging.md` - n8n workflow issues
- `.agents/sops/voiceflow-debugging.md` - Voiceflow issues

---

*Key lesson: Test webhook directly first to isolate source vs pipeline issues.*
