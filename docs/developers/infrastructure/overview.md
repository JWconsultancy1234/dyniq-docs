---
sidebar_position: 1
title: Infrastructure
description: DYNIQ deployment architecture - Contabo VPS, Docker, Caddy, and service networking
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Infrastructure Overview

DYNIQ runs on a single Contabo VPS with Docker Compose orchestration, Caddy reverse proxy, and Cloudflare for SSL and CDN.

## Architecture

```mermaid
graph LR
    Internet[Internet] --> CF[Cloudflare<br/>SSL + CDN]
    Phone[Phone] --> Twilio[Twilio SIP]
    CF --> Caddy[Caddy<br/>:80/:443]
    Twilio --> LK[LiveKit]
    Caddy --> LK
    Caddy --> AA[Agents API<br/>:8000]
    Caddy --> RA[Ruben API<br/>:8080]
    Caddy --> N8N[n8n<br/>:5678]
    Caddy --> LF[Langfuse<br/>:3100]
    Caddy --> MB[Metabase<br/>:3001]
    Caddy --> DOCS[Docs<br/>:80]
    LK --> Ruben[Ruben Agent]
    Ruben --> DG[Deepgram STT]
    Ruben --> OR[OpenRouter LLM]
    Ruben --> EL[ElevenLabs TTS]
```

## Services

| Domain | Service | Port | Network | Stack |
|--------|---------|------|---------|-------|
| voice.dyniq.ai | LiveKit | 7880 | voice-net | dyniq-voice |
| ruben-api.dyniq.ai | Ruben Voice API | 8080 | voice-net | dyniq-voice |
| agents-api.dyniq.ai | FastAPI Agents | 8000 | voice-net | dyniq-voice |
| docs.dyniq.ai | Docusaurus (nginx) | 80 | voice-net | dyniq-voice |
| automation.dyniq.ai | n8n | 5678 | n8n_default | n8n |
| crm.dyniq.ai | NocoDB | 8080 | nocodb_default | nocodb |
| langfuse.dyniq.ai | Langfuse | 3100 | langfuse_default | langfuse |
| analytics.dyniq.ai | Metabase | 3001 | metabase-net | metabase |

## Docker Networks

Services are isolated into separate Docker networks. Caddy must be connected to **all** networks to proxy traffic:

```mermaid
graph TD
    subgraph voice-net
        LK[LiveKit]
        SIP[SIP]
        Ruben[Ruben]
        RubenAPI[Ruben API]
        AgentsAPI[Agents API]
        Redis[Redis]
        Postgres[Postgres]
        Docs[Docs]
    end
    subgraph n8n_default
        N8N[n8n]
        N8N_PG[n8n Postgres]
    end
    subgraph langfuse_default
        LF_Web[Langfuse Web]
        LF_Worker[Worker]
        LF_PG[Postgres]
        LF_CH[ClickHouse]
    end
    subgraph metabase-net
        MB[Metabase]
    end
    Caddy[Caddy] --> voice-net
    Caddy --> n8n_default
    Caddy --> langfuse_default
    Caddy --> metabase-net
```

## External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Cloudflare | SSL termination, CDN, DNS | Proxy all domains |
| Supabase (Walker-OS) | Personal data (scorecards, timeblocks) | REST API |
| Supabase (DYNIQ) | Business data (leads, content, board meetings) | REST API |
| OpenRouter | LLM API gateway | All agent calls |
| ElevenLabs | Text-to-Speech | Ruben voice agent |
| Deepgram | Speech-to-Text | Ruben voice agent |
| Twilio | SIP trunking | Inbound/outbound calls |
| Langfuse | LLM observability | OpenTelemetry traces |

## Port Assignments

| Port Range | Service | Exposure |
|------------|---------|----------|
| 80/443 | Caddy HTTP/HTTPS | Public |
| 5060 | SIP | Public |
| 7880-7882 | LiveKit WS/RTC/TURN | Public |
| 8000 | Agents API | Caddy only |
| 8080 | Ruben API / NocoDB | Caddy only |
| 5678 | n8n | Caddy only |
| 10000-10100 | SIP RTP | Public |
| 50000-50100 | WebRTC Media | Public |

## Cloudflare Configuration

All DYNIQ domains are proxied through Cloudflare with:

- **SSL mode**: Full (strict)
- **Proxy timeout**: 100 seconds (important for board meetings)
- **Caching**: Disabled for API endpoints, enabled for static assets

:::warning Cloudflare 100s Timeout
Cloudflare enforces a hard 100-second timeout on proxied requests. Board meetings at Level 3+ (40+ agents) exceed this limit, which is why they use async polling mode.
:::
