---
title: "Brand Audit Checklist"
sidebar_label: "Brand Audit Checklist"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Brand Audit Checklist

Reference for `/brand-audit` command. Enumerates all file categories that contain brand elements.

---

## Brand Elements to Grep

| Element | Example Patterns |
|---------|-----------------|
| Archetype name | `Magician`, `Everyman`, `Caregiver` |
| Primary color hex | `#00D4FF`, `#3B82F6` |
| Secondary color hex | `#8B5CF6`, `#10B981` |
| Color names | `Electric Purple`, `Emerald Green`, `Cyber Blue` |
| Taglines | `"AI die belt"`, `"Ontmoet Ruben"` |
| Ruben title | `"Digital Sales Expert"`, `"Uw Digitale Collega"` |
| Power words | `Transformeer`, `Magie`, `Werkt`, `Simpel` |
| Brand gradient | `cyan-to-purple`, `cyan-to-green` |

---

## File Categories

### Category 1: Reference Docs (walker-os)

**Path:** `*.md`
**Examples:** `content-creation.md`, `agent-hierarchy-100.md`
**Contains:** Brand quick reference tables, color definitions, archetype mentions
**Action:** Fix immediately

### Category 2: Agent Configs + Memory (walker-os)

**Path:** `.claude/agents/*.md`, `.claude/agents/specialists/*.md`, `.claude/agent-memory/*/MEMORY.md`
**Examples:** `brand-strategist.md`, `creative-director.md`, `vp-marketing-brand.md`
**Contains:** Brand identity constraints, color palettes, voice guidelines
**Action:** Fix immediately

### Category 3: Commands (walker-os + dyniq-app)

**Path:** `.claude/commands/**/*.md`
**Examples:** `build-landing.md`, `create-linkedin-post.md`, `create-email.md`
**Contains:** Brand guidelines sections, color references in output specs
**Action:** Fix immediately

### Category 4: Document Templates (walker-os)

**Path:** `.agents/docs/templates/*.md`
**Examples:** `dyniq-welcome-brochure-nl.md`, `dyniq-roadmap-day1-30-nl.md`
**Contains:** Design notes with colors, taglines, print specs
**Action:** Fix immediately

### Category 5: Email Templates (dyniq-app)

**Path:** `templates/email/**/*.html`
**Examples:** `welcome-client.html`, `booking-confirmation.html`, `signature.html`
**Contains:** Inline CSS with brand color hex values in gradients and accents
**Action:** Fix immediately (customer-facing)

### Category 6: Backlog Items (walker-os)

**Path:** `plans/*.md`, `features/*.md`, `epics/*.md`
**Examples:** `PLAN-linear-setup-*.md`, `EPIC-dyniq-*.md`, `PRD-*.md`
**Contains:** Brand references in design specs, acceptance criteria
**Action:** Fix active items. Skip items in `done/`.

### Category 7: SOPs (walker-os + dyniq-app)

**Path:** `.agents/sops/*.md`, `SOP-*.md`
**Examples:** `SOP-everyman-brand-voice.md`, `SOP-DYNIQ-MASTER.md`
**Contains:** Brand color tables, visual guidelines
**Action:** Fix immediately

### Category 8: READMEs + Landing Docs (dyniq-app)

**Path:** `README.md`, `docs/*.md`, `landing-page.md`
**Examples:** `README.md`, `03-GTM-PLAYBOOK.md`
**Contains:** Brand archetype descriptions, color references
**Action:** Fix immediately

### Category 9: LinkedIn/Social Guides (both repos)

**Path:** `templates/linkedin/*.md`, `.agents/content/linkedin/*.md`
**Examples:** `SETUP-GUIDE.md`, `E3-006-posting-guide.md`
**Contains:** Visual spec colors, brand gradient references
**Action:** Fix immediately

### Category 10: Landing Page Code (dyniq-app)

**Path:** `apps/landing/src/**/*.{tsx,css,astro}`
**Contains:** Actual CSS colors, component text, meta descriptions
**Action:** Track in sprint issues (code changes need build verification)

---

## SKIP Categories (Historical/Archive)

| Path Pattern | Reason |
|--------------|--------|
| `.agents/logs/` | Historical execution/review logs |
| `done/` | Completed work items |
| `.agents/docs/archive/` | Archived documents |
| `docs/archive/` | Archived docs |
| `.agents/context/archive/` | Archived context |
| Board meeting logs | Documents the transition itself |
| Research docs | Factual analysis of prior patterns |
| Files saying "AVOID old X" | Correct - references old as negative |

---

## Grep Command Templates

```bash
# All active files (exclude archive/done/logs)
grep -r "PATTERN" /path/to/repo \
  --include="*.md" --include="*.tsx" --include="*.html" --include="*.css" \
  | grep -v "/archive/" | grep -v "/done/" | grep -v "/logs/" \
  | grep -v "node_modules"

# Color hex (case-insensitive for CSS)
grep -ri "#8B5CF6" /path/to/repo \
  --include="*.md" --include="*.tsx" --include="*.html" --include="*.css"

# Email templates specifically
grep -r "PATTERN" templates/email/ --include="*.html"
```

---

## Impact Baseline (2026-02-10 Audit)

| Category | Files Found | Effort |
|----------|-------------|--------|
| Reference docs | 8 | 15 min |
| Agent configs/memory | 6 | 10 min |
| Commands | 3 | 5 min |
| Document templates | 3 | 5 min |
| Email templates | 7 | 5 min (bulk replace) |
| Backlog items | 3 | 5 min |
| SOPs | 1 | 2 min |
| READMEs/landing docs | 2 | 3 min |
| **Total** | **33** | **~50 min** |

---

*Created 2026-02-10 from brand audit execution. Referenced by `/brand-audit` command.*
