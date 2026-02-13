---
title: "n8n Workflow Templates Reference"
sidebar_label: "n8n Workflow Templates Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# n8n Workflow Templates Reference

Templates and patterns for DYNIQ n8n automations.

---

## Lead Notification Flow

```
Webhook → Validate → Calculate Score → Save to Supabase → Route by Score → Notify
```

---

## Workflow JSON Structure

```json
{
  "name": "Lead Notification v1",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "lead-webhook",
        "responseMode": "onReceived"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.phone }}",
            "operation": "isNotEmpty"
          }]
        }
      },
      "name": "Validate Data",
      "type": "n8n-nodes-base.if"
    },
    {
      "parameters": {
        "functionCode": "const lead = items[0].json;\nlet score = 50;\nif (lead.urgency === 'dringend') score += 30;\nlead.score = Math.min(score, 100);\nreturn items;"
      },
      "name": "Calculate Score",
      "type": "n8n-nodes-base.function"
    }
  ]
}
```

---

## Daily Summary Template

```javascript
// Function node
const leads = items;
const summary = {
  total: leads.length,
  hot: leads.filter(l => l.json.score >= 80).length,
  warm: leads.filter(l => l.json.score >= 50 && l.json.score < 80).length,
  cold: leads.filter(l => l.json.score < 50).length
};
return [{ json: summary }];
```

**WhatsApp:**
```
📊 Dagelijks Overzicht
Gisteren: {{ total }} nieuwe leads
🔥 Hot: {{ hot }} | ⚡ Warm: {{ warm }} | ❄️ Cold: {{ cold }}
```

---

## Integration Credentials

| Service | Type |
|---------|------|
| Supabase | Service role API key |
| Twilio | Account SID + Token |
| SendGrid | API Key |

---

## Error Handling

```javascript
const maxRetries = 3;
const currentRetry = $item.retryCount || 0;

if (currentRetry < maxRetries) {
  $item.retryCount = currentRetry + 1;
  return $item;
} else {
  throw new Error('Max retries exceeded');
}
```

---

## Webhook Security

```javascript
const crypto = require('crypto');
const expected = crypto
  .createHmac('sha256', $env.WEBHOOK_SECRET)
  .update(JSON.stringify($input.first().body))
  .digest('hex');

if ($input.first().headers['x-signature'] !== expected) {
  throw new Error('Invalid signature');
}
```

---

## Quality Checklist

- [ ] All nodes connected
- [ ] Error handling configured
- [ ] Credentials referenced (not hardcoded)
- [ ] Webhook auth enabled
- [ ] Test with sample payload
- [ ] Retry logic in place

---

*Reference doc for /n8n-workflow command.*
