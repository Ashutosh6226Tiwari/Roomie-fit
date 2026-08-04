"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default function OnboardingClient({ profile, userEmail }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create profile.");
        setLoading(false);
        return;
      }

      // Successful onboarding save -> redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Onboarding Save exception:", err);
      setError("An unexpected error occurred while saving your profile.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          College Domain Verified ({profile?.verification_method || "college_email"})
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Set Up Your Roommate Profile
        </h1>

        <p className="text-base text-slate-300 max-w-2xl">
          Tell us about your budget, sleep habits, cleanliness, and preferences so our
          AI engine can match you with compatible roommates.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <ProfileForm
        initialData={profile}
        onSave={handleSave}
        loading={loading}
        submitLabel="Complete Onboarding & View Matches →"
        isEditing={false}
      />
    </div>
  );
}
