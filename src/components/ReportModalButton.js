"use client";

import { useState } from "react";

/**
 * ==============================================================================
 * RoomieMatch ReportModalButton Client Component (PRD §7.3)
 * ==============================================================================
 *
 * Provides a "Report this profile" button and modal form on every profile/match
 * card, POSTing { reported_user_id, reason } to /api/reports.
 */
export default function ReportModalButton({ candidateId, candidateName = "User" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reported, setReported] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || reported) return;
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Please enter a reason (at least 3 characters).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reported_user_id: candidateId,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setReported(true);
      setIsOpen(false);
    } catch (err) {
      console.error("[ReportModalButton] Error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (reported) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-400">
        <span>✅ Reported for review</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError(null);
        }}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        title="Report this profile per PRD §7.3"
      >
        <span>🚩</span>
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                  <span>PRD §7.3 Trust &amp; Safety</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Report Profile: {candidateName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Help us maintain a secure student community. All reports are confidential
              and investigated by our moderation team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="report-reason"
                  className="block text-xs font-bold text-slate-200 mb-1"
                >
                  Reason for Report
                </label>
                <textarea
                  id="report-reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Suspicious account, inappropriate bio, spam, harassment, or not a college student..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  maxLength={500}
                  required
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-[10px] text-slate-500">
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
                  ❌ {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
