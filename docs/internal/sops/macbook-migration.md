---
sidebar_position: 10
title: MacBook Migration & Restore
description: Backup, encrypt, and restore development environment when switching machines
doc_owner: Walker
review_cycle: 90d
doc_status: published
---

# MacBook Migration & Restore

:::caution Internal Only
This SOP covers backup and restore of the DYNIQ development environment when switching MacBooks.
:::

## Overview

| Item | Detail |
|------|--------|
| **Last executed** | 2026-02-12 (Argenx MacBook return) |
| **Backup size** | 379 MB encrypted archive + 47 GB iCloud Code sync |
| **Restore time** | ~30 minutes |
| **Encryption** | AES-256-CBC with PBKDF2 |

## What's Backed Up

| Category | Files | Location in Archive |
|----------|-------|---------------------|
| .env files | 34 across all repos | `env-files/` |
| SSH keys | 5 (Contabo key pair, config, known_hosts) | `ssh/` |
| Shell configs | .zshrc, .zprofile, .profile, .zsh_history | `shell/` |
| Git config | .gitconfig, .git-hooks | `git/` |
| Claude Code | settings, history, projects (3,794 files) | `claude/` |
| Docker | config.json, daemon.json | `docker/` |
| App lists | Brewfile, npm, pip, VS Code extensions | `apps/` |

**Not in archive (cloud-hosted):**
- Code repos (GitHub + iCloud Desktop sync)
- Supabase databases (cloud)
- Contabo server (stays running)
- Linear, n8n, Langfuse, Metabase (all SaaS)

---

## Part A: Backup (Old Machine)

### Step 1: Commit and push all repos

```bash
# Check all repos for uncommitted work
for repo in walker-os dyniq-ai-agents dyniq-app dyniq-docs dyniq-n8n bolscout-app; do
  echo "=== $repo ===" && cd ~/Desktop/Code/$repo && git status --short 2>/dev/null
  cd ~
done
```

If branch protection blocks push to develop, create a backup branch:

```bash
git checkout -b backup/pre-migration-$(date +%Y-%m-%d)
git push -u origin backup/pre-migration-$(date +%Y-%m-%d)
```

### Step 2: Backup .env files

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/env-files
cd ~/Desktop/Code
find . -name ".env" -o -name ".env.local" -o -name ".env.production" | \
  while IFS= read -r f; do
    dir="~/Desktop/MIGRATION-BACKUP/env-files/$(dirname "$f")"
    mkdir -p "$dir" && cp "$f" "$dir/"
  done
```

:::tip Spaces in paths
If repos have spaces in folder names, use null-delimited find:
```bash
find . \( -name ".env" -o -name ".env.local" \) -print0 | \
  while IFS= read -r -d '' f; do
    dir=~/Desktop/MIGRATION-BACKUP/env-files/"$(dirname "$f")"
    mkdir -p "$dir" && cp "$f" "$dir/"
  done
```
:::

### Step 3: Backup SSH keys

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/ssh
cp ~/.ssh/config ~/.ssh/id_ed25519* ~/.ssh/known_hosts* ~/Desktop/MIGRATION-BACKUP/ssh/
```

### Step 4: Backup configs

```bash
# Shell
mkdir -p ~/Desktop/MIGRATION-BACKUP/shell
cp ~/.zshrc ~/.zprofile ~/.profile ~/.zsh_history ~/Desktop/MIGRATION-BACKUP/shell/ 2>/dev/null

# Git
mkdir -p ~/Desktop/MIGRATION-BACKUP/git
cp ~/.gitconfig ~/Desktop/MIGRATION-BACKUP/git/

# Claude Code
mkdir -p ~/Desktop/MIGRATION-BACKUP/claude
cp -r ~/.claude/* ~/Desktop/MIGRATION-BACKUP/claude/ 2>/dev/null

# Docker
mkdir -p ~/Desktop/MIGRATION-BACKUP/docker
cp ~/.docker/config.json ~/.docker/daemon.json ~/Desktop/MIGRATION-BACKUP/docker/ 2>/dev/null
```

### Step 5: Export app lists

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/apps
brew bundle dump --file=~/Desktop/MIGRATION-BACKUP/apps/Brewfile
npm list -g --depth=0 > ~/Desktop/MIGRATION-BACKUP/apps/npm-global.txt
pip list --format=freeze > ~/Desktop/MIGRATION-BACKUP/apps/pip-packages.txt
code --list-extensions > ~/Desktop/MIGRATION-BACKUP/apps/vscode-extensions.txt
ls /Applications/ > ~/Desktop/MIGRATION-BACKUP/apps/macos-apps.txt
```

### Step 6: Create encrypted archive

```bash
cd ~/Desktop
tar -czf MIGRATION-BACKUP.tar.gz MIGRATION-BACKUP/
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in MIGRATION-BACKUP.tar.gz \
  -out MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc
```

### Step 7: Upload to iCloud

```bash
cp ~/Desktop/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc \
  ~/Library/Mobile\ Documents/com~apple~CloudDocs/
```

### Step 8: Verify

```bash
# Test decrypt works
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in ~/Desktop/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc | tar -tz | head -20

# Verify iCloud has the file
ls -lh ~/Library/Mobile\ Documents/com~apple~CloudDocs/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc
```

### Step 9: Clean up old machine

- [ ] Export browser bookmarks (Arc, Chrome, Safari)
- [ ] Sign out: GitHub, Gmail, LinkedIn, Linear, Supabase, n8n, Langfuse
- [ ] Clear browser data
- [ ] Remove sensitive files: `rm ~/Desktop/MIGRATION-BACKUP.tar.gz`

---

## Part B: Restore (New Machine)

### Step 1: Decrypt and extract

```bash
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in ~/Desktop/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc \
  -out ~/Desktop/MIGRATION-BACKUP.tar.gz && \
  tar -xzf ~/Desktop/MIGRATION-BACKUP.tar.gz -C ~/Desktop/
```

### Step 2: Install Homebrew + packages

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew bundle --file=~/Desktop/MIGRATION-BACKUP/apps/Brewfile
```

### Step 3: Restore SSH keys

```bash
mkdir -p ~/.ssh
cp ~/Desktop/MIGRATION-BACKUP/ssh/* ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_contabo
chmod 644 ~/.ssh/*.pub ~/.ssh/config ~/.ssh/known_hosts*
ssh contabo echo "SSH OK"
```

### Step 4: Restore shell + git configs

```bash
cp ~/Desktop/MIGRATION-BACKUP/shell/.zshrc ~/.zshrc
cp ~/Desktop/MIGRATION-BACKUP/shell/.zprofile ~/.zprofile 2>/dev/null
cp ~/Desktop/MIGRATION-BACKUP/git/.gitconfig ~/.gitconfig
source ~/.zshrc
```

### Step 5: Restore .env files

```bash
# Copy per repo (adjust paths to match your Code directory)
for repo in walker-os dyniq-ai-agents dyniq-app dyniq-n8n; do
  if [ -d ~/Desktop/MIGRATION-BACKUP/env-files/$repo ]; then
    cp -r ~/Desktop/MIGRATION-BACKUP/env-files/$repo/* ~/Desktop/Code/$repo/ 2>/dev/null
    echo "Restored: $repo"
  fi
done
```

### Step 6: Clone repos (if not synced via iCloud)

```bash
mkdir -p ~/Desktop/Code && cd ~/Desktop/Code
git clone git@github.com:JWconsultancy1234/walker-os.git
git clone git@github.com:JWconsultancy1234/dyniq-ai-agents.git
git clone git@github.com:JWconsultancy1234/dyniq-app.git
git clone git@github.com:JWconsultancy1234/dyniq-docs.git
git clone git@github.com:JWconsultancy1234/dyniq-n8n.git
git clone git@github.com:JWconsultancy1234/bolscout-app.git
```

### Step 7: Install runtimes + tools

```bash
# Bun
curl -fsSL https://bun.sh/install | bash

# Node (via Homebrew or nvm)
brew install node

# Python (pyenv)
brew install pyenv
pyenv install 3.12

# VS Code extensions
cat ~/Desktop/MIGRATION-BACKUP/apps/vscode-extensions.txt | xargs -L 1 code --install-extension

# Claude Code
npm install -g @anthropic-ai/claude-code
```

### Step 8: Restore Claude Code data

```bash
mkdir -p ~/.claude
cp -r ~/Desktop/MIGRATION-BACKUP/claude/* ~/.claude/
```

### Step 9: Verify everything works

```bash
ssh contabo echo "SSH: OK"
cd ~/Desktop/Code/walker-os && pnpm install && pnpm dev:web &
cd ~/Desktop/Code/dyniq-ai-agents && pip install -r requirements.txt
curl -s https://agents-api.dyniq.ai/health
curl -s https://ruben-api.dyniq.ai/health
echo "All systems restored"
```

---

## Post-Restore Checklist

- [ ] SSH to Contabo works
- [ ] All repos cloned and on correct branches
- [ ] .env files in place per repo
- [ ] `pnpm dev:web` starts walker-os dashboard
- [ ] `docker ps` on Contabo shows all services running
- [ ] Browser bookmarks imported
- [ ] Merge backup PRs if still open (walker-os #50, dyniq-ai-agents #23, dyniq-app #30)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SSH permission denied | `chmod 600 ~/.ssh/id_ed25519_contabo` |
| Homebrew packages fail | Run `brew update` first, then retry |
| .env not found by app | Check paths match repo structure |
| Claude Code no history | Verify `~/.claude/` has projects/ directory |
| Branch protection blocks push | Create `backup/*` branch, push there, create PR |
| Decrypt fails | Wrong password. No recovery — re-backup from old machine |

---

*Last executed: 2026-02-12 | Next review: 2026-05-12*
