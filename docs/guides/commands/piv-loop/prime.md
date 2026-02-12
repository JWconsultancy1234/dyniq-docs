---
description: Prime agent with walker-os context and current project understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of the current project by analyzing structure, documentation, and key files. Also load walker-os decision framework context.

## Process

### 1. Load Walker-OS Context

Read the core decision framework:
- Read `/Users/walker/Desktop/Code/walker-os/CLAUDE.md`
- Understand: Path A (BolScout), Path B (Quick Product), €72/hr filter
- Data lives in Supabase (no local YAML files)

### 2. Analyze Current Project Structure

List all tracked files:
!`git ls-files`

Show directory structure:
!`tree -L 3 -I 'node_modules|__pycache__|.git|dist|build|.next'`

### 3. Read Core Documentation

- Read CLAUDE.md or similar global rules file
- Read README files at project root and major directories
- Read any PRD or architecture documentation

### 4. Identify Key Files

Based on the structure, identify and read:
- Main entry points (main.py, index.ts, app.py, etc.)
- Core configuration files (pyproject.toml, package.json, tsconfig.json)
- Key model/schema definitions
- Important service or controller files

### 5. Understand Current State

Check recent activity:
!`git log -10 --oneline`

Check current branch and status:
!`git status`

## Output Report

Provide a concise summary covering:

### Walker-OS Alignment
- Which path does this serve? (Path A: BolScout / Path B: Freedom)
- Is this a €72+/hr activity?
- WHO can own this outcome?

### Project Overview
- Purpose and type of application
- Primary technologies and frameworks
- Current version/state

### Architecture
- Overall structure and organization
- Key architectural patterns identified
- Important directories and their purposes

### Tech Stack
- Languages and versions
- Frameworks and major libraries
- Build tools and package managers

### Current State
- Active branch
- Recent changes or development focus
- Any blockers or concerns

**Make this summary easy to scan - use bullet points and clear headers.**
