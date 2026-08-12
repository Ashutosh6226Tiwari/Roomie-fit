"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileStatusManager({ profile, onStatusUpdate }) {
  const [activelyLooking, setActivelyLooking] = useState(
    profile?.actively_looking !== false
  );
  const [foundRoommate, setFoundRoommate] = useState(
    profile?.found_roommate === true
  );
  const [confirmedAt, setConfirmedAt] = useState(
    profile?.actively_looking_confirmed_at
  );
  const [foundAt, setFoundAt] = useState(profile?.found_roommate_at);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const handleToggleLooking = async () => {
    if (loading || foundRoommate) return;

    setLoading(true);
    setToastMessage("");
    const newLookingState = !activelyLooking;

    try {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actively_looking: newLookingState }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update status.");
        setLoading(false);
        return;
      }

      setActivelyLooking(newLookingState);
      if (newLookingState) {
        setConfirmedAt(
          data.profile?.actively_looking_confirmed_at || new Date().toISOString()
        );
        setToastMessage(
          "✅ You are now actively looking! 30-day auto-expiry timer reset."
        );
      } else {
        setToastMessage(
          "⏸️ Profile paused. You will not appear in roommate matches."
        );
      }

      if (onStatusUpdate && data.profile) {
        onStatusUpdate(data.profile);
      }
      router.refresh();
    } catch (err) {
      console.error("Toggle actively_looking error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFoundRoommate = async () => {
    setLoading(true);
    setShowConfirmModal(false);
    setToastMessage("");

    try {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ found_roommate: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to record roommate found.");
        setLoading(false);
        return;
      }

      setFoundRoommate(true);
      setActivelyLooking(false);
      setFoundAt(data.profile?.found_roommate_at || new Date().toISOString());
      setToastMessage(
        "🎉 Congratulations on finding your roommate! Your profile is now hidden from roommate search."
      );

      if (onStatusUpdate && data.profile) {
        onStatusUpdate(data.profile);
      }
      router.refresh();
    } catch (err) {
      console.error("Found roommate error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSearch = async () => {
    if (loading) return;
    setLoading(true);
    setToastMessage("");

    try {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ found_roommate: false, actively_looking: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to re-activate profile.");
        setLoading(false);
        return;
      }

      setFoundRoommate(false);
      setActivelyLooking(true);
      setFoundAt(null);
      setConfirmedAt(
        data.profile?.actively_looking_confirmed_at || new Date().toISOString()
      );
      setToastMessage(
        "✅ Profile re-activated! You are now actively looking for roommates again."
      );

      if (onStatusUpdate && data.profile) {
        onStatusUpdate(data.profile);
      }
      router.refresh();
    } catch (err) {
      console.error("Re-activate search error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="card-clean rounded-2xl p-6 md:p-8 bg-card space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary mb-2">
            Search &amp; availability controls
          </div>
          <h2 className="text-xl font-bold text-foreground">Roommate search status</h2>
          <p className="text-sm text-muted-foreground">
            Control your visibility in matching and record your roommate success.
          </p>
        </div>

        {/* Status indicator pill */}
        <div>
          {foundRoommate ? (
            <span className="inline-flex items-center gap-2 rounded-full badge-trust px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2F7A56]">
              <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
              Roommate found 🎉
            </span>
          ) : activelyLooking ? (
            <span className="inline-flex items-center gap-2 rounded-full badge-trust px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2F7A56]">
              <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
              Actively looking
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[#17151F]/40" />
              Paused / inactive
            </span>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-sm text-indigo-200 flex items-center gap-3">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Toggles & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle 1: Actively Looking */}
        <div
          className={`rounded-2xl border p-5 transition-all ${
            foundRoommate
              ? "border-white/5 bg-black/20 opacity-60"
              : activelyLooking
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-white/10 bg-card/5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Actively Looking</h3>
              <p className="text-xs text-slate-400 mt-1">
                {foundRoommate
                  ? "Disabled because you marked roommate found."
                  : activelyLooking
                  ? `Confirmed on ${formatDate(confirmedAt) || "Today"}. Auto-pauses after 30 days of inactivity.`
                  : "Paused. You are hidden from other students' searches."}
              </p>
            </div>

            <button
              type="button"
              disabled={loading || foundRoommate}
              onClick={handleToggleLooking}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                activelyLooking && !foundRoommate
                  ? "bg-emerald-500"
                  : "bg-slate-700"
              } ${loading || foundRoommate ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                  activelyLooking && !foundRoommate
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Toggle 2: Found Roommate */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Did you find your roommate?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {foundRoommate
                ? `Recorded success on ${
                    formatDate(foundAt) || "Today"
                  }. Your profile is removed from matching searches.`
                : "Marking this records your roommate match success and removes your profile from searches."}
            </p>
          </div>

          <div className="pt-4">
            {foundRoommate ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleReactivateSearch}
                className="w-full rounded-xl border border-white/20 bg-card/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-card/15 transition-colors"
              >
                Re-activate Profile (I am looking again)
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirmModal(true)}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-foreground shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                🎉 I Found My Roommate!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl">
                🎉
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Confirm Roommate Found!
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Congratulations! Confirming this will record your match success
              and remove your profile from all future roommate search results.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-white/15 bg-card/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-card/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmFoundRoommate}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-foreground shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                {loading ? "Recording..." : "Yes, I Found My Roommate! 🎊"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
