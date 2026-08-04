"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

const DEFAULT_CITIES = [
  "Campus City",
  "Cambridge, MA",
  "Stanford, CA",
  "Berkeley, CA",
  "New York, NY",
  "Austin, TX",
  "Ann Arbor, MI",
  "Los Angeles, CA",
  "Chicago, IL",
];

export default function ProfileForm({
  initialData = null,
  onSave,
  loading = false,
  submitLabel = "Save profile",
  isEditing = false,
}) {
  const supabase = createClient();

  // Form State
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Campus City");
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(1500);
  const [gender, setGender] = useState("other");
  const [prefGender, setPrefGender] = useState("any");
  const [sleepSchedule, setSleepSchedule] = useState("flexible");
  const [cleanliness, setCleanliness] = useState(3);
  const [foodHabits, setFoodHabits] = useState("no_preference");
  const [guestFrequency, setGuestFrequency] = useState("occasionally");
  const [smoking, setSmoking] = useState(false);
  const [moveInMonth, setMoveInMonth] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [activelyLooking, setActivelyLooking] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);

  // Upload UI state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");

  // Initialize from initialData if provided
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || "");
      setCity(initialData.city || "Campus City");
      setBudgetMin(initialData.budget_min ?? 500);
      setBudgetMax(initialData.budget_max ?? 1500);
      setGender(initialData.gender || "other");
      setPrefGender(initialData.preferred_roommate_gender || "any");
      setSleepSchedule(initialData.sleep_schedule || "flexible");
      setCleanliness(initialData.cleanliness_level ?? 3);
      setFoodHabits(initialData.food_habits || "no_preference");
      setGuestFrequency(initialData.guest_frequency || "occasionally");
      setSmoking(Boolean(initialData.smoking));
      setMoveInMonth(
        initialData.move_in_month
          ? initialData.move_in_month.substring(0, 10)
          : new Date().toISOString().substring(0, 10)
      );
      setAboutMe(initialData.about_me || "");
      setActivelyLooking(initialData.actively_looking ?? true);
      setPhotoUrl(initialData.photo_url || null);
    } else {
      setMoveInMonth(new Date().toISOString().substring(0, 10));
    }
  }, [initialData]);

  // Live Character Count for about_me
  const aboutCharCount = aboutMe.length;
  const isAboutUnderMin = aboutCharCount > 0 && aboutCharCount < 300;
  const isAboutOverMax = aboutCharCount > 500;
  const isAboutValid =
    aboutCharCount === 0 || (aboutCharCount >= 300 && aboutCharCount <= 500);

  // Photo Upload Handler (to Supabase Storage public bucket 'profile-photos')
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPhotoError("You must be signed in to upload a photo.");
        setUploadingPhoto(false);
        return;
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Photo size must be under 5MB.");
        setUploadingPhoto(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        setPhotoError(
          "Storage bucket 'profile-photos' error: " + uploadErr.message
        );
        setUploadingPhoto(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (err) {
      console.error("Photo Upload error:", err);
      setPhotoError("An unexpected error occurred while uploading your photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName || !city || !moveInMonth) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (Number(budgetMin) > Number(budgetMax)) {
      setFormError("Minimum budget cannot be higher than maximum budget.");
      return;
    }

    if (aboutCharCount > 500) {
      setFormError(
        "About Me description must be 500 characters or fewer."
      );
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      city,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      gender,
      preferred_roommate_gender: prefGender,
      sleep_schedule: sleepSchedule,
      cleanliness_level: Number(cleanliness),
      food_habits: foodHabits,
      guest_frequency: guestFrequency,
      smoking,
      move_in_month: new Date(moveInMonth).toISOString(),
      about_me: aboutMe.trim(),
      actively_looking: activelyLooking,
      photo_url: photoUrl,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {formError && (
        <div className="rounded-xl border border-[#FF6B4A]/40 bg-[#FF6B4A]/10 p-4 text-sm text-[#FF6B4A]">
          {formError}
        </div>
      )}

      {/* SECTION 1: Personal Profile & Photo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              1. Basic information
            </h2>
            <p className="text-xs text-foreground/70">
              Your identity and target campus city.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            Structured filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Photo Upload Box */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center space-y-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary flex items-center justify-center group hover:border-primary/50 transition-all">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <svg
                    className="h-8 w-8 text-foreground/50 group-hover:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-[11px] text-foreground/60 mt-1 font-medium">
                    {uploadingPhoto ? "Uploading..." : "Add photo"}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            {photoError && (
              <span className="text-xs text-[#FF6B4A]">{photoError}</span>
            )}
            <span className="text-[11px] text-foreground/60">
              Optional photo (5MB max)
            </span>
          </div>

          {/* Name, City & Looking Toggle */}
          <div className="sm:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Full name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  Target city *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                >
                  {DEFAULT_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  Move-in timeframe *
                </label>
                <input
                  type="date"
                  required
                  value={moveInMonth}
                  onChange={(e) => setMoveInMonth(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Actively Looking Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Actively looking for roommates
                </span>
                <p className="text-[11px] text-foreground/70">
                  When enabled, your profile appears in matches for other students.
                </p>
              </div>
              <input
                type="checkbox"
                checked={activelyLooking}
                onChange={(e) => setActivelyLooking(e.target.checked)}
                className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Hard Filters (Budget & Genders) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              2. Budget &amp; preferences
            </h2>
            <p className="text-xs text-foreground/70">
              Used as strict exclusion filters in roommate matching.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            Exclusion filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Monthly Budget Range */}
          <div className="card-clean space-y-3 rounded-2xl p-5 bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Monthly budget range ($/month) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-foreground/70">Min budget ($)</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-foreground/70">Max budget ($)</span>
                <input
                  type="number"
                  min={budgetMin}
                  step="50"
                  required
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-foreground/60">
              Roommate budgets must overlap for compatibility.
            </p>
          </div>

          {/* Gender & Preference */}
          <div className="card-clean space-y-3 rounded-2xl p-5 bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                  Your gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary"
                >
                  <option value="male" className="bg-card text-foreground">Male</option>
                  <option value="female" className="bg-card text-foreground">Female</option>
                  <option value="other" className="bg-card text-foreground">Non-binary / Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                  Preferred roommate *
                </label>
                <select
                  value={prefGender}
                  onChange={(e) => setPrefGender(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary"
                >
                  <option value="any" className="bg-card text-foreground">Any gender</option>
                  <option value="male" className="bg-card text-foreground">Male only</option>
                  <option value="female" className="bg-card text-foreground">Female only</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-foreground/60">
              Applied strictly against potential roommates&apos; gender field.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Lifestyle & Habits */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              3. Lifestyle &amp; living habits
            </h2>
            <p className="text-xs text-foreground/70">
              Used in compatibility scoring (sleep, cleanliness, food, guests, smoking).
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            Lifestyle scoring
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sleep Schedule */}
          <div className="card-clean space-y-2 rounded-2xl p-4 bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Sleep schedule *
            </label>
            <select
              value={sleepSchedule}
              onChange={(e) => setSleepSchedule(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="early_bird" className="bg-card text-foreground">Early bird (Before 11 PM)</option>
              <option value="night_owl" className="bg-card text-foreground">Night owl (After 12 AM)</option>
              <option value="flexible" className="bg-card text-foreground">Flexible / varied</option>
            </select>
          </div>

          {/* Cleanliness Level */}
          <div className="card-clean space-y-2 rounded-2xl p-4 bg-card">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-foreground/80">
              <span>Cleanliness level *</span>
              <span className="font-mono-data text-primary font-bold">
                {cleanliness} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={cleanliness}
              onChange={(e) => setCleanliness(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground/60">
              <span>1 - Casual</span>
              <span>3 - Neat</span>
              <span>5 - Immaculate</span>
            </div>
          </div>

          {/* Food Habits */}
          <div className="card-clean space-y-2 rounded-2xl p-4 bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Food habits *
            </label>
            <select
              value={foodHabits}
              onChange={(e) => setFoodHabits(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="no_preference" className="bg-card text-foreground">No preference</option>
              <option value="vegetarian" className="bg-card text-foreground">Vegetarian</option>
              <option value="vegan" className="bg-card text-foreground">Vegan</option>
              <option value="non_vegetarian" className="bg-card text-foreground">Non-vegetarian</option>
            </select>
          </div>

          {/* Guest Frequency */}
          <div className="card-clean space-y-2 rounded-2xl p-4 bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Guest frequency *
            </label>
            <select
              value={guestFrequency}
              onChange={(e) => setGuestFrequency(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="rarely" className="bg-card text-foreground">Rarely (Few guests)</option>
              <option value="occasionally" className="bg-card text-foreground">Occasionally (Weekends)</option>
              <option value="frequently" className="bg-card text-foreground">Frequently (Open door)</option>
            </select>
          </div>

          {/* Smoking Toggle */}
          <div className="card-clean space-y-2 rounded-2xl p-4 bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Do you smoke? *
              </label>
              <input
                type="checkbox"
                checked={smoking}
                onChange={(e) => setSmoking(e.target.checked)}
                className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary"
              />
            </div>
            <p className="text-[11px] text-foreground/70">
              {smoking ? "Yes (Smoker)" : "No (Non-smoker)"}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: About Me */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              4. About me
            </h2>
            <p className="text-xs text-foreground/70">
              Helps peers discover shared lifestyle vibes &amp; routine nuances.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              isAboutValid
                ? "bg-[#2F7A56]/10 border-[#2F7A56]/30 text-[#2F7A56]"
                : isAboutOverMax
                ? "bg-[#FF6B4A]/10 border-[#FF6B4A]/30 text-[#FF6B4A]"
                : "bg-secondary border-border text-foreground/70"
            }`}
          >
            {aboutCharCount} / 500 characters
          </span>
        </div>

        <div className="space-y-2">
          <textarea
            rows={5}
            maxLength={500}
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="Tell future roommates about your typical week, study schedule, hobbies, or what makes a great living environment for you... (300 characters recommended)"
            className={`w-full rounded-2xl border bg-card p-4 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 transition-all ${
              isAboutUnderMin
                ? "border-border focus:border-primary focus:ring-primary"
                : isAboutOverMax
                ? "border-[#FF6B4A]/50 focus:border-[#FF6B4A] focus:ring-[#FF6B4A]"
                : "border-border focus:border-primary focus:ring-primary"
            }`}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isAboutUnderMin
                  ? "text-foreground/70"
                  : isAboutOverMax
                  ? "text-[#FF6B4A] font-bold"
                  : "text-foreground/70"
              }
            >
              {isAboutUnderMin &&
                `Add ${300 - aboutCharCount} more characters for optimal compatibility matching (300-500 recommended).`}
              {isAboutValid &&
                "Great length! Your future roommates will get a clear picture of your routine."}
            </span>
            <span className="font-mono-data text-foreground/60">{aboutCharCount} / 500</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || uploadingPhoto}
          className="btn-primary-flat w-full rounded-2xl px-8 py-4 text-base font-bold shadow-sm transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Saving profile..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
