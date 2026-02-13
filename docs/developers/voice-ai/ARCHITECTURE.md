---
title: "DYNIQ AI Agents Architecture"
sidebar_label: "DYNIQ AI Agents Architecture"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [voice-ai, auto-synced]
---

# DYNIQ AI Agents Architecture

System architecture for the DYNIQ AI agent platform.

## C4 Context Diagram

```mermaid
C4Context
    title System Context - DYNIQ AI Agents

    Person(ceo, "CEO Walker", "Makes strategic decisions")
    Person(dev, "Developer", "Implements features")

    System(agents_api, "DYNIQ AI Agents", "FastAPI + LangGraph agents for decision automation")

    System_Ext(openrouter, "OpenRouter", "LLM API Gateway (Kimi K2.5, Claude, GPT)")
    System_Ext(supabase, "Supabase", "PostgreSQL + Auth + Storage")
    System_Ext(langfuse, "Langfuse", "Observability + Tracing")
    System_Ext(telegram, "Telegram", "HITL Notifications")
    System_Ext(n8n, "n8n", "Workflow Automation")

    Rel(ceo, agents_api, "Reviews decisions via", "Telegram HITL")
    Rel(dev, agents_api, "Triggers via", "API / n8n")

    Rel(agents_api, openrouter, "LLM calls", "HTTPS")
    Rel(agents_api, supabase, "State + Data", "HTTPS")
    Rel(agents_api, langfuse, "Traces", "HTTPS")
    Rel(agents_api, telegram, "Notifications", "Bot API")
    Rel(n8n, agents_api, "Webhooks", "HTTPS")
```

## Container Diagram

```mermaid
C4Container
    title Container Diagram - DYNIQ AI Agents

    Container(api, "FastAPI Server", "Python/FastAPI", "REST API + WebSocket endpoints")

    Container(board_meeting, "Board Meeting Pipeline", "LangGraph", "C-suite agent orchestration")
    Container(pm_pipeline, "PM Pipeline", "LangGraph", "Epic/PRD/Story generation")
    Container(content_pipeline, "Content Pipeline", "LangGraph", "Social media content")

    ContainerDb(pg, "PostgreSQL", "pgvector", "State persistence + embeddings")
    ContainerDb(redis, "Redis", "Cache", "Session cache")

    Rel(api, board_meeting, "Invokes")
    Rel(api, pm_pipeline, "Invokes")
    Rel(api, content_pipeline, "Invokes")

    Rel(board_meeting, pg, "Checkpoints")
    Rel(pm_pipeline, pg, "Checkpoints")
    Rel(content_pipeline, pg, "Checkpoints")
```

## Component Overview

### Board Meeting Pipeline

```mermaid
graph LR
    A[START] --> B[load_context]
    B --> C[parallel_analysis]
    C --> D[aggregate_scores]
    D --> E[capability_gap_check]
    E --> F{confidence_router}
    F -->|>0.9| G[auto_approve]
    F -->|0.7-0.9| H[quick_review]
    F -->|<=0.7| I[full_review]
    G --> J[END]
    H --> J
    I --> J
```

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `load_context` | Fetch historical decisions, R&D research |
| `parallel_analysis` | 6 C-suite agents analyze in parallel via Kimi K2.5 |
| `aggregate_scores` | Domain-weighted voting aggregation |
| `capability_gap_check` | Identify missing expertise, spawn specialists |
| `confidence_router` | Route to appropriate HITL level |
| `auto/quick/full_review` | HITL interrupt nodes with timeout handling |

### PM Pipeline

```mermaid
graph LR
    A[START] --> B[prepare]
    B --> C{fan_out}
    C --> D1[generate_section_1]
    C --> D2[generate_section_2]
    C --> D3[generate_section_N]
    D1 --> E[merge]
    D2 --> E
    D3 --> E
    E --> F[END]
```

**Map-Reduce Pattern:**

Uses LangGraph `Send` API for true parallel execution:

```python
def fan_out_sections(state) -> list[Send]:
    return [
        Send("generate_section", {"section": s, "context": state.context})
        for s in sections
    ]
```

**Document Types:**

| Type | Sections | Parallelism |
|------|----------|-------------|
| Epic | 5 (exec_summary, business_case, pbs, sprint_plan, success) | 5-way |
| PRD | 4 (problem, solution, requirements, acceptance) | 4-way |
| Stories | N stories | N-way |

### Content Pipeline

```mermaid
graph LR
    A[START] --> B[research]
    B --> C[generate_content]
    C --> D[generate_visuals]
    D --> E[team_review]
    E --> F{HITL}
    F -->|approve| G[publish]
    F -->|edit| C
    F -->|reject| H[archive]
    G --> I[END]
    H --> I
```

## Data Flow

### Board Meeting Flow

```
1. API Request → /api/board-meeting/analyze
2. load_context → Fetch from Supabase (historical_decisions, rd_research)
3. parallel_analysis → 6 concurrent Kimi K2.5 calls via OpenRouter
4. aggregate_scores → Domain-weighted voting calculation
5. capability_gap_check → Spawn specialists if needed
6. confidence_router → Route based on score
7. HITL interrupt → Telegram notification via n8n
8. Resume → /api/board-meeting/resume with decision
9. Persist → Store decision in Supabase
```

### HITL Interrupt/Resume

```mermaid
sequenceDiagram
    participant API as FastAPI
    participant Graph as LangGraph
    participant CP as Checkpointer
    participant N8N as n8n
    participant TG as Telegram
    participant CEO as CEO Walker

    API->>Graph: invoke(state)
    Graph->>Graph: Process nodes
    Graph->>CP: Save checkpoint (interrupt)
    Graph-->>API: Return with __interrupt__
    API->>N8N: POST /webhook/hitl
    N8N->>TG: Send decision request
    TG->>CEO: Inline keyboard buttons
    CEO->>TG: Click decision
    TG->>N8N: Callback
    N8N->>API: POST /resume
    API->>CP: Load checkpoint
    CP->>Graph: Resume with decision
    Graph->>Graph: Continue to END
    Graph-->>API: Final result
```

## State Persistence

### Checkpointing

Uses LangGraph checkpointer for HITL state persistence:

```python
# PostgreSQL (production)
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
checkpointer = AsyncPostgresSaver.from_conn_string(postgres_url)

# Memory (development)
from langgraph.checkpoint.memory import MemorySaver
checkpointer = MemorySaver()
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `board_meeting_decisions` | Historical decisions for context |
| `execution_learnings` | Episodic memory (learning from executions) |
| `validated_patterns` | Semantic memory (promoted learnings) |
| `content_generations` | Content pipeline outputs |

## Observability

### Langfuse Integration

```python
from langfuse import Langfuse

langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
)

# Traces automatically capture:
# - LLM calls (tokens, latency, cost)
# - Graph node execution
# - HITL decisions
```

### Metrics Tracked

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Phase 2 latency | <5 min | >10 min |
| Epic generation | <60s | >2 min |
| Story generation (5) | <3 min | >5 min |
| HITL response time | <24h | >48h auto-escalate |

## Deployment Architecture

```mermaid
graph TB
    subgraph Contabo VPS
        subgraph Docker
            A[Caddy Reverse Proxy]
            B[agents-api:8000]
            C[ruben-api:8080]
            D[PostgreSQL + pgvector]
            E[Redis]
        end
    end

    F[Cloudflare DNS] --> A
    A --> B
    A --> C
    B --> D
    B --> E
    C --> D

    G[OpenRouter] --- B
    H[Langfuse] --- B
    I[Telegram] --- B
```

**Production URLs:**

| Service | URL |
|---------|-----|
| Agents API | `agents-api.dyniq.ai` |
| Voice API | `ruben-api.dyniq.ai` |
| Langfuse | `langfuse.dyniq.ai` |

## Security

### Authentication

```python
# API Key authentication
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        api_key = request.headers.get("X-API-Key")
        if api_key != os.getenv("AGENTS_API_KEY"):
            return JSONResponse(status_code=401, content={"error": "Unauthorized"})
    return await call_next(request)
```

### Secrets Management

- All secrets via environment variables
- Never logged or traced
- Rotated quarterly

## Performance Optimization

### Parallelization Strategies

1. **LangGraph Send API** - True parallel node execution
2. **Async all the way** - No blocking I/O
3. **Connection pooling** - PostgreSQL, Redis
4. **Caching** - Historical decisions cached 5 min

### Bottleneck Analysis

| Operation | Latency | Optimization |
|-----------|---------|--------------|
| LLM call (Kimi K2.5) | 8-15s | Parallel execution |
| Database query | 10-50ms | Connection pooling |
| Embedding generation | 200-500ms | Batch processing |
| Telegram notification | 100-300ms | Async fire-and-forget |

---

*Sprint S6 - Agent Infrastructure v3.1*
