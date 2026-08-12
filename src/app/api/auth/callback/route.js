import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // [MVP OVERRIDE] We are temporarily bypassing domain verification.
      const REQUIRE_DOMAIN_VERIFICATION = false;
      
      if (!REQUIRE_DOMAIN_VERIFICATION && data?.user) {
        // Auto-verify OAuth users (trigger might have set them to student_id_pending)
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from("profiles")
          .update({ is_verified: true, verification_method: "email_verified" })
          .eq("user_id", data.user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("OAuth exchangeCodeForSession error:", error);
  }

  return NextResponse.redirect(`${origin}/sign-in?error=OAuthCallbackError`);
}
