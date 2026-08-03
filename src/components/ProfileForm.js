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
  submitLabel = "Save Profile →",
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

  // Live Character Count for about_me (300 - 500 chars limit per §3.2)
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

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      setPhotoUrl(publicUrlData.publicUrl);
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (Number(budgetMax) < Number(budgetMin)) {
      setFormError("Maximum budget must be at least the minimum budget.");
      return;
    }
    if (aboutCharCount > 0 && aboutCharCount < 300) {
      setFormError(
        `'About me' is ${aboutCharCount} characters. Please provide at least 300 characters so the AI matching engine can accurately parse your lifestyle nuances.`
      );
      return;
    }
    if (aboutCharCount > 500) {
      setFormError(
        `'About me' exceeds the 500-character limit (${aboutCharCount}/500). Please shorten it.`
      );
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      city: city.trim(),
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      gender,
      preferred_roommate_gender: prefGender,
      sleep_schedule: sleepSchedule,
      cleanliness_level: Number(cleanliness),
      food_habits: foodHabits,
      guest_frequency: guestFrequency,
      smoking: Boolean(smoking),
      move_in_month: moveInMonth,
      about_me: aboutMe.trim() || null,
      actively_looking: Boolean(activelyLooking),
      photo_url: photoUrl,
    };

    onSave(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
    >
      {formError && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {formError}
        </div>
      )}

      {/* SECTION 1: Personal Profile & Photo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              1. Basic Information
            </h2>
            <p className="text-xs text-slate-400">
              Your identity and where you are looking to live.
            </p>
          </div>
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            Structured Filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Photo Upload Box */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center space-y-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/60 flex items-center justify-center group hover:border-indigo-500/50 transition-all">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <svg
                    className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors"
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
                  <span className="text-[11px] text-slate-400 mt-1 font-medium">
                    {uploadingPhoto ? "Uploading..." : "Add Photo"}
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
              <span className="text-xs text-red-400">{photoError}</span>
            )}
            <span className="text-[11px] text-slate-500">
              Optional profile picture (5MB max)
            </span>
          </div>

          {/* Name, City & Looking Toggle */}
          <div className="sm:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Target City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  {DEFAULT_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Move-in Timeframe *
                </label>
                <input
                  type="date"
                  required
                  value={moveInMonth}
                  onChange={(e) => setMoveInMonth(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Actively Looking Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white">
                  Actively Looking for Roommates
                </span>
                <p className="text-[11px] text-slate-400">
                  When enabled, your profile appears in top-3 AI matches for
                  other verified students.
                </p>
              </div>
              <input
                type="checkbox"
                checked={activelyLooking}
                onChange={(e) => setActivelyLooking(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Hard Filters (Budget & Genders) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              2. Roommate &amp; Budget Requirements
            </h2>
            <p className="text-xs text-slate-400">
              Used as strict exclusion filters in Step 1 of AI Matching.
            </p>
          </div>
          <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
            Hard Filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Monthly Budget Range */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Monthly Budget Range ($/month) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400">Min Budget ($)</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Max Budget ($)</span>
                <input
                  type="number"
                  min={budgetMin}
                  step="50"
                  required
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Roommate budgets must overlap for compatibility.
            </p>
          </div>

          {/* Gender & Preference */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Your Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Non-binary / Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Preferred Roommate *
                </label>
                <select
                  value={prefGender}
                  onChange={(e) => setPrefGender(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500"
                >
                  <option value="any">Any Gender</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Applied strictly against potential roommates&apos; gender field.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Lifestyle & Habits (Rule-based scoring) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              3. Lifestyle &amp; Living Habits
            </h2>
            <p className="text-xs text-slate-400">
              Used in Step 2 rule-based scoring (sleep, cleanliness, food,
              guests, smoking).
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
            Rule-Based Scoring
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sleep Schedule (20% weight) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Sleep Schedule *
            </label>
            <select
              value={sleepSchedule}
              onChange={(e) => setSleepSchedule(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500"
            >
              <option value="early_bird">Early Bird (Before 11 PM)</option>
              <option value="night_owl">Night Owl (After 12 AM)</option>
              <option value="flexible">Flexible / Varied</option>
            </select>
          </div>

          {/* Cleanliness Level (25% weight) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>Cleanliness Level *</span>
              <span className="text-indigo-400 font-bold">
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
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 - Very Casual</span>
              <span>3 - Neat</span>
              <span>5 - Immaculate</span>
            </div>
          </div>

          {/* Food Habits (15% weight) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Food Habits *
            </label>
            <select
              value={foodHabits}
              onChange={(e) => setFoodHabits(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500"
            >
              <option value="no_preference">No Preference / Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="non_vegetarian">Non-Vegetarian Only</option>
            </select>
          </div>

          {/* Guest Frequency (15% weight) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Guest Frequency *
            </label>
            <select
              value={guestFrequency}
              onChange={(e) => setGuestFrequency(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500"
            >
              <option value="rarely">Rarely (Few guests)</option>
              <option value="occasionally">Occasionally (Weekends)</option>
              <option value="frequently">Frequently (Open door)</option>
            </select>
          </div>

          {/* Smoking Toggle (15% weight) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Do You Smoke? *
              </label>
              <input
                type="checkbox"
                checked={smoking}
                onChange={(e) => setSmoking(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {smoking
                ? "Yes (Smoker)"
                : "No (Non-smoker)"}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: About Me (300 - 500 Char limit per §3.2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              4. About Me (AI Nuance Signal)
            </h2>
            <p className="text-xs text-slate-400">
              Read by Claude AI in Step 3 to discover shared lifestyle vibes &amp;
              red flags.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              isAboutValid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : isAboutOverMax
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
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
            placeholder="Tell future roommates about your typical week, study schedule, hobbies, or what makes a great living environment for you... (min. 300 characters recommended)"
            className={`w-full rounded-2xl border bg-slate-900/60 p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
              isAboutUnderMin
                ? "border-amber-500/40 focus:border-amber-500 focus:ring-amber-500"
                : isAboutOverMax
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                : "border-white/15 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isAboutUnderMin
                  ? "text-amber-300"
                  : isAboutOverMax
                  ? "text-red-400 font-bold"
                  : "text-slate-400"
              }
            >
              {isAboutUnderMin &&
                `Add ${300 - aboutCharCount} more characters for optimal AI compatibility matching (300-500 limit).`}
              {isAboutValid &&
                "Great length! The AI engine will parse this for nuance and lifestyle compatibility."}
            </span>
            <span className="text-slate-500">{aboutCharCount} / 500</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || uploadingPhoto}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40 disabled:opacity-50"
        >
          {loading ? "Saving Profile..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
