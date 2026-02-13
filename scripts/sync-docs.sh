#!/usr/bin/env bash
# sync-docs.sh - Transform and copy docs from source repos into Docusaurus
# Called by .github/workflows/sync-docs.yml
set -euo pipefail

SOURCES="_sources"
DOCS="docs"
DATE=$(date +%Y-%m-%d)

# ──────────────────────────────────────────────
# Helper: Add frontmatter to a markdown file
# Usage: add_frontmatter <file> <title> <category> <owner> <classification>
# ──────────────────────────────────────────────
add_frontmatter() {
  local file="$1" title="$2" category="$3" owner="${4:-walker}" classification="${5:-internal}"

  # Skip if frontmatter already exists
  if head -1 "$file" | grep -q "^---"; then
    # Update last_review date in existing frontmatter
    sed -i "s/^last_review:.*/last_review: $DATE/" "$file"
    # Fix unquoted argument-hint values (YAML interprets [x] as array)
    sed -i 's/^argument-hint: \([^"]\)/argument-hint: "\1/' "$file"
    sed -i '/^argument-hint: "/{ /[^"]$/s/$/"/ }' "$file"
    return
  fi

  local tmpfile
  tmpfile=$(mktemp)
  cat > "$tmpfile" <<FRONT
---
title: "${title}"
sidebar_label: "${title}"
owner: ${owner}
last_review: ${DATE}
classification: ${classification}
tags: [${category}, auto-synced]
---

FRONT
  cat "$file" >> "$tmpfile"
  mv "$tmpfile" "$file"
}

# ──────────────────────────────────────────────
# Helper: Clean repo-specific paths from content
# ──────────────────────────────────────────────
clean_paths() {
  local file="$1"
  # Remove @.claude/reference/ imports (Docusaurus doesn't support these)
  sed -i '/^@\.claude\//d' "$file"
  # Remove file-path-style references that won't resolve
  sed -i 's|\.claude/reference/||g' "$file"
  sed -i 's|\.agents/backlog/||g' "$file"
}

# ──────────────────────────────────────────────
# Sync: walker-os commands
# ──────────────────────────────────────────────
sync_commands() {
  local src="$SOURCES/walker-os/.claude/commands"
  [ -d "$src" ] || return 0

  local categories=("1-timeblock:timeblock" "2-planning:planning" "3-piv-loop:piv-loop" "4-release:release" "maintenance:maintenance" "infrastructure:infrastructure")

  for mapping in "${categories[@]}"; do
    local src_dir="${mapping%%:*}"
    local dst_dir="${mapping##*:}"
    local src_path="$src/$src_dir"
    local dst_path="$DOCS/guides/commands/$dst_dir"

    [ -d "$src_path" ] || continue
    mkdir -p "$dst_path"

    for file in "$src_path"/*.md; do
      [ -f "$file" ] || continue
      local basename
      basename=$(basename "$file")
      local title
      title=$(head -20 "$file" | grep -m1 "^# " | sed 's/^# //' || echo "${basename%.md}")

      cp "$file" "$dst_path/$basename"
      add_frontmatter "$dst_path/$basename" "$title" "commands"
      clean_paths "$dst_path/$basename"
    done
  done

  echo "Synced commands from walker-os"
}

# ──────────────────────────────────────────────
# Sync: walker-os reference docs
# ──────────────────────────────────────────────
sync_reference() {
  local src="$SOURCES/walker-os/.claude/reference"
  local dst="$DOCS/developers/reference"
  [ -d "$src" ] || return 0
  mkdir -p "$dst"

  for file in "$src"/*.md; do
    [ -f "$file" ] || continue
    local basename
    basename=$(basename "$file")

    # Skip files that are too repo-specific or internal-only
    case "$basename" in
      infinite-loop-patterns.md|technical-patterns.md) continue ;;
      freedom-system.md|daily-plan-phases.md|timeblock-phases.md) continue ;;
      end-timeblock-automation.md|end-timeblock-templates.md) continue ;;
      executive-assistant-workflows.md|force-multiplier-examples.md) continue ;;
      epic-completion-checklist.md|operations-templates.md) continue ;;
      business-case-template.md|business-case-templates.md) continue ;;
      proposal-templates.md|sales-frameworks.md) continue ;;
      client-onboard-checklist.md|brand-audit-checklist.md) continue ;;
      brand-variables.md|content-creation.md|optimization-analytics.md) continue ;;
    esac

    local title
    title=$(head -20 "$file" | grep -m1 "^# " | sed 's/^# //' || echo "${basename%.md}")

    cp "$file" "$dst/$basename"
    add_frontmatter "$dst/$basename" "$title" "reference"
    clean_paths "$dst/$basename"
  done

  echo "Synced reference docs from walker-os"
}

# ──────────────────────────────────────────────
# Sync: walker-os SOPs
# ──────────────────────────────────────────────
sync_sops() {
  local src="$SOURCES/walker-os/.agents/sops"
  local dst="$DOCS/internal/sops"
  [ -d "$src" ] || return 0
  mkdir -p "$dst"

  for file in "$src"/*.md; do
    [ -f "$file" ] || continue
    local basename
    basename=$(basename "$file")
    local title
    title=$(head -20 "$file" | grep -m1 "^# " | sed 's/^# //' || echo "${basename%.md}")

    cp "$file" "$dst/$basename"
    add_frontmatter "$dst/$basename" "$title" "sops"
    clean_paths "$dst/$basename"
  done

  echo "Synced SOPs from walker-os"
}

# ──────────────────────────────────────────────
# Sync: dyniq-ai-agents docs
# ──────────────────────────────────────────────
sync_agents_docs() {
  local src="$SOURCES/dyniq-ai-agents/docs"
  local dst="$DOCS/developers/voice-ai"
  [ -d "$src" ] || return 0
  mkdir -p "$dst"

  for file in "$src"/*.md; do
    [ -f "$file" ] || continue
    local basename
    basename=$(basename "$file")
    local title
    title=$(head -20 "$file" | grep -m1 "^# " | sed 's/^# //' || echo "${basename%.md}")

    cp "$file" "$dst/$basename"
    add_frontmatter "$dst/$basename" "$title" "voice-ai"
    clean_paths "$dst/$basename"
  done

  # Sync README as overview
  if [ -f "$SOURCES/dyniq-ai-agents/README.md" ]; then
    cp "$SOURCES/dyniq-ai-agents/README.md" "$dst/overview.md"
    add_frontmatter "$dst/overview.md" "Voice AI Agents Overview" "voice-ai"
    clean_paths "$dst/overview.md"
  fi

  echo "Synced docs from dyniq-ai-agents"
}

# ──────────────────────────────────────────────
# Sync: Architecture docs from all repos
# ──────────────────────────────────────────────
sync_architecture() {
  local dst="$DOCS/developers/architecture"
  mkdir -p "$dst"

  for repo in walker-os dyniq-ai-agents dyniq-app; do
    local arch="$SOURCES/$repo/ARCHITECTURE.md"
    [ -f "$arch" ] || continue
    cp "$arch" "$dst/${repo}-architecture.md"
    add_frontmatter "$dst/${repo}-architecture.md" "${repo} Architecture" "architecture"
    clean_paths "$dst/${repo}-architecture.md"
  done

  echo "Synced architecture docs"
}

# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
echo "Starting doc sync at $(date)"
echo "Sources: $SOURCES"

sync_commands
sync_reference
sync_sops
sync_agents_docs
sync_architecture

echo "Doc sync complete at $(date)"
