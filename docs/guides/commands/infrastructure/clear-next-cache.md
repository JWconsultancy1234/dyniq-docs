---
title: "Clear Next.js Cache"
sidebar_label: "Clear Next.js Cache"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Clear Next.js Cache

**Command:** `/clear-next-cache`
**Owner:** CTO
**Purpose:** Fix Turbopack cache corruption errors

---

## When to Use

**Symptoms:**
- `[Error: Failed to open database]`
- `invalid digit found in string`
- Dev server won't start
- Lock file conflicts

**Common Triggers:**
- After heavy file refactoring
- After switching branches with many changes
- After pulling major updates
- When dev server mysteriously fails

---

## What It Does

1. Kills any running Next.js dev servers
2. Removes `.next` directory (build cache)
3. Removes `.turbo` directory (Turbopack cache)
4. Removes `node_modules/.cache` (dependency cache)
5. Removes lock files
6. Verifies cleanup complete

---

## Usage

```bash
/clear-next-cache
```

**Then:**
```bash
pnpm dev  # Start clean dev server
```

---

## Implementation

```bash
#!/bin/bash

echo "🧹 Clearing Next.js caches..."

# 1. Kill running dev servers
pkill -f "next dev" 2>/dev/null && echo "✅ Stopped running dev servers" || echo "ℹ️  No dev servers running"

# 2. Remove Next.js build cache
rm -rf .next && echo "✅ Cleared .next" || echo "⚠️  .next not found"

# 3. Remove Turbopack cache
rm -rf .turbo && echo "✅ Cleared .turbo" || echo "⚠️  .turbo not found"

# 4. Remove node_modules cache
rm -rf node_modules/.cache && echo "✅ Cleared node_modules/.cache" || echo "⚠️  Cache not found"

# 5. Remove lock files
rm -f .next/dev/lock && echo "✅ Removed lock file" || echo "ℹ️  No lock file"

# 6. Free ports
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Freed port 3000" || echo "ℹ️  Port 3000 already free"

echo ""
echo "✅ Cache cleared successfully"
echo "📝 Run 'pnpm dev' to start clean dev server"
```

---

## Verification

After clearing:
```bash
ls -la .next .turbo node_modules/.cache 2>/dev/null
# Should show: "cannot access" (directories removed)

pnpm dev
# Should start without errors
```

---

## When NOT to Use

- **First troubleshooting step** - Try simple restart first
- **In production** - This is dev-only
- **During active development** - Will lose incremental build cache

---

## Related Issues

**Pattern Detected:** Turbopack cache corruption after:
- Large refactoring sessions (13+ files modified)
- Branch switches with conflicting changes
- Hard stops during compilation

**Frequency:** ~2-3 times per month during heavy development

---

## Alternative: Full Clean

If `/clear-next-cache` doesn't fix it:

```bash
rm -rf .next .turbo node_modules
pnpm install
pnpm dev
```

**Time:** ~2-3 minutes (vs ~5 seconds for cache clear)

---

*Quick fix for Turbopack database corruption. Part of infrastructure maintenance toolkit.*
