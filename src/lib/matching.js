/**
 * ==============================================================================
 * RoomieMatch Rule-Based Matching Engine (PRD §3.4 Steps 1 & 2)
 * ==============================================================================
 *
 * Configurable weighting constants exported separately per PRD §3.4 and §11
 * so they can be tuned later without modifying scoring logic.
 */
export const RULE_WEIGHTS = {
  SLEEP: 0.20,
  CLEANLINESS: 0.25,
  FOOD: 0.15,
  GUESTS: 0.15,
  SMOKING: 0.15,
  MOVE_IN: 0.10,
};

/**
 * Checks if two budget ranges overlap.
 * Overlap exists when max(minA, minB) <= min(maxA, maxB).
 */
export function budgetsOverlap(minA, maxA, minB, maxB) {
  const start = Math.max(Number(minA) || 0, Number(minB) || 0);
  const end = Math.min(Number(maxA) || 0, Number(maxB) || 0);
  return start <= end;
}

/**
 * Step 1: applyHardFilters
 * Pure function that filters an array of candidate profiles against the requester profile.
 *
 * Excludes candidates where:
 * 1. The candidate is the requester's own profile.
 * 2. The candidate is inactive (actively_looking === false or found_roommate === true).
 * 3. Budget ranges do not overlap.
 * 4. Gender preferences do not match (bidirectionally: requester's preference against candidate's gender,
 *    and candidate's preference against requester's gender, unless "any").
 *
 * @param {Object} requesterProfile - The searching student's profile.
 * @param {Array<Object>} candidateProfiles - Pool of potential candidates.
 * @returns {Array<Object>} - Filtered eligible candidates.
 */
export function applyHardFilters(requesterProfile, candidateProfiles) {
  if (!requesterProfile || !Array.isArray(candidateProfiles)) {
    return [];
  }

  const reqMin = Number(requesterProfile.budget_min) || 0;
  const reqMax = Number(requesterProfile.budget_max) || 0;
  const reqGender = requesterProfile.gender;
  const reqPrefGender = requesterProfile.preferred_roommate_gender;

  return candidateProfiles.filter((cand) => {
    // 1. Exclude requester's own profile
    if (
      cand.id === requesterProfile.id ||
      (cand.user_id && cand.user_id === requesterProfile.user_id)
    ) {
      return false;
    }

    // 2. Exclude inactive candidates per §3.4 & §3.7
    if (cand.actively_looking === false || cand.found_roommate === true) {
      return false;
    }

    // 3. Budget ranges must overlap
    const candMin = Number(cand.budget_min) || 0;
    const candMax = Number(cand.budget_max) || 0;
    if (!budgetsOverlap(reqMin, reqMax, candMin, candMax)) {
      return false;
    }

    // 4. Gender preferences must match (unless "any")
    if (reqPrefGender !== "any" && reqPrefGender !== cand.gender) {
      return false;
    }
    // Also respect candidate's gender preference toward requester
    if (
      cand.preferred_roommate_gender !== "any" &&
      cand.preferred_roommate_gender !== reqGender
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Helper: Sleep schedule normalized score (0 to 1)
 */
function getSleepScore(s1, s2) {
  if (!s1 || !s2) return 0.5;
  if (s1 === s2) return 1.0;
  if (s1 === "flexible" || s2 === "flexible") return 0.8;
  // early_bird vs night_owl
  return 0.2;
}

/**
 * Helper: Cleanliness level closeness normalized score (0 to 1)
 * Scale 1-5 -> Max difference is 4 -> score = 1 - (diff / 4)
 */
function getCleanlinessScore(c1, c2) {
  const v1 = Number(c1) || 3;
  const v2 = Number(c2) || 3;
  const diff = Math.abs(v1 - v2);
  return Math.max(0, 1 - diff / 4);
}

/**
 * Helper: Food habits compatibility normalized score (0 to 1)
 */
function getFoodScore(f1, f2) {
  if (!f1 || !f2) return 0.5;
  if (f1 === f2) return 1.0;
  if (f1 === "no_preference" || f2 === "no_preference") return 0.9;
  const vegTypes = ["vegetarian", "vegan"];
  if (vegTypes.includes(f1) && vegTypes.includes(f2)) return 0.8;
  return 0.5;
}

/**
 * Helper: Guest frequency closeness normalized score (0 to 1)
 * rarely = 1, occasionally = 2, frequently = 3 -> Max diff is 2
 */
function getGuestsScore(g1, g2) {
  const map = { rarely: 1, occasionally: 2, frequently: 3 };
  const v1 = map[g1] || 2;
  const v2 = map[g2] || 2;
  const diff = Math.abs(v1 - v2);
  return Math.max(0, 1 - diff / 2);
}

/**
 * Helper: Smoking compatibility normalized score (0 to 1)
 */
function getSmokingScore(sm1, sm2) {
  return Boolean(sm1) === Boolean(sm2) ? 1.0 : 0.0;
}

/**
 * Helper: Move-in timeframe proximity normalized score (0 to 1)
 * Based on absolute month difference.
 */
function getMoveInScore(m1, m2) {
  if (!m1 || !m2) return 0.5;
  try {
    const d1 = new Date(m1);
    const d2 = new Date(m2);
    const months1 = d1.getFullYear() * 12 + d1.getMonth();
    const months2 = d2.getFullYear() * 12 + d2.getMonth();
    const diff = Math.abs(months1 - months2);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.7;
    if (diff === 2) return 0.4;
    return 0.1;
  } catch {
    return 0.5;
  }
}

/**
 * Step 2: computeRuleScore
 * Pure function that computes a weighted compatibility score between 0 and 100
 * for a candidate against a requester profile per PRD §3.4 Step 2.
 *
 * Each sub-score is normalized to 0-1, multiplied by its configurable weight,
 * and summed to a final 0-100 integer score.
 *
 * @param {Object} requesterProfile - The searching student's profile.
 * @param {Object} candidateProfile - A candidate profile that passed hard filters.
 * @returns {Object} { score: number (0-100), breakdown: Object }
 */
export function computeRuleScore(requesterProfile, candidateProfile) {
  const sleepNorm = getSleepScore(
    requesterProfile.sleep_schedule,
    candidateProfile.sleep_schedule
  );
  const cleanNorm = getCleanlinessScore(
    requesterProfile.cleanliness_level,
    candidateProfile.cleanliness_level
  );
  const foodNorm = getFoodScore(
    requesterProfile.food_habits,
    candidateProfile.food_habits
  );
  const guestsNorm = getGuestsScore(
    requesterProfile.guest_frequency,
    candidateProfile.guest_frequency
  );
  const smokingNorm = getSmokingScore(
    requesterProfile.smoking,
    candidateProfile.smoking
  );
  const moveInNorm = getMoveInScore(
    requesterProfile.move_in_month,
    candidateProfile.move_in_month
  );

  const weightedSum =
    sleepNorm * RULE_WEIGHTS.SLEEP +
    cleanNorm * RULE_WEIGHTS.CLEANLINESS +
    foodNorm * RULE_WEIGHTS.FOOD +
    guestsNorm * RULE_WEIGHTS.GUESTS +
    smokingNorm * RULE_WEIGHTS.SMOKING +
    moveInNorm * RULE_WEIGHTS.MOVE_IN;

  const finalScore = Math.round(weightedSum * 100);

  return {
    score: finalScore,
    breakdown: {
      sleep: { norm: sleepNorm, weight: RULE_WEIGHTS.SLEEP, points: sleepNorm * RULE_WEIGHTS.SLEEP * 100 },
      cleanliness: { norm: cleanNorm, weight: RULE_WEIGHTS.CLEANLINESS, points: cleanNorm * RULE_WEIGHTS.CLEANLINESS * 100 },
      food: { norm: foodNorm, weight: RULE_WEIGHTS.FOOD, points: foodNorm * RULE_WEIGHTS.FOOD * 100 },
      guests: { norm: guestsNorm, weight: RULE_WEIGHTS.GUESTS, points: guestsNorm * RULE_WEIGHTS.GUESTS * 100 },
      smoking: { norm: smokingNorm, weight: RULE_WEIGHTS.SMOKING, points: smokingNorm * RULE_WEIGHTS.SMOKING * 100 },
      moveIn: { norm: moveInNorm, weight: RULE_WEIGHTS.MOVE_IN, points: moveInNorm * RULE_WEIGHTS.MOVE_IN * 100 },
    },
  };
}
