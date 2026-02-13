---
title: "dyniq-ai-agents AgentDeps Pattern"
sidebar_label: "dyniq-ai-agents AgentDeps Pattern"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# dyniq-ai-agents AgentDeps Pattern

Reference for the AgentDeps dependency injection pattern in dyniq-ai-agents.

## Quick Reference

```python
# Create deps
from agents.pydantic_ai.deps import AgentDeps
deps = AgentDeps.from_env()

# Call OpenRouter (CORRECT)
async with httpx.AsyncClient() as client:
    response = await client.post(
        f"{deps.openrouter_base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {deps.openrouter_api_key}",
            "Content-Type": "application/json",
        },
        json={"model": "moonshotai/kimi-k2.5", "messages": [...]}
    )
```

## What AgentDeps IS

A **dataclass** that holds API keys and URLs, NOT pre-configured clients.

```python
@dataclass
class AgentDeps:
    model: str = "openai/gpt-4o-mini"
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    tavily_api_key: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    langfuse_enabled: bool = False
    lead_id: Optional[str] = None
    session_id: Optional[str] = None
```

## What AgentDeps is NOT

- **NOT** `deps.openrouter_client` - doesn't exist
- **NOT** `create_agent_deps()` - function doesn't exist
- **NOT** a configured API client - just stores credentials

## Available Methods

| Method | Purpose |
|--------|---------|
| `AgentDeps.from_env()` | Create from environment variables |
| `deps.validate()` | Returns list of missing required fields |
| `deps.is_valid()` | True if all required fields set |
| `deps.with_context(lead_id, session_id)` | Return new deps with runtime context |

## Environment Variables

| Variable | Field | Required |
|----------|-------|----------|
| `LLM_MODEL` | model | No (default: gpt-4o-mini) |
| `OPENROUTER_API_KEY` | openrouter_api_key | Yes |
| `OPENAI_BASE_URL` | openrouter_base_url | No |
| `TAVILY_API_KEY` | tavily_api_key | No |
| `SUPABASE_URL` | supabase_url | No |
| `SUPABASE_SERVICE_KEY` | supabase_key | No |

## Common Patterns

### OpenRouter API Call

```python
import httpx
from agents.pydantic_ai.deps import AgentDeps

async def call_llm(prompt: str, deps: AgentDeps) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{deps.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {deps.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "moonshotai/kimi-k2.5",
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=60.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
```

### Lazy Graph Initialization

```python
def build_graph(deps: AgentDeps | None = None):
    if deps is None:
        deps = AgentDeps.from_env()
    # ... build graph with deps
```

## Pre-Planning Verification

Before planning agent work, verify deps.py exports:

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents
grep -E "^class |^def |^[A-Z].*=" agents/pydantic_ai/deps.py
```

## File Location

`dyniq-ai-agents/agents/pydantic_ai/deps.py`

---

*Created: 2026-01-29 after Board Meeting S2 system review identified 3+ plan errors from incorrect API assumptions.*
