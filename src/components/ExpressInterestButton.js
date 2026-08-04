"use client";

import { useState } from "react";

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
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2F7A56]/30 bg-[#2F7A56]/10 px-5 py-2.5 text-sm font-semibold text-[#2F7A56] cursor-default"
      >
        <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
        <span>Mutual match — contact info unlocked</span>
      </button>
    );
  }

  if (status === "sent") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2F7A56]/30 bg-[#2F7A56]/10 px-5 py-2.5 text-sm font-semibold text-[#2F7A56] cursor-default"
      >
        <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
        <span>Interest sent</span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={status === "loading"}
        onClick={handleClick}
        className="btn-primary-flat inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-75"
      >
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
            <span>Expressing interest...</span>
          </span>
        ) : (
          <span>Express interest</span>
        )}
      </button>

      {status === "error" && errorMessage && (
        <p className="text-center text-xs text-[#FF6B4A] font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
