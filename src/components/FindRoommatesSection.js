"use client";

import { useState } from "react";
import Link from "next/link";
import MatchCard from "./MatchCard";

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
      setError(
        err.message || "An unexpected error occurred while finding matches."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isProfileComplete) {
    return (
      <div className="card-clean rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
          <span>Profile setup required</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Complete your profile to unlock matching
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          To calculate your lifestyle compatibility and budget overlap, please
          finish setting up your city, budget range, and daily habits.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/profile"
            className="btn-primary-flat inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm"
          >
            Finish profile setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header / Trigger Bar */}
      <div className="card-clean flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl p-6 bg-card">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Find my roommates
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compatibility scoring scoped to{" "}
            <strong className="text-foreground">{profile.city}</strong> (Budget:{" "}
            <span className="text-primary font-semibold">
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
            className="btn-primary-flat inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm disabled:opacity-75"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-foreground"
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
                <span>Analyzing matches...</span>
              </span>
            ) : (
              <span>
                {matches ? "Re-run matcher" : "Find my roommates"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleFindMatches}
            className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-secondary px-5 py-2 text-sm font-semibold text-primary">
              <span>
                Calculating lifestyle scoring in {profile.city}...
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="h-96 rounded-2xl border border-border bg-secondary p-6 animate-pulse space-y-4"
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {!loading && matches && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 border-b border-border pb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>Top roommate candidates</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary border border-border">
                {matches.length} matches
              </span>
            </h3>
            {metadata && (
              <p className="text-xs text-muted-foreground">
                Filtered from{" "}
                <strong className="text-foreground">
                  {metadata.totalEligible}
                </strong>{" "}
                eligible candidates in{" "}
                <strong className="text-foreground">{profile.city}</strong>
              </p>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="card-clean rounded-2xl border border-border bg-card p-10 text-center space-y-3">
              <h4 className="text-base font-bold text-foreground">
                No compatible matches found
              </h4>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                We couldn&apos;t find candidates in{" "}
                <strong className="text-foreground">{profile.city}</strong> whose
                budget overlaps with your range ($
                {profile.budget_min}–${profile.budget_max}) or preferences.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/profile"
                  className="btn-primary-flat inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-xs font-semibold shadow-sm"
                >
                  Adjust preferences
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
