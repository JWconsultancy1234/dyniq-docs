---
title: "n8n Integration Guide - FastAPI Lead Processing"
sidebar_label: "n8n Integration Guide - FastAPI Lead Processing"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [voice-ai, auto-synced]
---

# n8n Integration Guide - FastAPI Lead Processing

## Overview

This guide explains how to integrate the FastAPI `/api/process-lead` endpoint into the existing Quiz → Ruben Call workflow.

## Current Workflow Structure

```
ScoreApp Webhook → Format Lead Data → Qualified Lead? → Dispatch Ruben Agent
                                    ↓
                              Save to NocoDB, Supabase, Send Emails
```

## Updated Workflow Structure

```
ScoreApp Webhook → Format Lead Data → Process Lead (FastAPI) → Qualified Lead? → Dispatch Ruben Agent
                                                             ↓
                                                       Save to NocoDB, Supabase
```

---

## Step 1: Add HTTP Request Node "Process Lead (FastAPI)"

### Position
- **After:** "Format Lead Data"
- **Before:** "Qualified Lead?" (IF node)

### Configuration

**Method:** POST

**URL:** `https://agents-api.dyniq.ai/api/process-lead`

**Authentication:** None (internal network)

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "lead_id": "{{ $json.email }}",
  "company_name": "{{ $json.company || $json.fullName }}",
  "lead_name": "{{ $json.firstName }}",
  "quiz_score": {{ $json.totalScore }},
  "location": "{{ $json.q12_region || 'Belgium' }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.phone }}",
  "industry": "{{ $json.q13_work_type }}"
}
```

### Expected Response
```json
{
  "lead_id": "test@example.com",
  "tier": "HOT",
  "qualification_reason": "High quiz score + buying signals",
  "next_action": "call",
  "playbook_html": "<html>...</html>",
  "playbook_pdf_url": "https://ahseakobsxrtzkikbtxi.supabase.co/storage/v1/object/sign/...",
  "talking_points": ["Point 1", "Point 2"],
  "opening_hook": "Personalized opening line",
  "kbo_number": "0123.456.789",
  "processing_time_ms": 5432
}
```

---

## Step 2: Update "Qualified Lead?" IF Node

### Change the condition to use FastAPI response:

**Current:**
```javascript
{{ $json.isQualified }}
```

**Updated:**
```javascript
{{ $('Process Lead (FastAPI)').item.json.next_action === 'call' }}
```

This routes to Ruben only when FastAPI recommends calling.

---

## Step 3: Update "Dispatch Ruben Agent" HTTP Request

### Add playbook context to the request body:

**Current Body:**
```json
{
  "phone_number": "{{ $json.phone }}",
  "lead_data": {
    "firstName": "{{ $json.firstName }}",
    "companyName": "{{ $json.company }}",
    "quizScore": {{ $json.totalScore }},
    "email": "{{ $json.email }}"
  }
}
```

**Updated Body:**
```json
{
  "phone_number": "{{ $('Format Lead Data').item.json.phone }}",
  "lead_data": {
    "firstName": "{{ $('Format Lead Data').item.json.firstName }}",
    "companyName": "{{ $('Format Lead Data').item.json.company }}",
    "quizScore": {{ $('Format Lead Data').item.json.totalScore }},
    "email": "{{ $('Format Lead Data').item.json.email }}",
    "playbook": "{{ $('Process Lead (FastAPI)').item.json.playbook_html }}",
    "talking_points": {{ $('Process Lead (FastAPI)').item.json.talking_points }},
    "opening_hook": "{{ $('Process Lead (FastAPI)').item.json.opening_hook }}",
    "tier": "{{ $('Process Lead (FastAPI)').item.json.tier }}",
    "playbook_pdf_url": "{{ $('Process Lead (FastAPI)').item.json.playbook_pdf_url }}"
  }
}
```

---

## Step 4: Update Storage Nodes (Optional)

### Update "Save to NocoDB" to include PDF URL:

Add field:
```
Playbook_URL: {{ $('Process Lead (FastAPI)').item.json.playbook_pdf_url }}
```

### Update "Save Quiz Data (Supabase)" to include playbook:

Add fields:
```
playbook_html: {{ $('Process Lead (FastAPI)').item.json.playbook_html }}
playbook_pdf_url: {{ $('Process Lead (FastAPI)').item.json.playbook_pdf_url }}
```

---

## Validation Checklist

- [ ] HTTP Request node added after "Format Lead Data"
- [ ] URL set to `https://agents-api.dyniq.ai/api/process-lead`
- [ ] Body fields mapped correctly from Format Lead Data output
- [ ] IF node condition updated to use FastAPI response
- [ ] Dispatch Ruben Agent body updated with playbook context
- [ ] Test with manual execution before activating
- [ ] Verify Telegram notification received with PDF
- [ ] Verify Ruben call includes playbook context

---

## Troubleshooting

### FastAPI returns 502 Bad Gateway
- Check if agents-api container is running: `docker ps | grep agents-api`
- Check Caddy logs: `docker logs docker-caddy-1`

### FastAPI returns 504 Timeout
- Graph processing takes too long (>60s)
- Check Tavily API rate limits
- Check OpenRouter API status

### Playbook PDF URL is null
- WeasyPrint may not be installed
- Supabase Storage bucket may not exist
- Check logs: `docker logs docker-agents-api-1`

---

## Environment Variables Required

Make sure these are set in `.env`:

```bash
# Supabase (for storage)
SUPABASE_URL=https://ahseakobsxrtzkikbtxi.supabase.co
SUPABASE_SERVICE_KEY=<key>

# Telegram (for notifications)
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_WALKER_CHAT_ID=1415093686

# NocoDB (for CRM sync)
NOCODB_API_KEY=<key>
NOCODB_BASE_URL=https://crm.dyniq.ai
```

---

*Last updated: 2026-01-23*
