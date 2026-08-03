# Product Requirements Document (PRD)
# RoomieMatch — AI-Powered Roommate Matching for College Students

**Version:** 1.0 (MVP)
**Document type:** Engineering PRD for AI-assisted development
**Target audience of this doc:** AI coding agent / development team

---

## 1. Product Overview

### 1.1 Problem Statement
Students moving to a new city for college struggle to find roommates who are actually compatible with their lifestyle and trustworthy enough to live with. Existing solutions (WhatsApp groups, Facebook pages) are unstructured, low-trust, and surface low-intent responses. There is no structured way to showcase lifestyle preferences (sleep schedule, cleanliness, food habits, guests, budget) and no intelligent system to surface genuinely compatible matches from a pool of strangers.

### 1.2 Solution Summary
A web application where verified college students create a single lifestyle profile. When a student marks themselves "actively looking," the system uses an AI-driven hybrid scoring engine (rule-based + LLM) to surface the **top 3 most compatible other students** as potential roommates. Contact details are revealed only after both students mutually express interest.

### 1.3 MVP Scope Boundaries
**In scope:**
- Single city/campus launch
- College students only (not interns, not landlords/PG owners)
- Web only, responsive (no native app)
- Peer-to-peer matching only (student-to-student, not student-to-listing)

**Explicitly out of scope for MVP (do not build):**
- In-app messaging/chat
- Ratings/reviews system
- Multi-city support
- Native mobile app / PWA
- Payments or monetization features
- Landlord/PG owner accounts
- Icebreaker question suggestions

---

## 2. User Roles

There is exactly **one user role** in the MVP: **Student**. There is no admin-facing UI required for MVP beyond a basic report-review queue (see §7.3), which can be a simple internal/manual process, not a built dashboard, unless trivial to add.

---

## 3. Functional Requirements

### 3.1 Authentication & Verification
- Students sign up using **email + password**, OR email-only magic link (developer's choice for simplicity)
- Email must be a **verified college domain** (e.g. `@college.edu`) OR the student uploads a student ID image for manual/placeholder verification
  - MVP implementation: maintain an allow-list of college email domains; if the signup email domain matches, mark `is_verified = true` automatically. Student ID upload path can simply store the image and mark `verification_status = "pending"` for later manual review — no OCR/automated ID verification needed for MVP.
- No verification = cannot create a profile or appear in match results (can browse only, if browsing is unauthenticated — otherwise, verification gates all app access)

### 3.2 Profile Creation & Management
Each student has exactly one profile with the following fields:

**Structured fields (all required unless marked optional):**
| Field | Type | Notes |
|---|---|---|
| Full name | text | |
| City | text/dropdown | Single city for MVP, but store as a field for future multi-city support |
| Budget (monthly rent, min-max range) | number range | Used as a **hard filter** |
| Gender | select | Used as a **hard filter** (student sets a preference for roommate gender separately, see below) |
| Preferred roommate gender | select (Male / Female / Any) | Hard filter applied against other students' gender field |
| Sleep schedule | select (Early bird / Night owl / Flexible) | Soft-scored |
| Cleanliness level | scale (1-5) | Soft-scored |
| Food habits | select (Vegetarian / Non-vegetarian / Vegan / No preference) | Soft-scored |
| Guest frequency | select (Rarely / Occasionally / Frequently) | Soft-scored |
| Smoking | boolean (Yes/No) | Soft-scored (can be promoted to hard filter if desired — flag as configurable) |
| Move-in timeframe | date/month | Soft-scored (proximity) |

**Free-text field:**
| Field | Type | Notes |
|---|---|---|
| About me | textarea (300-500 char limit) | Parsed by LLM for nuance signal, not shown as raw scoring input to the rule engine |

**Status fields:**
| Field | Type | Notes |
|---|---|---|
| Actively looking | boolean toggle | Defaults to `true` on profile creation; auto-expires to `false` after 30 days of no re-confirmation |
| Found roommate | boolean | Manually set by student; when `true`, excludes them from all future match results regardless of "actively looking" status |

- Students can edit their profile at any time
- Profile is always viewable/browsable by other verified students, but appears in **top-3 AI match results** only when `actively_looking = true` and `found_roommate = false`

### 3.3 Requesting Matches
- There is **no separate "requirement submission form."** A student's own profile is the input to the matching engine.
- Flow: student clicks "Find My Roommates" → system runs the matching engine using the requester's own profile as the query → returns top 3 results
- Students can re-run this at any time (e.g. after editing their profile)

### 3.4 Matching Engine (Core AI Feature)

**Step 1 — Hard filters (apply first, exclude non-matches entirely):**
- Budget ranges must overlap
- Requester's "preferred roommate gender" must match the candidate's gender (unless requester set "Any")
- Exclude candidates where `actively_looking = false` or `found_roommate = true`
- Exclude the requester's own profile

**Step 2 — Rule-based compatibility score (0-100) on remaining candidates:**
Suggested weighting (should be defined as configurable constants, not hardcoded magic numbers, so they can be tuned later):
- Sleep schedule match: 20%
- Cleanliness level closeness (scaled difference): 25%
- Food habits compatibility: 15%
- Guest frequency closeness: 15%
- Smoking compatibility: 15%
- Move-in timeframe proximity: 10%

Each sub-score should be calculated as a normalized 0-1 value, weighted, and summed to a final 0-100 score.

**Step 3 — LLM adjustment layer:**
- Send both students' "About me" free-text fields to an LLM (Claude API) with a prompt instructing it to:
  - Identify semantic compatibility signals (e.g. both mention being quiet/introverted, both mention similar routines)
  - Identify potential red flags or mismatches not captured in structured fields
  - Return a small adjustment value (e.g. -10 to +10) to apply to the Step 2 score, plus a short natural-language explanation
- **Important:** the LLM should return structured JSON output only (adjustment score + explanation string), not free-form prose, so it can be reliably parsed. Prompt the LLM explicitly to respond in JSON only.
- Final score = Step 2 score + LLM adjustment, clamped to 0-100

**Step 4 — Return top 3** candidates by final score, each with:
- Final compatibility score
- AI-generated one-paragraph summary (can reuse/format the LLM explanation from Step 3, plus a note on the structured-field highlights, e.g. "You're both early risers and similar on cleanliness, though guest frequency differs slightly.")
- A structured attribute comparison object (for the side-by-side UI)

### 3.5 Match Results UI
For each of the 3 returned candidates, display:
- Name, photo (if any), city
- Compatibility score (visually prominent, e.g. a badge or ring)
- AI-generated summary text
- Side-by-side comparison table of key attributes (sleep schedule, cleanliness, food, guests, smoking, budget)
- An "I'm interested" button

### 3.6 Mutual Interest & Contact Reveal
- When Student A clicks "I'm interested" on Student B's match card, record this as a one-directional interest record
- If Student B has also (independently, at any point) expressed interest in Student A, this becomes a **mutual match**
- On mutual match:
  - Both students are notified (in-app notification and/or email)
  - Both students' contact info (email, and optionally a phone number field if collected) becomes visible to each other on the match card
- No in-app chat — students take the conversation to their own channels (WhatsApp, email, etc.)

### 3.7 Post-Match Status
- After a mutual match (or independently, at any time), a student can manually mark **"I found my roommate"**
- This sets `found_roommate = true`, removing them from all future match results
- This action should be logged with a timestamp — it is the **primary success metric** for the product (see §8)

---

## 4. Non-Functional Requirements

- **Privacy:** contact info must never be exposed in any API response or UI before a mutual match is confirmed server-side. This must be enforced in the backend, not just hidden in the frontend.
- **Verification gate:** unverified users must not be able to create profiles or appear in/receive match results.
- **Explainability:** every match must include a human-readable explanation, not just a raw score — do not ship a "black box" score with no reasoning.
- **Cost control:** LLM API calls should be minimized — only call the LLM during an actual match request (Step 3 above), not on every profile edit or page load. Cache/reuse computed scores where reasonable within a short window if the same pair is re-queried.
- **Data scoping:** all matching computations should be scoped to the single launch city (city field should still exist in the schema to support future multi-city expansion without a schema rewrite).

---

## 5. Data Model (Suggested Schema)

```
users
  id (uuid, pk)
  email (string, unique)
  password_hash (string, nullable if using magic link)
  is_verified (boolean)
  verification_method ("college_email" | "student_id_pending")
  created_at (timestamp)

profiles
  id (uuid, pk)
  user_id (uuid, fk -> users.id, unique)
  full_name (string)
  city (string)
  budget_min (integer)
  budget_max (integer)
  gender (enum: male, female, other)
  preferred_roommate_gender (enum: male, female, any)
  sleep_schedule (enum: early_bird, night_owl, flexible)
  cleanliness_level (integer, 1-5)
  food_habits (enum: vegetarian, non_vegetarian, vegan, no_preference)
  guest_frequency (enum: rarely, occasionally, frequently)
  smoking (boolean)
  move_in_month (date)
  about_me (text, max 500 chars)
  actively_looking (boolean, default true)
  actively_looking_confirmed_at (timestamp)  -- used for 30-day auto-expiry
  found_roommate (boolean, default false)
  photo_url (string, nullable)
  updated_at (timestamp)

interests
  id (uuid, pk)
  from_user_id (uuid, fk -> users.id)
  to_user_id (uuid, fk -> users.id)
  created_at (timestamp)
  -- a mutual match exists if a row (A,B) and a row (B,A) both exist

match_results (optional cache table)
  id (uuid, pk)
  requester_id (uuid, fk -> users.id)
  candidate_id (uuid, fk -> users.id)
  score (integer)
  explanation (text)
  computed_at (timestamp)

reports
  id (uuid, pk)
  reported_by_id (uuid, fk -> users.id)
  reported_user_id (uuid, fk -> users.id)
  reason (text)
  created_at (timestamp)
  status (enum: open, reviewed, dismissed)
```

---

## 6. API Surface (Suggested)

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/verify-email

GET    /api/profile/me
POST   /api/profile           (create)
PUT    /api/profile           (update)
PATCH  /api/profile/status    (toggle actively_looking / found_roommate)

GET    /api/matches           (runs the matching engine for the logged-in user, returns top 3)

POST   /api/interests         (body: { to_user_id })
GET    /api/interests/mutual  (list confirmed mutual matches, includes contact info only for these)

POST   /api/reports           (body: { reported_user_id, reason })
```

---

## 7. Safety & Trust Features

### 7.1 Verification
See §3.1. This is the primary trust mechanism at launch.

### 7.2 Hard filters
Budget and gender preference are hard filters, not soft scores — see §3.4 Step 1. This is a deliberate product decision, not a technical shortcut: these are non-negotiable constraints for most students.

### 7.3 Reporting
- A "Report this profile" button on every profile/match card
- Submits to the `reports` table
- MVP does not require a built admin dashboard — a simple internal query/export for the founder to review reports manually is sufficient. Flag this as a "nice-to-have" admin view if time allows, not a blocking requirement.

---

## 8. Success Metrics

**Primary metric:** count of profiles with `found_roommate = true` (with timestamp), i.e. completed matches. This should be trackable via a simple internal query or lightweight analytics view — not a public-facing dashboard for MVP.

**Secondary metrics (nice to have, not blocking):**
- Number of profiles created
- Number of profiles with `actively_looking = true`
- Number of mutual matches created
- Conversion rate: mutual matches → found_roommate

---

## 9. Recommended Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | Fast build, SSR, large ecosystem |
| Backend | Next.js API routes | Avoids running a separate backend service for MVP |
| Database + Auth | Supabase (Postgres + Auth), free tier | Auth, DB, and storage bundled; free tier sufficient for single-city MVP |
| LLM | Claude API (pay-as-you-go) | Only recurring cost item; used only in the Step 3 matching adjustment, keeping usage low |
| Hosting | Vercel, free tier | Zero-cost hosting, auto-scaling, pairs natively with Next.js |
| File/photo storage | Supabase Storage, free tier | Bundled with the DB choice |

**Cost note:** the only meaningful recurring cost at MVP scale is LLM API usage, and only during active match requests — everything else fits within free tiers for a single-city launch.

---

## 10. Suggested Build Order

1. Auth (signup/login) + college email domain verification
2. Profile CRUD (structured fields + free text + photo upload)
3. "Actively looking" / "found roommate" status toggles
4. Rule-based matching engine (Step 1 hard filters + Step 2 scoring) — ship and test this in isolation before adding the LLM layer
5. LLM adjustment layer (Step 3) — integrate Claude API, structured JSON output, clamp/merge with rule-based score
6. Match results UI (score, summary, comparison table, "I'm interested" button)
7. Interests table + mutual match detection + contact reveal logic (must be server-enforced)
8. Report button + reports table
9. "Found roommate" flag + basic internal metrics query

---

## 11. Open Questions for the Development Team
- Exact list of allowed college email domains for the launch city/campus
- Whether phone number is collected at signup or optionally added later (affects contact-reveal payload)
- Final scoring weights for Step 2 (start with suggested defaults in §3.4, tune based on real usage data)
- Whether "smoking" should be promoted from soft-scored to a hard filter (flagged as configurable in §3.2)
