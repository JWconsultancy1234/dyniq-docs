---
sidebar_position: 1
title: Security & GDPR
description: Security practices, GDPR compliance, and data governance for the DYNIQ platform
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Security & GDPR

Security and compliance documentation for the DYNIQ platform.

## Data Architecture

### Two Supabase Projects

:::danger Never Confuse These
DYNIQ and Walker-OS use separate Supabase projects. Cross-contamination causes data leaks.
:::

| Database | Purpose | Contains |
|----------|---------|----------|
| **DYNIQ** | Business data | Leads, board meetings, content, agent training |
| **Walker-OS** | Personal data | Timeblocks, scorecards, financial data |

### Data Routing Rules

| Data Type | Target Database |
|-----------|-----------------|
| Board meetings | DYNIQ |
| Leads, quiz responses | DYNIQ |
| Timeblocks, scorecards | Walker-OS |
| Net worth, cashflow | Walker-OS |

## GDPR Compliance

### Data Collection

| Data Point | Legal Basis | Retention |
|-----------|-------------|-----------|
| Lead name, email, phone | Legitimate interest (B2B) | Until deletion request |
| Quiz responses | Consent (ScoreApp form) | 90 days after last activity |
| Call recordings | Explicit consent | 90 days |
| Company information | Legitimate interest | Until deletion request |

### Consent Requirements

**Voice calls (Ruben):**
- Clients must sign GDPR consent form before go-live
- Ruben announces recording at start of each call
- Recordings stored max 90 days
- Deletion on request within 72 hours

**Quiz (Groei-Scan):**
- ScoreApp handles consent via form submission
- Data transferred to Supabase via n8n webhook
- Email-based deduplication (upsert on email)

### Data Subject Rights

| Right | Implementation |
|-------|---------------|
| Access (Art. 15) | Export from Supabase leads table |
| Rectification (Art. 16) | Update via Supabase dashboard |
| Erasure (Art. 17) | Delete from leads + quiz_responses + call recordings |
| Portability (Art. 20) | JSON export via Supabase API |

### Erasure Procedure

```bash
# 1. Find all records for the data subject
# Supabase DYNIQ database
curl -s "$DYNIQ_SUPABASE_URL/rest/v1/leads?email=eq.user@example.com" \
  -H "apikey: $DYNIQ_SERVICE_KEY"

# 2. Delete lead record
curl -X DELETE "$DYNIQ_SUPABASE_URL/rest/v1/leads?email=eq.user@example.com" \
  -H "apikey: $DYNIQ_SERVICE_KEY"

# 3. Delete quiz responses
curl -X DELETE "$DYNIQ_SUPABASE_URL/rest/v1/quiz_responses?email=eq.user@example.com" \
  -H "apikey: $DYNIQ_SERVICE_KEY"

# 4. Delete call recordings (Langfuse)
# Manual: Search by phone number in Langfuse UI, delete traces
```

## API Key Management

### Key Locations

| Key | Location | Rotation |
|-----|----------|----------|
| Agents API | `/opt/dyniq-voice/.env` | On compromise |
| Supabase Service | `/opt/dyniq-voice/.env` | On compromise |
| OpenRouter | `/opt/dyniq-voice/.env` | Monthly recommended |
| n8n API | `/opt/n8n/.env` | On compromise |
| Langfuse | `/opt/langfuse/.env` | On compromise |

### Key Safety Rules

- Never commit keys to git (pre-commit hook blocks this)
- Never print key VALUES in logs (print key NAMES only)
- Use environment variables, never hardcode
- Separate `.env` files per stack (n8n vs dyniq-voice)

### Pre-Commit Credential Scan

The repository has an automated pre-commit hook that blocks commits containing exposed credentials:

```bash
# Install hooks
.claude/hooks/install-hooks.sh

# Manual scan
grep -rn "sk-\|eyJ\|ghp_\|AKIA" --include="*.py" --include="*.ts" --include="*.md"
```

## Network Security

### Cloudflare Protection

All `*.dyniq.ai` domains are proxied through Cloudflare:
- DDoS protection
- SSL termination
- 100-second request timeout
- Rate limiting (configured per domain)

### Internal Network Isolation

Docker networks isolate service groups:

| Network | Services |
|---------|----------|
| `voice-net` | LiveKit, Ruben, agents-api, Caddy |
| `n8n_default` | n8n, n8n-postgres |
| `langfuse_default` | Langfuse, ClickHouse, Redis |
| `metabase_metabase-net` | Metabase |

Services can only communicate within their network unless Caddy bridges them.

### Port Exposure

Only these ports are exposed to the internet:

| Port | Service | Purpose |
|------|---------|---------|
| 80/443 | Caddy | HTTP/HTTPS |
| 5060 | SIP | Voice calls |
| 7880-7882 | LiveKit | WebSocket/RTC/TURN |
| 10000-10100 | SIP RTP | Voice media |

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|-------|-----------|--------------|
| P1 | Data breach, service down | Immediate |
| P2 | Security vulnerability found | 4 hours |
| P3 | Audit finding | 24 hours |
| P4 | Improvement suggestion | Next sprint |

### Response Steps

1. **Contain**: Isolate affected service (`docker stop [container]`)
2. **Assess**: Check logs (`docker logs [container] --tail=100`)
3. **Fix**: Apply patch, rebuild, redeploy
4. **Verify**: Health check all services
5. **Document**: Add to incident log and troubleshooting guide
