import { NextResponse } from "next/server";
import { createAuthenticatedClient, createAdminClient } from "@/lib/supabase-server";
import { applyHardFilters, computeRuleScore } from "@/lib/matching";
import { getLlmAdjustment } from "@/lib/llm";

// Helper to check verification gate per §3.1 (Per user request: allow any valid gmail or non-college email)
async function verifyUserGate(supabase, user) {
  return true;
}

// GET /api/matches
// Runs Step 1 (applyHardFilters), Step 2 (computeRuleScore), and Step 3 (LLM adjustment layer per §3.4)
// Implements PRD §4 Cost Control by caching and reusing computed scores in match_results within a 1-hour window.
export async function GET(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Enforce verification gate per §3.1
    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Matching requires a verified college account." },
        { status: 403 }
      );
    }

    // 2. Fetch the requester's own profile
    const { data: requesterProfile, error: reqErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (reqErr || !requesterProfile) {
      return NextResponse.json(
        { error: "Please complete your profile before requesting roommate matches." },
        { status: 400 }
      );
    }

    // 3. Data-scoping per §4: query candidate pool in the same launch city
    const { data: candidatePool, error: poolErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_verified", true)
      .eq("actively_looking", true)
      .eq("found_roommate", false)
      .ilike("city", requesterProfile.city)
      .neq("user_id", user.id);

    if (poolErr) {
      console.error("GET /api/matches pool query error:", poolErr);
      return NextResponse.json({ error: poolErr.message }, { status: 500 });
    }

    // 4. Apply Step 1 Hard Filters (budget range overlap & gender preferences)
    const eligibleCandidates = applyHardFilters(requesterProfile, candidatePool || []);

    // 5. Apply Step 2 (Rule Score) + Step 3 (LLM Adjustment with match_results Cache per §4)
    const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL per PRD §4
    const admin = createAdminClient();

    // Fetch current user's outgoing and incoming interest user_ids to flag button states without exposing contact info
    const { data: sentInterests } = await supabase
      .from("interests")
      .select("to_user_id")
      .eq("from_user_id", user.id);
    const sentIds = new Set((sentInterests || []).map((i) => i.to_user_id));

    const { data: receivedInterests } = await supabase
      .from("interests")
      .select("from_user_id")
      .eq("to_user_id", user.id);
    const receivedIds = new Set((receivedInterests || []).map((i) => i.from_user_id));

    const scoredCandidates = await Promise.all(
      eligibleCandidates.map(async (candidate) => {
        const { score: ruleScore, breakdown } = computeRuleScore(requesterProfile, candidate);

        let finalScore = ruleScore;
        let llmAdjustment = 0;
        let explanation = "";
        let isCached = false;
        let computedAt = new Date().toISOString();

        // Check match_results cache table for an existing computation within TTL
        const { data: cachedRow } = await supabase
          .from("match_results")
          .select("score, explanation, computed_at")
          .eq("requester_id", user.id)
          .eq("candidate_id", candidate.user_id)
          .single();

        if (
          cachedRow &&
          cachedRow.computed_at &&
          Date.now() - new Date(cachedRow.computed_at).getTime() <= CACHE_TTL_MS
        ) {
          // Cache hit: reuse cached score & explanation without calling LLM!
          finalScore = cachedRow.score;
          explanation = cachedRow.explanation;
          llmAdjustment = finalScore - ruleScore;
          isCached = true;
          computedAt = cachedRow.computed_at;
          console.log(
            `[GET /api/matches] Cache hit for pair (${user.id} -> ${candidate.user_id}). Reusing cached score ${finalScore}.`
          );
        } else {
          // Cache miss or expired row: execute Step 3 LLM adjustment layer
          console.log(
            `[GET /api/matches] Cache miss for pair (${user.id} -> ${candidate.user_id}). Calling getLlmAdjustment...`
          );
          const llmRes = await getLlmAdjustment(
            requesterProfile.about_me,
            candidate.about_me
          );
          llmAdjustment = llmRes.adjustment;
          explanation = llmRes.explanation;

          // Final score = Step 2 score + LLM adjustment, clamped to 0-100 per PRD §3.4 Step 3
          finalScore = Math.min(100, Math.max(0, ruleScore + llmAdjustment));
          isCached = false;
          computedAt = new Date().toISOString();

          // Write/upsert to match_results cache table per PRD §4
          try {
            const { error: cacheErr } = await admin
              .from("match_results")
              .upsert(
                {
                  requester_id: user.id,
                  candidate_id: candidate.user_id,
                  score: finalScore,
                  explanation: explanation,
                  computed_at: computedAt,
                },
                { onConflict: "requester_id,candidate_id" }
              );
            if (cacheErr) {
              console.warn("[GET /api/matches] Cache upsert warning:", cacheErr.message);
            }
          } catch (err) {
            console.error("[GET /api/matches] Cache upsert exception:", err);
          }
        }

        return {
          candidate: {
            id: candidate.id,
            user_id: candidate.user_id,
            full_name: candidate.full_name,
            city: candidate.city,
            gender: candidate.gender,
            preferred_roommate_gender: candidate.preferred_roommate_gender,
            budget_min: candidate.budget_min,
            budget_max: candidate.budget_max,
            sleep_schedule: candidate.sleep_schedule,
            cleanliness_level: candidate.cleanliness_level,
            food_habits: candidate.food_habits,
            guest_frequency: candidate.guest_frequency,
            smoking: candidate.smoking,
            move_in_month: candidate.move_in_month,
            about_me: candidate.about_me,
            photo_url: candidate.photo_url,
            hasExpressedInterest: sentIds.has(candidate.user_id),
            isMutual: sentIds.has(candidate.user_id) && receivedIds.has(candidate.user_id),
          },
          ruleScore: ruleScore,
          llmAdjustment: llmAdjustment,
          finalScore: finalScore,
          summary: explanation,
          breakdown: breakdown,
          cached: isCached,
          computed_at: computedAt,
        };
      })
    );

    // 6. Sort descending by finalScore and select Top 3 per PRD §3.4 Step 4
    scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);
    const top3Matches = scoredCandidates.slice(0, 3);

    return NextResponse.json(
      {
        success: true,
        matches: top3Matches,
        totalEligible: eligibleCandidates.length,
        totalInCityPool: (candidatePool || []).length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/matches exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
