# Contributing to DYNIQ Docs

Guide for VAs, contractors, and team members contributing to [docs.dyniq.ai](https://docs.dyniq.ai).

## Setup

```bash
git clone https://github.com/JWconsultancy1234/dyniq-docs.git
cd dyniq-docs
npm install
npm start        # http://localhost:3000
```

Requires Node.js 20+.

## Writing Style

| Rule | Example |
|------|---------|
| Use "we" not "I" | "We recommend..." not "I suggest..." |
| Active voice | "The agent processes..." not "It is processed by..." |
| Present tense | "This endpoint returns..." not "This endpoint will return..." |
| Short sentences | Max 25 words per sentence |
| Code blocks | Always specify language (```python, ```bash, ```yaml) |

**Tone:** Professional but approachable. Explain concepts simply. Avoid jargon without definition.

## Frontmatter (Required)

Every doc must have YAML frontmatter:

```yaml
---
title: Page Title
sidebar_label: Short Label
sidebar_position: 1
owner: walker
last_review: 2026-02-12
classification: internal
---
```

| Field | Required | Values |
|-------|----------|--------|
| `title` | Yes | Full page title |
| `sidebar_label` | No | Shorter nav label |
| `sidebar_position` | No | Sort order (lower = higher) |
| `owner` | Yes | GitHub username |
| `last_review` | Yes | YYYY-MM-DD |
| `classification` | Yes | `public`, `internal`, `confidential` |

## File Organization

```
docs/
  developers/       # Architecture, API, infrastructure
  guides/            # How-to guides, tutorials
  workflows/         # n8n templates
  internal/          # SOPs, runbooks, security
```

- Use kebab-case for filenames: `voice-pipeline-overview.md`
- One topic per file (max 300 lines)
- Images go in `static/img/` with descriptive names

## PR Process

1. Create branch: `docs/description-of-change`
2. Write or update docs following style guide
3. Run locally: `npm start` and verify rendering
4. Submit PR using the docs PR template
5. Request review from doc owner (see frontmatter)

**Review criteria:**
- Frontmatter complete and correct
- Spell check passes (`npx cspell "docs/**/*.md"`)
- No broken links
- Code examples are tested and work
- Follows writing style guide

## Spell Check

We use cspell. To add project-specific words:

```bash
# Add to cspell.json wordlist
npx cspell "docs/**/*.md" --no-progress
```

## Questions?

Open an issue using the "Doc Request" template or reach out in the team channel.
