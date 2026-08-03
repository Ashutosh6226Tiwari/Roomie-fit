"use client";

import { useState } from "react";

/**
 * ==============================================================================
 * RoomieMatch ExpressInterestButton (PRD §3.5 & §3.6)
 * ==============================================================================
 *
 * Client component for expressing mutual interest via POST /api/interests.
 * Displays distinctive success badges for directional interest vs mutual match.
 */
export default function ExpressInterestButton({
  candidate,
  initialExpressed = false,
  initialMutual = false,
  onInterest,
}) {
  const [status, setStatus] = useState(() => {
    if (initialMutual) return "mutual";
    if (initialExpressed) return "sent";
    return "idle";
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const handleClick = async () => {
    if (status !== "idle" && status !== "error") return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_user_id: candidate.user_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to express interest.");
      }

      if (data.isMutual) {
        setStatus("mutual");
      } else {
        setStatus("sent");
      }

      if (onInterest) {
        onInterest(candidate, data.isMutual);
      }
    } catch (err) {
      console.error("[ExpressInterestButton] Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An error occurred.");
    }
  };

  if (status === "mutual") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 px-5 py-3 text-sm font-extrabold text-amber-300 shadow-lg shadow-amber-500/10 cursor-default"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
        <span>🎉 Mutual Match! (Contact Unlocked)</span>
      </button>
    );
  }

  if (status === "sent") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-300 transition-all cursor-default"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>✓ Interest Sent</span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={status === "loading"}
        onClick={handleClick}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-75"
      >
        <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {status === "loading" ? (
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
            <span>Expressing Interest...</span>
          </span>
        ) : (
          <>
            <span>👋 I&apos;m Interested!</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>

      {status === "error" && errorMessage && (
        <p className="text-center text-xs text-red-300 font-medium">
          ❌ {errorMessage}
        </p>
      )}
    </div>
  );
}
