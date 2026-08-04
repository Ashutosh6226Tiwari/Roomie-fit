# RoomieMatch — Warm, Credible & Calm Design System (v3.0)

*A trusted, campus-first aesthetic for college students making a genuinely personal and slightly anxious decision: who am I going to live with?*

---

## 1. Core Visual Philosophy & Emotional Tone
- **Who this is for**: College students, mostly on their phones, making a personal and important living decision.
- **What it should feel like**: Warm, credible, and calm — closer to a trusted campus service than a hyped-up AI startup. Confidence and reassurance, not flash.
- **What is explicitly excluded**: No dark navy/purple gradient background, no floating glassy 3D orbs/shapes, no gradient-text keywords in headlines, no gradient pill badges, no bold generic sans-serif SaaS templates.

---

## 2. Color Palette (Exact Hex Values — Flat, No Gradients)
Each color is used as a flat, deliberate choice (card background, icon, badge, button), never as a decorative gradient sweep:
- **Background (primary)**: `#FFFFFF` — clean, crisp primary page canvas.
- **Background (secondary, alternating sections)**: `#F1EFFC` — a very soft pale lilac tint, used as flat section backgrounds.
- **Ink (primary text)**: `#17151F` — deep charcoal-black for headlines and body text.
- **Primary accent (brand color)**: `#5B4EE5` — a flat periwinkle-violet for navigation, primary buttons, and interactive links.
- **Secondary accent (compatibility score, highlights)**: `#FF6B4A` — a warm coral, used sparingly for score numbers and key highlights only.
- **Trust/verified accent**: `#2F7A56` — a moss green, used only for verification and safety-related badges/icons.

---

## 3. Typography Hierarchy
- **Display Face (Headlines, Hero Text)**: **Fraunces** (Google Fonts, serif), set at high weight (600–700). Confident, warm editorial serif with real character that carries the personality of the page (48–64px on desktop hero).
- **Body / UI Face**: **Inter** for all body text, form labels, nav, and buttons. Clean, highly legible, stays out of the way of the serif headlines.
- **Data / Utility Face**: **IBM Plex Mono** for compatibility scores, numeric badges, and step numerals (`01`, `02`, `03`). Gives measured values a distinct, precise feel.

---

## 4. Signature Element: The 6-Axis Compatibility Fingerprint
The product's core mechanism is a 6-axis compatibility score:
1. Sleep schedule
2. Cleanliness
3. Food habits
4. Guest frequency
5. Smoking
6. Move-in timing

### Visual Implementations:
- **Logo Mark (Navigation)**: A simplified static 6-point radial/asterisk mark in `#5B4EE5` on the left of the navbar.
- **MatchCard Score Visualization**: Replaces plain percentage badges/rings with two overlapping radial 6-axis shapes in primary (`#5B4EE5`) and secondary (`#FF6B4A`) accents, with the overlap area shaded to show compatibility at a glance.
- **Hero Watermark**: A single large, faint instance of the fingerprint mark behind the hero headline (low opacity, single flat `#5B4EE5` tint, no glow or blur).

---

## 5. Layout & Content Principles
- **Hero Section**:
  - Headline in serif **Fraunces**: *"Find a roommate you'll actually get along with"*
  - Supporting sentence in **Inter**: *"We check your college email, match your sleep schedule and living habits, and keep your contact info private until you both say yes."*
  - Single primary CTA button: *"Get started"* (flat `#5B4EE5` background, white text).
  - Secondary text link: *"Sign in"* (not a second competing button).
- **How It Works Section**:
  - Set on `#F1EFFC` secondary background.
  - Numbered steps using plain numerals (`01`, `02`, `03`) in **IBM Plex Mono**.
- **Trust Section**:
  - Explains email verification and mutual-interest contact reveal in plain language without jargon or specification references.
- **Section Separation**:
  - Uses generous whitespace and `#F1EFFC` alternating backgrounds instead of accent lines under headings, vertical color stripes, or gradient bars.
