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

      setSuccess("Your profile changes have been saved successfully.");
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
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1 text-xs font-semibold text-primary mb-2">
            Profile settings
          </div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Edit your roommate profile
          </h1>
          <p className="text-sm text-foreground/75 mt-1">
            Update your lifestyle habits, budget, and preferences anytime.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>

      <ProfileStatusManager profile={profile} />

      {error && (
        <div className="rounded-xl border border-[#FF6B4A]/40 bg-[#FF6B4A]/10 p-4 text-sm text-[#FF6B4A]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[#2F7A56]/40 bg-[#2F7A56]/10 p-4 text-sm text-[#2F7A56] flex items-center gap-3">
          <svg
            className="h-5 w-5 text-[#2F7A56] shrink-0"
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
          <span className="font-semibold">{success}</span>
        </div>
      )}

      <ProfileForm
        initialData={profile}
        onSave={handleSave}
        loading={loading}
        submitLabel="Save profile changes"
        isEditing={true}
      />
    </div>
  );
}
