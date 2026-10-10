#!/bin/bash

# ╔══════════════════════════════════════════════════════╗
# ║           git-sync.sh — Lost & Found PWA            ║
# ║     Auto stage → commit → push to GitHub            ║
# ║     Remote: https://github.com/Venkatesh-107/IF-zero-one ║
# ╚══════════════════════════════════════════════════════╝

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Banner ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║        🔄  Git Sync — IF-zero&one        ║${RESET}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Go to repo root ──────────────────────────────────────
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR" || { echo -e "${RED}✖  Could not cd into repo directory.${RESET}"; exit 1; }

# ── Check git repo ───────────────────────────────────────
if [ ! -d ".git" ]; then
  echo -e "${RED}✖  Not a git repository: ${REPO_DIR}${RESET}"
  exit 1
fi

# ── Show current branch & status ─────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo -e "${YELLOW}📂 Repo   :${RESET} $REPO_DIR"
echo -e "${YELLOW}🌿 Branch :${RESET} $BRANCH"
echo ""

# ── Show changed files ───────────────────────────────────
echo -e "${CYAN}📋 Changed files:${RESET}"
git status --short
echo ""

# ── Check if there is anything to commit ─────────────────
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo -e "${GREEN}✔  Nothing to commit. Working tree is clean.${RESET}"
  exit 0
fi

# ── Prompt for commit message ─────────────────────────────
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
  echo -e "${CYAN}💬 Commit message (from arg):${RESET} $COMMIT_MSG"
else
  echo -e "${CYAN}💬 Enter commit message:${RESET}"
  read -r COMMIT_MSG

  if [ -z "$COMMIT_MSG" ]; then
    # Auto-generate a timestamped message if left blank
    COMMIT_MSG="chore: sync docs $(date '+%Y-%m-%d %H:%M')"
    echo -e "${YELLOW}⚠  No message entered. Using auto-message:${RESET} $COMMIT_MSG"
  fi
fi

echo ""

# ── Stage all changes ─────────────────────────────────────
echo -e "${CYAN}📦 Staging all changes...${RESET}"
git add -A
if [ $? -ne 0 ]; then
  echo -e "${RED}✖  git add failed.${RESET}"
  exit 1
fi
echo -e "${GREEN}   ✔ Staged successfully.${RESET}"

# ── Commit ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}💾 Committing...${RESET}"
git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
  echo -e "${RED}✖  git commit failed.${RESET}"
  exit 1
fi
echo -e "${GREEN}   ✔ Committed: \"$COMMIT_MSG\"${RESET}"

# ── Push ─────────────────────────────────────────────────
echo ""
echo -e "${CYAN}🚀 Pushing to origin/${BRANCH}...${RESET}"
git push origin "$BRANCH"
if [ $? -ne 0 ]; then
  echo -e "${RED}✖  git push failed. Check your remote/auth settings.${RESET}"
  exit 1
fi

# ── Success ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║  ✅  Synced to GitHub successfully!      ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${YELLOW}🔗 https://github.com/Venkatesh-107/IF-zero-one/tree/${BRANCH}${RESET}"
echo ""
