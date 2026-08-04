"use client";

import React from "react";

/**
 * ==============================================================================
 * RoomieMatch Compatibility Fingerprint Motif (v3.0 Signature Element)
 * ==============================================================================
 * 
 * Represents the 6-axis lifestyle compatibility score:
 * 1. Sleep schedule (0 deg)
 * 2. Cleanliness (60 deg)
 * 3. Food habits (120 deg)
 * 4. Guest frequency (180 deg)
 * 5. Smoking (240 deg)
 * 6. Move-in timing (300 deg)
 */

// Helper to convert polar coordinates (angle in degrees, radius 0 to 1) to SVG XY (center 50, 50, maxR 40)
function polarToXY(angleDeg, radiusNorm, center = 50, maxR = 38) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const r = radiusNorm * maxR;
  const x = center + r * Math.cos(angleRad);
  const y = center + r * Math.sin(angleRad);
  return [x, y];
}

/**
 * 1. Navigation Logo Mark: Simplified static 6-point radial asterisk mark
 */
export function FingerprintLogo({ className = "h-7 w-7", color = "#5B4EE5" }) {
  const axes = [0, 60, 120, 180, 240, 300];
  const lengths = [0.95, 0.75, 0.9, 0.85, 0.7, 0.95]; // aesthetically balanced static profile

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Center dot */}
      <circle cx="50" cy="50" r="5" fill={color} />

      {/* 6 radiating asterisk arms */}
      {axes.map((angle, i) => {
        const [x, y] = polarToXY(angle, lengths[i]);
        return (
          <g key={i}>
            <line
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={color}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx={x} cy={y} r="3" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * 2. MatchCard Literal Score Visualization: 6-axis overlapping fingerprint
 * Overlaps primary (#5B4EE5) and secondary (#FF6B4A) radial shapes with shaded overlap area.
 */
export function FingerprintScore({
  userScores = [0.9, 0.85, 0.7, 0.95, 0.8, 0.9],
  candidateScores = [0.85, 0.9, 0.75, 0.9, 0.85, 0.88],
  scoreValue = 87,
  className = "h-20 w-20",
}) {
  const axes = [0, 60, 120, 180, 240, 300];

  // Create polygon coordinate strings
  const userPoints = axes
    .map((ang, idx) => polarToXY(ang, userScores[idx] || 0.8).join(","))
    .join(" ");
  const candidatePoints = axes
    .map((ang, idx) => polarToXY(ang, candidateScores[idx] || 0.8).join(","))
    .join(" ");

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label={`Compatibility fingerprint: ${scoreValue}% match`}
      >
        {/* Background 6-axis grid lines */}
        {axes.map((angle, idx) => {
          const [x, y] = polarToXY(angle, 1.0);
          return (
            <line
              key={idx}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="#E4E1F2"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Outer reference circle */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#E4E1F2"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Candidate shape (#FF6B4A - Warm Coral) */}
        <polygon
          points={candidatePoints}
          fill="#FF6B4A"
          fillOpacity="0.2"
          stroke="#FF6B4A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* User shape (#5B4EE5 - Primary Periwinkle Violet) */}
        <polygon
          points={userPoints}
          fill="#5B4EE5"
          fillOpacity="0.25"
          stroke="#5B4EE5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="3.5" fill="#17151F" />
      </svg>

      {/* Numeric score badge in IBM Plex Mono below/center */}
      <div className="mt-0.5 flex items-baseline gap-0.5 text-center">
        <span className="font-mono-data text-lg font-bold tracking-tight text-[#17151F]">
          {scoreValue}
        </span>
        <span className="font-mono-data text-[10px] font-semibold text-[#FF6B4A]">
          MATCH
        </span>
      </div>
    </div>
  );
}

/**
 * 3. Hero Background Watermark: Single faint instance behind hero headline
 */
export function HeroFingerprintWatermark({ className = "w-80 h-80" }) {
  const axes = [0, 60, 120, 180, 240, 300];
  const lengths = [0.95, 0.8, 0.9, 0.85, 0.75, 0.95];

  return (
    <div
      className={`pointer-events-none absolute select-none opacity-5 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <circle cx="50" cy="50" r="8" fill="#5B4EE5" />
        {axes.map((angle, i) => {
          const [x, y] = polarToXY(angle, lengths[i], 50, 42);
          return (
            <g key={i}>
              <line
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="#5B4EE5"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx={x} cy={y} r="3" fill="#5B4EE5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
