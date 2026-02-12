---
title: "SOP: Creating a Pydantic AI Agent"
sidebar_label: "SOP: Creating a Pydantic AI Agent"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [sops, auto-synced]
---

# SOP: Creating a Pydantic AI Agent

**Version:** 1.1.0
**Created:** 2026-01-23
**Updated:** 2026-01-23 (Sprint 2 fixes: model format, output_type)
**Author:** Walker
**Target Audience:** Walker, Future VA, Developers

---

## Purpose

This SOP provides step-by-step instructions for creating a new Pydantic AI agent within the DYNIQ AI Agent Platform. Follow this procedure to ensure consistency, observability, and testability.

---

## Prerequisites

- [ ] Python 3.11+ installed
- [ ] Access to dyniq-ai-agents repository
- [ ] Environment variables configured (see `.env.example`)
- [ ] Understanding of the agent's purpose and inputs/outputs

---

## Procedure

### Step 1: Define Agent Purpose

Before writing code, document:

| Question | Answer |
|----------|--------|
| What does this agent do? | [e.g., Research company information] |
| What inputs does it need? | [e.g., company_name, website] |
| What outputs does it produce? | [e.g., company_info dict, kbo_number] |
| What external APIs does it call? | [e.g., Tavily, OpenRouter] |
| Where does it fit in the graph? | [e.g., After webhook, before qualify] |

### Step 2: Create Agent File

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

# Define the agent
{agent_name}_agent = Agent(
    "openrouter:openai/gpt-4o-mini",  # Via OpenRouter
    deps_type=AgentDeps,
    system_prompt="""You are a [role description].

Your task is to [specific task].

Guidelines:
- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

Output format:
[Describe expected output format]
""",
)


# Optional: Add tools for the agent
@{agent_name}_agent.tool
async def search_company(ctx, company_name: str) -> dict:
    """Search for company information.

    Args:
        company_name: Name of the company to search

    Returns:
        Dictionary with company information
    """
    # Access deps via ctx.deps
    if not ctx.deps.tavily_api_key:
        logger.warning("Tavily API key not configured")
        return {"error": "Research API not configured"}

    # Implement tool logic
    # ...

    return {"company_name": company_name, "found": True}
```

### Step 3: Update State (if needed)

If your agent produces new state fields, update `agents/pydantic_ai/state.py`:

```python
class LeadState(TypedDict, total=False):
    # Existing fields...

    # Add your new fields
    {new_field}: {type}  # Description
```

### Step 4: Add to Graph

Update `agents/pydantic_ai/graph.py`:

```python
# 1. Import your agent
from agents.pydantic_ai.{agent_name} import {agent_name}_agent

# 2. Create node function
async def {agent_name}_node(state: LeadState) -> LeadState:
    """[Description of what this node does]."""
    deps = AgentDeps.from_env().with_context(lead_id=state.get("lead_id"))

    result = await {agent_name}_agent.run(
        f"Process: {state.get('relevant_field')}",
        deps=deps,
    )

    logger.info(f"[{agent_name}] Result: {result.output}")

    return {
        "{output_field}": result.output,
    }

# 3. Add node to builder
builder.add_node("{agent_name}", {agent_name}_node)

# 4. Add edges
builder.add_edge("{previous_node}", "{agent_name}")
builder.add_edge("{agent_name}", "{next_node}")
```

### Step 5: Add Dependencies (if needed)

If your agent needs new external services:

1. **Update AgentDeps** in `agents/pydantic_ai/deps.py`:
   ```python
   @dataclass
   class AgentDeps:
       # Existing fields...
       {new_service}_api_key: str = ""
   ```

2. **Update from_env()** method:
   ```python
   {new_service}_api_key=os.getenv("{NEW_SERVICE}_API_KEY", ""),
   ```

3. **Update .env.example**:
   ```
   # {New Service}
   {NEW_SERVICE}_API_KEY=xxx
   ```

### Step 6: Create Test

Create `agents/pydantic_ai/test_{agent_name}.py`:

```python
"""Test {agent_name} agent."""

import asyncio

from agents.pydantic_ai import AgentDeps
from agents.pydantic_ai.{agent_name} import {agent_name}_agent
from shared.integrations.langfuse import init_langfuse
from shared.utils.logging import get_logger

logger = get_logger("test-{agent_name}")


async def test_{agent_name}():
    """Test {agent_name} agent with sample input."""
    # Initialize observability
    init_langfuse()

    # Create deps
    deps = AgentDeps.from_env()
    if not deps.is_valid():
        logger.error(f"Invalid deps: {deps.validate()}")
        return

    # Run test
    result = await {agent_name}_agent.run(
        "[Test prompt]",
        deps=deps,
    )

    logger.info(f"Result: {result.output}")
    logger.info("Check Langfuse for trace!")

    # Assertions
    assert result.output is not None
    # Add more specific assertions


if __name__ == "__main__":
    asyncio.run(test_{agent_name}())
```

### Step 7: Validate

Run these validation steps:

```bash
# 1. Syntax check
python3 -m py_compile agents/pydantic_ai/{agent_name}.py

# 2. Import test
python3 -c "from agents.pydantic_ai.{agent_name} import {agent_name}_agent; print('OK')"

# 3. Run agent test
python3 -m agents.pydantic_ai.test_{agent_name}

# 4. Verify Langfuse trace
# Open https://langfuse.dyniq.ai and check for new trace
```

### Step 8: Update Documentation

1. **Update ARCHITECTURE.md** with new component
2. **Add to graph diagram** in architecture doc
3. **Document any new ADRs** if architectural decisions made

---

## Checklist

Before marking agent as complete:

- [ ] Agent file created with proper structure
- [ ] System prompt is clear and specific
- [ ] Tools implemented (if needed)
- [ ] State fields added (if needed)
- [ ] Node added to graph
- [ ] Edges configured correctly
- [ ] Dependencies updated (if needed)
- [ ] Test file created
- [ ] All validations pass
- [ ] Langfuse trace visible
- [ ] Documentation updated

---

## Common Patterns

### Pattern: Structured Output

```python
from pydantic import BaseModel

class CompanyInfo(BaseModel):
    name: str
    industry: str
    employee_count: int | None
    website: str | None

research_agent = Agent(
    "openrouter:openai/gpt-4o-mini",
    deps_type=AgentDeps,
    output_type=CompanyInfo,  # Structured output (Pydantic AI v2)
    system_prompt="Extract company information...",
)
```

### Pattern: Tool with API Call

```python
@research_agent.tool
async def tavily_search(ctx, query: str) -> list[dict]:
    """Search using Tavily API."""
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": ctx.deps.tavily_api_key,
                "query": query,
                "max_results": 5,
            },
        )
        return response.json().get("results", [])
```

### Pattern: Conditional Graph Routing

```python
def should_deep_research(state: LeadState) -> str:
    """Route based on tier - HOT leads get deep research."""
    if state.get("tier") == "HOT":
        return "deep_research"
    return "quick_research"

builder.add_conditional_edges(
    "qualify",
    should_deep_research,
    {"deep_research": "deep_research", "quick_research": "quick_research"},
)
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Import error | Missing dependency | Check requirements.txt |
| "Invalid deps" | Missing env var | Check .env, run validate() |
| No Langfuse trace | Keys not set | Verify LANGFUSE_* env vars |
| Tool not called | LLM didn't invoke | Check system prompt clarity |
| State not updating | Wrong return format | Return dict with new fields |

---

## References

- [Pydantic AI Docs](https://ai.pydantic.dev/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [ARCHITECTURE.md](../docs/ARCHITECTURE-ai-agent-platform.md)
- [AgentDeps Pattern](../../agents/pydantic_ai/deps.py)

---

*Follow this SOP for consistent, observable, maintainable agents.*
