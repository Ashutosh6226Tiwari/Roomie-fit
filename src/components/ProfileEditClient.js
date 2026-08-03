"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import ProfileStatusManager from "@/components/ProfileStatusManager";

export default function ProfileEditClient({ profile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSave = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile.");
        setLoading(false);
        return;
      }

      setSuccess("Your profile changes have been saved successfully!");
      setLoading(false);
      router.refresh();
    } catch (err) {
      console.error("Profile Edit Save exception:", err);
      setError("An unexpected error occurred while saving your changes.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-2">
            Profile Settings
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Edit Your Roommate Profile
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Update your lifestyle habits, budget, and preferences anytime.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* PRD §3.2 & §3.7 Status Toggles and Auto-Expiry control */}
      <ProfileStatusManager profile={profile} />

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-emerald-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <ProfileForm
        initialData={profile}
        onSave={handleSave}
        loading={loading}
        submitLabel="Save Profile Changes →"
        isEditing={true}
      />
    </div>
  );
}
