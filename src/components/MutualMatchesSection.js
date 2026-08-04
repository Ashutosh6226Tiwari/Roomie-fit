"use client";

import { useState, useEffect } from "react";
import ReportModalButton from "./ReportModalButton";

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

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#17151F]">Mutual matches</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-[#E4E1F2] bg-[#F1EFFC] p-6 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FF6B4A]/40 bg-[#FF6B4A]/10 p-4 text-sm text-[#FF6B4A]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#17151F]">Mutual matches</h2>
          <p className="text-sm text-[#17151F]/70">
            Peers who have also expressed interest in living with you.
          </p>
        </div>
      </div>

      {matches && matches.length === 0 && (
        <div className="card-clean rounded-2xl border border-[#E4E1F2] bg-[#FFFFFF] p-8 text-center space-y-2">
          <h3 className="text-base font-bold text-[#17151F]">
            No mutual matches yet
          </h3>
          <p className="mx-auto max-w-md text-sm text-[#17151F]/70">
            When you and another student both select{" "}
            <strong className="text-[#17151F] font-semibold">
              Express interest
            </strong>{" "}
            on each other&apos;s cards, contact information will unlock here.
          </p>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {matches.map((cand) => (
            <div
              key={cand.id || cand.user_id}
              className="card-clean rounded-2xl border border-[#2F7A56]/30 bg-[#FFFFFF] p-6 space-y-4"
            >
              {/* Top Bar: Name, Score badge, City */}
              <div className="flex items-start justify-between gap-4 border-b border-[#E4E1F2] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#17151F]">
                      {cand.full_name}
                    </h3>
                    <span className="rounded-full badge-trust px-2.5 py-0.5 text-xs font-semibold">
                      {cand.compatibilityScore || 100}% match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#17151F]/70">
                    📍 {cand.city} • Budget: ${cand.budget_min}–${cand.budget_max}/mo
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-[#2F7A56] bg-[#2F7A56]/10 px-2.5 py-1 rounded-full border border-[#2F7A56]/20">
                    Contact unlocked
                  </span>
                  <ReportModalButton
                    candidateId={cand.user_id}
                    candidateName={cand.full_name}
                  />
                </div>
              </div>

              {/* UNLOCKED CONTACT DETAILS BOX */}
              <div className="rounded-xl border border-[#2F7A56]/25 bg-[#2F7A56]/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2F7A56]">
                    Verified contact info
                  </span>
                  <span className="text-xs text-[#17151F]/60">
                    Matched:{" "}
                    {new Date(cand.matchedAt || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#17151F]/60">Email:</span>
                    <a
                      href={`mailto:${cand.email}`}
                      className="font-semibold text-[#5B4EE5] hover:underline"
                    >
                      {cand.email}
                    </a>
                  </div>

                  {cand.phone ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#17151F]/60">Phone:</span>
                      <a
                        href={`tel:${cand.phone}`}
                        className="font-semibold text-[#17151F] hover:text-[#5B4EE5]"
                      >
                        {cand.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#17151F]/60">
                      <span>Phone:</span>
                      <span className="italic">Not provided in profile</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick lifestyle highlights */}
              <div className="flex flex-wrap gap-2 text-xs text-[#17151F]/75 pt-2">
                <span className="rounded-lg bg-[#F1EFFC] px-2.5 py-1">
                  Sleep: {cand.sleep_schedule?.replace("_", " ")}
                </span>
                <span className="rounded-lg bg-[#F1EFFC] px-2.5 py-1">
                  Cleanliness: {cand.cleanliness_level}/5
                </span>
                <span className="rounded-lg bg-[#F1EFFC] px-2.5 py-1">
                  Guests: {cand.guest_frequency}
                </span>
              </div>

              {/* Email CTA */}
              <div className="pt-2">
                <a
                  href={`mailto:${cand.email}?subject=RoomieMatch: Let's connect about rooming in ${cand.city}`}
                  className="btn-primary-flat inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm"
                >
                  <span>Email {cand.full_name.split(" ")[0]}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
