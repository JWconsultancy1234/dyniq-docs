---
title: "pytest Mock Patterns"
sidebar_label: "pytest Mock Patterns"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# pytest Mock Patterns

Advanced mocking patterns for Python tests, particularly for lazy imports and path conventions.

---

## Mock Path Convention

**Pattern detected 3x (SAC-012, SAC Phase 3, Story 07):** Mock where function LIVES, not where it's USED.

### Problem

```python
# vector_storage.py imports from shared.vector_store
from agents.pydantic_ai.shared.vector_store import search_similar

# WRONG - mocking the usage location
@patch("agents.pydantic_ai.style_transfer.vector_storage.search_similar")

# CORRECT - mocking the source location
@patch("agents.pydantic_ai.shared.vector_store.search_similar")
```

### Quick Rule

```
Module A imports function B from Module C
→ Mock path is: Module_C.function_B
```

### Common Mock Path Errors

| Import Statement | Wrong Mock Path | Correct Mock Path |
|-----------------|-----------------|-------------------|
| `from shared.vector_store import search_similar` | `module.search_similar` | `shared.vector_store.search_similar` |
| `from spawn_manager import SpawnManager` | `supervisor.SpawnManager` | `spawn_manager.SpawnManager` |

### Files With This Pattern

- `tests/unit/style_transfer/test_vector_storage.py`
- `tests/unit/board_meeting/test_spawn_manager.py`
- `tests/unit/board_meeting/test_supervisor.py`

---

## sys.modules Mock Pattern (Lazy Imports)

**Pattern detected 3x:** When testing functions that use lazy imports of system libraries (WeasyPrint, Pillow with GTK deps), standard `@patch` doesn't work because the import itself fails before the patch is applied.

### Problem

```python
# This fails because weasyprint import raises OSError on macOS without GTK
@patch("weasyprint.HTML")  # Import fails BEFORE patch applied
def test_pdf_generator():
    ...
```

### Solution: sys.modules Mock

```python
import sys
from unittest.mock import MagicMock

# Create mock BEFORE importing the module that uses weasyprint
mock_weasyprint = MagicMock()
mock_weasyprint.HTML.return_value.write_pdf.return_value = b"%PDF-1.4 mock content"
sys.modules["weasyprint"] = mock_weasyprint

# NOW import the function that uses lazy import of weasyprint
from agents.pydantic_ai.style_transfer.pdf_generator import generate_pdf

@pytest.mark.anyio
async def test_generate_pdf():
    """Test PDF generation with mocked weasyprint."""
    result = await generate_pdf(content)
    assert result.startswith(b"%PDF")
```

### When to Use

| Scenario | Use sys.modules Mock |
|----------|---------------------|
| Testing code with lazy imports | ✅ Yes |
| System library not installed (GTK, ImageMagick) | ✅ Yes |
| Import-time failures | ✅ Yes |
| Standard library imports | ❌ Use @patch |
| Already-imported modules | ❌ Use @patch |

### Files Using This Pattern

- `tests/unit/style_transfer/test_pdf_generator.py`
- `tests/unit/style_transfer/test_image_compositor.py`

### Related: Lazy Import Pattern (Code Side)

```python
# In the actual module - use lazy import to avoid import-time failures
HTML = None  # Placeholder at module level

async def generate_pdf(content: PDFContent) -> bytes:
    from weasyprint import HTML  # Only fails if function actually called
    ...
```

This pattern pair (lazy import + sys.modules mock) enables testing code that depends on system libraries not available in all environments.

---

*Extracted from testing-patterns.md (2026-02-06)*
*Patterns validated across Phase 6 Style Transfer Sprint (2026-02-03)*
