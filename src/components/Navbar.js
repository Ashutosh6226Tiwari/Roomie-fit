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

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      return (
        (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
      ).toUpperCase();
    }
    return (email?.[0] || "U").toUpperCase();
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 pointer-events-none">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/15 bg-black/60 px-6 py-3 shadow-2xl backdrop-blur-2xl pointer-events-auto transition-all duration-300 hover:border-white/25">
        {/* Brand Logo with Glowing Badge */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white hover:opacity-90 transition-all"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-xs font-black text-white shadow-lg shadow-indigo-500/30">
            RM
          </span>
          <span className="bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            RoomieMatch
          </span>
        </Link>

        {/* Navigation Links & User Actions */}
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Verified Account Status Pill */}
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>✓ Verified Account</span>
              </div>

              {/* Nav Links */}
              <Link
                href="/dashboard"
                className={`text-sm font-semibold transition-all ${
                  pathname === "/dashboard"
                    ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Matches
              </Link>

              <Link
                href="/onboarding"
                className={`text-sm font-semibold transition-all ${
                  pathname?.startsWith("/onboarding")
                    ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Preferences
              </Link>

              <Link
                href="/dashboard/profile"
                className={`text-sm font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/profile")
                    ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                My Profile
              </Link>

              {/* User Initials Avatar & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                <div
                  title={profile?.full_name || user?.email}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/40 text-xs font-bold text-indigo-200"
                >
                  {getInitials(profile?.full_name, user?.email)}
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/15 hover:text-white hover:border-white/30"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
