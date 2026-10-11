# 📦 IF-zero&one — Lost & Found PWA

> **A modern, privacy-focused Progressive Web App (PWA) for managing lost and found items in campuses and communities, backed by cryptographic claim verification and structured admin workflows.**

[![Vite](https://img.shields.io/badge/Vite-5.3+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.21+-b882f8?style=flat&logo=pocketbase&logoColor=white)](https://pocketbase.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture & Graph Maps](#-system-architecture--graph-maps)
  - [1. End-to-End System Topology Map](#1-end-to-end-system-topology-map)
  - [2. Comprehensive User & Data Flow Map](#2-comprehensive-user--data-flow-map)
  - [3. Post Lifecycle & State Transition Graph](#3-post-lifecycle--state-transition-graph)
  - [4. Cryptographic SHA-256 Token Chain Map](#4-cryptographic-sha-256-token-chain-map)
  - [5. Component Hierarchy & Navigation Map](#5-component-hierarchy--navigation-map)
  - [6. Entity Relationship (ER) Data Model](#6-entity-relationship-er-data-model)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [PocketBase Backend Setup](#pocketbase-backend-setup)
  - [Running the Application](#running-the-application)
  - [Demo Accounts & Roles](#demo-accounts--roles)
- [Database Collections & API](#-database-collections--api)
- [Documentation Suite](#-documentation-suite)
- [License](#-license)

---

## 📌 Overview

**IF-zero&one** is an institutional Lost & Found system engineered for colleges, offices, and large campuses. It bridges the gap between individuals who find lost property and the genuine owners who seek to reclaim them, while preventing fraudulent claims through a **two-tier verification engine**:

1. **Found Item Submission & Triage:** Finders submit photo evidence, category taxonomy, and location descriptions. Items enter a `pending` state awaiting physical surrender to the admin desk.
2. **Physical Inspection & Rule-based Verification:** Administrators physically verify the item and record challenge answers (e.g., engravings, passcode hints, bag contents, phone case stickers).
3. **Claim Challenge & Cryptographic Token Generation:** Claimants answer category-specific verification questions. A deterministic **SHA-256 chained claim token** is generated linking the post, claimant identity, and timestamp.
4. **Desk Distribution & Audit Trail:** Physical handover is completed at the admin desk against the claim token, transitioning posts to `claimed` status, with an automated 20-day cleanup cycle.

---

## 🗺️ System Architecture & Graph Maps

### 1. End-to-End System Topology Map

The system combines a lightweight client-side PWA with an embedded PocketBase Go backend and an optional Node.js companion engine for background scheduling.

```mermaid
flowchart TB
    subgraph Client["📱 Progressive Web App (Client)"]
        direction TB
        UI["React 18 UI / Vanilla CSS"]
        SW["Service Worker (Workbox PWA Cache)"]
        Store["Zustand Auth Store (JWT & User Context)"]
        CryptoEngine["Web Crypto API (SHA-256 Token Chain)"]
        Services["Service Layer (auth, post, claim)"]
        
        UI <--> Store
        UI --> Services
        Services --> CryptoEngine
        UI <--> SW
    end

    subgraph Backend["⚡ PocketBase Backend (:8090)"]
        direction TB
        PB_API["PocketBase REST & Realtime API"]
        PB_AUTH["JWT Auth Engine & Collection Rules"]
        PB_STORAGE["Local Media Storage (/pb_data/storage)"]
        SQLITE[("SQLite Database (/pb_data/data.db)")]
        
        PB_API --> PB_AUTH
        PB_AUTH --> SQLITE
        PB_API --> PB_STORAGE
    end

    subgraph Companion["⚙️ Companion Server (:4000)"]
        direction TB
        CRON["node-cron Scheduler (00:00 Daily)"]
        CLEANUP["Cleanup Service (20-day TTL purger)"]
        NOTIFY["Admin Notification Dispatcher"]
        
        CRON --> CLEANUP
        CLEANUP --> PB_API
        NOTIFY --> PB_API
    end

    Services -- "HTTP / REST & WebSocket" --> PB_API
    SW -- "Intercept / Offline Fallback" --> UI
```

---

### 2. Comprehensive User & Data Flow Map

This graph outlines the exact journey of both **Candidates** (students/staff) and **Administrators** across every stage of the lost-and-found lifecycle.

```mermaid
graph TD
    %% Roles
    User([👤 Candidate / Student]):::candidateStyle
    Admin([🛡️ Admin Desk Officer]):::adminStyle

    %% Candidate Reporting Found Item
    subgraph FlowA["Flow 1: Reporting a Found Item"]
        User -->|1. Taps '+' FAB on /home| UploadModal[Upload Modal]
        UploadModal -->|2. Fills Category, Subcategory, Photo, Description| PostPending[Create Post: status = 'pending']
        PostPending -->|3. Surrenders item to desk| PhysicalDesk[(🏢 Physical Admin Desk)]
    end

    %% Admin Verifying & Setting Questions
    subgraph FlowB["Flow 2: Verification & Publishing"]
        PhysicalDesk -.-> Admin
        Admin -->|4. Inspects item & clicks 'Approve'| AdminReview[Admin Review Queue]
        AdminReview -->|5. Answers rule-based taxonomy questions| QStore[Save to 'item_questions']
        QStore -->|6. Status changed to 'active'| PostActive[Post Published to Public Feed]
    end

    %% Candidate Lost Pre-Report
    subgraph FlowC["Flow 3: Pre-Request Lost Report"]
        User -->|Loses item before anyone finds it| LostTab[Lost Tab /home]
        LostTab -->|Submits category, date, desc| LostReport[Saved to 'lost_reports']
        LostReport -.->|Monitored in dashboard| Admin
    end

    %% Candidate Claiming Item
    subgraph FlowD["Flow 4: Claiming & Cryptographic Token"]
        PostActive -->|7. Candidate browses feed & clicks 'Claim'| ClaimModal[Claim Modal]
        ClaimModal -->|8. Answers category questions| AnswerEval{Evaluate Answers against Admin Baseline}
        AnswerEval -->|Record attempt| SaveAttempt[Save to 'claim_attempts']
        SaveAttempt -->|9. SHA-256 Token Chain| GenToken["Generate Chained Token:<br/>SHA256(prevToken + candidateId + timestamp)"]
        GenToken -->|10. View in Tokens tab| TokenScreen[Claim Token Issued]
    end

    %% Physical Resolution & Close
    subgraph FlowE["Flow 5: Resolution & Handover"]
        TokenScreen -->|11. Brings Token to Desk| PhysicalDesk
        Admin -->|12. Verifies claimant ID & answers| Handover[Hand Over Physical Item]
        Handover -->|13. Clicks 'Mark Claimed'| MarkClaimed[Post status = 'claimed']
        MarkClaimed -->|14. Starts 20-day TTL| ArchiveTimer[Claimed Timer Started]
    end

    %% Automated Cleanup
    subgraph FlowF["Flow 6: Retention & Cleanup"]
        ArchiveTimer -->|15. Day 20 Reached| CronJob[Cron Cleanup Agent]
        CronJob -->|16. Delete Image Storage & Archive Record| Purged[Purged / Archived]
    end

    classDef candidateStyle fill:#1e3a5f,stroke:#60a5fa,stroke-width:2px,color:#fff;
    classDef adminStyle fill:#3b2d54,stroke:#c084fc,stroke-width:2px,color:#fff;
```

---

### 3. Post Lifecycle & State Transition Graph

```mermaid
stateDiagram-v2
    [*] --> Pending: Candidate submits found item (Image + Taxonomy)
    
    state Pending {
        [*] --> InReviewQueue
        InReviewQueue --> AdminQnSetup: Admin inspects physical item
        AdminQnSetup --> Approved: Admin submits correct answers
    }

    Pending --> Rejected: Rejected / Spam / Non-compliant
    Rejected --> [*]

    Pending --> Active: Status updated to 'active'
    
    state Active {
        [*] --> InFeed: Visible on Candidate Feed
        InFeed --> ClaimAttempt: Candidate starts claim
        ClaimAttempt --> TokenIssued: Answers recorded & Token chained
        TokenIssued --> DeskVerification: Presented at Admin desk
    }

    Active --> Claimed: Admin verifies claimant & Marks Claimed
    
    state Claimed {
        [*] --> InRetention: Removed from public feed
        InRetention --> CleanupPending: 20-day countdown
    }

    Claimed --> ArchivedOrDeleted: Cleanup Agent purges files & record
    ArchivedOrDeleted --> [*]
```

---

### 4. Cryptographic SHA-256 Token Chain Map

To guarantee auditability and prevent claim forgery or replay attacks, tokens are derived sequentially using a **cryptographic hash chain** computed via the browser's native `window.crypto.subtle`:

```mermaid
flowchart LR
    subgraph Genesis["Genesis Block"]
        PostID["post.id<br/>(e.g., 'p0sts0000000001')"]
    end

    subgraph Claimant1["Claimant 1 Token"]
        G_In["prevToken = post.id"]
        C1_In["candidate_id_1"]
        T1_In["timestamp_1"]
        H1["SHA-256(prevToken::candidate_id::timestamp)"]
        Token1["Token 1 (Hash Hex)"]
        
        G_In & C1_In & T1_In --> H1 --> Token1
    end

    subgraph Claimant2["Claimant 2 Token (Chain)"]
        Prev_In["prevToken = Token 1"]
        C2_In["candidate_id_2"]
        T2_In["timestamp_2"]
        H2["SHA-256(prevToken::candidate_id::timestamp)"]
        Token2["Token 2 (Hash Hex)"]
        
        Prev_In & C2_In & T2_In --> H2 --> Token2
    end

    PostID --> G_In
    Token1 --> Prev_In
```

- **Genesis Seed:** The unique `post.id` acts as the genesis token for the first claim attempt.
- **Subsequent Nodes:** Each successive token hashes the previous claimant's token together with the new claimant's ID and exact millisecond timestamp (`${prevToken}::${candidateId}::${timestamp}`).
- **Integrity Guarantee:** The chain is immutable and deterministic. Admins can verify the sequential chain of claimants and detect any fabricated tokens.

---

### 5. Component Hierarchy & Navigation Map

```mermaid
graph TD
    Root["App (BrowserRouter)"]
    
    %% Routes
    Root --> R_Login["/login (Login.jsx)"]
    Root --> R_Home["/home (Home.jsx) — Protected"]
    Root --> R_Admin["/admin (Admin.jsx) — Protected"]

    %% Login Subcomponents
    R_Login --> TabRole["Role Selector (Candidate / Admin)"]
    R_Login --> AuthStore["useAuthStore (Zustand)"]

    %% Home Subcomponents
    R_Home --> Nav_Top["Navbar.jsx"]
    R_Home --> View_Home["View: 'home' (Vertical Feed)"]
    R_Home --> View_Lost["View: 'lost' (LostReportView.jsx)"]
    R_Home --> View_Tokens["View: 'tokens' (Tokens Tab)"]
    R_Home --> View_Profile["View: 'profile' (Profile & Logout)"]
    R_Home --> Nav_Bottom["Bottom Navigation Bar"]
    R_Home --> FAB_Comp["FAB.jsx (+)"]

    %% Feed Modals
    View_Home --> PostCard_Comp["PostCard.jsx (Image, Category, Claim Button)"]
    FAB_Comp --> UploadModal_Comp["UploadModal.jsx (Image Drop, Taxonomy, Desc)"]
    PostCard_Comp --> ClaimModal_Comp["ClaimModal.jsx (Dynamic Q&A Form)"]

    %% Admin Subcomponents
    R_Admin --> AdminNav["Navbar.jsx"]
    R_Admin --> StatCards["Admin Stat Cards (Review, Live, Tokens, Lost)"]
    R_Admin --> AdminTabs["Admin Tabs:"]
    AdminTabs --> Tab_Review["Tab 1: Review Posts Queue"]
    AdminTabs --> Tab_All["Tab 2: All Active Posts"]
    AdminTabs --> Tab_Claims["Tab 3: Claims & Tokens"]
    AdminTabs --> Tab_Lost["Tab 4: Lost Reports"]
    Tab_Review --> ApproveModal["Question Editor Modal (questions.json)"]
```

---

### 6. Entity Relationship (ER) Data Model

```mermaid
erDiagram
    users ||--o{ posts : "creates (posted_by)"
    users ||--o{ posts : "claims (claimed_by)"
    users ||--o{ lost_reports : "submits (user_id)"
    users ||--o{ claim_tokens : "issued_to (candidate_id)"
    users ||--o{ claim_attempts : "attempts (candidate_id)"
    
    posts ||--o{ item_questions : "has questions"
    posts ||--o{ claim_tokens : "tracks tokens"
    posts ||--o{ claim_attempts : "records attempts"

    users {
        string id PK
        string email
        string password
        string name
        string role "admin | student | staff | candidate"
        datetime created
        datetime updated
    }

    posts {
        string id PK
        file image "JPG / PNG / WebP (max 5MB)"
        string description "max 200 chars"
        string category "e.g. electronics, bags_and_wallets"
        string sub_category "e.g. mobile_phones, backpacks"
        string status "pending | active | claimed"
        string posted_by FK "-> users.id"
        string claimed_by FK "-> users.id (nullable)"
        datetime claimed_at "timestamp (nullable)"
        datetime created
        datetime updated
    }

    item_questions {
        string id PK
        string post_id FK "-> posts.id"
        string question "verification question text"
        string answer "correct baseline answer"
        datetime created
    }

    lost_reports {
        string id PK
        string user_id FK "-> users.id"
        string category "primary taxonomy"
        string sub_category "secondary taxonomy"
        string description "details of lost item"
        datetime date_lost "approximate date"
        string status "open | resolved"
        datetime created
    }

    claim_tokens {
        string id PK
        string post_id FK "-> posts.id"
        string candidate_id FK "-> users.id"
        string token "SHA-256 Hex Hash"
        string prev_token "Previous Token / post.id"
        string status "pending | approved | rejected"
        datetime created
    }

    claim_attempts {
        string id PK
        string post_id FK "-> posts.id"
        string candidate_id FK "-> users.id"
        json answers "Submitted Q&A key-values"
        bool passed "Validation check flag"
        datetime created
    }
```

---

## ✨ Key Features

- **📱 True Progressive Web App (PWA):**
  - Instant loading via Vite PWA Workbox caching.
  - Add to Home Screen (A2HS) support for iOS and Android.
  - Native feel with bottom navigation, snappy scroll feeds, and fluid micro-transitions.
- **🏷️ Deep Category Taxonomy (`questions.json`):**
  - Over 40+ specific sub-categories spanning Electronics, Wallets, IDs, Keys, Books, and Clothing.
  - Pre-calibrated verification questions tailored to each item type.
- **🛡️ Secure Verification Without Leaking Details:**
  - Challenge answers set by admins are never exposed directly to claimants.
  - Verification prevents social-engineering claims by asking specific, non-obvious details (e.g., lock screen background, key ring tag, internal compartment contents).
- **⛓️ Tamper-Evident SHA-256 Token Chain:**
  - Generates verifiable cryptographic proof of claim requests.
  - Uniquely binds the item, applicant, and time of claim into a single hexadecimal hash.
- **📋 Pre-Request Lost Reports:**
  - Candidates can register lost property proactively before it is turned in.
  - Admins can instantly match incoming found items with pending lost reports.
- **🎛️ Real-Time Admin Command Center:**
  - Quick-action stat cards showing items to review, active posts, pending tokens, and new lost reports.
  - One-click approvals, dynamic question prompting, and post closures.
- **🧹 Automated 20-Day Retention Cleanup:**
  - Background cron agent removes post media and cleans database records 20 days after claim fulfillment.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| **State Management** | [Zustand 4](https://github.com/pmndrs/zustand) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) |
| **Styling & Design** | Modern Vanilla CSS with Custom Design Tokens (`--bg-dark: #121212`, `--accent: #86efac`, Outfit font) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Cryptography** | Native Web Crypto API (`SubtleCrypto.digest` SHA-256) |
| **Backend & Database** | [PocketBase 0.21+](https://pocketbase.io/) (SQLite + Go standalone binary) |
| **PWA Plugin** | `vite-plugin-pwa` (Workbox offline worker & web manifest) |
| **Companion / Cron** | [Express](https://expressjs.com/) + [node-cron](https://github.com/node-cron/node-cron) |

---

## 📁 Project Directory Structure

```
IF-zero&one/
├── docs/                             # Comprehensive Architecture & Workflow Docs
│   ├── AGENTS.md                     # Agent roles, permissions & capabilities
│   ├── ARCHITECTURE.md               # Technical architecture & collection specs
│   ├── FLOW.md                       # Detailed end-to-end user interaction flows
│   └── LOG.md                        # Architectural Decision Records (ADRs) & changelog
│
├── pocketbase/                       # PocketBase Backend Instance
│   ├── pb_migrations/                # Database schema migrations
│   │   ├── 1710000000_update_status.js
│   │   ├── 1710000001_add_categories.js
│   │   ├── 1710000002_create_lost_reports.js
│   │   ├── 1710000003_update_post_status.js
│   │   └── 1710000004_update_post_rules.js
│   ├── pb_data/                      # SQLite database files & uploaded images
│   ├── pb_schema.json                # Complete exported PocketBase schema
│   └── pocketbase                    # PocketBase binary executable
│
├── public/                           # Static assets & PWA manifest icons
│   ├── icon.svg
│   └── manifest.webmanifest
│
├── src/                              # Frontend Application Source
│   ├── components/                   # Modular UI Components
│   │   ├── ClaimModal.jsx            # Q&A claim challenge modal
│   │   ├── FAB.jsx                   # Floating Action Button for uploading
│   │   ├── LostReportView.jsx        # Pre-request lost report form
│   │   ├── Navbar.jsx                # Top bar with title and action triggers
│   │   ├── PostCard.jsx              # Feed post card with item photo & claim trigger
│   │   └── UploadModal.jsx           # Found item submission sheet
│   │
│   ├── pages/                        # Page-level Views
│   │   ├── Admin.jsx                 # Full admin management dashboard
│   │   ├── Home.jsx                  # Candidate portal (Feed, Lost, Tokens, Profile)
│   │   └── Login.jsx                 # Dual-role authentication portal
│   │
│   ├── services/                     # Decoupled API Service Layer
│   │   ├── auth.service.js           # JWT auth, user logins, session storage
│   │   ├── claim.service.js          # Q&A retrieval, attempt logger, token generation
│   │   ├── pb.js                     # PocketBase SDK singleton instance
│   │   └── post.service.js           # Post CRUD, image file handling, lost reports
│   │
│   ├── store/                        # Global State
│   │   └── authStore.js              # Zustand store for user session and auth state
│   │
│   ├── styles/                       # Modular Component & Global Styles
│   │   ├── Admin.css                 # Admin tables, stat cards, and modals
│   │   ├── ClaimModal.css            # Challenge modal styling
│   │   ├── FAB.css                   # Floating action button styles
│   │   ├── Home.css                  # Feed and bottom navigation styles
│   │   ├── Login.css                 # Login page styles
│   │   ├── Navbar.css                # Header styles
│   │   ├── PostCard.css              # Post card layout and overlays
│   │   ├── UploadModal.css           # Image picker and taxonomy selects
│   │   └── global.css                # Design tokens, color system, and resets
│   │
│   ├── utils/                        # Utility Libraries
│   │   ├── questions.json            # Deep hierarchical taxonomy & challenge questions
│   │   └── tokenChain.js             # SHA-256 native cryptographic chaining algorithm
│   │
│   ├── App.jsx                       # Route configuration & protected route guards
│   ├── main.jsx                      # React 18 DOM mount & PWA service worker registration
│   └── index.css                     # Base styling
│
├── .env.example                      # Environment variables template
├── git-sync.sh                       # Quick Git staging, commit, and push automation
├── index.html                        # Application entry point with font preloads
├── package.json                      # Node.js dependencies and script definitions
└── vite.config.js                    # Vite bundler, path aliases & PWA Workbox config
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **PocketBase binary**: Included in the `pocketbase/` directory (or download from [PocketBase Releases](https://pocketbase.io/docs/))

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Venkatesh-107/IF-zero-one.git
   cd IF-zero-one
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Verify the contents of `.env`:
   ```ini
   # PocketBase server URL
   VITE_PB_URL=http://127.0.0.1:8090

   # Node.js Companion Server port
   NODE_PORT=4000

   # PocketBase Admin credentials (for background jobs)
   PB_ADMIN_EMAIL=admin@example.com
   PB_ADMIN_PASSWORD=your_admin_password

   # General Configuration
   VITE_APP_NAME="Lost & Found"
   VITE_CLAIM_EXPIRY_DAYS=20
   ```

---

### PocketBase Backend Setup

1. **Start the PocketBase server:**
   ```bash
   cd pocketbase
   ./pocketbase serve
   ```
   *(On Windows, run `pocketbase.exe serve`)*

2. **Access the Admin Dashboard:**
   - Open your browser at: `http://127.0.0.1:8090/_/`
   - On the first run, create your primary PocketBase Admin account.
   - The collections (`users`, `posts`, `item_questions`, `lost_reports`, `claim_tokens`, `claim_attempts`) are automatically migrated from `pb_migrations/` or can be imported via `pb_schema.json`.

---

### Running the Application

1. **Start the Vite Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at: `http://localhost:5173`

2. **(Optional) Run with Companion Server:**
   ```bash
   npm run dev:all
   ```

---

### Demo Accounts & Roles

The system supports role-based access control. You can register new accounts via the UI or use pre-configured test users:

| Role | Access URL | Permissions & Capabilities |
|---|---|---|
| **Admin** (`role: admin`) | `/admin` | Review queue, post approvals, set challenge answers, inspect tokens, mark claimed, manage reports |
| **Candidate** (`role: candidate` / `student`) | `/home` | Browse feed, report found items (`+`), file lost pre-reports, submit claim answers, receive claim tokens |

---

## 🗄️ Database Collections & API

The frontend interacts with PocketBase via standard REST endpoints and the official JS SDK (`src/services/`):

| Collection | Endpoint | Access Rules | Key Purpose |
|---|---|---|---|
| `users` | `/api/collections/users` | Auth Required | User profiles & role determination (`admin` vs `candidate`) |
| `posts` | `/api/collections/posts` | Public/Auth | Lost & found item listings, pictures, categories, and status |
| `item_questions` | `/api/collections/item_questions` | Auth (Admin update) | Baseline verification questions & answers per post |
| `lost_reports` | `/api/collections/lost_reports` | Auth Required | Pre-request lost reports submitted by users |
| `claim_tokens` | `/api/collections/claim_tokens` | Auth / Admin view | Cryptographic SHA-256 tokens issued to claimants |
| `claim_attempts` | `/api/collections/claim_attempts` | Auth / Admin view | Audit log of candidate responses and pass/fail evaluations |

---

## 📚 Documentation Suite

For deeper technical deep dives, refer to the documentation files in the [`docs/`](./docs) folder:

- 🏗️ **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Architectural design, component breakdowns, data flow sequence diagrams, and database schemas.
- 🔄 **[docs/FLOW.md](./docs/FLOW.md)** — Detailed step-by-step user interaction scenarios, routing transitions, and verification logic.
- 🤖 **[docs/AGENTS.md](./docs/AGENTS.md)** — Human vs. automated agent definitions, responsibilities, and permissions matrix.
- 📋 **[docs/LOG.md](./docs/LOG.md)** — Architectural Decision Records (ADRs), milestone progress, and planned roadmap.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — see the LICENSE file for details.