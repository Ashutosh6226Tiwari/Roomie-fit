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
  const allowedDomainsEnv = process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS || "college.edu";
  const allowedDomains = allowedDomainsEnv
    .split(",")
    .map((d) => d.trim().toLowerCase());

  const isCollegeDomain = allowedDomains.includes(domain);

  return NextResponse.json({
    isCollegeDomain,
    domain,
    allowedDomains,
  });
}
