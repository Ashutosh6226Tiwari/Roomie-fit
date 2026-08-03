import Link from "next/link";

export const metadata = {
  title: "RoomieMatch — 3D AI College Roommate Finder",
  description:
    "AI-powered roommate matching with a stunning 3D UI/UX. Discover compatible college roommates based on lifestyle, cleanliness, sleep schedule, and budget.",
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#070913] via-[#0d1126] to-[#120a24] text-white selection:bg-indigo-500 selection:text-white">
      {/* 3D Floating Glowing Spheres / Orbs in Backdrop */}
      <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full orb-3d-1 opacity-70 blur-xl z-0" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-96 w-96 rounded-full orb-3d-2 opacity-60 blur-2xl z-0" />
      <div className="pointer-events-none absolute left-1/3 bottom-10 h-72 w-72 rounded-full orb-3d-3 opacity-50 blur-xl z-0" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070913]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 font-extrabold text-white shadow-lg shadow-indigo-500/40 border border-white/20">
              RM
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Roomie<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Match</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn-3d rounded-xl px-5 py-2.5 text-xs font-extrabold text-white tracking-wide"
            >
              Get Verified (Any Email) →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with 3D Depth */}
      <main className="flex-1 relative z-10">
        <section className="px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="badge-3d inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Any Email ID Allowed • 3D UI/UX Engine • PRD §3.4</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-tight sm:leading-tight">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(168,85,247,0.5)]">
                College Roommate
              </span>{" "}
              in 3D Dimension.
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
              Experience the next-gen 3D roommate matcher. Log in with any email
              address, analyze 6-factor lifestyle compatibility, and unlock contact
              details only when interest is mutual!
            </p>

            {/* Tactile 3D CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <Link
                href="/sign-up"
                className="btn-3d w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-9 py-4 text-sm font-extrabold text-white"
              >
                <span>Get Verified (Any Email)</span>
                <span>→</span>
              </Link>

              <Link
                href="/sign-in"
                className="btn-3d-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-9 py-4 text-sm font-extrabold text-white"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* 3D Glass Trust Cards */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="card-3d rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-indigo-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                  Any Email
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Universal Verified Login
                </p>
              </div>
              <div className="card-3d rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                  3D Engine
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Tactile UI/UX Design
                </p>
              </div>
              <div className="card-3d rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-pink-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]">
                  6 Factors
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Weighted Score Engine
                </p>
              </div>
              <div className="card-3d rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                  Zero Leak
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Server Contact Reveal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Glass How It Works Section */}
        <section className="border-t border-white/10 py-24 px-6 relative z-10">
          <div className="mx-auto max-w-5xl space-y-16">
            <div className="text-center space-y-3">
              <div className="badge-3d inline-block rounded-full px-4 py-1 text-xs font-extrabold uppercase text-purple-200">
                Interactive 3D Workflow
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                How RoomieMatch Works
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Built with tactile 3D cards and AI compatibility scoring to find you
                the perfect roommate match.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 3D Card */}
              <div className="card-3d rounded-3xl p-8 space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-xl font-black text-white shadow-lg shadow-indigo-500/30 border border-white/20">
                  01
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Sign In With Any Email
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Log in instantly with any email address (Gmail, college email, or custom). Our universal auth system gets you verified in seconds.
                </p>
              </div>

              {/* Step 2 3D Card */}
              <div className="card-3d rounded-3xl p-8 space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-xl font-black text-white shadow-lg shadow-purple-500/30 border border-white/20">
                  02
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Set Lifestyle &amp; Budget
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Configure your budget range, cleanliness level (1–5), sleep schedule (Early Bird vs Night Owl), and write a custom bio.
                </p>
              </div>

              {/* Step 3 3D Card */}
              <div className="card-3d rounded-3xl p-8 space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-xl font-black text-white shadow-lg shadow-pink-500/30 border border-white/20">
                  03
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Match &amp; Unseal Safely
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Explore your Top 3 scored roommate matches. Express interest anonymously—your contact info only unlocks when interest is mutual!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Success CTA */}
        <section className="py-20 px-6 text-center relative z-10">
          <div className="card-3d mx-auto max-w-4xl rounded-3xl p-10 sm:p-16 space-y-8 border-2 border-indigo-500/30">
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Ready to find your roommate with{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                3D AI matching?
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Join students matching on lifestyle, cleanliness, and budget with complete contact privacy.
            </p>
            <div>
              <Link
                href="/sign-up"
                className="btn-3d inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-5 text-base font-extrabold text-white"
              >
                <span>Start Matching Now</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070913] px-6 py-8 relative z-20">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>RoomieMatch</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-normal">3D UI/UX Universal Email Edition</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Sign Up (Any Email)
            </Link>
            <Link
              href="/admin/metrics"
              className="hover:text-indigo-300 text-indigo-400 font-semibold transition-colors"
            >
              Internal Metrics (§8)
            </Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} RoomieMatch. Built with 3D UI/UX Aesthetics.
          </div>
        </div>
      </footer>
    </div>
  );
}
