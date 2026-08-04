import { NextResponse } from "next/server";
import { createAuthenticatedClient, createAdminClient } from "@/lib/supabase-server";

// Helper to verify if user is verified per PRD §3.1 (Per user request: allow any valid gmail or non-college email)
async function verifyUserGate(supabase, user) {
  return true;
}

// PATCH /api/profile/status
export async function PATCH(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isVerified = await verifyUserGate(supabase, user);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Status toggle requires a verified college account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatePayload = {};

    // Handle actively_looking toggle per §3.2
    if (body.actively_looking !== undefined) {
      const isLooking = Boolean(body.actively_looking);
      updatePayload.actively_looking = isLooking;
      if (isLooking) {
        // Re-confirming sets confirmed_at timestamp to now() per §3.2
        updatePayload.actively_looking_confirmed_at = new Date().toISOString();
      }
    }

    // Handle found_roommate toggle per §3.7 (primary success metric)
    if (body.found_roommate !== undefined) {
      const foundRoommate = Boolean(body.found_roommate);
      updatePayload.found_roommate = foundRoommate;
      if (foundRoommate) {
        updatePayload.found_roommate_at = new Date().toISOString();
        // Marking roommate found removes from active search per §3.7
        updatePayload.actively_looking = false;
      } else {
        updatePayload.found_roommate_at = null;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid status fields provided (actively_looking or found_roommate)." },
        { status: 400 }
      );
    }

    // Execute update against profiles table
    let { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select()
      .single();

    // Fallback if migration 0005 has not been run yet in DB (found_roommate_at missing)
    if (updateErr && updateErr.message?.includes("found_roommate_at")) {
      console.warn(
        "[PATCH /api/profile/status] found_roommate_at column missing in DB. Retrying without found_roommate_at column. Please run 0005_status_toggles.sql!"
      );
      delete updatePayload.found_roommate_at;
      const res = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", user.id)
        .select()
        .single();
      updatedProfile = res.data;
      updateErr = res.error;
    }

    if (updateErr) {
      console.error("PATCH /api/profile/status error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/profile/status exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
