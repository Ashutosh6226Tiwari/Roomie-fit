/**
 * ==============================================================================
 * RoomieMatch Summary Helper (PRD §3.5)
 * ==============================================================================
 *
 * Generates natural-language highlight sentences from structured lifestyle
 * attributes and score breakdowns, combining them with Step 3 LLM explanations.
 */

function formatSleep(val) {
  if (val === "early_bird") return "early riser";
  if (val === "night_owl") return "night owl";
  return "flexible sleeper";
}

function formatFood(val) {
  if (val === "vegetarian") return "vegetarian";
  if (val === "vegan") return "vegan";
  if (val === "non_vegetarian") return "non-vegetarian";
  return "no preference";
}

function formatGuests(val) {
  if (val === "rarely") return "rarely have guests";
  if (val === "occasionally") return "occasionally have guests";
  if (val === "frequently") return "frequently have guests";
  return "have guests";
}

/**
 * Generates a structured-field highlight sentence per PRD §3.5.
 * Example: "You're both early risers and similar on cleanliness, though guest frequency differs slightly."
 *
 * @param {Object} req - Requester profile
 * @param {Object} cand - Candidate profile
 * @returns {string} Natural-language highlight sentence
 */
export function generateHighlightSentence(req, cand) {
  if (!req || !cand) {
    return "You have compatible college lifestyle attributes and budget ranges.";
  }

  const aligns = [];
  const differs = [];

  // 1. Sleep Schedule comparison
  if (req.sleep_schedule === cand.sleep_schedule && req.sleep_schedule !== "flexible") {
    aligns.push(`both ${formatSleep(req.sleep_schedule)}s`);
  } else if (
    (req.sleep_schedule === "early_bird" && cand.sleep_schedule === "night_owl") ||
    (req.sleep_schedule === "night_owl" && cand.sleep_schedule === "early_bird")
  ) {
    differs.push("sleep schedules differ");
  }

  // 2. Cleanliness comparison
  const cleanDiff = Math.abs(
    (Number(req.cleanliness_level) || 3) - (Number(cand.cleanliness_level) || 3)
  );
  if (cleanDiff === 0) {
    aligns.push(`identically matched on cleanliness (${cand.cleanliness_level}/5)`);
  } else if (cleanDiff <= 1) {
    aligns.push("similar on cleanliness");
  } else {
    differs.push(`cleanliness levels vary (${req.cleanliness_level} vs ${cand.cleanliness_level})`);
  }

  // 3. Food habits comparison
  if (req.food_habits === cand.food_habits && req.food_habits !== "no_preference") {
    aligns.push(`share ${formatFood(req.food_habits)} food habits`);
  } else if (
    ["vegetarian", "vegan"].includes(req.food_habits) &&
    cand.food_habits === "non_vegetarian"
  ) {
    differs.push("dietary preferences differ");
  }

  // 4. Guest frequency comparison
  const guestMap = { rarely: 1, occasionally: 2, frequently: 3 };
  const guestDiff = Math.abs(
    (guestMap[req.guest_frequency] || 2) - (guestMap[cand.guest_frequency] || 2)
  );
  if (guestDiff === 0) {
    if (req.guest_frequency === "rarely") {
      aligns.push("both prefer a quiet home with few guests");
    }
  } else if (guestDiff >= 2) {
    differs.push("guest frequency differs noticeably");
  } else if (guestDiff === 1 && differs.length === 0) {
    differs.push("guest frequency differs slightly");
  }

  // 5. Build sentence
  let sentence = "";
  if (aligns.length === 1) {
    sentence = `You're ${aligns[0]}`;
  } else if (aligns.length >= 2) {
    sentence = `You're ${aligns[0]} and ${aligns[1]}`;
  } else {
    sentence = "You have compatible budget ranges and city preferences";
  }

  if (differs.length > 0) {
    sentence += `, though ${differs[0]}.`;
  } else {
    sentence += " with very well-aligned daily habits.";
  }

  // Capitalize first letter
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Combines Step 3 LLM explanation with structured highlight sentence per PRD §3.5.
 *
 * @param {Object} match - The match result item returned from GET /api/matches
 * @param {Object} requesterProfile - The searching student's profile
 * @returns {string} - Complete one-paragraph summary
 */
export function generateFullMatchSummary(match, requesterProfile) {
  if (!match) return "";
  const highlight = generateHighlightSentence(requesterProfile, match.candidate);
  const llmText = match.summary || "";

  // Avoid duplicating text if the highlight sentence is already part of summary
  if (llmText.includes(highlight)) {
    return llmText;
  }
  return `${llmText} ${highlight}`.trim();
}
