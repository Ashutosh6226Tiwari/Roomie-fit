"use client";

import { useState, useEffect } from "react";
import ReportModalButton from "./ReportModalButton";

/**
 * ==============================================================================
 * RoomieMatch MutualMatchesSection Client Component (PRD §3.6 & §4)
 * ==============================================================================
 *
 * Displays confirmed mutual roommate matches.
 * PER PRD §4 SERVER-ENFORCED CONTACT REVEAL:
 * This view is the ONLY place where contact information (email/phone) is rendered.
 */
export default function MutualMatchesSection() {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMutualMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interests/mutual", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load mutual matches.");
      }
      setMatches(data.matches || []);
    } catch (err) {
      console.error("[MutualMatchesSection] Error:", err);
      setError(err.message || "Could not load mutual matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutualMatches();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>PRD §3.6 Contact Reveal</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-white flex items-center gap-2">
            <span>🤝 My Mutual Roommate Matches</span>
            {matches && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Confirmed mutual matches where both students clicked &ldquo;I&apos;m
            interested.&rdquo; Contact details are unlocked below.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMutualMatches}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <span>🔄 Refresh Mutuals</span>
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-48 rounded bg-slate-800" />
              <div className="h-20 rounded-2xl bg-slate-800/60" />
              <div className="h-10 rounded-xl bg-slate-800/40" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          ❌ {error}
        </div>
      )}

      {!loading && matches && matches.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl space-y-3">
          <div className="text-4xl">🔒</div>
          <h3 className="text-lg font-bold text-white">
            No Mutual Matches Yet
          </h3>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            When you and another student both click{" "}
            <strong className="text-slate-300">&ldquo;👋 I&apos;m Interested!&rdquo;</strong>{" "}
            on each other&apos;s candidate cards, your verified college contact
            information will unlock here per PRD §3.6!
          </p>
        </div>
      )}

      {!loading && matches && matches.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {matches.map((cand) => (
            <div
              key={cand.id || cand.user_id}
              className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-amber-950/20 p-6 shadow-xl shadow-amber-500/5 transition-all hover:border-amber-500/60"
            >
              {/* Top Bar: Name, Score badge, City */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">
                      {cand.full_name}
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300 border border-emerald-500/30">
                      {cand.compatibilityScore || 100}% Match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    📍 {cand.city} • Budget: ${cand.budget_min}–${cand.budget_max}/mo
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                    🎉 Contact Unlocked
                  </span>
                  <ReportModalButton
                    candidateId={cand.user_id}
                    candidateName={cand.full_name}
                  />
                </div>
              </div>

              {/* UNLOCKED CONTACT DETAILS BOX (§3.6 & §4) */}
              <div className="my-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Verified Contact Info
                  </span>
                  <span className="text-xs text-slate-400">
                    Matched:{" "}
                    {new Date(cand.matchedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📧 Email:</span>
                    <a
                      href={`mailto:${cand.email}`}
                      className="font-bold text-white underline decoration-amber-400 underline-offset-4 hover:text-amber-300"
                    >
                      {cand.email}
                    </a>
                  </div>

                  {cand.phone ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📱 Phone:</span>
                      <a
                        href={`tel:${cand.phone}`}
                        className="font-semibold text-white hover:text-amber-300"
                      >
                        {cand.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>📱 Phone:</span>
                      <span className="italic">Not provided in profile</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick lifestyle highlights */}
              <div className="flex flex-wrap gap-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                <span className="rounded-lg bg-black/30 px-2.5 py-1">
                  🌙 {cand.sleep_schedule?.replace("_", " ")}
                </span>
                <span className="rounded-lg bg-black/30 px-2.5 py-1">
                  ✨ Cleanliness: {cand.cleanliness_level}/5
                </span>
                <span className="rounded-lg bg-black/30 px-2.5 py-1">
                  👥 Guests: {cand.guest_frequency}
                </span>
              </div>

              {/* Email Button */}
              <div className="mt-5">
                <a
                  href={`mailto:${cand.email}?subject=RoomieMatch: Let's room together in ${cand.city}!`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] hover:from-amber-600 hover:to-emerald-700"
                >
                  <span>✉️ Email {cand.full_name.split(" ")[0]} Now →</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
