"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { FingerprintLogo } from "@/components/CompatibilityFingerprint";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domainStatus, setDomainStatus] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [idFilePreview, setIdFilePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

      // Allow any valid email per user request
      const isCollegeDomain = true;

      // 1. Create account via server signup API
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
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#FFFFFF] px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[#E4E1F2] bg-[#FFFFFF] p-8 shadow-sm">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <FingerprintLogo className="h-9 w-9" color="#5B4EE5" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight text-[#17151F]">
            Create your account
          </h1>
          <p className="text-sm text-[#17151F]/70">
            Connect with verified peers who share your routine and living habits.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-[#FF6B4A]/40 bg-[#FF6B4A]/10 p-3.5 text-xs text-[#FF6B4A]">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#E4E1F2] bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#17151F] transition-colors hover:bg-[#F1EFFC] disabled:opacity-50"
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
          <div className="w-full border-t border-[#E4E1F2]" />
          <span className="absolute bg-[#FFFFFF] px-3 text-xs uppercase tracking-wider text-[#17151F]/40">
            or sign up with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17151F]">
              Full name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E4E1F2] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#17151F] placeholder-[#17151F]/40 focus:border-[#5B4EE5] focus:outline-none focus:ring-1 focus:ring-[#5B4EE5]"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17151F]">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex@gmail.com or alex@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#E4E1F2] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#17151F] placeholder-[#17151F]/40 focus:border-[#5B4EE5] focus:outline-none focus:ring-1 focus:ring-[#5B4EE5]"
            />

            {activeDomainStatus && (
              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-lg badge-trust px-3 py-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
                  <span>
                    Valid email address (@{activeDomainStatus.domain}). Community
                    matching enabled!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17151F]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#E4E1F2] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#17151F] placeholder-[#17151F]/40 focus:border-[#5B4EE5] focus:outline-none focus:ring-1 focus:ring-[#5B4EE5]"
            />
          </div>

          {activeDomainStatus && !activeDomainStatus.isCollegeDomain && (
            <div className="space-y-2 rounded-xl border border-[#E4E1F2] bg-[#F1EFFC] p-4">
              <label className="block text-xs font-bold text-[#17151F]">
                Upload Student ID Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-[#17151F]/70 file:mr-3 file:rounded-lg file:border-0 file:bg-[#5B4EE5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#4A3DD1]"
              />
              {idFilePreview && (
                <div className="mt-2">
                  <img
                    src={idFilePreview}
                    alt="ID Card preview"
                    className="h-24 rounded-lg border border-[#E4E1F2] object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-flat rounded-lg px-6 py-3 text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Get started"}
          </button>
        </form>

        <p className="text-center text-xs text-[#17151F]/70">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#5B4EE5] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
