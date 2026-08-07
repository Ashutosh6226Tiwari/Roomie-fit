"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { FingerprintLogo } from "./CompatibilityFingerprint";

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

  const isHome = pathname === "/";

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors ${isHome ? 'bg-transparent border-b border-white/10' : 'border-b border-[#E4E1F2] bg-[#FFFFFF]/95 backdrop-blur-md'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo with Signature 6-Axis Fingerprint Mark */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 text-lg font-bold tracking-tight hover:opacity-90 transition-opacity ${isHome ? 'text-white' : 'text-[#17151F]'}`}
        >
          <FingerprintLogo className="h-7 w-7" color={isHome ? "#FFFFFF" : "#5B4EE5"} />
          <span className={`font-semibold ${isHome ? 'text-white' : 'text-[#17151F]'}`}>
            RoomieMatch
          </span>
        </Link>

        {/* Navigation Links & User Actions */}
        <nav className="flex items-center gap-6">
          {loading ? (
            <div className={`h-8 w-28 animate-pulse rounded-full ${isHome ? 'bg-white/10' : 'bg-[#F1EFFC]'}`} />
          ) : user ? (
            <div className="flex items-center gap-5">
              {/* Trust Moss Green Verified Status Pill */}
              <div className="hidden md:flex items-center gap-1.5 rounded-full badge-trust px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
                <span className={isHome ? "text-white/90" : ""}>✓ Verified student</span>
              </div>

              {/* Nav Links */}
              <Link
                href="/dashboard"
                className={`text-sm font-semibold transition-colors ${
                  pathname === "/dashboard"
                    ? "text-[#5B4EE5] underline underline-offset-4"
                    : isHome ? "text-white/80 hover:text-white" : "text-[#17151F]/75 hover:text-[#17151F]"
                }`}
              >
                Matches
              </Link>

              <Link
                href="/onboarding"
                className={`text-sm font-semibold transition-colors ${
                  pathname?.startsWith("/onboarding")
                    ? "text-[#5B4EE5] underline underline-offset-4"
                    : isHome ? "text-white/80 hover:text-white" : "text-[#17151F]/75 hover:text-[#17151F]"
                }`}
              >
                Preferences
              </Link>

              <Link
                href="/dashboard/profile"
                className={`text-sm font-semibold transition-colors ${
                  pathname?.startsWith("/dashboard/profile")
                    ? "text-[#5B4EE5] underline underline-offset-4"
                    : isHome ? "text-white/80 hover:text-white" : "text-[#17151F]/75 hover:text-[#17151F]"
                }`}
              >
                My Profile
              </Link>

              {/* User Initials Avatar & Sign Out */}
              <div className={`flex items-center gap-3 pl-3 border-l ${isHome ? 'border-white/20' : 'border-[#E4E1F2]'}`}>
                <div
                  title={profile?.full_name || user?.email}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${isHome ? 'bg-white/10 border-white/20 text-white' : 'bg-[#F1EFFC] border-[#D8D5EC] text-[#5B4EE5]'}`}
                >
                  {getInitials(profile?.full_name, user?.email)}
                </div>
                <button
                  onClick={handleSignOut}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${isHome ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'border-[#E4E1F2] bg-[#FFFFFF] text-[#17151F]/80 hover:bg-[#F1EFFC] hover:text-[#17151F]'}`}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/sign-in"
                className={`text-sm font-semibold transition-colors ${isHome ? 'text-white/80 hover:text-white' : 'text-[#17151F] hover:text-[#5B4EE5]'}`}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-primary-flat rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
