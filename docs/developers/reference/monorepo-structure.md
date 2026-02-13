---
title: "DYNIQ Monorepo Structure Reference"
sidebar_label: "DYNIQ Monorepo Structure Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# DYNIQ Monorepo Structure Reference

Quick reference for navigating the multi-repo DYNIQ architecture.

---

## Multi-Repo Architecture

| Repo | Path | Language | Purpose |
|------|------|----------|---------|
| Walker-OS | `/Users/walker/Desktop/Code/walker-os` | TypeScript (Next.js) | Personal OS, freedom tracking |
| DYNIQ App | `/Users/walker/Desktop/Code/dyniq-app` | Mixed (Astro + Next.js) | Landing page + demos |
| Agents API | `/Users/walker/Desktop/Code/dyniq-ai-agents` | Python | Ruben voice AI, board meeting |
| BolScout | `/Users/walker/Desktop/Code/bolscout-app` | TypeScript | Path A product |

---

## dyniq-app Internal Structure

### Apps (monorepo within dyniq-app)

| App | Path | Framework | Use Case |
|-----|------|-----------|----------|
| **Landing** | `apps/landing/` | Astro | Sales/marketing site (dyniq.ai) |
| **Demo** | `apps/demo/` | Next.js 16 | Interactive feature demos |

### When to Use Each

| Task | Target | Framework | Notes |
|------|--------|-----------|-------|
| Landing page copy | `apps/landing/` | Astro | Static content, SEO optimized |
| Interactive demo | `apps/demo/` | Next.js | Real-time state, SSE streaming |
| API integration UI | `apps/demo/` | Next.js | Server components, hooks |

### Demo App Routes (Next.js 16)

| Route | Purpose | File |
|-------|---------|------|
| `/` | Demo index | `src/app/page.tsx` |
| `/style` | Style transfer demo | `src/app/style/page.tsx` |

---

## Pre-Implementation Repo Checklist

Before starting ANY implementation:

- [ ] Plan specifies target app/repo
- [ ] Framework confirmed (Astro, Next.js, FastAPI)
- [ ] File path matches repo structure
- [ ] If unclear → ASK user

**Decision Tree:**

```
Is it a marketing page?
├── Yes → apps/landing/ (Astro)
└── No → Is it interactive/demo?
    ├── Yes → apps/demo/ (Next.js)
    └── No → Is it API/backend?
        ├── Yes → dyniq-ai-agents/ (FastAPI)
        └── No → walker-os/apps/web/ (Next.js)
```

---

## Database Ownership

| Database | Purpose | Owner Repo |
|----------|---------|------------|
| **Walker-OS** | Personal productivity, timeblocks | walker-os |
| **DYNIQ** | Leads, content, board meetings | dyniq-ai-agents |

See @infrastructure-architecture.md for full details.

---

## Incident History

| Date | Issue | Time Wasted | Resolution |
|------|-------|-------------|------------|
| 2026-02-03 | Phase 6 demo created in wrong repo | 10 min | Added Phase 1.5 verification |
| 2026-02-02 | Database targeting confusion | 15 min | Added to pre-implementation checklist |
| 2026-02-02 | Migration in wrong repo | 10 min | Documented pattern |

**Pattern hit 3x threshold → This reference doc created.**

---

*Reference this doc when starting frontend or multi-repo work.*
