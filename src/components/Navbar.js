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
  const [isScrolled, setIsScrolled] = useState(false);
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
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

  const getNavClasses = () => {
    if (isHome && !isScrolled) {
      return "fixed top-0 z-50 w-full transition-all duration-300 bg-transparent border-b border-transparent";
    }
    return "fixed top-0 z-50 w-full transition-all duration-300 bg-[#0a0a0f]/95 border-b border-white/10 backdrop-blur-md shadow-lg";
  };

  return (
    <header className={getNavClasses()}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo with Signature 6-Axis Fingerprint Mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight hover:opacity-90 transition-opacity text-foreground"
        >
          <FingerprintLogo className="h-7 w-7" color="#5B4EE5" />
          <span className="font-semibold text-foreground">
            RoomieMatch
          </span>
        </Link>

        {/* Navigation Links & User Actions */}
        <nav className="flex items-center gap-6">
          {loading ? (
            <div className={"h-8 w-28 animate-pulse rounded-full " + (isHome ? "bg-card/10" : "bg-secondary")} />
          ) : user ? (
            <div className="flex items-center gap-5">
              {/* Trust Moss Green Verified Status Pill */}
              <div className="hidden md:flex items-center gap-1.5 rounded-full badge-trust px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
                <span className={isHome ? "text-foreground/90" : ""}>✓ Verified student</span>
              </div>

              {/* Nav Links */}
              <Link
                href="/dashboard"
                className={
                  "text-sm font-semibold transition-colors " +
                  (pathname === "/dashboard"
                    ? "text-primary underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Matches
              </Link>

              <Link
                href="/onboarding"
                className={
                  "text-sm font-semibold transition-colors " +
                  (pathname?.startsWith("/onboarding")
                    ? "text-primary underline underline-offset-4"
                    : isHome ? "text-foreground/80 hover:text-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                Preferences
              </Link>

              <Link
                href="/dashboard/profile"
                className={
                  "text-sm font-semibold transition-colors " +
                  (pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard/profile")
                    ? "text-primary underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                My Profile
              </Link>

              {/* User Initials Avatar & Sign Out */}
              <div className={"flex items-center gap-3 pl-3 border-l " + (isHome ? "border-white/20" : "border-border")}>
                <div
                  title={profile?.full_name || user?.email}
                  className={"flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold " + (isHome ? "bg-card/10 border-white/20 text-foreground" : "bg-secondary border-border text-primary")}
                >
                  {getInitials(profile?.full_name, user?.email)}
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors bg-white/10 border-white/20 text-foreground hover:bg-white/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
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
