# 🔄 FLOW.md — User Interaction Flows
> **Project:** Lost & Found PWA  
> **Stack:** Vite · Node.js · PocketBase · PWA  
> **Last Updated:** 2026-10-10

---

## 📌 Overview

This document maps all end-to-end **user interaction flows** in the application. Each flow describes the exact steps a user (or system) takes from entry point to completion.

---

## Flow 1 — App Launch & Login Routing

```
[User opens PWA]
        │
        ▼
[Login Screen displayed]
        │
   ┌────┴────┐
   │         │
[Admin]  [Candidate]
   │         │
   ▼         ▼
[/admin]  [/home]
 Portal    Feed
```

### Steps

1. User opens the PWA in their browser.
2. App checks for an existing valid session (PocketBase JWT).
   - **If session valid** → skip login, route to appropriate dashboard.
   - **If no session** → display the **Login Screen**.
3. Login Screen shows two separate login paths:
   - **Admin Login** (email + password for admin-role account)
   - **Candidate Login** (email + password for regular user account)
4. On successful auth, PocketBase returns a JWT with the user's `role` field.
5. `AUTH_AGENT` reads the role:
   - `role === 'admin'` → Navigate to `/admin`
   - `role === 'candidate'` → Navigate to `/home`
6. On failed auth → show error message, remain on login screen.

---

## Flow 2 — Candidate: Browsing the Feed

```
[Candidate lands on /home]
        │
        ▼
[Instagram-style vertical feed loads]
        │
        ▼
[Posts scroll one after another]
   Each post contains:
   ├── 📸 Image
   ├── 📝 Description
   └── 🔵 Claim Button
        │
        ▼
[Candidate scrolls / interacts]
```

### Steps

1. On `/home`, the app fetches paginated posts from PocketBase `posts` collection.
2. Posts render in a **vertical scrollable feed** (one post per viewport, similar to Instagram/Reels).
3. Each post card displays:
   - High-quality image of the lost item.
   - Short description text.
   - A **Claim** button (if post status is `active`).
   - A **Claimed** badge (if post status is `claimed`).
4. Infinite scroll or pagination loads more posts as the user scrolls down.
5. A **`+` floating action button** is pinned at the bottom of the screen.

---

## Flow 3 — Candidate: Submitting a Found Item (`+` Icon)

```
[Candidate taps + icon]
        │
        ▼
[Upload Modal opens]
        │
        ▼
[Select image from device]
        │
        ▼
[Enter short description]
        │
        ▼
[Submit]
        │
   ┌────┴────┐
[Valid]   [Invalid]
   │           │
   ▼           ▼
[POST_AGENT  [Show validation
 stores post  error, retry]
 in PocketBase]
   │
   ▼
[Post appears in feed]
```

### Steps

1. Candidate taps the `+` floating button at the bottom of the home screen.
2. A **bottom sheet / modal** slides up with:
   - Image picker (camera or gallery).
   - A text field for a short description (e.g., max 200 characters).
   - A **Submit** button.
3. On submit, `POST_AGENT` validates:
   - Image: must be JPG/PNG/WEBP, max 5MB.
   - Description: required, non-empty.
4. If valid → image and metadata are uploaded to PocketBase.
5. Post is created with status `active` and appears at the top of the feed.
6. If invalid → validation error is shown inline, user retries.

---

## Flow 4 — Candidate: Claiming an Item

```
[Candidate clicks Claim on a post]
        │
        ▼
[Claim Modal opens]
        │
        ▼
[Rule-based questions displayed]
   (set by Admin for this item)
        │
        ▼
[Candidate answers all questions]
        │
        ▼
[Submit answers]
        │
   ┌────┴──────┐
[All Pass]  [Any Fail]
   │              │
   ▼              ▼
[CLAIM_AGENT  [Show failure
 generates     message,
 Claim Token]  deny claim]
   │
   ▼
[Token issued with chain:
 token = hash(prev_token + user_id + timestamp)]
   │
   ▼
[Admin notified of verified claim]
   │
   ▼
[Admin reviews & distributes item]
   │
   ▼
[Admin marks post as CLAIMED]
   │
   ▼
[Post displays CLAIMED badge]
   │
   ▼
[20-day countdown begins]
   │
   ▼
[CLEANUP_AGENT deletes post & image]
```

### Steps

1. Candidate clicks the **Claim** button on an active post.
2. A **Claim Modal** opens displaying all rule-based questions for that item.
   - Questions are fetched from PocketBase `item_questions` collection.
   - Example questions: "What color is the item?", "Where was it last seen?"
3. Candidate fills in all answers and submits.
4. `CLAIM_AGENT` evaluates answers:
   - **All correct** → proceed to token generation.
   - **Any incorrect** → modal shows "Claim Failed" message. Attempt is logged.
5. On success:
   - A **Claim Token** is generated using: `SHA256(previous_token + candidate_id + timestamp)`.
   - The token is stored in PocketBase `claim_tokens` collection.
   - Admin receives a notification of the verified claim.
6. Admin reviews the claim in the Admin Portal.
7. Admin physically distributes the item and clicks **Mark as Distributed**.
8. Post status changes to `claimed`, `claimed_at` is set to current timestamp.
9. Post UI updates to show a **"CLAIMED"** badge overlay.
10. After **20 days**, `CLEANUP_AGENT` deletes the post image and archives the record.

---

## Flow 5 — Admin: Managing Claims

```
[Admin logs in → /admin]
        │
        ▼
[Admin Dashboard loads]
   ├── All Posts overview
   ├── Pending Claim Requests
   └── Item Management
        │
        ▼
[Admin selects a claim request]
        │
        ▼
[Views candidate's token & answers]
        │
        ▼
[Distributes item physically]
        │
        ▼
[Clicks "Mark as Distributed"]
        │
        ▼
[Post status → CLAIMED]
```

### Steps

1. Admin logs in via Admin Portal (`/admin`).
2. Dashboard shows:
   - List of all active posts.
   - Pending claim requests (candidates who passed Q&A).
   - Option to add/edit questions per post.
3. Admin clicks on a claim request to view:
   - Candidate info.
   - Claim token.
   - Q&A answers.
4. Admin physically hands over the item to the candidate.
5. Admin clicks **"Mark as Distributed"** in the portal.
6. System updates post status to `claimed` with timestamp.
7. 20-day cleanup countdown starts.

---

## Flow 6 — Auto Cleanup (System Flow)

```
[CLEANUP_AGENT runs daily cron]
        │
        ▼
[Query posts WHERE status = 'claimed'
 AND claimed_at <= NOW() - 20 days]
        │
        ▼
[For each matched post:]
   ├── Delete image from PocketBase storage
   ├── Archive post record (or delete)
   └── Write entry to audit LOG
        │
        ▼
[Cron completes, sleeps until next day]
```

---

## 📎 Related Documents
- [AGENTS.md](./AGENTS.md) — Agent roles and permissions
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture & component design
- [LOG.md](./LOG.md) — Development changelog and decision log
