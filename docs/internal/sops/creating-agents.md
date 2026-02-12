---
sidebar_position: 4
title: Creating Pydantic AI Agents
description: Step-by-step SOP for creating new agents in the DYNIQ platform
doc_owner: CTO
review_cycle: 60d
doc_status: published
---

# Creating Pydantic AI Agents

Step-by-step procedure for creating a new Pydantic AI agent within the DYNIQ platform.

## Prerequisites

- Python 3.11+
- Access to `dyniq-ai-agents` repository
- Environment variables configured (see `.env.example`)

## Step 1: Define Agent Purpose

| Question | Example |
|----------|---------|
| What does this agent do? | Research company information |
| What inputs does it need? | company_name, website |
| What outputs does it produce? | company_info dict |
| What external APIs does it call? | Tavily, OpenRouter |
| Where does it fit in the graph? | After webhook, before qualify |

## Step 2: Create Agent File

Create `agents/pydantic_ai/{agent_name}.py`:

```python
"""[Agent Name] - [One-line description].

Usage:
    from agents.pydantic_ai.{agent_name} import {agent_name}_agent
    result = await {agent_name}_agent.run(prompt, deps=deps)
"""

from pydantic_ai import Agent
from agents.pydantic_ai import AgentDeps
from shared.utils.logging import get_logger

logger = get_logger("{agent-name}")

{agent_name}_agent = Agent(
    "openrouter:openai/gpt-4o-mini",  # Via OpenRouter
    deps_type=AgentDeps,
    system_prompt="""You are a [role description].
Your task is to [specific task].

Guidelines:
- [Guideline 1]
- [Guideline 2]
""",
)
```

:::warning Logging
Always use `from shared.utils.logging import get_logger`, NOT `import logging`. Standard logging is invisible in server logs.
:::

## Step 3: Add Tools (Optional)

```python
@{agent_name}_agent.tool
async def search_company(ctx, company_name: str) -> dict:
    """Search for company information."""
    if not ctx.deps.tavily_api_key:
        logger.warning("Tavily API key not configured")
        return {"error": "Research API not configured"}

    # Implement tool logic
    return {"company_name": company_name, "found": True}
```

## Step 4: Update State

If your agent produces new state fields, update `agents/pydantic_ai/state.py`:

```python
class LeadState(TypedDict, total=False):
    # Add your new fields
    {new_field}: {type}  # Description
```

## Step 5: Add to Graph

Update `agents/pydantic_ai/graph.py`:

```python
from agents.pydantic_ai.{agent_name} import {agent_name}_agent

async def {agent_name}_node(state: LeadState) -> LeadState:
    """[Description of what this node does]."""
    deps = AgentDeps.from_env().with_context(lead_id=state.get("lead_id"))
    result = await {agent_name}_agent.run(
        f"Process: {state.get('relevant_field')}",
        deps=deps,
    )
    return {"{output_field}": result.output}

builder.add_node("{agent_name}", {agent_name}_node)
builder.add_edge("{previous_node}", "{agent_name}")
builder.add_edge("{agent_name}", "{next_node}")
```

## Step 6: Create Test

```python
"""Test {agent_name} agent."""
import asyncio
from agents.pydantic_ai import AgentDeps
from agents.pydantic_ai.{agent_name} import {agent_name}_agent
from shared.integrations.langfuse import init_langfuse

async def test():
    init_langfuse()
    deps = AgentDeps.from_env()
    result = await {agent_name}_agent.run("[Test prompt]", deps=deps)
    assert result.output is not None
    print(f"Result: {result.output}")

if __name__ == "__main__":
    asyncio.run(test())
```

## Step 7: Validate

```bash
python3 -m py_compile agents/pydantic_ai/{agent_name}.py
python3 -c "from agents.pydantic_ai.{agent_name} import {agent_name}_agent; print('OK')"
python3 -m agents.pydantic_ai.test_{agent_name}
# Verify trace at https://langfuse.dyniq.ai
```

## Common Patterns

### Structured Output

```python
from pydantic import BaseModel

class CompanyInfo(BaseModel):
    name: str
    industry: str
    employee_count: int | None

research_agent = Agent(
    "openrouter:openai/gpt-4o-mini",
    deps_type=AgentDeps,
    output_type=CompanyInfo,
    system_prompt="Extract company information...",
)
```

### Conditional Graph Routing

```python
def should_deep_research(state: LeadState) -> str:
    if state.get("tier") == "HOT":
        return "deep_research"
    return "quick_research"

builder.add_conditional_edges(
    "qualify",
    should_deep_research,
    {"deep_research": "deep_research", "quick_research": "quick_research"},
)
```

## Completion Checklist

- [ ] Agent file created with proper structure
- [ ] System prompt is clear and specific
- [ ] Tools implemented (if needed)
- [ ] State fields added (if needed)
- [ ] Node added to graph with correct edges
- [ ] Test file created and passing
- [ ] Langfuse trace visible
- [ ] Documentation updated

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Import error | Missing dependency | Check requirements.txt |
| "Invalid deps" | Missing env var | Check `.env`, run `validate()` |
| No Langfuse trace | Keys not set | Verify `LANGFUSE_*` env vars |
| Tool not called | LLM didn't invoke | Improve system prompt clarity |
| State not updating | Wrong return format | Return dict with new fields |
