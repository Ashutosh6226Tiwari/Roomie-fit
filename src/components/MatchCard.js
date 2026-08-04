"use client";

import { useMemo, useState } from "react";
import ExpressInterestButton from "./ExpressInterestButton";
import ReportModalButton from "./ReportModalButton";
import { generateFullMatchSummary } from "@/lib/match-summary";
import { FingerprintScore } from "./CompatibilityFingerprint";

// Helpers for human-readable labels
function formatSleep(val) {
  if (val === "early_bird") return "Early Riser 🌅";
  if (val === "night_owl") return "Night Owl 🦉";
  return "Flexible ☀️";
}

function formatFood(val) {
  if (val === "vegetarian") return "Vegetarian 🥗";
  if (val === "vegan") return "Vegan 🥑";
  if (val === "non_vegetarian") return "Non-Veg 🍗";
  return "No Pref 🍽️";
}

function formatGuests(val) {
  if (val === "rarely") return "Rarely 🤫";
  if (val === "occasionally") return "Occasionally 🎉";
  if (val === "frequently") return "Frequently 🥳";
  return "Flexible";
}

function formatSmoking(val) {
  return val ? "Smoker 🚬" : "Non-smoker 🚭";
}

export default function MatchCard({ match, requesterProfile, rank }) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const candidate = match.candidate || {};
  const score = match.finalScore ?? match.ruleScore ?? 0;

  // Combine LLM explanation with structured-field highlights per Prompt 8
  const fullSummary = useMemo(
    () => generateFullMatchSummary(match, requesterProfile),
    [match, requesterProfile]
  );

  // Comparison rows for side-by-side table
  const comparisonRows = [
    {
      label: "Sleep Schedule",
      you: formatSleep(requesterProfile?.sleep_schedule),
      them: formatSleep(candidate.sleep_schedule),
      isMatch:
        requesterProfile?.sleep_schedule === candidate.sleep_schedule ||
        requesterProfile?.sleep_schedule === "flexible" ||
        candidate.sleep_schedule === "flexible",
    },
    {
      label: "Cleanliness",
      you: `${requesterProfile?.cleanliness_level || "?"}/5`,
      them: `${candidate.cleanliness_level || "?"}/5`,
      isMatch:
        Math.abs(
          (requesterProfile?.cleanliness_level || 3) -
            (candidate.cleanliness_level || 3)
        ) <= 1,
    },
    {
      label: "Food Habits",
      you: formatFood(requesterProfile?.food_habits),
      them: formatFood(candidate.food_habits),
      isMatch:
        requesterProfile?.food_habits === candidate.food_habits ||
        requesterProfile?.food_habits === "no_preference" ||
        candidate.food_habits === "no_preference",
    },
    {
      label: "Guest Frequency",
      you: formatGuests(requesterProfile?.guest_frequency),
      them: formatGuests(candidate.guest_frequency),
      isMatch:
        requesterProfile?.guest_frequency === candidate.guest_frequency,
    },
    {
      label: "Smoking",
      you: formatSmoking(requesterProfile?.smoking),
      them: formatSmoking(candidate.smoking),
      isMatch:
        Boolean(requesterProfile?.smoking) === Boolean(candidate.smoking),
    },
    {
      label: "Monthly Budget",
      you: `$${requesterProfile?.budget_min || 0} – $${
        requesterProfile?.budget_max || 0
      }`,
      them: `$${candidate.budget_min || 0} – $${candidate.budget_max || 0}`,
      isMatch: true, // Hard filter already guaranteed overlap
    },
  ];

  const initials = (candidate.full_name || "Student")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card-clean group relative flex flex-col overflow-hidden rounded-2xl p-6 bg-[#FFFFFF]">
      {/* Top Rank Ribbon if Rank 1 */}
      {rank === 1 && (
        <div className="absolute -right-10 top-5 rotate-45 bg-[#FF6B4A] px-10 py-1 text-center font-mono-data text-[10px] font-bold uppercase tracking-widest text-[#FFFFFF] shadow-sm">
          TOP MATCH
        </div>
      )}

      {/* Header: Avatar, Name, City, and Compatibility Fingerprint Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.full_name}
              className="h-16 w-16 rounded-xl border border-[#E4E1F2] object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F1EFFC] border border-[#D8D5EC] text-xl font-bold text-[#5B4EE5] transition-transform duration-300 group-hover:scale-105">
              {initials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#17151F] tracking-tight">
                {candidate.full_name}
              </h3>
              <span className="rounded-full border border-[#D8D5EC] bg-[#F1EFFC] px-2.5 py-0.5 font-mono-data text-xs font-semibold text-[#5B4EE5]">
                Verified
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#17151F]/70">
              <span>📍</span> {candidate.city || "College City"}
            </p>
          </div>
        </div>

        {/* Signature 6-Axis Compatibility Fingerprint Score Visualization */}
        <div className="flex flex-col items-center justify-center">
          <FingerprintScore
            scoreValue={score}
            className="h-20 w-20"
          />
        </div>
      </div>

      {/* AI Compatibility Analysis Card */}
      <div className="mt-6 rounded-xl bg-[#F1EFFC] border border-[#D8D5EC] p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5B4EE5]">
          <span>✨</span>
          <span>Compatibility Analysis</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#17151F]/80">
          {fullSummary}
        </p>
      </div>

      {/* Side-by-Side Lifestyle Comparison Matrix */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#17151F]/60 mb-3">
          Side-by-Side Lifestyle Comparison
        </h4>
        <div className="overflow-hidden rounded-xl border border-[#E4E1F2] bg-[#FFFFFF]">
          <div className="grid grid-cols-12 border-b border-[#E4E1F2] bg-[#F1EFFC] px-4 py-2.5 text-xs font-semibold text-[#17151F]/70">
            <div className="col-span-4">Attribute</div>
            <div className="col-span-4 text-center">You</div>
            <div className="col-span-4 text-right">Candidate</div>
          </div>

          <div className="divide-y divide-[#E4E1F2]">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center px-4 py-2.5 text-xs transition-colors hover:bg-[#F1EFFC]/50"
              >
                <div className="col-span-4 flex items-center gap-1.5 font-medium text-[#17151F]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      row.isMatch ? "bg-[#2F7A56]" : "bg-[#FF6B4A]"
                    }`}
                  />
                  <span>{row.label}</span>
                </div>
                <div className="col-span-4 text-center font-semibold text-[#5B4EE5]">
                  {row.you}
                </div>
                <div className="col-span-4 text-right font-semibold text-[#17151F]/85">
                  {row.them}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable About Me Bio Section */}
      {candidate.about_me && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setBioExpanded(!bioExpanded)}
            className="flex items-center gap-1 text-xs font-semibold text-[#5B4EE5] hover:underline transition-colors"
          >
            <span>{bioExpanded ? "▾ Hide Bio" : "▸ Read Full Bio"}</span>
          </button>
          {bioExpanded && (
            <div className="mt-2 rounded-lg border border-[#E4E1F2] bg-[#F1EFFC] p-3 text-xs italic text-[#17151F]/80">
              &ldquo;{candidate.about_me}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Action Footer: Express Interest Button & Report Button */}
      <div className="mt-6 pt-2 flex items-center justify-between gap-3">
        <div className="flex-1">
          <ExpressInterestButton
            candidate={candidate}
            initialExpressed={candidate.hasExpressedInterest}
            initialMutual={candidate.isMutual}
          />
        </div>
        <div className="flex-shrink-0">
          <ReportModalButton
            candidateId={candidate.user_id}
            candidateName={candidate.full_name}
          />
        </div>
      </div>
    </div>
  );
}
