"use client";

import { useMemo, useState } from "react";
import ExpressInterestButton from "./ExpressInterestButton";
import ReportModalButton from "./ReportModalButton";
import { generateFullMatchSummary } from "@/lib/match-summary";

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

function getScoreTheme(score) {
  if (score >= 80) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      stroke: "#10b981",
      badge: "High Match",
    };
  }
  if (score >= 60) {
    return {
      text: "text-indigo-400",
      bg: "bg-indigo-500/15",
      border: "border-indigo-500/30",
      stroke: "#6366f1",
      badge: "Good Match",
    };
  }
  return {
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    stroke: "#f59e0b",
    badge: "Moderate Match",
  };
}

/**
 * ==============================================================================
 * RoomieMatch MatchCard Component (PRD §3.5)
 * ==============================================================================
 *
 * Displays a single candidate match with:
 * - Prominent compatibility progress ring & score badge
 * - Combined AI summary paragraph & structured field highlight sentence
 * - Side-by-side comparison table of all 6 core attributes
 * - Expandable candidate bio
 * - Interactive ExpressInterestButton
 */
export default function MatchCard({ match, requesterProfile, rank }) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const candidate = match.candidate || {};
  const score = match.finalScore ?? match.ruleScore ?? 0;
  const theme = getScoreTheme(score);

  // Combine LLM explanation with structured-field highlights per Prompt 8
  const fullSummary = useMemo(
    () => generateFullMatchSummary(match, requesterProfile),
    [match, requesterProfile]
  );

  // SVG circular progress ring calculation (radius 34, circumference 213.6)
  const circumference = 2 * Math.PI * 34;
  const strokeDashoffset = circumference - (score / 100) * circumference;

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
    <div className="card-3d group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all duration-400">
      {/* Top Rank Ribbon if Rank 1 */}
      {rank === 1 && (
        <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-amber-500 to-amber-600 px-12 py-1 text-center text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg">
          Top Match ★
        </div>
      )}

      {/* Header: Avatar, Name, City, and Compatibility Ring Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.full_name}
              className="h-16 w-16 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-md"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md">
              {initials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">
                {candidate.full_name}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.bg} ${theme.border} ${theme.text}`}
              >
                {theme.badge}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <span className="text-slate-500">📍</span> {candidate.city || "College City"}
            </p>
          </div>
        </div>

        {/* Circular Score Progress Ring Badge per PRD §3.5 */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800"
                strokeWidth="7"
                fill="none"
              />
              {/* Progress ring */}
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke={theme.stroke}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-xl font-black ${theme.text}`}>
                {score}%
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Match
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Compatibility Analysis Card (Combined Paragraph per §3.5) */}
      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <span>✨</span>
          <span>AI Compatibility Analysis</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {fullSummary}
        </p>
      </div>

      {/* Side-by-Side Comparison Table (Sleep, Cleanliness, Food, Guests, Smoking, Budget) */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Side-by-Side Lifestyle Comparison
        </h4>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
          <div className="grid grid-cols-12 border-b border-slate-800/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-400">
            <div className="col-span-4">Attribute</div>
            <div className="col-span-4 text-center">You</div>
            <div className="col-span-4 text-right">Candidate</div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center px-4 py-2.5 text-xs transition-colors hover:bg-slate-900/40"
              >
                <div className="col-span-4 flex items-center gap-1.5 font-medium text-slate-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      row.isMatch ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span>{row.label}</span>
                </div>
                <div className="col-span-4 text-center font-semibold text-indigo-300">
                  {row.you}
                </div>
                <div className="col-span-4 text-right font-semibold text-slate-200">
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
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>{bioExpanded ? "▾ Hide Bio" : "▸ Read Full Bio"}</span>
          </button>
          {bioExpanded && (
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs italic text-slate-300">
              &ldquo;{candidate.about_me}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Action Footer: Express Interest Button & Report Button (§7.3) */}
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
