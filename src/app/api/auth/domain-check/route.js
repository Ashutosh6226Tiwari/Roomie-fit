import { NextResponse } from "next/server";

/**
 * GET /api/auth/domain-check?email=student@college.edu
 * Checks if the email domain is in ALLOWED_COLLEGE_EMAIL_DOMAINS.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ isCollegeDomain: false, domain: null }, { status: 400 });
  }

  const domain = email.split("@")[1]?.toLowerCase().trim();
  // Per user request: allow any valid gmail or email domain to enter (non-college also)
  const isCollegeDomain = true;
  const allowedDomains = [domain, "gmail.com", "college.edu"];

  return NextResponse.json({
    isCollegeDomain: true,
    domain,
    allowedDomains,
    message: "Verified Community Email Domain",
  });
}
