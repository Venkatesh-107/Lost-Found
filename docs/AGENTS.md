# 🤖 AGENTS.md — Agent & Role Definitions
> **Project:** Lost & Found PWA  
> **Stack:** Vite · Node.js · PocketBase · PWA  
> **Last Updated:** 2026-10-10

---

## 📌 Overview

This document defines all **agent roles** within the Lost & Found application — both human actors (users) and system-level agents (automated processes). Each agent has distinct responsibilities, permissions, and interaction boundaries.

---

## 👤 Human Agents

### 1. `ADMIN`
The administrative authority of the platform. Manages the full lifecycle of lost & found items.

| Property       | Detail |
|----------------|--------|
| **Role ID**    | `role:admin` |
| **Auth Method**| PocketBase Admin Login (separate portal) |
| **Dashboard**  | Admin Portal (`/admin`) |

#### Capabilities
- ✅ View all submitted lost item posts
- ✅ Approve or reject claim requests from candidates
- ✅ Distribute (hand over) a claimed item to the verified claimant
- ✅ Mark posts as **Claimed** after item distribution
- ✅ Set custom rule-based questions per item post
- ✅ Pull claim requests and inspect candidate answers
- ✅ Delete posts (auto-delete is triggered after 20 days post-claim)
- ✅ View full claim token history per item
- ✅ Manage user accounts and moderate content

#### Restrictions
- ❌ Cannot submit lost item posts as a regular user
- ❌ Cannot respond to claim Q&A as a candidate

---

### 2. `CANDIDATE` (Normal User)
A registered user of the platform who can browse lost items, submit found items, and attempt to claim lost items.

| Property       | Detail |
|----------------|--------|
| **Role ID**    | `role:candidate` |
| **Auth Method**| PocketBase User Login |
| **Dashboard**  | Home Publishing Portal (`/home`) |

#### Capabilities
- ✅ View the public feed of lost/found item posts
- ✅ Post a found item (image + description via `+` icon)
- ✅ Click **Claim** on a post to initiate a claim attempt
- ✅ Answer rule-based questions set by the admin for that item
- ✅ Receive a **Claim Token** upon passing all questions
- ✅ View personal claim history and token status

#### Restrictions
- ❌ Cannot access the Admin Portal
- ❌ Cannot approve or reject other candidates' claims
- ❌ Cannot delete posts
- ❌ Cannot modify rule-based questions

---

## 🤖 System Agents (Automated)

### 3. `AUTH_AGENT`
Handles authentication routing and session management.

| Property       | Detail |
|----------------|--------|
| **Trigger**    | App launch / login form submission |
| **Backed by**  | PocketBase Auth API |

#### Responsibilities
- Detect user role from PocketBase auth record (`role` field)
- Route `admin` → `/admin` portal
- Route `candidate` → `/home` feed portal
- Maintain JWT session tokens
- Refresh tokens on expiry

---

### 4. `CLAIM_AGENT`
Processes claim requests and manages the token issuance pipeline.

| Property       | Detail |
|----------------|--------|
| **Trigger**    | Candidate clicks **Claim** button on a post |
| **Backed by**  | PocketBase Collections + Node.js logic |

#### Responsibilities
- Fetch rule-based questions linked to the item from PocketBase
- Present questions in a modal/form to the candidate
- Evaluate answers (pass/fail logic)
- On **pass**: Generate a unique **Claim Token** chained from the previous claimant's token
- On **fail**: Deny claim and log the attempt
- Notify admin of a new verified claim request

---

### 5. `CLEANUP_AGENT`
Manages the lifecycle and auto-deletion of claimed posts.

| Property       | Detail |
|----------------|--------|
| **Trigger**    | Scheduled cron job (PocketBase hooks / Node.js cron) |
| **Schedule**   | Runs daily |

#### Responsibilities
- Monitor posts with status `claimed` and a `claimed_at` timestamp
- After **20 days** from `claimed_at`, automatically:
  - Delete the post image from PocketBase storage
  - Archive or permanently delete the post record
- Log all deletion events to the audit log

---

### 6. `POST_AGENT`
Handles the creation and validation of new lost/found item posts.

| Property       | Detail |
|----------------|--------|
| **Trigger**    | Candidate taps the `+` icon and submits the form |
| **Backed by**  | PocketBase Collections |

#### Responsibilities
- Accept image upload and short description from the candidate
- Validate file type, size, and description length
- Store the post in PocketBase with status `active`
- Broadcast the new post to the live feed

---

## 🔐 Permission Matrix

| Action                        | Admin | Candidate | System |
|-------------------------------|:-----:|:---------:|:------:|
| Login (Admin Portal)          | ✅    | ❌        | —      |
| Login (Candidate Portal)      | ❌    | ✅        | —      |
| View Feed                     | ✅    | ✅        | —      |
| Create Post (`+`)             | ❌    | ✅        | —      |
| Click Claim                   | ❌    | ✅        | —      |
| Answer Claim Questions        | ❌    | ✅        | —      |
| Issue Claim Token             | —     | —         | ✅     |
| Approve/Distribute Item       | ✅    | ❌        | —      |
| Mark Post as Claimed          | ✅    | ❌        | ✅     |
| Auto-delete After 20 Days     | —     | —         | ✅     |
| Set Rule-Based Questions      | ✅    | ❌        | —      |
| View All Claim Requests       | ✅    | ❌        | —      |

---

## 📎 Related Documents
- [FLOW.md](./FLOW.md) — Step-by-step user interaction flows
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture & component design
- [LOG.md](./LOG.md) — Development changelog and decision log
