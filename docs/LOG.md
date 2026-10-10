# 📋 LOG.md — Development Changelog & Decision Log
> **Project:** Lost & Found PWA  
> **Stack:** Vite · Node.js · PocketBase · PWA  
> **Last Updated:** 2026-10-10

---

## 📌 Overview

This document serves as the **living development log** for the Lost & Found PWA. It tracks:
- 🏗️ Architecture decisions and their rationale
- 📅 Development milestones and changelogs
- 🐛 Known issues and resolutions
- 🔮 Upcoming tasks and backlog

---

## 🏗️ Architecture Decision Records (ADR)

### ADR-001 — Chose PocketBase as Backend
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** Needed a lightweight, self-hostable backend that provides authentication, file storage, and a real-time database with minimal server setup.
- **Decision:** Use **PocketBase** as the primary backend.
- **Consequences:**
  - ✅ Zero-config REST API auto-generated from collections
  - ✅ Built-in file storage for post images
  - ✅ Real-time subscriptions available via PocketBase JS SDK
  - ⚠️ Limited to single-node; horizontal scaling requires workarounds
  - ⚠️ Complex business logic (cron, token chain) still needs Node.js layer

---

### ADR-002 — Chose Vite as Frontend Build Tool
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** Needed a fast, modern build tool that supports PWA out of the box.
- **Decision:** Use **Vite** with `vite-plugin-pwa` (Workbox).
- **Consequences:**
  - ✅ Blazing fast HMR in development
  - ✅ PWA manifest + service worker auto-generated
  - ✅ Excellent React/JSX support

---

### ADR-003 — Dual Login Flow (Admin vs Candidate)
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** The system needs two distinct user experiences — a management portal for admins and a feed portal for candidates.
- **Decision:** Use a **single login page** with a **role selector** (radio/tab for Admin vs Candidate). After auth, route by `role` field from PocketBase user record.
- **Consequences:**
  - ✅ Simpler UX — one URL to share
  - ✅ Role-based routing is clean and centralized in `AUTH_AGENT`
  - ⚠️ Must ensure PocketBase API rules prevent candidates from accessing admin collections

---

### ADR-004 — Token Chain for Claim Verification
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** Need an auditable, tamper-evident record of who has claimed an item and in what order.
- **Decision:** Use a **SHA-256 chained token** where each new token is derived from the previous claimant's token + the new claimant's ID + timestamp. Genesis token = `post.id`.
- **Consequences:**
  - ✅ Provides full audit trail of claim history
  - ✅ Tokens are deterministic and verifiable
  - ⚠️ Token chain is append-only; reordering or tampering breaks the chain

---

### ADR-005 — 20-Day Auto-Deletion via Node.js Cron
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** Claimed posts should be cleaned up after 20 days to preserve storage and privacy.
- **Decision:** Use **node-cron** in the Node.js companion server to run a daily cleanup job that queries PocketBase for claimed posts older than 20 days.
- **Consequences:**
  - ✅ Automated, no manual admin action needed
  - ✅ Runs server-side, independent of client activity
  - ⚠️ Requires Node.js server to be running continuously (managed process with PM2)

---

### ADR-006 — Instagram-style Vertical Feed
- **Date:** 2026-10-10
- **Status:** ✅ Accepted
- **Context:** Need an engaging, familiar UX for browsing lost/found items.
- **Decision:** Use a **CSS scroll-snap vertical feed** where each post occupies the full viewport height, snapping into view on scroll — similar to Instagram Reels.
- **Consequences:**
  - ✅ Highly engaging and familiar UX pattern
  - ✅ Encourages users to view each item carefully
  - ⚠️ Requires careful image optimization (lazy loading, compression) for performance

---

## 📅 Development Changelog

### [v0.1.0] — 2026-10-10 — Project Initialization
- ✅ Created project repository `IF-zero&one`
- ✅ Defined application workflow and feature set
- ✅ Created documentation suite:
  - `docs/AGENTS.md` — Agent roles and permissions
  - `docs/FLOW.md` — User interaction flows
  - `docs/ARCHITECTURE.md` — System architecture
  - `docs/LOG.md` — This changelog

---

### [v0.2.0] — Planned — Project Scaffold
- [ ] Initialize Vite + React project
- [ ] Install and configure PocketBase JS SDK
- [ ] Set up `vite-plugin-pwa` with manifest and service worker
- [ ] Create PocketBase collections (`users`, `posts`, `item_questions`, `claim_tokens`, `claim_attempts`)
- [ ] Set up Node.js Express server with basic route structure
- [ ] Configure `.env` for PocketBase URL and Node port

---

### [v0.3.0] — Planned — Authentication Module
- [ ] Build `Login.jsx` page with Admin / Candidate tabs
- [ ] Implement `auth.service.js` using PocketBase auth API
- [ ] Implement `AUTH_AGENT` role-based routing logic
- [ ] Set up protected routes (`/admin`, `/home`)
- [ ] Persist auth session in localStorage via PocketBase SDK

---

### [v0.4.0] — Planned — Candidate Feed
- [ ] Build `Home.jsx` with vertical scroll-snap feed layout
- [ ] Build `PostCard.jsx` component (image, description, claim button)
- [ ] Implement `useFeed.js` hook with paginated PocketBase queries
- [ ] Add lazy loading for post images
- [ ] Add `ClaimedBadge.jsx` overlay for claimed posts
- [ ] Build `FAB.jsx` (floating `+` button)

---

### [v0.5.0] — Planned — Upload & Post Flow
- [ ] Build `UploadModal.jsx` (image picker + description field)
- [ ] Implement `post.service.js` for post creation
- [ ] Build `POST_AGENT` validation logic (file type, size, description)
- [ ] Test end-to-end post creation flow

---

### [v0.6.0] — Planned — Claim System
- [ ] Build `ClaimModal.jsx` with dynamic Q&A form
- [ ] Implement `claim.service.js` for Q&A fetch and answer submission
- [ ] Implement `tokenChain.js` SHA-256 token generation
- [ ] Implement `CLAIM_AGENT` pass/fail logic
- [ ] Store claim attempts and tokens in PocketBase
- [ ] Notify admin on verified claim

---

### [v0.7.0] — Planned — Admin Portal
- [ ] Build `Admin.jsx` dashboard layout
- [ ] Build `PostManager.jsx` — view all posts, update status
- [ ] Build `ClaimRequests.jsx` — review pending claim tokens
- [ ] Build `QuestionEditor.jsx` — set rule-based Q&A per post
- [ ] Implement "Mark as Distributed" action

---

### [v0.8.0] — Planned — Cleanup Cron Job
- [ ] Set up `cleanupJob.js` with `node-cron`
- [ ] Implement query for claimed posts older than 20 days
- [ ] Implement image deletion via PocketBase file API
- [ ] Implement post archival/deletion
- [ ] Add cleanup audit log entries

---

### [v0.9.0] — Planned — PWA Polish & Testing
- [ ] Configure PWA manifest (`name`, `icons`, `theme_color`, `display`)
- [ ] Test offline capability via service worker
- [ ] Test on mobile (Android/iOS) for installability
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit

---

### [v1.0.0] — Planned — Production Release
- [ ] Set up production PocketBase instance on VPS
- [ ] Deploy Vite PWA to Vercel / Netlify
- [ ] Deploy Node.js server to Render / VPS with PM2
- [ ] Configure environment variables
- [ ] Final end-to-end testing
- [ ] Write user guide / README

---

## 🐛 Known Issues & Notes

| ID    | Issue                                       | Status      | Notes                                          |
|-------|---------------------------------------------|-------------|------------------------------------------------|
| I-001 | No issues yet — project in planning phase   | —           | Will be updated as development progresses      |

---

## 🔮 Future Backlog

| Priority | Feature                                              |
|----------|------------------------------------------------------|
| High     | Push notifications for claim status updates          |
| High     | Email notification to admin on verified claim        |
| Medium   | Search & filter posts by description keyword         |
| Medium   | Map view showing where items were found              |
| Low      | Multi-language support (i18n)                        |
| Low      | Dark/Light theme toggle                              |
| Low      | Analytics dashboard for admin (claims per day, etc.) |

---

## 📎 Related Documents
- [AGENTS.md](./AGENTS.md) — Agent roles and permissions
- [FLOW.md](./FLOW.md) — Step-by-step user interaction flows
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture & component design
