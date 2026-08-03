"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * ==============================================================================
 * RoomieMatch Internal Metrics Page (PRD §8 & §3.7)
 * ==============================================================================
 *
 * Internal-only dashboard gated by hardcoded admin secret check per Prompt 11.
 * Shows primary success metrics and conversion rate over time.
 */
export default function AdminMetricsPage() {
  const [secret, setSecret] = useState("roomiematch-admin-2026");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/metrics?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load metrics.");
      }
      setMetrics(data.metrics);
    } catch (err) {
      console.error("[AdminMetricsPage] Error:", err);
      setError(err.message || "Invalid secret or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white selection:bg-indigo-500 selection:text-white p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Internal Only • PRD §8 &amp; §3.7</span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              RoomieMatch Internal Metrics
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track primary success metrics, active seekers, and mutual match
              conversion rate over time.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Back to App
          </Link>
        </div>

        {/* Admin Secret Gate */}
        {!metrics && (
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">🔐</div>
              <h2 className="text-xl font-bold text-white">
                Admin Secret Authentication
              </h2>
              <p className="text-xs text-slate-400">
                Enter the internal admin secret to query production analytics per
                PRD §8.
              </p>
            </div>

            <form onSubmit={fetchMetrics} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-secret"
                  className="block text-xs font-bold text-slate-300 mb-1"
                >
                  Admin Secret
                </label>
                <input
                  id="admin-secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Loading Metrics..." : "Unlock Internal Metrics →"}
              </button>
            </form>
          </div>
        )}

        {/* Unlocked Metrics Display */}
        {metrics && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Profiles
                </span>
                <p className="text-4xl font-black text-white">
                  {metrics.totalProfiles}
                </p>
                <p className="text-xs text-slate-500">
                  All created student profiles
                </p>
              </div>

              <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-6 backdrop-blur-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Actively Looking
                </span>
                <p className="text-4xl font-black text-indigo-200">
                  {metrics.activelyLookingCount}
                </p>
                <p className="text-xs text-indigo-300/80">
                  actively_looking = true
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Found Roommate
                </span>
                <p className="text-4xl font-black text-emerald-200">
                  {metrics.foundRoommateCount}
                </p>
                <p className="text-xs text-emerald-300/80">
                  Primary Success Metric §3.7
                </p>
              </div>

              <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Conversion Rate
                </span>
                <p className="text-4xl font-black text-purple-200">
                  {metrics.conversionRate}
                </p>
                <p className="text-xs text-purple-300/80">
                  Mutual Match → Found Roommate (§8)
                </p>
              </div>
            </div>

            {/* Found Roommate over time breakdown */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Found Roommate Over Time (§8)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Chronological timeline of students successfully matched on
                    RoomieMatch
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchMetrics()}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  🔄 Refresh
                </button>
              </div>

              {metrics.foundRoommateOverTime.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  No students have marked &ldquo;Found Roommate&rdquo; yet. Once
                  students toggle success on their dashboard, timeline entries
                  will appear here!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Profiles Matched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {metrics.foundRoommateOverTime.map((entry) => (
                        <tr key={entry.date}>
                          <td className="py-3 px-4 font-semibold text-white">
                            {entry.date}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                              +{entry.count} student{entry.count > 1 ? "s" : ""}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
