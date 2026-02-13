---
title: "EPIC Completion Checklist"
sidebar_label: "EPIC Completion Checklist"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# EPIC Completion Checklist

Mandatory verification before marking any EPIC "COMPLETE".

**Origin:** System review 2026-01-30 - EPIC claimed 100% but was actually 83%

---

## Before Marking EPIC Complete

### 1. Test Suite Verification

```bash
# Run full test suite for the feature
cd [repo] && pytest tests/test_[feature].py -v

# Expected: ALL tests passing (not just "most")
```

- [ ] All tests pass (not 31/35, must be 35/35)
- [ ] No skipped tests without documented reason
- [ ] Integration tests included

### 2. API Health Check

```bash
# For deployed features
curl -s https://[api-domain]/health
```

- [ ] Health endpoint returns OK
- [ ] All dependent services healthy
- [ ] No error logs in last 24h

### 3. Observability Verification

```bash
# Trigger feature, then check Langfuse
# 1. Call the API endpoint
# 2. Check https://langfuse.dyniq.ai for traces
```

- [ ] Langfuse traces appear for feature
- [ ] All spans complete (no orphaned traces)
- [ ] Error rates within acceptable range

### 4. Production Deployment

- [ ] Code deployed to production
- [ ] No rollback needed
- [ ] Verified working via production URL (not localhost)

### 5. Documentation

- [ ] EPIC status updated to reflect actual completion %
- [ ] Deferred stories documented with reason
- [ ] README updated if needed

---

## Verification Script

```bash
#!/bin/bash
# Run this before marking EPIC complete

FEATURE=$1
REPO=$2
API_URL=$3

echo "=== EPIC Completion Verification ==="

# 1. Tests
echo "Running tests..."
cd $REPO && pytest tests/test_$FEATURE.py -v --tb=short
TEST_RESULT=$?

# 2. API Health
echo "Checking API health..."
HEALTH=$(curl -s $API_URL/health | jq -r '.status')

# 3. Summary
echo ""
echo "=== Results ==="
echo "Tests: $([ $TEST_RESULT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "API Health: $HEALTH"
echo ""
echo "If both PASS, EPIC can be marked COMPLETE"
```

---

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Marking done before all tests pass | Run full test suite, not just changed tests |
| Not checking production | Always verify production URL, not localhost |
| Missing observability | Check Langfuse traces exist |
| Deferred stories hidden | Document deferrals explicitly in EPIC status |

---

## Status Format

**Correct:**
```markdown
**Status:** ✅ S1-S3 COMPLETE | S4-S6 83% (5 deferred) | ⬅️ S7 NEXT
```

**Incorrect:**
```markdown
**Status:** ✅ COMPLETE  <!-- Hidden: 5 stories deferred -->
```

---

*Added 2026-01-30 after board-meeting EPIC status discrepancy*
