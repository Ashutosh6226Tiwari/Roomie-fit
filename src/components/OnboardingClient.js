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
        <div className="inline-flex items-center gap-2 rounded-full badge-trust px-3 py-1 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
          <span>Verified student community</span>
        </div>

        <h1 className="font-serif-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Set up your roommate profile
        </h1>

        <p className="text-sm text-foreground/80 max-w-2xl leading-relaxed">
          Tell us about your budget, sleep schedule, cleanliness, and daily routine so we
          can score your lifestyle compatibility with peers in your city.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[#FF6B4A]/40 bg-[#FF6B4A]/10 p-4 text-sm text-[#FF6B4A]">
          {error}
        </div>
      )}

      <ProfileForm
        initialData={profile}
        onSave={handleSave}
        loading={loading}
        submitLabel="Complete profile & view matches"
        isEditing={false}
      />
    </div>
  );
}
