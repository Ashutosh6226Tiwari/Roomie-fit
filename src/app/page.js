import Link from "next/link";
import HeroSceneContainer from "@/components/HeroSceneContainer";

export const metadata = {
  title: "RoomieMatch — Verified AI Roommate Finder",
  description:
    "AI-powered roommate matching for verified students & community members. Discover compatible roommates based on lifestyle, cleanliness, sleep schedule, and budget.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Hero Section with High-End 3D Zero-Gravity Physics Scene */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 min-h-[720px] flex items-center justify-center">
          {/* 3D Zero-Gravity Physics Hero Scene (Spheres, Matte Geometry, Floating Glass Cards) */}
          <HeroSceneContainer />

          {/* Decorative glowing backdrops */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[400px] w-[700px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-4xl text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>AI-Powered Compatibility • Verified Community Matching</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight sm:leading-tight drop-shadow-lg">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Roommate
              </span>{" "}
              Without the Chaos.
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed drop-shadow">
              No sketchy strangers or random social media DMs. RoomieMatch verifies
              your community email, scores lifestyle compatibility across 6 key
              dimensions, and protects your contact info until interest is mutual.
            </p>

            {/* Primary / Secondary CTAs per Prompt 11 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
              >
                <span>Get Verified Now</span>
                <span>→</span>
              </Link>

              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-extrabold text-white transition-all hover:bg-white/10 hover:border-white/30"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-indigo-300">100%</p>
                <p className="text-xs text-slate-400 mt-1">.edu Email Verified</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-purple-300">6 Factors</p>
                <p className="text-xs text-slate-400 mt-1">Weighted Rule Engine</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-pink-300">AI + Rules</p>
                <p className="text-xs text-slate-400 mt-1">Semantic Compatibility</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-emerald-300">Zero Leak</p>
                <p className="text-xs text-slate-400 mt-1">Server Contact Reveal</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section (§1.3 & §3.4–3.6) */}
        <section className="border-t border-white/10 bg-slate-900/60 py-24 px-6">
          <div className="mx-auto max-w-5xl space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                How RoomieMatch Works
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Built specifically for college campuses, combining hard budget
                filters with lifestyle habits and AI-powered compatibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-xl font-extrabold text-indigo-400 border border-indigo-500/30">
                  01
                </div>
                <h3 className="text-xl font-bold text-white">
                  Get College Verified
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sign up with your university email address (.edu). Our automated
                  gate ensures only verified students can access candidate profiles.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-xl font-extrabold text-purple-400 border border-purple-500/30">
                  02
                </div>
                <h3 className="text-xl font-bold text-white">
                  Set Lifestyle &amp; Budget
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter your monthly budget, sleep schedule (Early Riser / Night
                  Owl), cleanliness level (1–5), food habits, guests, and bio.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-xl font-extrabold text-pink-400 border border-pink-500/30">
                  03
                </div>
                <h3 className="text-xl font-bold text-white">
                  Match &amp; Unseal Safely
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  See your Top 3 scored matches. Express interest anonymously—your
                  verified contact details only unlock when interest is mutual!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRD §3.7 Primary Success Metric CTA */}
        <section className="py-20 px-6 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 p-10 sm:p-14 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to find your college roommate?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
              Join students across Boston and college towns finding roommates who
              match their lifestyle and budget.
            </p>
            <div>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all"
              >
                <span>Start Finding Roommates</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>RoomieMatch</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-normal">MVP Version 0.1.0</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Get Verified
            </Link>
            <Link
              href="/admin/metrics"
              className="hover:text-indigo-300 text-indigo-400 font-semibold transition-colors"
            >
              System Metrics
            </Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} RoomieMatch. College Verified Roommate Finder.
          </div>
        </div>
      </footer>
    </div>
  );
}
