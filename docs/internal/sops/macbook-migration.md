---
sidebar_position: 10
title: MacBook Migration & Restore
description: Complete backup, encrypt, and restore development environment when switching machines
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
| **Total restore time** | ~45 minutes |
| **Encryption** | AES-256-CBC with PBKDF2 |

---

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

**Auto-synced (no backup needed):**

| Service | Sync Method | What Syncs |
|---------|-------------|------------|
| iCloud Drive | Apple ID | Desktop, Documents, 47GB Code folder |
| Apple Keychain | iCloud Keychain | All passwords, WiFi, certificates |
| NordVPN | Account login | VPN config |
| Arc Browser | Arc account | Bookmarks, tabs, spaces |
| GitHub | SSH key + account | All repos |
| Linear | Web login | All issues, projects |
| Supabase | Web login | All databases |
| n8n | Server-hosted | All workflows (on Contabo) |
| Langfuse | Server-hosted | All traces (on Contabo) |
| Metabase | Server-hosted | All dashboards (on Contabo) |

---

## Part A: Backup (Old Machine)

### Step 1: Commit and push all repos

```bash
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
mkdir -p ~/Desktop/MIGRATION-BACKUP/env-files && cd ~/Desktop/Code
find . \( -name ".env" -o -name ".env.local" -o -name ".env.production" \) -print0 | \
  while IFS= read -r -d '' f; do
    dir=~/Desktop/MIGRATION-BACKUP/env-files/"$(dirname "$f")"
    mkdir -p "$dir" && cp "$f" "$dir/"
  done
```

### Step 3: Backup SSH keys

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/ssh
cp ~/.ssh/config ~/.ssh/id_ed25519* ~/.ssh/known_hosts* ~/Desktop/MIGRATION-BACKUP/ssh/
```

### Step 4: Backup configs

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/{shell,git,claude,docker,pyenv}
cp ~/.zshrc ~/.zprofile ~/.profile ~/.zsh_history ~/Desktop/MIGRATION-BACKUP/shell/ 2>/dev/null
cp ~/.gitconfig ~/Desktop/MIGRATION-BACKUP/git/
cp -r ~/.claude/* ~/Desktop/MIGRATION-BACKUP/claude/ 2>/dev/null
cp ~/.docker/config.json ~/.docker/daemon.json ~/Desktop/MIGRATION-BACKUP/docker/ 2>/dev/null
cp ~/.pyenv/version ~/Desktop/MIGRATION-BACKUP/pyenv/ 2>/dev/null
```

### Step 5: Export app lists

```bash
mkdir -p ~/Desktop/MIGRATION-BACKUP/apps
brew bundle dump --file=~/Desktop/MIGRATION-BACKUP/apps/Brewfile --force
npm list -g --depth=0 > ~/Desktop/MIGRATION-BACKUP/apps/npm-global.txt
pip list --format=freeze > ~/Desktop/MIGRATION-BACKUP/apps/pip-packages.txt
code --list-extensions > ~/Desktop/MIGRATION-BACKUP/apps/vscode-extensions.txt
ls /Applications/ > ~/Desktop/MIGRATION-BACKUP/apps/macos-apps.txt
node --version > ~/Desktop/MIGRATION-BACKUP/apps/node-version.txt
python3 --version >> ~/Desktop/MIGRATION-BACKUP/apps/python-version.txt
pyenv versions >> ~/Desktop/MIGRATION-BACKUP/apps/python-version.txt
~/.bun/bin/bun --version > ~/Desktop/MIGRATION-BACKUP/apps/bun-version.txt 2>/dev/null
```

### Step 6: Export browser bookmarks

- **Arc**: Arc menu > Bookmarks > Export Bookmarks > save to `~/Desktop/MIGRATION-BACKUP/browser/`
- **Chrome**: chrome://bookmarks > three-dot menu > Export > save to `~/Desktop/MIGRATION-BACKUP/browser/`
- **Safari**: File > Export Bookmarks > save to `~/Desktop/MIGRATION-BACKUP/browser/`

### Step 7: Verify Apple Keychain sync

```
System Settings > Apple ID > iCloud > Passwords & Keychain > ON
```

This syncs all saved passwords, WiFi networks, and certificates to new Mac automatically.

### Step 8: Create encrypted archive

```bash
cd ~/Desktop
tar -czf MIGRATION-BACKUP.tar.gz MIGRATION-BACKUP/
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in MIGRATION-BACKUP.tar.gz \
  -out MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc
```

### Step 9: Upload to iCloud

```bash
cp ~/Desktop/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc \
  ~/Library/Mobile\ Documents/com~apple~CloudDocs/
ls -lh ~/Library/Mobile\ Documents/com~apple~CloudDocs/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc
```

### Step 10: Verify encryption

```bash
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in ~/Desktop/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc | tar -tz | head -20
```

### Step 11: Clean up old machine

- [ ] Sign out: GitHub, Gmail, LinkedIn, Linear, Supabase, n8n, Langfuse
- [ ] Clear browser data in all browsers
- [ ] Delete unencrypted archive: `rm ~/Desktop/MIGRATION-BACKUP.tar.gz`

---

## Part B: New Mac Setup + Restore

### Phase 1: Apple Account + iCloud (5 min)

1. Sign in with your **personal Apple ID** during Mac setup
2. Enable iCloud Drive with Desktop & Documents sync
3. Wait for iCloud to start syncing (47GB Code folder will download in background)
4. Verify: `System Settings > Apple ID > iCloud > Passwords & Keychain > ON`

:::tip
Keychain syncs automatically. All saved passwords, WiFi passwords, and certificates will appear on the new Mac within minutes.
:::

### Phase 2: Download Applications (15 min)

**Install in this order:**

| Priority | App | Install Method | Why |
|----------|-----|---------------|-----|
| 1 | **Homebrew** | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | Package manager for everything else |
| 2 | **Arc Browser** | [arc.net](https://arc.net) | Primary browser (bookmarks sync via Arc account) |
| 3 | **Visual Studio Code** | `brew install --cask visual-studio-code` | Code editor |
| 4 | **Docker Desktop** | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) | Container runtime |
| 5 | **Claude Desktop** | [claude.ai/download](https://claude.ai/download) | AI assistant |
| 6 | **NordVPN** | [nordvpn.com/download](https://nordvpn.com/download/mac/) | VPN (login with account) |
| 7 | **Telegram** | Mac App Store | Messaging |
| 8 | **Slack** | Mac App Store | Work messaging |
| 9 | **Notion** | [notion.so/desktop](https://www.notion.so/desktop) | Notes |
| 10 | **Obsidian** | [obsidian.md](https://obsidian.md/) | Knowledge base |
| 11 | **Linear** | [linear.app/download](https://linear.app/download) | Project management |
| 12 | **Figma** | [figma.com/downloads](https://www.figma.com/downloads/) | Design |
| 13 | **Discord** | [discord.com/download](https://discord.com/download) | Communities |
| 14 | **Todoist** | Mac App Store | Task management |
| 15 | **Zoom** | [zoom.us/download](https://zoom.us/download) | Video calls |

**Skip (Argenx-only apps):**
- Microsoft Office (Excel, Word, PowerPoint, OneNote, Outlook, Teams)
- Microsoft Defender
- OneDrive
- Windows App
- Akiflow (if Argenx-specific)

### Phase 3: Decrypt and Extract Backup (2 min)

```bash
# Download encrypted file from iCloud (should already be there)
ls ~/Library/Mobile\ Documents/com~apple~CloudDocs/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc

# Decrypt and extract
openssl enc -d -aes-256-cbc -pbkdf2 \
  -in ~/Library/Mobile\ Documents/com~apple~CloudDocs/MIGRATION-BACKUP-ENCRYPTED.tar.gz.enc \
  -out ~/Desktop/MIGRATION-BACKUP.tar.gz && \
  tar -xzf ~/Desktop/MIGRATION-BACKUP.tar.gz -C ~/Desktop/
```

### Phase 4: Restore SSH Keys (2 min)

```bash
mkdir -p ~/.ssh
cp ~/Desktop/MIGRATION-BACKUP/ssh/* ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_contabo
chmod 644 ~/.ssh/*.pub ~/.ssh/config ~/.ssh/known_hosts*

# Test connection
ssh contabo echo "SSH OK"
```

### Phase 5: Restore Shell + Git Config (1 min)

```bash
cp ~/Desktop/MIGRATION-BACKUP/shell/.zshrc ~/.zshrc
cp ~/Desktop/MIGRATION-BACKUP/shell/.zprofile ~/.zprofile 2>/dev/null
cp ~/Desktop/MIGRATION-BACKUP/git/.gitconfig ~/.gitconfig
source ~/.zshrc
```

### Phase 6: Install Dev Runtimes (10 min)

```bash
# All Homebrew packages (gh, pnpm, pyenv, postgresql, livekit-cli, etc.)
brew bundle --file=~/Desktop/MIGRATION-BACKUP/apps/Brewfile

# Node.js (v22)
brew install node

# Python via pyenv
pyenv install 3.12.1
pyenv global 3.12.1

# Bun
curl -fsSL https://bun.sh/install | bash

# Claude Code CLI
npm install -g @anthropic-ai/claude-code

# VS Code extensions
cat ~/Desktop/MIGRATION-BACKUP/apps/vscode-extensions.txt | xargs -L 1 code --install-extension

# GitHub CLI auth
gh auth login
```

### Phase 7: Clone Repos (5 min)

:::tip
If iCloud synced your `~/Desktop/Code/` folder, repos are already there. Skip to Phase 8.
:::

```bash
mkdir -p ~/Desktop/Code && cd ~/Desktop/Code
git clone git@github.com:JWconsultancy1234/walker-os.git
git clone git@github.com:JWconsultancy1234/dyniq-ai-agents.git
git clone git@github.com:JWconsultancy1234/dyniq-app.git
git clone git@github.com:JWconsultancy1234/dyniq-docs.git
git clone git@github.com:JWconsultancy1234/dyniq-n8n.git
git clone git@github.com:JWconsultancy1234/bolscout-app.git
```

### Phase 8: Restore .env Files (2 min)

```bash
cd ~/Desktop/MIGRATION-BACKUP/env-files
for repo in walker-os dyniq-ai-agents dyniq-app dyniq-n8n dyniq-docs; do
  if [ -d "$repo" ]; then
    cp -r "$repo"/* ~/Desktop/Code/$repo/ 2>/dev/null
    echo "Restored .env: $repo"
  fi
done
```

### Phase 9: Restore Claude Code Data (1 min)

```bash
mkdir -p ~/.claude
cp -r ~/Desktop/MIGRATION-BACKUP/claude/* ~/.claude/
```

### Phase 10: Restore Docker Config (1 min)

```bash
mkdir -p ~/.docker
cp ~/Desktop/MIGRATION-BACKUP/docker/* ~/.docker/ 2>/dev/null
```

### Phase 11: Import Browser Bookmarks

- **Arc**: Sign in to Arc account (syncs automatically)
- **Chrome**: chrome://bookmarks > three-dot menu > Import > select HTML file from backup
- **Safari**: File > Import From > Bookmarks HTML File

### Phase 12: Install Python Dependencies (5 min)

```bash
cd ~/Desktop/Code/dyniq-ai-agents
pip install -r requirements.txt

cd ~/Desktop/Code/walker-os
pnpm install
```

---

## Post-Restore Verification Checklist

```bash
# Run this to verify everything works
echo "=== SSH ===" && ssh contabo echo "OK"
echo "=== Node ===" && node --version
echo "=== Python ===" && python3 --version
echo "=== Bun ===" && ~/.bun/bin/bun --version
echo "=== pnpm ===" && pnpm --version
echo "=== gh ===" && gh auth status
echo "=== Docker ===" && docker --version
echo "=== Contabo services ===" && ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}' | head -10"
echo "=== Agents API ===" && curl -s https://agents-api.dyniq.ai/health
echo "=== Ruben API ===" && curl -s https://ruben-api.dyniq.ai/health
```

**Manual checks:**
- [ ] iCloud Keychain synced (System Settings > Passwords > check count)
- [ ] NordVPN connected
- [ ] Arc browser bookmarks visible
- [ ] Linear desktop app signed in
- [ ] VS Code opens with extensions
- [ ] `pnpm dev:web` starts walker-os dashboard at localhost:3000
- [ ] Merge backup PRs if still open (walker-os #50, dyniq-ai-agents #23, dyniq-app #30)

---

## Account Re-Authentication Checklist

After restore, sign into these services:

| Service | URL / App | Auth Method |
|---------|-----------|-------------|
| GitHub | github.com + `gh auth login` | SSH key + browser OAuth |
| Arc Browser | Arc app | Arc account |
| NordVPN | NordVPN app | Account login |
| Supabase | supabase.com | Google/GitHub OAuth |
| Linear | linear.app | Google OAuth |
| Langfuse | langfuse.dyniq.ai | Email/password |
| n8n | automation.dyniq.ai | Basic auth (in .env) |
| Metabase | analytics.dyniq.ai | Email/password |
| Claude | claude.ai | Anthropic account |
| Telegram | Telegram app | Phone number + SMS |
| Slack | Slack app | Workspace URL + OAuth |
| Figma | figma.com | Google OAuth |
| Docker Hub | Docker Desktop | Docker account |
| OpenRouter | openrouter.ai | API key (in .env) |
| Contabo | contabo.com | Email/password |

---

## What NOT to Worry About

| Item | Why |
|------|-----|
| Supabase data | Cloud-hosted, nothing local |
| Contabo server | Stays running, SSH key in backup |
| n8n workflows | Server-hosted at automation.dyniq.ai |
| Langfuse traces | Server-hosted at langfuse.dyniq.ai |
| Metabase dashboards | Server-hosted at analytics.dyniq.ai |
| Apple Keychain | Auto-syncs via iCloud |
| WiFi passwords | Synced via iCloud Keychain |
| iCloud files | Sync to any Mac with same Apple ID |
| App Store purchases | Tied to Apple ID, re-download free |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SSH permission denied | `chmod 600 ~/.ssh/id_ed25519_contabo` |
| Homebrew packages fail | `brew update` first, then retry |
| .env not found by app | Check paths match repo structure |
| Claude Code no history | Verify `~/.claude/` has projects/ directory |
| Branch protection blocks push | Create `backup/*` branch, push there, create PR |
| Decrypt fails | Wrong password. No recovery without old machine |
| iCloud slow to sync | Kill bird daemon: `killall bird` and wait |
| Pyenv "command not found" | Add to .zshrc: `eval "$(pyenv init -)"` |
| Docker not starting | Open Docker Desktop app first, wait for startup |
| pnpm not found | `brew install pnpm` or `npm install -g pnpm` |

---

*Last executed: 2026-02-12 | Next review: 2026-05-12*
