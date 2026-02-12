---
title: "Security Credential Scan Command"
sidebar_label: "Security Credential Scan Command"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Security Credential Scan Command

**Command:** `/security-scan`
**Owner:** CTO
**Auto-Invoked:** No (manual on-demand)

---

## Purpose

Scans codebase for exposed credentials before commits. Runs the same patterns as the pre-commit hook but allows manual invocation.

---

## Usage

```bash
# Scan all relevant files in current directory
/security-scan

# Scan specific directory
/security-scan ./docs

# Scan staged files only (same as pre-commit)
/security-scan --staged
```

---

## Patterns Detected

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| Supabase project IDs | 20+ char alphanumeric before `.supabase.co` | `abcdefghij123456789.supabase.co` |
| JWT tokens | `eyJ` followed by base64 | `eyJhbGciOiJIUzI1...` |
| Hardcoded passwords | `password = "..."` | `password: "****"` |
| API keys | `api_key = "..."` with 20+ chars | `api_key: "sk-****"` |
| OpenAI/OpenRouter keys | `sk-` followed by 20+ chars | `sk-abcdefghij123456789` |
| Basic auth | `admin / password` pattern | `admin / ****` |

---

## Execution

The command runs the pre-commit security scan hook on the specified files:

```bash
# Runs: .claude/hooks/pre-commit-security-scan.sh
```

---

## Output

### Clean Scan

```
🔒 Running security scan for exposed credentials...
  Checking for Supabase project IDs...
  Checking for JWT tokens...
  Checking for hardcoded passwords...
  Checking for API key patterns...
  Checking for basic auth credentials...
  Checking for LLM API keys...
✅ Security scan passed - no credentials detected
```

### Issues Found

```
🔒 Running security scan for exposed credentials...
  Checking for Supabase project IDs...
❌ BLOCKED: Supabase project ID found in documentation
   Use $SUPABASE_URL or $SUPABASE_PROJECT_ID instead

═══════════════════════════════════════════════════════════
  COMMIT BLOCKED: Credentials detected in staged files
═══════════════════════════════════════════════════════════

Fix the issues above and try again.
Reference: core-rules.md → Credential Placeholders
```

---

## Integration with Pre-Commit

This command uses the same script as the git pre-commit hook:
- `.claude/hooks/pre-commit-security-scan.sh`

The hook runs automatically on every commit after installation:
```bash
.claude/hooks/install-hooks.sh
```

---

## CI/CD Integration

For GitHub Actions, add to your workflow:

```yaml
- name: Security Credential Scan
  run: |
    .claude/hooks/pre-commit-security-scan.sh
```

---

## Incident Reference

**SEC-2026-02-02:** 44+ files had exposed Supabase project IDs and passwords in documentation. This command and pre-commit hook were created to prevent recurrence.

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/security-review` | OWASP security review for features |
| `/commit` | Includes security scan before commit |

---

*"Never commit credentials. When in doubt, use `$ENV_VAR` placeholders."*
