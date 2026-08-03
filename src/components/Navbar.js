"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserAndProfile() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_verified, verification_method, full_name, email")
          .eq("user_id", currentUser.id)
          .single();

        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    fetchUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);

      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_verified, verification_method, full_name, email")
          .eq("user_id", authUser.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      setProfile(null);
      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-100 bg-clip-text text-transparent">
            RoomieMatch
          </span>
          <span className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 sm:inline-block">
            Verified MVP
          </span>
        </Link>

        {/* Navigation Links & User Actions */}
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Verification status pill */}
              {profile && (
                <div
                  className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                    profile.is_verified
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      profile.is_verified ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {profile.is_verified ? "College Verified" : "Verification Pending"}
                </div>
              )}

              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/dashboard")
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/onboarding"
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith("/onboarding")
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Onboarding
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/30"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
