import Link from "next/link";
import {
  HeroFingerprintWatermark,
  FingerprintLogo,
} from "@/components/CompatibilityFingerprint";

export const metadata = {
  title: "RoomieMatch — Find a Roommate You'll Actually Get Along With",
  description:
    "Verified college roommate matching based on lifestyle compatibility. We check your college email, match your sleep schedule and living habits, and keep your contact info private until you both say yes.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#17151F]">
      <main className="flex-1">
        {/* =====================================================================
            HERO SECTION
            Warm, credible, calm editorial serif headline with signature watermark
            ===================================================================== */}
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 bg-[#FFFFFF]">
          {/* Subtle signature element: single large, faint instance of the 6-axis compatibility fingerprint behind hero */}
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <HeroFingerprintWatermark className="w-[420px] h-[420px] sm:w-[540px] sm:h-[540px]" />
          </div>

          <div className="mx-auto max-w-3xl text-center relative z-10 space-y-8">
            {/* Trust Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full badge-trust px-3.5 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
              <span>For verified college students</span>
            </div>

            {/* Editorial Serif Display Headline (Fraunces 600-700, flat #17151F ink, no gradient) */}
            <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#17151F] leading-[1.08]">
              Find a roommate you&apos;ll actually get along with
            </h1>

            {/* Supporting Sentence in Inter */}
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#17151F]/80 leading-relaxed">
              We check your college email, match your sleep schedule and living
              habits, and keep your contact info private until you both say yes.
            </p>

            {/* CTA Buttons: Single primary button (flat #5B4EE5) + secondary text link */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto btn-primary-flat inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-semibold shadow-sm"
              >
                Get started
              </Link>

              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#17151F] hover:text-[#5B4EE5] transition-colors underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            HOW IT WORKS SECTION
            Set on alternating flat #F1EFFC secondary background tint
            Numbered sequence with plain numerals (01, 02, 03) in IBM Plex Mono
            ===================================================================== */}
        <section className="bg-lilac-section px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl space-y-16">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#17151F]">
                How it works
              </h2>
              <p className="text-base text-[#17151F]/75">
                A simple three-step process designed to remove the anxiety from
                choosing your roommate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {/* Step 01 */}
              <div className="space-y-4">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A]">
                  01
                </div>
                <h3 className="text-lg font-semibold text-[#17151F]">
                  Create your profile
                </h3>
                <p className="text-sm text-[#17151F]/75 leading-relaxed">
                  Share your sleep schedule, cleanliness habits, guest
                  preferences, and budget in a straightforward 2-minute setup.
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A]">
                  02
                </div>
                <h3 className="text-lg font-semibold text-[#17151F]">
                  Get matched
                </h3>
                <p className="text-sm text-[#17151F]/75 leading-relaxed">
                  Our 6-axis compatibility scoring ranks students in your city by
                  how well your daily routines and lifestyle align.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A]">
                  03
                </div>
                <h3 className="text-lg font-semibold text-[#17151F]">
                  Connect once it&apos;s mutual
                </h3>
                <p className="text-sm text-[#17151F]/75 leading-relaxed">
                  Express interest privately. When you both say yes, we unlock
                  your contact info so you can chat with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            TRUST & SAFETY SECTION
            Plain language explanation of email verification & contact privacy
            ===================================================================== */}
        <section className="bg-[#FFFFFF] px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#17151F]">
                Built for trust on campus
              </h2>
              <p className="text-base text-[#17151F]/75">
                We designed RoomieMatch to feel safe, calm, and dependable from
                the moment you sign up.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-clean rounded-2xl p-8 space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F7A56]">
                  <span>✓</span>
                  <span>We check your college email</span>
                </div>
                <h3 className="text-lg font-bold text-[#17151F]">
                  A verified campus community
                </h3>
                <p className="text-sm text-[#17151F]/75 leading-relaxed">
                  Every student verifies their email domain when signing up. You
                  know you are looking at real college peers from your city,
                  not sketchy online strangers.
                </p>
              </div>

              <div className="card-clean rounded-2xl p-8 space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B4EE5]">
                  <span>🔒</span>
                  <span>Contact info stays private until you both say yes</span>
                </div>
                <h3 className="text-lg font-bold text-[#17151F]">
                  No awkward rejections or unwanted spam
                </h3>
                <p className="text-sm text-[#17151F]/75 leading-relaxed">
                  Your phone number and social media handles are hidden by
                  default. Contact details are only revealed when both of you
                  have explicitly expressed mutual interest.
                </p>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="bg-lilac-section rounded-3xl p-8 sm:p-12 text-center space-y-6">
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#17151F]">
                Ready to find a roommate who fits your routine?
              </h3>
              <p className="text-sm sm:text-base text-[#17151F]/75 max-w-xl mx-auto">
                Join students in your city using lifestyle scoring to make living
                decisions with confidence.
              </p>
              <div>
                <Link
                  href="/sign-up"
                  className="btn-primary-flat inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-semibold shadow-sm"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER
          Clean, white background, no decorative bars or gradients
          ===================================================================== */}
      <footer className="border-t border-[#E4E1F2] bg-[#FFFFFF] py-10 px-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#17151F]/70">
          <div className="flex items-center gap-2">
            <FingerprintLogo className="h-5 w-5" color="#5B4EE5" />
            <span className="font-semibold text-[#17151F]">RoomieMatch</span>
            <span className="text-xs">
              © {new Date().getFullYear()} RoomieMatch. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/sign-in"
              className="hover:text-[#5B4EE5] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hover:text-[#5B4EE5] transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/admin/metrics"
              className="hover:text-[#5B4EE5] transition-colors"
            >
              System Metrics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
