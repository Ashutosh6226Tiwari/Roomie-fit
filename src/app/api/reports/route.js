import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase-server";
import crypto from "crypto";

// POST /api/reports
// Allows any authenticated user to report another user per PRD §7.3.
// Inserts a row into public.reports with status = 'open'.
// Adheres to RLS: authenticated users can INSERT (auth.uid() = reported_by_id),
// while SELECT is restricted to admins per §7.3.
export async function POST(request) {
  try {
    const { supabase, user, error: authErr } = await createAuthenticatedClient(request);

    if (authErr || !user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reported_user_id, reason } = body;

    if (!reported_user_id || typeof reported_user_id !== "string") {
      return NextResponse.json(
        { error: "Valid reported_user_id is required." },
        { status: 400 }
      );
    }

    if (reported_user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot report your own profile." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a valid reason (at least 3 characters)." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Insert report into public.reports with default status = 'open'
    // Do not call .select() here so we don't violate the SELECT RLS policy for non-admins
    const { error: insertErr } = await supabase
      .from("reports")
      .insert({
        id: id,
        reported_by_id: user.id,
        reported_user_id: reported_user_id,
        reason: reason.trim(),
        status: "open",
      });

    if (insertErr) {
      console.error("[POST /api/reports] Insert error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        report: {
          id: id,
          reported_by_id: user.id,
          reported_user_id: reported_user_id,
          reason: reason.trim(),
          status: "open",
          created_at: createdAt,
        },
        message: "Thank you. Your report has been submitted for moderation review.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/reports] Exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
