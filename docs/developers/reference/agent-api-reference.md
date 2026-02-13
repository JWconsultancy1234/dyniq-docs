---
title: "Agent API Reference"
sidebar_label: "Agent API Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Agent API Reference

> API endpoints, board meeting command, and SAC module reference for `dyniq-ai-agents`.

---

## Agent Infrastructure v3.1 (EPIC Complete)

### New Personas

| Persona | File | Role |
|---------|------|------|
| Content Director | `content-director.md` | Content strategy + batch generation |
| Creative Director | `creative-director.md` | Visual design + image generation |

### Content API Endpoints (agents-api.dyniq.ai)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content/create` | POST | Generate text/visual/combined content |
| `/api/hitl/resume` | POST | Resume paused graph with decision |
| `/api/hitl/pending` | GET | List pending HITL approvals |

### Vision Pipeline API (agents-api.dyniq.ai)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vision/ui-to-code` | POST | Image/text → React code (Kimi K2.5 native) |
| `/api/vision/status/{thread_id}` | GET | Check generation status |
| `/api/vision/feedback` | POST | Submit feedback on generated code |

**Input (any one required):**
- `image_base64` - Base64 encoded image (PNG, JPG, WebP)
- `image_url` - URL to image
- `description` - Text description (if no image)

**Optional:** `components_hint[]`, `brand_colors[]`, `context`

**Returns:** `thread_id`, `status`, `component_code`, `types_code`, `confidence`, `cost_usd`, `model`

**Cost:** ~€0.05/request | **Time:** ~30s | **Model:** Kimi K2.5 (native vision)

---

## Board Meeting Command

**Modes:**

| Mode | Description | Endpoint |
|------|-------------|----------|
| `interactive` | Local Claude CLI execution | N/A (local) |
| `kimi` | API dispatch for parallel analysis | agents-api.dyniq.ai/api/board-meeting/analyze |
| `hybrid` | Local framing + Kimi analysis | Mixed |

**API Endpoints:**

| Action | Method | URL |
|--------|--------|-----|
| Start meeting | POST | `agents-api.dyniq.ai/api/board-meeting/analyze` |
| Check status | GET | `agents-api.dyniq.ai/api/board-meeting/status/{id}` |
| Resume after HITL | POST | `agents-api.dyniq.ai/api/board-meeting/resume` |

**Langfuse Traces:** Check `langfuse.dyniq.ai` for execution traces

**Timeout:** 100s Cloudflare limit (Level 4 43-agent swarm = 134s → use async polling)
**Agent Count:** Dynamic 6-81 based on complexity level

**API Parameters:**

| Parameter | Default | Notes |
|-----------|---------|-------|
| `level` | 2 | 0-5 (more agents at higher levels) |
| `skip_research` | `true` for level 0-1 | Skip R&D web search (saves 30s+) |
| `decision_type` | required | financial, technical, operational, strategic, market |

**Calibration Endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /api/board-meeting/agent-calibration/{agent}` | Single agent ECE/ACE metrics |
| `GET /api/board-meeting/calibration-report` | All agents calibration report |

**Tier Calibration Thresholds (SAC-018):**

| Tier | ECE Good | ECE Warning | Min Predictions |
|------|----------|-------------|-----------------|
| C-Suite | 0.03 | 0.07 | 10 |
| VP | 0.05 | 0.10 | 10 |
| Director | 0.07 | 0.12 | 10 |
| Industry Advisor | 0.08 | 0.15 | 5 |
| Task Force | 0.10 | 0.20 | 5 |

**CRITICAL:** Use agents-api.dyniq.ai:8000, NOT ruben-api.dyniq.ai:8080

---

## SAC Phase 3 Modules (dyniq-ai-agents)

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `spawn_manager.py` | Dynamic Task Force spawning | `SpawnManager`, `execute_task_force_worker()` |
| `llm_monitor.py` | LLM landscape monitoring | `fetch_openrouter_models()`, `scrape_with_kimi()` |
| `calibration/engine.py` | Tier-aware calibration | `classify_status()`, `compute_tier_calibration_report()` |

---

## Testing Commands

```bash
# E2E tests (mocked, fast)
cd dyniq-ai-agents && pytest tests/e2e/ -v -k "not integration"

# Integration tests (real API - requires AGENTS_API_KEY)
cd dyniq-ai-agents && pytest -m integration -v

# Performance benchmarks
cd dyniq-ai-agents && pytest tests/benchmark/ --benchmark-only
```

---

## Python Logging Pattern (dyniq-ai-agents)

**CRITICAL:** Always use shared logger for visible server logs.

| Use (Visible) | Don't Use (Invisible) |
|---------------|----------------------|
| `from shared.utils.logging import get_logger` | `import logging` |
| `logger = get_logger("module_name")` | `logger = logging.getLogger(__name__)` |

**Incident 2026-02-03:** R&D research logs invisible because modules used `logging.getLogger()`.

---

*Reference doc for agent APIs. Parent: CLAUDE.md*
