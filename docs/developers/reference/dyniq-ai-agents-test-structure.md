---
title: "dyniq-ai-agents Test Structure"
sidebar_label: "dyniq-ai-agents Test Structure"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# dyniq-ai-agents Test Structure

Reference for test organization and avoiding conftest conflicts in the dyniq-ai-agents repository.

---

## Directory Structure

```
dyniq-ai-agents/
└── tests/
    ├── conftest.py          # Global fixtures (autouse for API key, slowapi)
    ├── unit/                 # Isolated unit tests
    │   ├── conftest.py       # Override global autouse fixtures
    │   ├── test_vector_store.py
    │   └── test_*.py
    ├── e2e/                  # End-to-end tests (hit real API)
    │   └── test_*.py
    ├── integration/          # Integration tests (mocked external services)
    │   └── test_*.py
    └── benchmark/            # Performance benchmarks
        └── test_*.py
```

---

## Global conftest.py Issues

**Problem:** The root `tests/conftest.py` has `autouse=True` fixtures that import heavy dependencies:

```python
# tests/conftest.py - PROBLEMATIC
@pytest.fixture(autouse=True)
def mock_api_key_validation():
    """Auto-patches API key for ALL tests."""
    from api.security import API_KEY  # Imports slowapi, etc.
    # ...
```

**Impact:** Unit tests importing from `agents/` fail because they trigger API imports.

---

## Solution: Unit Test Isolation

Create `tests/unit/conftest.py` to override global fixtures:

```python
# tests/unit/conftest.py
"""Override global autouse fixtures for isolated unit tests."""

import pytest

@pytest.fixture(autouse=True)
def mock_api_key_validation():
    """Override global fixture - do nothing for unit tests."""
    yield
```

---

## Test Type Guidelines

| Type | Location | Fixtures | What to Test |
|------|----------|----------|--------------|
| **Unit** | `tests/unit/` | Override conftest | Pure functions, isolated logic |
| **Integration** | `tests/integration/` | Mock external services | Module interactions |
| **E2E** | `tests/e2e/` | Global conftest | Full API workflows |
| **Benchmark** | `tests/benchmark/` | Global conftest | Performance metrics |

---

## Common Patterns

### Unit Test Template

```python
# tests/unit/test_my_module.py
"""Unit tests for my_module."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from agents.pydantic_ai.my_module import my_function


@pytest.fixture
def mock_dependency():
    """Mock external dependency."""
    with patch("agents.pydantic_ai.my_module.external_dep") as mock:
        yield mock


@pytest.mark.asyncio
async def test_my_function(mock_dependency):
    mock_dependency.return_value = "mocked"
    result = await my_function("input")
    assert result == "expected"
```

### Mock Path Convention

**CRITICAL:** Mock where the function is USED, not where it LIVES.

```python
# If my_module.py has: from other_module import some_function

# CORRECT - mock import location
@patch("agents.pydantic_ai.my_module.some_function")

# WRONG - mock source location
@patch("agents.pydantic_ai.other_module.some_function")
```

---

## Running Tests

```bash
# Unit tests only (fast, isolated)
cd dyniq-ai-agents && pytest tests/unit/ -v

# Integration tests
cd dyniq-ai-agents && pytest tests/integration/ -v

# E2E tests (requires running server)
cd dyniq-ai-agents && pytest tests/e2e/ -v -k "not integration"

# All tests
cd dyniq-ai-agents && pytest tests/ -v
```

---

## Troubleshooting

### "ModuleNotFoundError" in Unit Tests

**Cause:** Global conftest.py importing API modules.
**Fix:** Create `tests/unit/conftest.py` to override autouse fixtures.

### "slowapi" Import Errors

**Cause:** API security module imported via fixture.
**Fix:** Use unit test isolation pattern above.

### Tests Pass Locally, Fail in CI

**Cause:** Different Python path or missing fixtures.
**Fix:** Ensure conftest.py override is present in test directory.

---

## Pattern History

| Date | Issue | Solution |
|------|-------|----------|
| 2026-01-29 | langfuse E2E import errors | Test production API instead |
| 2026-01-30 | map-reduce PM import errors | Run tests after each file |
| 2026-02-02 | SAC Phase 4 API key fixture | Added autouse fixture |
| 2026-02-02 | UIL Phase 3 vector_store | Created tests/unit/conftest.py |

**Threshold:** 4 occurrences → This reference doc created.

---

*Last updated: 2026-02-02*
*Reference: `.agents/logs/system-reviews/uil-phase3-vector-intelligence-review-2026-02-02.md`*
