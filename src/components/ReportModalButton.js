"use client";

import { useState } from "react";

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
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        <span>✅ Reported</span>
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
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        title="Report this profile"
      >
        <span>🚩</span>
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  <span>Safety</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Report profile: {candidateName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Help us maintain a safe community. All reports are confidential
              and reviewed by our moderation team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="report-reason"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Reason for report
                </label>
                <textarea
                  id="report-reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Suspicious account, spam, harassment, or inappropriate bio..."
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder-[#17151F]/40 focus:border-[#5B4EE5] focus:outline-none focus:ring-1 focus:ring-[#5B4EE5]"
                  maxLength={500}
                  required
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-[10px] text-muted-foreground">
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-5 py-2 text-xs font-bold text-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit report</span>
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
