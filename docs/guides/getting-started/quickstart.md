---
sidebar_position: 2
title: Developer Quickstart
description: Get up and running with DYNIQ AI Agents in 5 minutes
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Developer Quickstart

Get up and running with DYNIQ AI Agents in 5 minutes.

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (with pgvector extension)
- OpenRouter API key
- Optional: Langfuse account for observability

## Quick Setup

```bash
# 1. Clone the repo
git clone https://github.com/dyniq/dyniq-ai-agents.git
cd dyniq-ai-agents

# 2. Install dependencies
pip install -e .
# Or with poetry:
poetry install

# 3. Copy env template
cp .env.example .env

# 4. Edit .env with your keys (see below)

# 5. Start the API
uvicorn api.main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM calls |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `AGENTS_API_KEY` | No | API authentication (optional in dev) |
| `CHECKPOINT_POSTGRES_URL` | No | PostgreSQL URL for HITL state persistence |
| `LANGFUSE_PUBLIC_KEY` | No | Langfuse public key for tracing |
| `LANGFUSE_SECRET_KEY` | No | Langfuse secret key |
| `LANGFUSE_HOST` | No | Langfuse host (default: cloud) |

## Running Locally

```bash
# Development mode (auto-reload)
uvicorn api.main:app --reload --port 8000

# Production mode
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### Health Check

```bash
curl http://localhost:8000/health
# {"status":"ok","service":"agents-api","version":"1.0.0"}
```

## API Endpoints

### Board Meeting

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/board-meeting/analyze` | POST | Start board meeting analysis |
| `/api/board-meeting/status/{id}` | GET | Check meeting status |
| `/api/board-meeting/resume` | POST | Resume after HITL decision |

**Start a meeting:**

```bash
curl -X POST http://localhost:8000/api/board-meeting/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{
    "topic": "MoltBot vs Current Stack",
    "level": 3,
    "options": ["Adopt MoltBot", "Keep Current"],
    "decision_type": "technical"
  }'
```

**Resume after HITL:**

```bash
curl -X POST http://localhost:8000/api/board-meeting/resume \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{
    "thread_id": "bm-xxx",
    "decision": "ADOPT",
    "rationale": "Strong ROI"
  }'
```

### PM Pipeline

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pm-pipeline/epic` | POST | Generate Epic document |
| `/api/pm-pipeline/prd` | POST | Generate PRD document |
| `/api/pm-pipeline/stories` | POST | Generate user stories |

### Content Pipeline

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content/create` | POST | Generate content |
| `/api/hitl/pending` | GET | List pending approvals |
| `/api/hitl/resume` | POST | Resume after approval |

## Testing

```bash
# Run all tests (mocked, fast)
pytest tests/ -v -k "not integration"

# Run E2E tests
pytest tests/e2e/ -v

# Run integration tests (requires API keys)
pytest -m integration -v
```

## Project Structure

```
dyniq-ai-agents/
├── api/                    # FastAPI application
│   ├── main.py            # App entry point
│   └── routes/            # API route handlers
├── agents/
│   └── pydantic_ai/       # Agent implementations
│       ├── board_meeting/ # Board meeting pipeline
│       ├── pm_pipeline/   # PM document generation
│       └── ...
├── tests/
│   ├── e2e/              # End-to-end tests
│   ├── benchmark/        # Performance tests
│   └── conftest.py       # Shared fixtures
└── docs/                  # Documentation
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Import errors | Set `PYTHONPATH` to include project root |
| HITL not persisting | Set `CHECKPOINT_POSTGRES_URL` for state persistence |
| Langfuse traces missing | Verify keys, check `LANGFUSE_HOST` for self-hosted |

## Next Steps

- [Architecture Overview](/docs/developers/architecture/overview) - System design
- [Agent System Architecture](/docs/developers/architecture/agent-system) - C4 diagrams
- [Board Meeting API](/docs/developers/api/board-meeting) - Full API reference
- [Deployment Guide](/docs/developers/infrastructure/deployment) - Production setup
