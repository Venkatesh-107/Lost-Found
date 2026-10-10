# 🏗️ ARCHITECTURE.md — System Architecture
> **Project:** Lost & Found PWA  
> **Stack:** Vite · Node.js · PocketBase · PWA  
> **Last Updated:** 2026-10-10

---

## 📌 Overview

This document describes the **technical architecture** of the Lost & Found PWA — covering the frontend, backend, database schema, API contracts, and deployment topology.

---

## 🗂️ Project Structure

```
IF-zero&one/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons (192x192, 512x512)
│
├── src/
│   ├── main.js                # Vite entry point
│   ├── App.jsx                # Root component with Router
│   │
│   ├── pages/
│   │   ├── Login.jsx          # Login screen (admin/candidate split)
│   │   ├── Home.jsx           # Candidate feed (Instagram-style)
│   │   ├── Admin.jsx          # Admin dashboard
│   │   └── NotFound.jsx       # 404 page
│   │
│   ├── components/
│   │   ├── PostCard.jsx       # Single post card (image, desc, claim btn)
│   │   ├── ClaimModal.jsx     # Q&A modal triggered by Claim button
│   │   ├── UploadModal.jsx    # + icon upload sheet (image + description)
│   │   ├── ClaimedBadge.jsx   # Overlay badge for claimed posts
│   │   ├── FAB.jsx            # Floating Action Button (+)
│   │   └── Navbar.jsx         # Top navigation bar
│   │
│   ├── services/
│   │   ├── pb.js              # PocketBase client singleton
│   │   ├── auth.service.js    # Login, logout, session management
│   │   ├── post.service.js    # CRUD for posts collection
│   │   ├── claim.service.js   # Claim logic, token generation
│   │   └── cleanup.service.js # Cleanup trigger helpers
│   │
│   ├── hooks/
│   │   ├── useAuth.js         # Auth state hook
│   │   ├── useFeed.js         # Paginated feed data hook
│   │   └── useClaim.js        # Claim state & Q&A hook
│   │
│   ├── store/
│   │   └── authStore.js       # Global auth state (Zustand / Context)
│   │
│   └── utils/
│       ├── tokenChain.js      # Claim token chain generator
│       └── validators.js      # File & form validators
│
├── server/                    # Node.js companion server
│   ├── index.js               # Express entry point
│   ├── routes/
│   │   ├── cleanup.route.js   # Manual/cron trigger for cleanup
│   │   └── notify.route.js    # Admin notification endpoint
│   └── cron/
│       └── cleanupJob.js      # node-cron job for 20-day deletion
│
├── pocketbase/
│   └── pb_schema.json         # PocketBase collection schema export
│
├── docs/
│   ├── AGENTS.md
│   ├── FLOW.md
│   ├── ARCHITECTURE.md
│   └── LOG.md
│
├── vite.config.js
├── package.json
└── .env                       # VITE_PB_URL, NODE_PORT, etc.
```

---

## 🧩 Component Architecture

### Frontend (Vite + React)

```
App
 ├── <Router>
 │    ├── /login         → <Login />
 │    ├── /home          → <Home />           [ProtectedRoute: candidate]
 │    │    ├── <Navbar />
 │    │    ├── <PostCard /> × N               [Vertical feed]
 │    │    │    ├── <img />                   [Item image]
 │    │    │    ├── <p />                     [Description]
 │    │    │    ├── <ClaimedBadge />          [If status=claimed]
 │    │    │    └── <button> Claim </button>  [Triggers ClaimModal]
 │    │    ├── <ClaimModal />                 [Q&A overlay]
 │    │    ├── <UploadModal />               [+ FAB sheet]
 │    │    └── <FAB />                        [+ floating button]
 │    │
 │    └── /admin         → <Admin />          [ProtectedRoute: admin]
 │         ├── <PostManager />
 │         ├── <ClaimRequests />
 │         └── <QuestionEditor />
```

---

## 🗄️ Database Schema (PocketBase Collections)

### Collection: `users`
| Field       | Type     | Notes                          |
|-------------|----------|-------------------------------|
| `id`        | string   | Auto-generated PB ID           |
| `email`     | string   | Unique, required               |
| `password`  | string   | Hashed by PocketBase           |
| `role`      | select   | `admin` \| `candidate`        |
| `name`      | string   | Display name                   |
| `created`   | datetime | Auto                           |

---

### Collection: `posts`
| Field         | Type     | Notes                                   |
|---------------|----------|-----------------------------------------|
| `id`          | string   | Auto-generated PB ID                    |
| `image`       | file     | Lost item image                         |
| `description` | text     | Short description (max 200 chars)       |
| `status`      | select   | `active` \| `claimed`                  |
| `posted_by`   | relation | → `users.id`                            |
| `claimed_by`  | relation | → `users.id` (nullable)                |
| `claimed_at`  | datetime | When admin marked as claimed (nullable) |
| `created`     | datetime | Auto                                    |

---

### Collection: `item_questions`
| Field      | Type     | Notes                          |
|------------|----------|-------------------------------|
| `id`       | string   | Auto-generated PB ID           |
| `post_id`  | relation | → `posts.id`                   |
| `question` | text     | The rule-based question text   |
| `answer`   | text     | Correct answer (admin-set)     |
| `created`  | datetime | Auto                           |

---

### Collection: `claim_tokens`
| Field          | Type     | Notes                                        |
|----------------|----------|----------------------------------------------|
| `id`           | string   | Auto-generated PB ID                         |
| `post_id`      | relation | → `posts.id`                                 |
| `candidate_id` | relation | → `users.id`                                 |
| `token`        | string   | SHA256 chained token                         |
| `prev_token`   | string   | Previous claimant's token (chain reference)  |
| `status`       | select   | `pending` \| `approved` \| `rejected`       |
| `created`      | datetime | Auto                                         |

---

### Collection: `claim_attempts`
| Field          | Type     | Notes                              |
|----------------|----------|------------------------------------|
| `id`           | string   | Auto-generated PB ID               |
| `post_id`      | relation | → `posts.id`                       |
| `candidate_id` | relation | → `users.id`                       |
| `answers`      | json     | Submitted Q&A pairs                |
| `passed`       | bool     | Whether all answers were correct   |
| `created`      | datetime | Auto                               |

---

## 🔌 API Contract

### PocketBase REST Endpoints (auto-generated)

| Method | Endpoint                            | Auth Required | Description                  |
|--------|-------------------------------------|---------------|------------------------------|
| POST   | `/api/collections/users/auth-with-password` | No  | Login (returns JWT + role)   |
| GET    | `/api/collections/posts/records`    | Yes (candidate) | Fetch paginated feed         |
| POST   | `/api/collections/posts/records`    | Yes (candidate) | Create new post              |
| PATCH  | `/api/collections/posts/records/:id`| Yes (admin)   | Update post status           |
| GET    | `/api/collections/item_questions/records?filter=(post_id='...')` | Yes | Fetch Q&A for a post |
| POST   | `/api/collections/claim_attempts/records` | Yes (candidate) | Submit claim answers    |
| POST   | `/api/collections/claim_tokens/records`   | Yes (system) | Issue a claim token      |
| GET    | `/api/collections/claim_tokens/records`   | Yes (admin)  | View all claim tokens     |

### Node.js Express Endpoints

| Method | Endpoint              | Description                                |
|--------|-----------------------|--------------------------------------------|
| POST   | `/api/cleanup/run`    | Manually trigger the 20-day cleanup job    |
| GET    | `/api/cleanup/status` | Check last cleanup run & deleted count     |
| POST   | `/api/notify/admin`   | Send notification to admin on new claim    |

---

## 🔐 Authentication Flow

```
[Client] --POST /api/collections/users/auth-with-password--> [PocketBase]
                                                                    │
                                                              Returns JWT
                                                            + user record
                                                            (role field)
        <-------------------------------------------------------  │
[Client reads role]
   ├── role = admin    → store token → navigate /admin
   └── role = candidate → store token → navigate /home

[All subsequent API calls include]
   Header: Authorization: Bearer <token>
```

---

## 🔗 Token Chain Algorithm

Each successful claim generates a chained token:

```js
// utils/tokenChain.js
import { createHash } from 'crypto'

export function generateClaimToken(prevToken, candidateId, timestamp) {
  const raw = `${prevToken}::${candidateId}::${timestamp}`
  return createHash('sha256').update(raw).digest('hex')
}

// First-ever claim on a post uses:
// prevToken = post.id (as the genesis token)
```

This creates an **auditable chain** of claimants per item.

---

## ⚙️ Cleanup Job Architecture

```
Node.js server (server/cron/cleanupJob.js)
        │
        ▼
node-cron: runs every day at 00:00
        │
        ▼
Query PocketBase REST API:
  GET /api/collections/posts/records
  ?filter=(status='claimed' && claimed_at <= {20_days_ago})
        │
        ▼
For each matched post:
  1. DELETE /api/files/{collection}/{recordId}/{filename}  ← remove image
  2. PATCH  /api/collections/posts/records/{id}           ← archive record
  3. Append entry to LOG.md / audit collection
```

---

## 🌐 PWA Configuration

| Property       | Value                            |
|----------------|----------------------------------|
| `name`         | Lost & Found Portal              |
| `short_name`   | L&F                              |
| `display`      | `standalone`                     |
| `theme_color`  | `#1a1a2e`                        |
| `start_url`    | `/`                              |
| `icons`        | 192×192, 512×512 PNG             |
| `Service Worker` | Vite PWA plugin (Workbox)      |
| `Cache Strategy` | Network-first for API, Cache-first for assets |

---

## 🚀 Deployment Topology

```
┌──────────────────────────────────────────────────────┐
│                     Production                        │
│                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────┐  │
│  │  Vite PWA   │───▶│  Node.js     │───▶│PocketBase│  │
│  │  (Static    │    │  Express     │    │ (Backend │  │
│  │   Hosting)  │    │  (Cron +     │    │  + DB +  │  │
│  │  Vercel /   │    │   Notify)    │    │  Files)  │  │
│  │  Netlify    │    │  VPS/Render  │    │  VPS     │  │
│  └─────────────┘    └──────────────┘    └─────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📎 Related Documents
- [AGENTS.md](./AGENTS.md) — Agent roles and permissions
- [FLOW.md](./FLOW.md) — Step-by-step user interaction flows
- [LOG.md](./LOG.md) — Development changelog and decision log
