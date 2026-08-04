"use client";

import { useState } from "react";
import Link from "next/link";
import MatchCard from "./MatchCard";

/**
 * ==============================================================================
 * RoomieMatch FindRoommatesSection Client Component (PRD §3.3 & §3.5)
 * ==============================================================================
 *
 * Implements the "Find My Roommates" experience on /dashboard:
 * - Checks profile completeness
 * - Re-triggerable "Find My Roommates" button calling GET /api/matches
 * - Interactive loading skeleton while request is in flight
 * - Renders top 3 candidates as MatchCard components
 */
export default function FindRoommatesSection({ profile }) {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const isProfileComplete = Boolean(
    profile &&
      profile.full_name &&
      profile.city &&
      profile.budget_min &&
      profile.budget_max
  );

  const handleFindMatches = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/matches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
      setMetadata({
        totalEligible: data.totalEligible || 0,
        totalInCityPool: data.totalInCityPool || 0,
      });
    } catch (err) {
      console.error("[FindRoommatesSection] Error fetching matches:", err);
      setError(err.message || "An unexpected error occurred while finding matches.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Profile incomplete explanatory message per PRD §3.3
  if (!isProfileComplete) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 text-center backdrop-blur-xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <span>⚠️</span>
          <span>Profile Incomplete</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Complete Your Profile to Unlock Matching
        </h2>
        <p className="mx-auto max-w-lg text-sm text-slate-300">
          To calculate your lifestyle compatibility and budget overlap,
          please finish setting up your city, budget range, and daily habits.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            Finish Profile Setup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header / Trigger Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            Find My Roommates ✨
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            AI compatibility engine scoped to{" "}
            <strong className="text-indigo-300">{profile.city}</strong> (Budget:{" "}
            <span className="text-slate-200 font-medium">
              ${profile.budget_min}–${profile.budget_max}
            </span>
            )
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleFindMatches}
            disabled={loading}
            className="group relative inline-flex w-full md:w-auto items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-75"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>AI Analyzing Matches...</span>
              </span>
            ) : (
              <>
                <span>
                  {matches ? "🔄 Re-run Matcher" : "🔍 Find My Roommates"}
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-center justify-between">
          <span>❌ {error}</span>
          <button
            type="button"
            onClick={handleFindMatches}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-300 animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span>
                Running hard filters &amp; weighted lifestyle scoring in{" "}
                {profile.city}...
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="h-96 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded bg-slate-800" />
                    <div className="h-3 w-20 rounded bg-slate-800" />
                  </div>
                </div>
                <div className="h-24 rounded-2xl bg-slate-800/60" />
                <div className="h-32 rounded-2xl bg-slate-800/40" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {!loading && matches && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Top Roommate Candidates</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                {matches.length} matches
              </span>
            </h3>
            {metadata && (
              <p className="text-xs text-slate-400">
                Filtered from{" "}
                <strong className="text-slate-300">
                  {metadata.totalEligible}
                </strong>{" "}
                eligible candidates in{" "}
                <strong className="text-slate-300">{profile.city}</strong>
              </p>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-4">
              <div className="text-4xl">🔎</div>
              <h4 className="text-xl font-extrabold text-white">
                No Compatible Matches Found
              </h4>
              <p className="mx-auto max-w-md text-sm text-slate-400">
                We couldn&apos;t find verified candidates in{" "}
                <strong className="text-slate-300">{profile.city}</strong> whose
                budget overlaps with your range ($
                {profile.budget_min}–${profile.budget_max}) or gender preference.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20"
                >
                  Adjust Profile Preferences →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {matches.map((match, idx) => (
                <MatchCard
                  key={match.candidate.id || idx}
                  match={match}
                  requesterProfile={profile}
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
