---
title: "Voice AI Agents Overview"
sidebar_label: "Voice AI Agents Overview"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [voice-ai, auto-synced]
---

# DYNIQ AI Agents

> All AI agents for DYNIQ in one repo (VSA architecture)

## Architecture

```
dyniq-ai-agents/
├── agents/                          # Each agent is a vertical slice
│   │
│   ├── ruben-voice/                # Voice AI for lead qualification
│   │   ├── features/
│   │   │   ├── call-handling/       # Phone call lifecycle
│   │   │   ├── booking/             # Cal.com integration
│   │   │   ├── knowledge/           # RAG search
│   │   │   ├── notifications/       # WhatsApp, voicemail
│   │   │   └── qualification/       # Lead scoring
│   │   ├── agent.py                 # Ruben main class
│   │   └── config.py                # Ruben-specific config
│   │
│   ├── chatbot/                     # Website chatbot (Voiceflow-style)
│   │   ├── features/
│   │   │   ├── conversation/        # Chat flow logic
│   │   │   ├── lead-capture/        # Form submission
│   │   │   └── handoff/             # WhatsApp/call handoff
│   │   └── agent.py
│   │
│   └── email-assistant/             # Email response agent (future)
│       ├── features/
│       │   ├── classification/      # Inbox triage
│       │   ├── response/            # Draft responses
│       │   └── scheduling/          # Meeting requests
│       └── agent.py
│
├── shared/                          # Shared across all agents
│   ├── providers/                   # STT/TTS/LLM configs
│   │   ├── __init__.py
│   │   ├── deepgram.py              # Deepgram STT
│   │   ├── cartesia.py              # Cartesia TTS
│   │   ├── openai.py                # GPT-4o / GPT-4o-mini
│   │   └── anthropic.py             # Claude (optional)
│   │
│   ├── integrations/                # External services
│   │   ├── __init__.py
│   │   ├── calcom.py                # Cal.com booking
│   │   ├── n8n.py                   # n8n webhooks
│   │   ├── twilio.py                # WhatsApp, SMS, SIP
│   │   └── supabase.py              # Database
│   │
│   ├── knowledge/                   # Shared knowledge base
│   │   ├── __init__.py
│   │   ├── rag.py                   # PGVector search
│   │   └── dyniq_info.py            # Static DYNIQ knowledge
│   │
│   ├── utils/                       # Helpers
│   │   ├── __init__.py
│   │   ├── config.py                # Environment config
│   │   └── logging.py               # Structured logging
│   │
│   └── types/                       # Shared types
│       ├── __init__.py
│       ├── lead.py                  # Lead model
│       └── events.py                # Webhook events
│
├── tests/                           # Tests per agent
│   ├── ruben/
│   ├── chatbot/
│   └── shared/
│
├── docker/                          # Docker configs
│   ├── docker-compose.yml           # Production
│   ├── docker-compose.local.yml     # Local dev
│   └── Dockerfile
│
├── scripts/                         # Utility scripts
│   ├── deploy.sh                    # Deploy to Contabo
│   ├── test-ruben.py               # Console test
│   └── seed-knowledge.py            # Seed RAG database
│
├── .env.example
├── requirements.txt
├── pyproject.toml
└── README.md
```

## Agents

| Agent | Status | Purpose |
|-------|--------|---------|
| **ruben-voice** | Active | Phone calls for lead qualification |
| **board_meeting** | Active | C-suite decision automation (LangGraph) |
| **pm_pipeline** | Active | Epic/PRD/Story generation (LangGraph) |
| **content_pipeline** | Active | Social media content generation |
| **chatbot** | Planned | Website chat widget |
| **email-assistant** | Future | Inbox management |

### LangGraph Pipelines (`agents/pydantic_ai/`)

| Pipeline | Parallelization | Performance Target |
|----------|-----------------|-------------------|
| Board Meeting | 6 agents parallel | Phase 2 <5 min |
| Epic Generation | 5 sections parallel | <60 sec |
| Story Generation | N stories parallel | 5 stories <3 min |

## Deployment

Deployed on **Contabo VPS** (83.171.248.35)

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Contabo VPS                               │
├─────────────────────────────────────────────────────────────┤
│  This stack provides:                                        │
│  - Unified Caddy (ports 80/443) for ALL dyniq.ai domains    │
│  - LiveKit voice server (voice.dyniq.ai)                    │
│  - Ruben Voice AI agent                                     │
│  - Ruben API (ruben-api.dyniq.ai)                         │
│                                                              │
│  docker_voice-net (internal network)                         │
│    ├── docker-livekit-1     (LiveKit server)                │
│    ├── docker-ruben-1      (Voice agent)                   │
│    ├── docker-ruben-api-1  (API for n8n)                   │
│    ├── docker-sip-1         (SIP trunk)                     │
│    ├── docker-redis-1       (Cache)                         │
│    └── voice-postgres-1     (PGVector)                      │
└─────────────────────────────────────────────────────────────┘
```

### Caddy Routing (Unified for All Services)

> **CRITICAL**: This is the ONLY stack with Caddy (ports 80/443).
> Other stacks (dyniq-crm, dyniq-n8n) expose on localhost only.

| Domain | Routes To |
|--------|-----------|
| voice.dyniq.ai | docker-livekit-1:7880 |
| ruben-api.dyniq.ai | docker-ruben-api-1:8080 |
| crm.dyniq.ai | nocodb-nocodb-1:8080 |
| automation.dyniq.ai | n8n-n8n-1:5678 |

### Production Setup

```bash
# On Contabo VPS
cd /opt/dyniq-voice/docker

# Configure environment
cp ../.env.example ../.env
nano ../.env

# Start services
docker compose up -d

# Verify all services
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check endpoints
curl -s https://ruben-api.dyniq.ai/health
curl -I https://voice.dyniq.ai
```

## Quick Start (Local Development)

```bash
# Clone
git clone https://github.com/JWconsultancy1234/dyniq-ai-agents.git
cd dyniq-ai-agents

# Setup
cp .env.example .env
pip install -r requirements.txt

# Test Ruben (console mode)
python -m agents.ruben_voice console

# Run with Docker (local)
docker compose -f docker/docker-compose.local.yml up

# Production deployment
docker compose -f docker/docker-compose.yml up -d
```

## API Endpoints

### Board Meeting (agents-api.dyniq.ai)

```bash
# Start board meeting analysis (6 C-suite agents in parallel)
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "MoltBot vs Current Stack",
    "level": 3,
    "options": ["Adopt MoltBot", "Keep Current"],
    "decision_type": "technical"
  }'

# Resume after HITL decision
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/resume \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "bm-xxx",
    "decision": "ADOPT",
    "rationale": "Strong ROI"
  }'
```

### PM Pipeline (agents-api.dyniq.ai)

```bash
# Generate Epic document (5 sections in parallel)
curl -X POST https://agents-api.dyniq.ai/api/pm-pipeline/epic \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Lead Qualification",
    "description": "Build AI system to qualify leads",
    "context": {"industry": "B2B SaaS"}
  }'

# Generate user stories (N stories in parallel)
curl -X POST https://agents-api.dyniq.ai/api/pm-pipeline/stories \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "epic_name": "AI Lead Qualification",
    "story_count": 5,
    "context": {"sprint": "S7"}
  }'
```

### Content Generation (agents-api.dyniq.ai)

```bash
# Generate text content
curl -X POST https://agents-api.dyniq.ai/api/content/create \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "request_type": "text",
    "topics": ["AI automation"],
    "platform": "linkedin",
    "count": 3
  }'

# Resume HITL review
curl -X POST https://agents-api.dyniq.ai/api/hitl/resume \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "...",
    "decision": "approve"
  }'
```

### Testing

```bash
# Run all tests
pytest tests/ -v

# Run E2E tests only (mocked, fast)
pytest tests/e2e/ -v -k "not integration"

# Run integration tests (requires AGENTS_API_KEY)
pytest -m integration -v

# Run benchmarks
pytest tests/benchmark/ --benchmark-only
```

## VSA Principles

1. **Feature folders** contain everything for that use-case
2. **Shared** only for truly cross-cutting concerns
3. **Each agent** is independently deployable
4. **Tests** mirror the agent structure

## Documentation

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](pathname://docs/ARCHITECTURE.md) | C4 diagrams, data flow, component overview |
| [QUICKSTART.md](./QUICKSTART) | 5-minute developer onboarding |

## Related Repos

| Repo | Purpose | Deploy |
|------|---------|--------|
| **dyniq-ai-agents** (this) | All AI agents | Contabo VPS |
| **dyniq-n8n** | Automation workflows | Contabo VPS |
| **dyniq-crm** | NocoDB CRM | Contabo VPS |
| **dyniq-app** | Docs + Landing page | Cloudflare Pages |
| **walker-os** | Goal tracking (Path B) | Local |
