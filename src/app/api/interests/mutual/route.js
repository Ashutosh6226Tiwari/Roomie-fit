import { NextResponse } from "next/server";
import { createAuthenticatedClient, createAdminClient } from "@/lib/supabase-server";
import { computeRuleScore } from "@/lib/matching";

// Helper to check verification gate per §3.1
async function verifyUserGate(supabase, user) {
  if (user.user_metadata?.is_verified === true) {
    return true;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("user_id", user.id)
    .single();

  return profile?.is_verified === true;
}

// GET /api/interests/mutual
// Returns confirmed mutual matches for the current user (where both A->B and B->A interest rows exist).
// CRITICAL PRIVACY REQUIREMENT PER PRD §4:
// This is the ONLY endpoint in the entire application allowed to return contact information
// (email and phone) for other users.
export async function GET(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Viewing mutual matches requires a verified college account." },
        { status: 403 }
      );
    }

    // 1. Fetch current user's outgoing interests (user -> B)
    const { data: sentInterests, error: sentErr } = await supabase
      .from("interests")
      .select("to_user_id, created_at")
      .eq("from_user_id", user.id);

    if (sentErr) {
      console.error("[GET /api/interests/mutual] sentInterests error:", sentErr);
      return NextResponse.json({ error: sentErr.message }, { status: 500 });
    }

    // 2. Fetch incoming interests (B -> user)
    const { data: receivedInterests, error: recErr } = await supabase
      .from("interests")
      .select("from_user_id, created_at")
      .eq("to_user_id", user.id);

    if (recErr) {
      console.error("[GET /api/interests/mutual] receivedInterests error:", recErr);
      return NextResponse.json({ error: recErr.message }, { status: 500 });
    }

    const receivedMap = new Map(
      (receivedInterests || []).map((item) => [item.from_user_id, item.created_at])
    );

    // 3. Find intersection (mutual user IDs)
    const mutualUserIds = [];
    const matchTimestamps = new Map();

    for (const sent of sentInterests || []) {
      if (receivedMap.has(sent.to_user_id)) {
        mutualUserIds.push(sent.to_user_id);
        // The mutual match occurred when the later of the two interest rows was created
        const t1 = new Date(sent.created_at).getTime();
        const t2 = new Date(receivedMap.get(sent.to_user_id)).getTime();
        matchTimestamps.set(
          sent.to_user_id,
          new Date(Math.max(t1, t2)).toISOString()
        );
      }
    }

    if (mutualUserIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, matches: [] }, { status: 200 });
    }

    // 4. Fetch profiles for mutual matches using admin client to safely retrieve contact info per §3.6 & §4
    const admin = createAdminClient();
    const { data: mutualProfiles, error: profErr } = await admin
      .from("profiles")
      .select("*")
      .in("user_id", mutualUserIds);

    if (profErr) {
      console.error("[GET /api/interests/mutual] profiles query error:", profErr);
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // 5. Fetch requester profile to compute/display compatibility score
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 6. Assemble response WITH contact fields (email, phone) — ONLY PERMITTED HERE per PRD §4
    const matches = (mutualProfiles || []).map((cand) => {
      const { score } = computeRuleScore(requesterProfile || {}, cand);

      return {
        id: cand.id,
        user_id: cand.user_id,
        full_name: cand.full_name,
        city: cand.city,
        gender: cand.gender,
        sleep_schedule: cand.sleep_schedule,
        cleanliness_level: cand.cleanliness_level,
        food_habits: cand.food_habits,
        guest_frequency: cand.guest_frequency,
        smoking: cand.smoking,
        budget_min: cand.budget_min,
        budget_max: cand.budget_max,
        about_me: cand.about_me,
        photo_url: cand.photo_url,
        // PRD §4 SERVER-ENFORCED CONTACT REVEAL:
        email: cand.email,
        phone: cand.phone || null,
        matchedAt: matchTimestamps.get(cand.user_id) || new Date().toISOString(),
        compatibilityScore: score,
      };
    });

    // Sort by matchedAt descending (newest mutual matches first)
    matches.sort((a, b) => new Date(b.matchedAt) - new Date(a.matchedAt));

    return NextResponse.json(
      {
        success: true,
        count: matches.length,
        matches: matches,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/interests/mutual] Exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
