"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domainStatus, setDomainStatus] = useState(null); // { isCollegeDomain, domain, allowedDomains }
  const [idFile, setIdFile] = useState(null);
  const [idFilePreview, setIdFilePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check domain whenever valid email changes
  useEffect(() => {
    if (!email || !email.includes("@")) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/domain-check?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setDomainStatus(data);
        }
      } catch (err) {
        console.error("Domain check error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const activeDomainStatus =
    !email || !email.includes("@") ? null : domainStatus;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      setIdFilePreview(URL.createObjectURL(file));
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error("Google OAuth exception:", err);
      setError("Failed to initiate Google sign in.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name || !email || !password) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const isCollegeDomain = activeDomainStatus?.isCollegeDomain || false;

      // If non-college domain, require student ID upload
      if (!isCollegeDomain && !idFile) {
        setError(
          "Because you entered a non-college email domain, you must upload a photo of your Student ID."
        );
        setLoading(false);
        return;
      }

      // 1. Create account via server signup API (auto-confirm email for MVP simplicity)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          verificationMethod: isCollegeDomain
            ? "college_email"
            : "student_id_pending",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // 2. Sign in immediately to establish user session
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(
          `Account created, but automatic sign in failed: ${signInError.message}`
        );
        setLoading(false);
        return;
      }

      const userId = signInData.user?.id;

      // 3. If non-college domain, upload Student ID image to Supabase Storage bucket 'student-ids'
      if (!isCollegeDomain && idFile && userId) {
        const fileExt = idFile.name.split(".").pop() || "jpg";
        const filePath = `${userId}/id_card.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("student-ids")
          .upload(filePath, idFile, { upsert: true });

        if (uploadError) {
          console.error("Student ID upload error:", uploadError);
          setError(
            `Account created, but Student ID image upload had an issue: ${uploadError.message}. Our team will review.`
          );
        }
      }

      // Redirect to onboarding
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      console.error("Signup exception:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Create Your Account
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Join RoomieMatch
          </h1>
          <p className="text-sm text-slate-400">
            Connect with verified college roommates who share your lifestyle.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/25 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.8c-.2-.7-.4-1.6-.4-2.8s.2-2.1.4-2.8L1.6 6.4C.6 8.4 0 10.1 0 12s.6 3.6 1.6 5.6l3.7-2.8z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 16c1.9 3.8 5.8 7 10.4 7z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-500">
            or sign up with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              College Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />

            {/* Domain check visual feedback */}
            {activeDomainStatus && (
              <div className="mt-2">
                {activeDomainStatus.isCollegeDomain ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>
                      College domain verified (
                      <strong>@{activeDomainStatus.domain}</strong>). Automatic
                      verification enabled!
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>
                        Non-college email domain (@{activeDomainStatus.domain})
                      </span>
                    </div>
                    <p className="text-amber-200/80">
                      You can still sign up, but you must upload a Student ID photo
                      below for manual verification.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* CONDITIONAL: Student ID Upload step if non-college domain */}
          {activeDomainStatus && !activeDomainStatus.isCollegeDomain && (
            <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                Upload Student ID Photo (Required)
              </label>
              <p className="text-xs text-slate-400">
                Your uploaded ID will be stored in our secure private bucket for
                manual review by our team.
              </p>
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-slate-900/40 p-6 text-center hover:border-indigo-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                {idFilePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={idFilePreview}
                      alt="Student ID Preview"
                      className="h-24 w-auto rounded-lg object-cover border border-white/20"
                    />
                    <span className="text-xs font-medium text-emerald-400">
                      {idFile?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click or drag to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-300">
                      Click to upload or drag &amp; drop
                    </div>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, or WEBP (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
