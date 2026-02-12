---
title: "Python Testing Patterns"
sidebar_label: "Python Testing Patterns"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Python Testing Patterns

Testing patterns for dyniq-ai-agents and Python projects.

## Test Stack

| Layer | Framework | Purpose |
|-------|-----------|---------|
| Async tests | pytest + anyio | Proper async/await handling |
| Mocking | unittest.mock | Cost-free CI/CD testing |
| HITL tests | Interrupt/resume pattern | Test approve/reject/edit flows |
| Performance | pytest-benchmark | Regression tracking |
| Integration | `@pytest.mark.integration` | Separate real API tests |

---

## Key Pattern: pytest-anyio (NOT pytest-asyncio)

**CRITICAL:** Use `@pytest.mark.anyio` not `@pytest.mark.asyncio`.

```python
# CORRECT
@pytest.mark.anyio
async def test_async_function():
    result = await some_async_call()
    assert result

# WRONG
@pytest.mark.asyncio  # Don't use this
async def test_async_function():
    ...
```

**Why:** anyio provides better async handling and is the standard for Pydantic AI projects.

### conftest.py Setup

```python
"""Shared fixtures for E2E testing."""
import pytest
from unittest.mock import AsyncMock, MagicMock

# Configure anyio for async tests
pytest_plugins = ["anyio"]

@pytest.fixture(scope="session")
def anyio_backend():
    """Use asyncio backend for anyio."""
    return "asyncio"
```

---

## Mocking External Services

### Mock OpenRouter (LLM calls)

```python
@pytest.fixture
def mock_openrouter():
    """Mock OpenRouter client - no API costs."""
    mock = AsyncMock()
    mock.chat.return_value = MagicMock(
        choices=[MagicMock(
            message=MagicMock(
                content='[{"task_id": 0, "status": "success", "result": "Generated content"}]'
            )
        )]
    )
    return mock
```

### Mock Supabase (Database)

```python
@pytest.fixture
def mock_supabase():
    """Mock Supabase client - isolated testing."""
    mock = MagicMock()
    mock.table.return_value.upsert.return_value.execute.return_value = MagicMock(
        data=[{"id": "test-uuid-001"}]
    )
    mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data={"edit_count": 0}
    )
    return mock
```

---

## HITL Testing Pattern

Test Human-in-the-Loop flows with approve/reject/edit scenarios:

```python
@pytest.mark.anyio
async def test_hitl_approve_flow():
    """Test HITL approval resumes graph correctly."""
    mock_result = {
        "status": "approved",
        "final_content": [{"content": "Approved content"}],
    }

    with patch("api.routes.hitl.resume_team_review", new=AsyncMock(return_value=mock_result)):
        with patch("api.routes.hitl.update_hitl_decision", new=AsyncMock(return_value=True)):
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
                headers={"X-API-Key": "test-key"},
            ) as client:
                response = await client.post(
                    "/api/hitl/resume",
                    json={
                        "thread_id": "test-thread-001",
                        "decision": "approve",
                        "feedback": "",
                    },
                )

    assert response.status_code == 200
    assert "approved" in response.json()["message"].lower()
```

### HITL Test Scenarios

| Scenario | Decision | Expected Result |
|----------|----------|-----------------|
| Approve | `"approve"` | Content published |
| Reject | `"reject"` | Content discarded, feedback stored |
| Edit | `"edit"` | Regeneration triggered |

---

## Integration Tests (Real API)

Separate integration tests that hit real APIs:

```python
@pytest.mark.integration
@pytest.mark.anyio
async def test_full_content_flow_integration():
    """Full E2E test with real production API."""
    import os
    api_key = os.getenv("AGENTS_API_KEY")
    if not api_key:
        pytest.skip("AGENTS_API_KEY not set")

    async with AsyncClient(
        base_url="https://agents-api.dyniq.ai",
        headers={"X-API-Key": api_key},
        timeout=180.0,
    ) as client:
        response = await client.post("/api/content/create", json={...})

    assert response.status_code == 200
```

### Running Integration Tests

```bash
# Get API key from Contabo
export AGENTS_API_KEY=$(ssh contabo "grep AGENTS_API_KEY /opt/dyniq-voice/.env" | cut -d'=' -f2)

# Run integration tests only
cd dyniq-ai-agents && pytest -m integration -v
```

---

## Custom Markers

Register custom markers in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
markers = [
    "integration: marks tests as integration tests (deselect with '-m \"not integration\"')",
]
```

---

## Performance Benchmarks

Use pytest-benchmark for tracking performance:

```python
def test_benchmark_5_posts(benchmark, mock_content_generator):
    """Benchmark: 5 posts should complete in <60s."""

    async def generate_5():
        result = await mock_content_generator(5)
        return result

    benchmark.pedantic(lambda: asyncio.run(generate_5()), rounds=3, iterations=1)

    benchmark.extra_info["target_latency_ms"] = 60_000
    benchmark.extra_info["target_throughput"] = 0.08
```

### Performance Targets

| Batch Size | Max Latency | Min Throughput |
|------------|-------------|----------------|
| 5 posts | 60s | 0.08 posts/sec |
| 10 posts | 120s | 0.08 posts/sec |
| 50 posts | 600s | 0.08 posts/sec |

---

## Test File Structure

```
tests/
├── conftest.py              # Shared fixtures
├── e2e/
│   ├── __init__.py
│   └── test_content_pipeline.py
└── benchmark/
    ├── __init__.py
    └── test_performance.py
```

---

## Running Tests

```bash
# All E2E tests (mocked)
cd dyniq-ai-agents && pytest tests/e2e/ -v -k "not integration"

# All benchmark tests
cd dyniq-ai-agents && pytest tests/benchmark/ -v --benchmark-disable

# Full validation
cd dyniq-ai-agents && ruff check tests/ && pytest tests/ -v -k "not integration"
```

---

## Cross-Directory Testing

When running tests from a different directory (e.g., walker-os), use skipif for graceful degradation:

```python
try:
    from api.main import app
except ImportError:
    app = None

@pytest.mark.anyio
@pytest.mark.skipif(app is None, reason="App not available")
async def test_requires_app():
    ...
```

---

## Advanced Mock Patterns

**Advanced mock patterns (path conventions, sys.modules):** @pytest-mock-patterns.md

---

*Patterns updated from Phase 6 Style Transfer Sprint (2026-02-03)*
