import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase-server";
import { applyLazyExpiry } from "@/lib/profile-status";

// Helper to verify if user is college-domain verified per PRD §3.1
async function verifyUserGate(supabase, user) {
  // 1. Check user_metadata first
  if (user.user_metadata?.is_verified === true) {
    return true;
  }

  // 2. Fallback check DB profile row
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("user_id", user.id)
    .single();

  return profile?.is_verified === true;
}

// Validation helper for structured fields from §3.2
function validateProfilePayload(body) {
  const errors = [];

  if (!body.full_name || typeof body.full_name !== "string" || !body.full_name.trim()) {
    errors.push("Full name is required.");
  }
  if (!body.city || typeof body.city !== "string" || !body.city.trim()) {
    errors.push("City is required.");
  }

  const minBudget = Number(body.budget_min);
  const maxBudget = Number(body.budget_max);
  if (isNaN(minBudget) || minBudget < 0) {
    errors.push("Budget minimum must be a valid non-negative number.");
  }
  if (isNaN(maxBudget) || maxBudget < minBudget) {
    errors.push("Budget maximum must be greater than or equal to minimum budget.");
  }

  const validGenders = ["male", "female", "other"];
  if (!validGenders.includes(body.gender)) {
    errors.push("Invalid gender selection.");
  }

  const validPrefGenders = ["male", "female", "any"];
  if (!validPrefGenders.includes(body.preferred_roommate_gender)) {
    errors.push("Invalid preferred roommate gender selection.");
  }

  const validSleep = ["early_bird", "night_owl", "flexible"];
  if (!validSleep.includes(body.sleep_schedule)) {
    errors.push("Invalid sleep schedule selection.");
  }

  const cleanliness = Number(body.cleanliness_level);
  if (isNaN(cleanliness) || cleanliness < 1 || cleanliness > 5) {
    errors.push("Cleanliness level must be between 1 and 5.");
  }

  const validFood = ["vegetarian", "non_vegetarian", "vegan", "no_preference"];
  if (!validFood.includes(body.food_habits)) {
    errors.push("Invalid food habits selection.");
  }

  const validGuest = ["rarely", "occasionally", "frequently"];
  if (!validGuest.includes(body.guest_frequency)) {
    errors.push("Invalid guest frequency selection.");
  }

  if (typeof body.smoking !== "boolean") {
    errors.push("Smoking must be a boolean.");
  }

  if (!body.move_in_month || typeof body.move_in_month !== "string") {
    errors.push("Move-in month is required.");
  }

  if (body.about_me !== undefined && body.about_me !== null && body.about_me !== "") {
    if (typeof body.about_me !== "string" || body.about_me.length > 500) {
      errors.push("About me must not exceed 500 characters.");
    }
  }

  return { errors, minBudget, maxBudget, cleanliness };
}

// GET /api/profile
export async function GET(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: dbErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (dbErr && dbErr.code === "PGRST116") {
      // Row not found
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    if (dbErr) {
      console.error("GET /api/profile db error:", dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    // Apply 30-day lazy auto-expiry per PRD §3.2
    const finalProfile = await applyLazyExpiry(profile);

    return NextResponse.json({ profile: finalProfile }, { status: 200 });
  } catch (err) {
    console.error("GET /api/profile exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/profile (create/initialize profile - requires verification per §3.1)
export async function POST(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enforce verification gate per §3.1
    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Profile creation requires a verified college account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { errors, minBudget, maxBudget, cleanliness } = validateProfilePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const profileData = {
      user_id: user.id,
      email: user.email,
      full_name: body.full_name.trim(),
      city: body.city.trim(),
      budget_min: minBudget,
      budget_max: maxBudget,
      gender: body.gender,
      preferred_roommate_gender: body.preferred_roommate_gender,
      sleep_schedule: body.sleep_schedule,
      cleanliness_level: cleanliness,
      food_habits: body.food_habits,
      guest_frequency: body.guest_frequency,
      smoking: Boolean(body.smoking),
      move_in_month: body.move_in_month,
      about_me: body.about_me ? body.about_me.trim() : null,
      actively_looking:
        body.actively_looking !== undefined ? Boolean(body.actively_looking) : true,
      found_roommate: Boolean(body.found_roommate || false),
      photo_url: body.photo_url || null,
      is_verified: true,
      verification_method: "college_email",
    };

    const { data: updatedProfile, error: upsertErr } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    if (upsertErr) {
      console.error("POST /api/profile upsert error:", upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
  } catch (err) {
    console.error("POST /api/profile exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/profile (update existing profile - requires verification per §3.1)
export async function PUT(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enforce verification gate per §3.1
    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Profile modification requires a verified college account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { errors, minBudget, maxBudget, cleanliness } = validateProfilePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const updatePayload = {
      full_name: body.full_name.trim(),
      city: body.city.trim(),
      budget_min: minBudget,
      budget_max: maxBudget,
      gender: body.gender,
      preferred_roommate_gender: body.preferred_roommate_gender,
      sleep_schedule: body.sleep_schedule,
      cleanliness_level: cleanliness,
      food_habits: body.food_habits,
      guest_frequency: body.guest_frequency,
      smoking: Boolean(body.smoking),
      move_in_month: body.move_in_month,
      about_me: body.about_me ? body.about_me.trim() : null,
      actively_looking:
        body.actively_looking !== undefined ? Boolean(body.actively_looking) : true,
      found_roommate: Boolean(body.found_roommate || false),
      photo_url: body.photo_url !== undefined ? body.photo_url : undefined,
    };

    const { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("PUT /api/profile update error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/profile exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
