---
sidebar_position: 2
title: Internal Integration Guide
description: API access, webhook configuration, and Ruben setup for DYNIQ team members
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Internal Integration Guide

Setup guide for DYNIQ team members, VAs, and contractors. Covers API access, webhooks, Ruben configuration, and Supabase connections.

## Environment Setup

### Required Tools

- SSH access to Contabo (`ssh contabo` alias configured)
- Git access to `dyniq-ai-agents` repository
- API keys (stored in `.env` files on server)

### API Endpoints

| Service | URL | Auth Header |
|---------|-----|-------------|
| Agents API | `https://agents-api.dyniq.ai` | `X-API-Key` |
| Ruben Voice API | `https://ruben-api.dyniq.ai` | `X-API-Key` |
| n8n Automation | `https://automation.dyniq.ai` | `X-N8N-API-KEY` |
| Langfuse Traces | `https://langfuse.dyniq.ai` | Session auth |
| Metabase Analytics | `https://analytics.dyniq.ai` | API key |

:::warning Two Separate APIs
`agents-api.dyniq.ai` (port 8000) and `ruben-api.dyniq.ai` (port 8080) are SEPARATE containers. Starting one does NOT start the other.
:::

### Quick Connectivity Test

```bash
curl -sf https://agents-api.dyniq.ai/health && echo "Agents: OK"
curl -sf https://ruben-api.dyniq.ai/health && echo "Ruben: OK"
curl -sf https://automation.dyniq.ai/healthz && echo "n8n: OK"
```

## Agents API

### Board Meeting

```bash
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Should we expand to Germany?",
    "decision_type": "strategic",
    "level": 2
  }'
```

### Content Creation

```bash
curl -X POST https://agents-api.dyniq.ai/api/content/create \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "linkedin_post",
    "topic": "AI agents for lead generation",
    "brand_voice": "everyman_caregiver"
  }'
```

### Style Transfer

```bash
curl -X POST https://agents-api.dyniq.ai/api/style-transfer/analyze \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "level": 2
  }'
```

### Vision (UI-to-Code)

```bash
curl -X POST https://agents-api.dyniq.ai/api/vision/ui-to-code \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A pricing card with three tiers",
    "components_hint": ["PricingCard"],
    "brand_colors": ["#10B981", "#0F1115"]
  }'
```

## Webhook Configuration

### n8n Webhook Format

n8n webhooks accept POST requests with JSON body:

```bash
curl -X POST https://automation.dyniq.ai/webhook/voiceflow-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Peter Janssen",
    "email": "peter@test.be",
    "phone": "+32470999888",
    "lead_score": "85",
    "industry": "loodgieter"
  }'
```

### Voiceflow Webhook Data

Voiceflow sends **flat JSON** (not wrapped in body):

```json
{
  "name": "Peter Janssen",
  "email": "peter@test.be",
  "phone": "+32470999888",
  "lead_score": "85"
}
```

Handle both nested and flat in n8n:
```javascript
{{ $json.body?.name || $json.name || "Unknown" }}
```

## Supabase Connections

### Two Separate Projects

| Project | Purpose | Env Variable |
|---------|---------|-------------|
| **DYNIQ** | Leads, board meetings, content | `DYNIQ_SUPABASE_URL` |
| **Walker-OS** | Personal productivity, financial | `NEXT_PUBLIC_SUPABASE_URL` |

### Query Example

```bash
# Query leads table (DYNIQ database)
curl -s "$DYNIQ_SUPABASE_URL/rest/v1/leads?select=*&limit=5" \
  -H "apikey: $DYNIQ_SERVICE_KEY" \
  -H "Authorization: Bearer $DYNIQ_SERVICE_KEY"
```

### Upsert Pattern

```bash
curl -X POST "$DYNIQ_SUPABASE_URL/rest/v1/leads?on_conflict=email" \
  -H "apikey: $DYNIQ_SERVICE_KEY" \
  -H "Authorization: Bearer $DYNIQ_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation,resolution=merge-duplicates" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

:::tip Empty String Handling
Columns with CHECK constraints reject `""`. Use `null` instead of empty strings.
:::

## Ruben Voice Agent Configuration

### Architecture

```
Phone -> Twilio SIP -> LiveKit -> Ruben Agent -> STT/LLM/TTS
```

| Component | Service | Purpose |
|-----------|---------|---------|
| STT | Deepgram | Speech-to-text |
| LLM | OpenRouter | Language model |
| TTS | ElevenLabs | Text-to-speech |
| Media | LiveKit | WebRTC/SIP bridge |

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `LIVEKIT_URL` | `ws://livekit:7880` (internal) |
| `LIVEKIT_API_KEY` | LiveKit auth |
| `SIP_TRUNK_ID` | LiveKit format `ST_xxx` |
| `ELEVENLAB_API_KEY` | ElevenLabs TTS |
| `DEEPGRAM_API_KEY` | Deepgram STT |

### Triggering a Call

```bash
curl -X POST https://ruben-api.dyniq.ai/api/dispatch \
  -H "X-API-Key: $RUBEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+32470000000",
    "lead_name": "Peter",
    "playbook": "qualification"
  }'
```

## External Services

| Service | URL | Key Location |
|---------|-----|-------------|
| n8n | automation.dyniq.ai | `/opt/n8n/.env` |
| NocoDB CRM | crm.dyniq.ai | `/opt/n8n/.env` |
| Cal.com | app.cal.eu | `dyniq-app/.env` |
| Voiceflow | creator.voiceflow.com | `dyniq-app/.env` |
| OpenRouter | openrouter.ai/api/v1 | `/opt/dyniq-voice/.env` |

## Env Variable Scope

:::danger Two Separate .env Files
n8n and dyniq-voice use different `.env` files on the server.
:::

| Stack | Env File | Contains |
|-------|----------|----------|
| n8n | `/opt/n8n/.env` | `N8N_API_KEY`, `NOCODB_API_KEY`, `TELEGRAM_BOT_TOKEN` |
| dyniq-voice | `/opt/dyniq-voice/.env` | `DYNIQ_SUPABASE_KEY`, `AGENTS_API_KEY`, `LIVEKIT_*` |
