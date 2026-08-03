import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

// GET /api/admin/metrics
// Internal metrics query per PRD §8 and §3.7.
// Protected by hardcoded admin secret header or query param.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret =
      request.headers.get("x-admin-secret") || searchParams.get("secret");

    // Simple hardcoded admin check per Prompt 11 requirement ("hardcoded admin check or basic auth")
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "roomiematch-admin-2026";
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Forbidden: Invalid admin credentials." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // 1. Total profiles created
    const { count: totalProfiles, error: e1 } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 2. Count with actively_looking = true
    const { count: activelyLookingCount, error: e2 } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("actively_looking", true);

    // 3. Count with found_roommate = true (Primary Success Metric §3.7)
    const { data: foundRoommateProfiles, count: foundRoommateCount, error: e3 } = await admin
      .from("profiles")
      .select("id, full_name, city, found_roommate_at, created_at", { count: "exact" })
      .eq("found_roommate", true);

    // 4. Mutual matches count (unique pairs where both A->B and B->A exist)
    const { data: allInterests, error: e4 } = await admin
      .from("interests")
      .select("from_user_id, to_user_id");

    let mutualPairsCount = 0;
    if (allInterests && allInterests.length > 0) {
      const interestSet = new Set(
        allInterests.map((i) => `${i.from_user_id}->${i.to_user_id}`)
      );
      const seenPairs = new Set();
      for (const row of allInterests) {
        const pairKey = [row.from_user_id, row.to_user_id].sort().join("<->");
        if (
          !seenPairs.has(pairKey) &&
          interestSet.has(`${row.from_user_id}->${row.to_user_id}`) &&
          interestSet.has(`${row.to_user_id}->${row.from_user_id}`)
        ) {
          seenPairs.add(pairKey);
          mutualPairsCount++;
        }
      }
    }

    // 5. Mutual match -> found_roommate conversion rate per §8
    const conversionRate =
      mutualPairsCount > 0
        ? Math.min(100, Math.round(((foundRoommateCount || 0) / mutualPairsCount) * 100))
        : 0;

    // 6. Found roommate over time grouping
    const overTimeMap = {};
    for (const p of foundRoommateProfiles || []) {
      const dateKey = (p.found_roommate_at || p.created_at || new Date().toISOString())
        .slice(0, 10);
      overTimeMap[dateKey] = (overTimeMap[dateKey] || 0) + 1;
    }
    const foundRoommateOverTime = Object.entries(overTimeMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalProfiles: totalProfiles || 0,
        activelyLookingCount: activelyLookingCount || 0,
        foundRoommateCount: foundRoommateCount || 0,
        mutualPairsCount: mutualPairsCount,
        conversionRate: `${conversionRate}%`,
        foundRoommateOverTime: foundRoommateOverTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/metrics] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
