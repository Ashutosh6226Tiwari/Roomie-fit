import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ProfileStatusManager from "@/components/ProfileStatusManager";
import FindRoommatesSection from "@/components/FindRoommatesSection";
import MutualMatchesSection from "@/components/MutualMatchesSection";

export const metadata = {
  title: "Find My Roommates — RoomieMatch",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch profile to verify college status per §3.1
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Per user request: allow any valid gmail / non-college email to enter without verification pending screen
  const isVerified = true;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Verification check per §3.1 */}
        {!isVerified ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 backdrop-blur-xl md:p-12">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Verification Pending
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Account Under Manual Review
              </h1>

              <p className="text-base text-slate-300">
                You signed up with email (
                <strong className="text-amber-300">{profile?.email || user.email}</strong>
                ). To ensure a trusted community, your account is currently pending review (
                <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-amber-400">
                  {profile?.verification_method || "pending"}
                </code>
                ).
              </p>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-left text-sm text-slate-400 space-y-2">
                <p className="font-semibold text-white">What happens next?</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Our verification team will inspect your uploaded Student ID card.</li>
                  <li>Once approved, <code className="text-emerald-400">is_verified</code> will be set to <code className="text-emerald-400">true</code>.</li>
                  <li>You will gain access to profile onboarding and the roommate matching engine.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/"
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Verified College Student Dashboard - Find My Roommates Experience (§3.3 & §3.5) */
          <div className="space-y-8">
            {/* Welcome & Status Banner */}
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Community Member • AI Engine Active
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                    Find My Roommates
                  </h1>
                  <p className="text-sm text-slate-300">
                    Welcome back,{" "}
                    <strong className="text-white font-extrabold">
                      {profile?.full_name || "Student"}
                    </strong>
                    ! Explore top AI-ranked roommate matches in{" "}
                    <span className="text-indigo-300 font-bold">{profile?.city || "your city"}</span>.
                  </p>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
                >
                  <span>Edit My Profile</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* PRD §3.2 & §3.7 Status Control Panel */}
            <ProfileStatusManager profile={profile} />

            {/* PRD §3.6 & §4 Confirmed Mutual Matches (with Server-Enforced Contact Reveal) */}
            <MutualMatchesSection />

            {/* PRD §3.3 & §3.5 Find My Roommates Experience (MatchCard Top 3 Engine) */}
            <FindRoommatesSection profile={profile} />

            {/* Profile Summary Card for Quick Reference */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    My Active Matching Criteria
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hard filters and lifestyle attributes used by the matching engine
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Manage all lifestyle &amp; budget settings →
                </Link>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">City</dt>
                  <dd className="font-semibold text-white">{profile?.city || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Monthly Budget</dt>
                  <dd className="font-semibold text-white">
                    ${profile?.budget_min || 0} – ${profile?.budget_max || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Sleep Schedule</dt>
                  <dd className="font-semibold text-white capitalize">
                    {profile?.sleep_schedule
                      ? profile.sleep_schedule.replace("_", " ")
                      : "Flexible"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Cleanliness Level</dt>
                  <dd className="font-semibold text-white">
                    {profile?.cleanliness_level || 3} / 5
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
