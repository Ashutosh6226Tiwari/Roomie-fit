import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

/**
 * POST /api/auth/signup
 * Handles student sign up with domain verification and profile initialization.
 * Auto-confirms email for MVP testing simplicity per §3.1.
 */
export async function POST(request) {
  try {
    const { name, email, password, verificationMethod } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const domain = email.split("@")[1]?.toLowerCase().trim();
    const allowedDomainsEnv = process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS || "college.edu";
    const allowedDomains = allowedDomainsEnv
      .split(",")
      .map((d) => d.trim().toLowerCase());

    const isCollegeDomain = allowedDomains.includes(domain);
    const finalVerificationMethod = isCollegeDomain
      ? "college_email"
      : verificationMethod || "student_id_pending";

    const adminSupabase = createAdminClient();

    // 1. Create user using admin API with email_confirm: true for MVP testing convenience
    const { data: userData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          is_verified: isCollegeDomain,
          verification_method: finalVerificationMethod,
        },
      });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

    // 2. Ensure profile row has the correct verified status (in case trigger was delayed or overridden)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .upsert({
        user_id: userId,
        email,
        full_name: name,
        city: "Campus City",
        budget_min: 500,
        budget_max: 1500,
        gender: "other",
        preferred_roommate_gender: "any",
        sleep_schedule: "flexible",
        cleanliness_level: 3,
        food_habits: "no_preference",
        guest_frequency: "occasionally",
        smoking: false,
        move_in_month: new Date().toISOString().split("T")[0],
        is_verified: isCollegeDomain,
        verification_method: finalVerificationMethod,
        actively_looking: true,
      }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Profile update error during signup:", profileError);
    }

    return NextResponse.json({
      success: true,
      user: userData.user,
      isVerified: isCollegeDomain,
      verificationMethod: finalVerificationMethod,
    });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
