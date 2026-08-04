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

  // Fetch existing profile if present
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // All users are verified for community matching (any valid email domain allowed)
  const isVerified = true;

  return (
    <div className="flex-1 bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {!isVerified ? (
          <div className="card-clean rounded-2xl p-8 bg-secondary border border-border md:p-12">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B4A]/30 bg-[#FF6B4A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FF6B4A]">
                <span>Verification pending</span>
              </div>

              <h1 className="font-serif-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Account under manual review
              </h1>

              <p className="text-sm text-foreground/80 leading-relaxed">
                You signed up with email (
                <strong className="text-foreground">{profile?.email || user.email}</strong>
                ). Your verification is currently pending review (
                <span className="font-mono-data text-xs font-semibold text-primary">
                  {profile?.verification_method || "pending"}
                </span>
                ).
              </p>

              <div className="w-full rounded-xl border border-border bg-card p-6 text-left text-sm text-foreground/80 space-y-2">
                <p className="font-bold text-foreground">What happens next?</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Our team verifies your Student ID or email domain.</li>
                  <li>Once approved, your account will be marked verified.</li>
                  <li>You will gain full access to roommate matching.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/"
                  className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Return to home
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
