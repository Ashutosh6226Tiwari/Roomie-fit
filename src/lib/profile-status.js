import { createAdminClient } from "@/lib/supabase-server";

/**
 * Approach (a): Lazy Check for 30-Day Auto-Expiry per PRD §3.2.
 *
 * Why Approach (a) Lazy Check?
 * - Simpler MVP architecture: avoids setting up and maintaining scheduled cron jobs or edge functions.
 * - Real-time correctness: whenever a profile is read (either by the student on GET /api/profile
 *   or by the matching engine in Prompt 6), if actively_looking is true and
 *   actively_looking_confirmed_at is more than 30 days old, it automatically flips
 *   actively_looking = false in the database and returns the updated profile state.
 *
 * @param {Object} profile - The database profile row.
 * @param {Object} supabase - Optional supabase client (uses Service Role / admin client for update).
 * @returns {Promise<Object>} - The profile (updated if expired).
 */
export async function applyLazyExpiry(profile) {
  if (!profile || !profile.actively_looking || !profile.actively_looking_confirmed_at) {
    return profile;
  }

  const confirmedAtMs = new Date(profile.actively_looking_confirmed_at).getTime();
  if (isNaN(confirmedAtMs)) {
    return profile;
  }

  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  if (nowMs - confirmedAtMs > thirtyDaysMs) {
    console.log(
      `[LazyExpiry] Profile ${profile.user_id} actively_looking_confirmed_at (${profile.actively_looking_confirmed_at}) > 30 days old. Auto-expiring actively_looking to false.`
    );

    try {
      const admin = createAdminClient();
      const { data: expiredProfile, error } = await admin
        .from("profiles")
        .update({
          actively_looking: false,
        })
        .eq("user_id", profile.user_id)
        .select()
        .single();

      if (!error && expiredProfile) {
        return expiredProfile;
      }
      console.error("[LazyExpiry] DB update error:", error?.message);
    } catch (err) {
      console.error("[LazyExpiry] Exception during auto-expiry:", err);
    }
  }

  return profile;
}
