import { NextResponse } from "next/server";
import { createAuthenticatedClient, createAdminClient } from "@/lib/supabase-server";
import { sendMutualMatchNotification } from "@/lib/notifications";

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

// POST /api/interests
// Records directional interest from current user to to_user_id per PRD §3.6.
// Detects mutual matches and triggers notifications.
// Never exposes contact information in this response.
export async function POST(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Enforce college-domain verification gate per §3.1
    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Expressing interest requires a verified college account." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { to_user_id } = body;

    if (!to_user_id || typeof to_user_id !== "string") {
      return NextResponse.json(
        { error: "Valid to_user_id is required." },
        { status: 400 }
      );
    }

    if (to_user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot express interest in your own profile." },
        { status: 400 }
      );
    }

    // 3. Attempt insert into interests table (from_user_id -> to_user_id)
    const { error: insertErr } = await supabase
      .from("interests")
      .insert({
        from_user_id: user.id,
        to_user_id: to_user_id,
      });

    if (insertErr) {
      // Rely on unique constraint unique_interest_pair to handle duplicates gracefully
      if (
        insertErr.code === "23505" ||
        insertErr.message.includes("unique_interest_pair") ||
        insertErr.message.includes("duplicate key")
      ) {
        return NextResponse.json(
          {
            success: true,
            alreadyExpressed: true,
            isMutual: false,
            message: "You have already expressed interest in this candidate.",
          },
          { status: 200 }
        );
      }
      console.error("[POST /api/interests] Insert error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 4. Check if reverse interest exists (to_user_id -> user.id) to detect mutual match per §3.6 Step 5
    const { data: reverseInterest } = await supabase
      .from("interests")
      .select("id")
      .eq("from_user_id", to_user_id)
      .eq("to_user_id", user.id)
      .single();

    const isMutual = Boolean(reverseInterest);

    if (isMutual) {
      // Use admin client to safely fetch profiles for notification email dispatch
      const admin = createAdminClient();
      const { data: profA } = await admin
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("user_id", user.id)
        .single();
      const { data: profB } = await admin
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("user_id", to_user_id)
        .single();

      if (profA && profB) {
        await sendMutualMatchNotification(profA, profB);
      }

      return NextResponse.json(
        {
          success: true,
          isMutual: true,
          message: "🎉 Mutual roommate match confirmed! Contact info is now unlocked in Mutual Matches.",
        },
        { status: 201 }
      );
    }

    // 5. Directional interest recorded (no notification to candidate yet per §3.6)
    return NextResponse.json(
      {
        success: true,
        isMutual: false,
        message: "Interest sent! We will notify you when interest is mutual.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/interests] Exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
