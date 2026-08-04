# RoomieMatch — High-End UI/UX Design Blueprint (v2.0)
*Bred for Excellence: A state-of-the-art, premium aesthetic that wows at first glance.*

---

## 1. Core Visual Philosophy & Design System

### A. The "Obsidian & Cyber-Violet" Color Palette
Instead of generic dark grays and standard blue buttons, RoomieMatch uses a deep, curated HSL & HEX dark mode palette inspired by futuristic glassmorphic interfaces:
- **Obsidian Void (Background)**: `#07070D` — ultra-deep black-violet canvas.
- **Ambient Aura (Glows)**: Radial gradients of Electric Iris (`#6366F1`), Cyber Rose (`#EC4899`), and Aurora Cyan (`#06B6D4`) softly illuminating page corners and card borders.
- **Multi-Layered Glassmorphic Cards**:
  - `bg-white/[0.04]` to `bg-white/[0.07]`
  - `backdrop-blur-2xl`
  - Subtle glowing borders: `border border-white/[0.08]` (default) to `hover:border-indigo-500/40` on hover.
  - Deep drop shadows: `shadow-2xl shadow-black/60`.

### B. Typography Hierarchy
- **Primary Display Font**: **Outfit / Geist Sans** (bold, geometric sans-serif for striking headings, hero titles, and percentage badges).
- **Secondary Body Font**: **Inter / Plus Jakarta Sans** (crisp, high-legibility body font with refined letter-spacing for AI compatibility summaries and lifestyle data).

### C. Dynamic Interactivity & Micro-Animations
- **Hover Elevation**: All interactive elements (match cards, CTAs, navigation pills) feature smooth `-translate-y-1` elevation and subtle shadow glow expansion on hover.
- **3D Zero-Gravity Hero (`ZeroGravityHero3D`)**: 5 glossy metallic spheres and floating glassmorphic cards drift in zero-gravity across the hero viewport, repelling gracefully from the user's cursor.
- **Glowing Compatibility Rings**: Scored match percentages displayed inside animated SVG circular progress rings with gradient strokes and neon pulse indicators.

---

## 2. Component-by-Component Overhaul Plan

### Step 1: Floating Pill Navbar (`src/components/Navbar.js`)
- Replaced standard full-width top border with a **floating glassmorphic pill bar** centered at the top of the viewport (`max-w-5xl mx-auto rounded-full bg-black/40 border border-white/10 backdrop-blur-2xl`).
- Features glowing status indicators (`"✓ Verified Account"` in neon emerald), user initials badge, and clean navigation pills (`Matches`, `Preferences`, `My Profile`).

### Step 2: Global Styles & Ambient Mesh (`src/app/globals.css`)
- Custom scrollbar styling (`::-webkit-scrollbar` with frosted glass thumb).
- Custom utility animations: `animate-float`, `animate-pulse-glow`, and smooth page entrance fade-in transitions.
- High-contrast badge utilities for lifestyle pills (`Early Riser`, `Cleanliness 4/5`, `Budget $800-$1,200`).

### Step 3: Premium MatchCard Component (`src/components/MatchCard.js`)
- **Top Header**: Candidate name, city, university badge, and a **prominent circular compatibility ring** (0–100% with color grading: Emerald for 85%+, Indigo for 70–84%, Amber for <70%).
- **AI Semantic Summary Card**: A dedicated glowing card section with an iridescent border highlighting the Claude AI semantic compatibility summary and shared routine insights.
- **Side-by-Side Comparison Grid**: 6-dimension lifestyle matrix (Sleep, Cleanliness, Budget, Guests, Food, Smoking) using crisp iconography and visual match badges (`"Match"`, `"Similar"`, `"Differs"`).
- **Action Toolbar**: An interactive **"👋 I'm Interested"** glowing gradient CTA button alongside a subtle, respectful **"Report profile"** shield icon button.

### Step 4: The Landing Page (`src/app/page.js`)
- **3D Zero-Gravity Hero Scene**: Full-screen canvas (`<HeroSceneContainer />`) with metallic spheres and floating glass cards.
- **Typography & CTAs**: High-impact gradient headline, trust metric badges (`100% Verified`, `6-Factor AI Scoring`, `Zero Spam Guarantee`), and dual primary/secondary CTA buttons.
- **Interactive "How It Works" Section**: 3 glowing glassmorphic cards with step numbers, micro-icons, and clear explanations.

### Step 5: Find My Roommates Dashboard (`src/app/dashboard/page.js`)
- **Dashboard Header Banner**: Personalized greeting, college verified badge, and quick stats showing available matches in their city.
- **Responsive Match Grid**: Automatically adapts from single column on mobile (`375px`) to 2-column on tablet and rich full-width cards on desktop.
- **Empty & Loading States**: Gorgeous skeleton pulse loaders and friendly empty-state illustrations.

---

## 3. Implementation Roadmap
1. [ ] Apply updated fonts, ambient colors, and glassmorphic utilities in `src/app/globals.css`.
2. [ ] Redesign `src/components/Navbar.js` into a floating glassmorphic pill navbar.
3. [ ] Upgrade `src/components/MatchCard.js` with glowing compatibility rings and sleek comparison tables.
4. [ ] Polish Landing Page (`src/app/page.js`) and Dashboard (`src/app/dashboard/page.js`) layouts.
5. [ ] Perform visual QA across mobile and desktop breakpoints.
