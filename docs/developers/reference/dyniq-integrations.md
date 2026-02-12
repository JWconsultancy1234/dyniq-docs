---
title: "DYNIQ External Integrations"
sidebar_label: "DYNIQ External Integrations"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# DYNIQ External Integrations

Quick reference for all DYNIQ external services and APIs.

## n8n Automation

| Property | Value |
|----------|-------|
| URL | https://automation.dyniq.ai |
| API Key | `dyniq-app/.env` → `N8N_API_KEY` |
| Basic Auth | `dyniq-app/.env` → `N8N_ADMIN_USER` / `N8N_ADMIN_PASSWORD` |

### API Endpoints

```bash
# Get workflow
GET /api/v1/workflows/{id}

# Update workflow
PUT /api/v1/workflows/{id}

# Activate workflow
POST /api/v1/workflows/{id}/activate

# Headers
X-N8N-API-KEY: {api_key}
Content-Type: application/json
```

### Key Workflows

| ID | Name | Webhook Path |
|----|------|--------------|
| DP0wfYBh8SJK33Ue | Voiceflow Lead Webhook | /webhook/voiceflow-lead |

### Sales Intelligence Pipeline

**Template:** `dyniq-n8n/templates/sales-intelligence-prompt.md`

**Flow:**
```
Quiz → Lead Data → Tavily Research → Framework Selection → AI Playbook
```

**Outputs Generated:**
| Output | Purpose | Audience |
|--------|---------|----------|
| Sales Playbook | Full briefing with buyer type, scripts | Walker / Future VA |
| Ruben Script | 2-min voice call flow | Ruben AI |
| Outreach Content | DM scripts + follow-ups | Chat selling |
| Content Ideas | Hook + format + CTA | Marketing |

**Frameworks Integrated:**
- Hormozi Money Models (Attraction/Upsell/Downsell/Continuity)
- Martell Sell By Chat (A-B Method, 9 Buyer Types)
- DYNIQ GTM strategy

**Implementation:** Add "Generate Personalized Playbook" node after Tavily research, before storage nodes.

---

## NocoDB CRM

| Property | Value |
|----------|-------|
| URL | https://crm.dyniq.ai |
| Token | `dyniq-app/.env` → NOCODB_API_KEY |
| Password | `dyniq-app/.env` → NOCODB_PASSWORD |

### API Endpoints

```bash
# List records
GET /api/v2/tables/{table_id}/records

# Create record
POST /api/v2/tables/{table_id}/records

# Add column
POST /api/v2/meta/tables/{table_id}/columns

# Headers
xc-token: {api_key}
Content-Type: application/json
```

### Key Tables

| Table | ID | Columns |
|-------|----|---------|
| Leads | mo6zko3dzsu1xrk | Name, Email, Phone, Company, Quiz_Score, Status, Source, Industry, Location, Urgency, Callback_Time, Pain_Points, Buying_Signals, Conversation_Summary, Needs, Current_Situation, Enthusiasm_Level, Booking_Offered |

---

## Supabase Dyniq

| Property | Value |
|----------|-------|
| URL | `$DYNIQ_SUPABASE_URL` (see apps/api/.env) |
| Project ID | See `.env` file - **never commit project IDs** |
| Service Key | `walker-os/apps/api/.env` → `Dyniq_Supabase_Service_Role_Key` |

### API Endpoints

```bash
# Query table
GET /rest/v1/{table}?select=*

# Insert record
POST /rest/v1/{table}

# Headers
apikey: {service_key}
Authorization: Bearer {service_key}
Content-Type: application/json
Prefer: return=representation
```

### Core Tables

| Table | Purpose | Columns |
|-------|---------|---------|
| leads | Lead lifecycle tracking (source of truth) | 65+ columns |
| quiz_responses | Quiz answers + scores | Links to leads via email |
| content_posts | Social media posts | platform, hook, topic, post_date |
| content_metrics | Daily performance snapshots | likes, comments, engagement_rate |

**Schema discovery before proposing new tables:**
```sql
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Table Schema Details

**leads table constraints:**

| Column | Type | Constraints |
|--------|------|-------------|
| email | text | UNIQUE, NOT NULL |
| urgency | text | CHECK (valid enum values) - rejects empty string |
| tier | text | CHECK constraint on valid values |
| pain_points | text[] | ARRAY type - requires `'{value1,value2}'` format |
| needs | text[] | ARRAY type |
| lead_score | integer | Nullable |

**quiz_responses table:**

| Column | Type | Notes |
|--------|------|-------|
| email | text | Links to leads table |
| total_score | integer | Quiz score |
| tier | text | HOT/WARM/COLD |
| sales_briefing_url | text | Public URL to HTML playbook |

### Upsert Pattern

```bash
POST /rest/v1/leads?on_conflict=email
Headers:
  apikey: {key}
  Authorization: Bearer {key}
  Prefer: return=representation,resolution=merge-duplicates
```

**Empty string handling:** Columns with CHECK constraints will reject `""`. Use `null` instead:
```javascript
// n8n expression
{{ $json.urgency || null }}
```

---

## Voiceflow

| Property | Value |
|----------|-------|
| API Key | `dyniq-app/.env` → VoiceFlow_API |
| Agent | Ruben (DYNIQ sales chatbot) |

### Templates Location

Templates in `dyniq-app/templates/voiceflow/` are **reference only**. Live Voiceflow pulls from their servers.

| Template | Purpose |
|----------|---------|
| `dyniq-internal-agent-v3.md` | Knowledge Base content |
| `ruben-agent-instructions-v2.md` | Agent Instructions (quiz-first) |
| `dyniq-landing.json` | Flow configuration (advanced) |

### Applying Template Updates

1. Open template file from repo
2. Login to [Voiceflow Creator](https://creator.voiceflow.com)
3. Navigate to Agent → Knowledge Base (or Agent Instructions)
4. Replace content with template
5. Test in Voiceflow preview
6. Publish changes

**Important:** Landing page code changes do NOT update live chatbot. Always apply templates manually after copy updates.

### Webhook Format

Voiceflow sends **flat JSON** (not wrapped in body):

```json
{
  "name": "Peter Janssen",
  "email": "peter@test.be",
  "phone": "+32470999888",
  "lead_score": "85",
  "industry": "loodgieter",
  ...
}
```

**n8n compatibility:** Use optional chaining:
```javascript
$json.body?.name || $json.name || ''
```

---

## OpenRouter (LLM)

| Property | Value |
|----------|-------|
| URL | https://openrouter.ai/api/v1 |
| API Key | `walker-os/apps/api/.env` → OPENROUTER_API_KEY |
| Model | openai/gpt-4o-mini |

### Usage

```bash
POST /chat/completions
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "model": "openai/gpt-4o-mini",
  "messages": [...],
  "max_tokens": 400
}
```

---

## Telegram

### Bots

| Bot | Username | Token Location | Purpose |
|-----|----------|----------------|---------|
| Walker OS | @Walker_OS_BOT | `n8n env` → TELEGRAM_BOT_TOKEN | Personal notifications |
| DYNIQ AI | @dyniq_AI_BOT | `n8n env` → DYNIQ_TELEGRAM_BOT_TOKEN | DYNIQ lead notifications |

### Chat IDs

| Chat | ID | Used By |
|------|-----|---------|
| Walker personal | `1415093686` | All current workflows |

### Best Practices

- Use `@dyniq_AI_BOT` for all DYNIQ workflow notifications
- Use `@Walker_OS_BOT` for personal OS notifications (morning briefing, shutdown)
- n8n credential ID: `DmiQb2aMaDzqcpFq`

### API Usage

```bash
# Send message
POST https://api.telegram.org/bot{token}/sendMessage
Content-Type: application/json

{
  "chat_id": "1415093686",
  "text": "Message here",
  "parse_mode": "Markdown"
}
```

---

## Cal.com

| Property | Value |
|----------|-------|
| API Key | `dyniq-app/.env` → CALCOM |
| Event Type ID | 13321 |
| Booking URL | https://app.cal.eu/dyniq.ai/strategy-15 |

---

**Voice AI, image generation, video, social media, content tracking:** @voice-content-integrations.md

---

## Pre-Flight Checklist

Before building any DYNIQ integration:

- [ ] Verify API credentials are accessible
- [ ] Test API connectivity with simple GET
- [ ] Confirm database tables/columns exist
- [ ] Document any discovered formats

---

*Last updated: 2026-02-06*
