import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileStatusManager from "@/components/ProfileStatusManager";
import MutualMatchesSection from "@/components/MutualMatchesSection";
import FindRoommatesSection from "@/components/FindRoommatesSection";

export const metadata = {
  title: "Dashboard — RoomieMatch",
  description: "Explore your top lifestyle-matched roommates in your college city.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Ensure user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 2. Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const isVerified = Boolean(profile?.is_verified);

  return (
    <div className="flex-1 bg-[#FFFFFF] px-6 py-12 text-[#17151F]">
      <div className="mx-auto max-w-6xl space-y-10">
        {!isVerified ? (
          <div className="card-clean rounded-2xl p-8 md:p-12 bg-[#F1EFFC] border border-[#D8D5EC]">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B4A]/30 bg-[#FF6B4A]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF6B4A]">
                <span>Verification in progress</span>
              </div>

              <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#17151F] sm:text-4xl">
                Account verification pending
              </h1>

              <p className="text-sm text-[#17151F]/80 leading-relaxed">
                You signed up with{" "}
                <strong className="text-[#17151F]">
                  {profile?.email || user.email}
                </strong>
                . To ensure a trusted student community, your verification is
                currently pending review (
                <span className="font-mono-data text-xs font-semibold text-[#5B4EE5]">
                  {profile?.verification_method || "pending"}
                </span>
                ).
              </p>

              <div className="w-full rounded-xl border border-[#E4E1F2] bg-[#FFFFFF] p-6 text-left text-sm text-[#17151F]/80 space-y-2">
                <p className="font-bold text-[#17151F]">What happens next?</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>
                    Our team verifies your Student ID or college email domain.
                  </li>
                  <li>
                    Once approved, your account will be marked verified.
                  </li>
                  <li>
                    You will gain full access to roommate matching and profile
                    discovery.
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="rounded-lg border border-[#E4E1F2] bg-[#FFFFFF] px-6 py-2.5 text-sm font-semibold text-[#17151F] transition-colors hover:bg-[#F1EFFC]"
                >
                  Return to home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Welcome & Status Banner */}
            <div className="card-clean relative overflow-hidden rounded-2xl p-8 md:p-10 bg-[#FFFFFF]">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full badge-trust px-3.5 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
                    <span>✓ Verified community member</span>
                  </div>
                  <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#17151F]">
                    Roommate matches
                  </h1>
                  <p className="text-sm text-[#17151F]/75">
                    Welcome back,{" "}
                    <strong className="text-[#17151F] font-bold">
                      {profile?.full_name || "Student"}
                    </strong>
                    . Here are your top compatible peers in{" "}
                    <span className="text-[#5B4EE5] font-semibold">
                      {profile?.city || "your college city"}
                    </span>
                    .
                  </p>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="btn-primary-flat inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm"
                >
                  Edit profile
                </Link>
              </div>
            </div>

            {/* Profile Status Manager */}
            <ProfileStatusManager profile={profile} />

            {/* Confirmed Mutual Matches */}
            <MutualMatchesSection />

            {/* Find My Roommates Experience */}
            <FindRoommatesSection profile={profile} />

            {/* Profile Summary Card for Quick Reference */}
            <div className="rounded-2xl border border-[#D8D5EC] bg-[#F1EFFC] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D5EC] pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17151F]">
                    Active matching criteria
                  </h3>
                  <p className="text-xs text-[#17151F]/70">
                    Filters and lifestyle preferences used to score compatibility
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="text-xs font-semibold text-[#5B4EE5] hover:underline"
                >
                  Manage preferences →
                </Link>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-[#17151F]/60">City</dt>
                  <dd className="font-semibold text-[#17151F]">
                    {profile?.city || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#17151F]/60">Monthly budget</dt>
                  <dd className="font-semibold text-[#17151F]">
                    ${profile?.budget_min || 0} – ${profile?.budget_max || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#17151F]/60">Sleep schedule</dt>
                  <dd className="font-semibold text-[#17151F] capitalize">
                    {profile?.sleep_schedule
                      ? profile.sleep_schedule.replace("_", " ")
                      : "Flexible"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#17151F]/60">Cleanliness</dt>
                  <dd className="font-semibold text-[#17151F]">
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
