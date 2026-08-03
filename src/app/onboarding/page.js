import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import OnboardingClient from "@/components/OnboardingClient";

export const metadata = {
  title: "Onboarding — RoomieMatch",
};

export default async function OnboardingPage() {
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

  const isVerified = profile?.is_verified === true;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {!isVerified ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 backdrop-blur-xl md:p-12">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Verification Pending
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Student ID Under Manual Review
              </h1>

              <p className="text-base text-slate-300">
                You signed up with a non-college email domain (
                <strong className="text-amber-300">{profile?.email || user.email}</strong>
                ). To ensure a trusted student-only community per §3.1, your uploaded
                Student ID is currently pending review (
                <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-amber-400">
                  {profile?.verification_method || "student_id_pending"}
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
          <OnboardingClient profile={profile} userEmail={user.email} />
        )}
      </div>
    </div>
  );
}
