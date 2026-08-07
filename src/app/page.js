import Link from "next/link";
import {
  HeroFingerprintWatermark,
} from "@/components/CompatibilityFingerprint";
import ScrollRevealedVideo from "@/components/ScrollRevealedVideo";

export const metadata = {
  title: "RoomieMatch — Find a Roommate You'll Actually Get Along With",
  description:
    "Verified college roommate matching based on lifestyle compatibility. We check your college email, match your sleep schedule and living habits, and keep your contact info private until you both say yes.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      <main className="flex-1">
        {/* =====================================================================
            HERO SECTION
            ===================================================================== */}
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 min-h-screen flex items-center">
          <ScrollRevealedVideo 
            src="/videos/hero-loop.mp4" 
            poster="/videos/hero-poster.jpg" 
          />

          {/* Subtle signature element: single large, faint instance of the 6-axis compatibility fingerprint behind hero */}
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 mix-blend-overlay opacity-30">
            <HeroFingerprintWatermark className="w-[420px] h-[420px] sm:w-[540px] sm:h-[540px]" />
          </div>

          <div className="mx-auto max-w-3xl text-center relative z-30 space-y-8">
            {/* Trust Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white shadow-lg">
              <span className="h-2 w-2 rounded-full bg-[#2F7A56]" />
              <span>For verified college students</span>
            </div>

            {/* Editorial Serif Display Headline */}
            <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-lg">
              Find a roommate you&apos;ll actually get along with
            </h1>

            {/* Supporting Sentence */}
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-white/90 leading-relaxed drop-shadow-md">
              We check your college email, match your sleep schedule and living
              habits, and keep your contact info private until you both say yes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[#5B4EE5] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
              >
                Get started
              </Link>

              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white hover:text-white/80 transition-colors underline underline-offset-4 drop-shadow-md"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            HOW IT WORKS SECTION
            ===================================================================== */}
        <section className="relative px-6 py-24 sm:py-32 min-h-screen flex items-center overflow-hidden">
          <ScrollRevealedVideo 
            src="/videos/how-it-works-loop.mp4" 
            poster="/videos/how-it-works-poster.jpg" 
          />

          <div className="mx-auto max-w-5xl space-y-16 relative z-30">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">
                How it works
              </h2>
              <p className="text-base sm:text-lg text-white/80 drop-shadow-md">
                A simple three-step process designed to remove the anxiety from
                choosing your roommate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {/* Step 01 */}
              <div className="space-y-4 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A] drop-shadow-md">
                  01
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                  Create your profile
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Share your sleep schedule, cleanliness habits, guest
                  preferences, and budget in a straightforward 2-minute setup.
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A] drop-shadow-md">
                  02
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                  Get matched
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Our 6-axis compatibility scoring ranks students in your city by
                  how well your daily routines and lifestyle align.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="font-mono-data text-2xl font-bold text-[#FF6B4A] drop-shadow-md">
                  03
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                  Connect once it&apos;s mutual
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Express interest privately. When you both say yes, we unlock
                  your contact info so you can chat with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            TRUST & SAFETY SECTION
            ===================================================================== */}
        <section className="relative px-6 py-24 sm:py-32 min-h-screen flex flex-col justify-center overflow-hidden">
          <ScrollRevealedVideo 
            src="/videos/trust-loop.mp4" 
            poster="/videos/trust-poster.jpg" 
          />

          <div className="mx-auto max-w-4xl space-y-14 relative z-30">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">
                Built for trust on campus
              </h2>
              <p className="text-base sm:text-lg text-white/80 drop-shadow-md">
                We designed RoomieMatch to feel safe, calm, and dependable from
                the moment you sign up.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-3 shadow-2xl">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#4ade80]">
                  <span>✓</span>
                  <span>We check your college email</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  A verified campus community
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Every student verifies their email domain when signing up. You
                  know you are looking at real college peers from your city,
                  not sketchy online strangers.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-3 shadow-2xl">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#818cf8]">
                  <span>🔒</span>
                  <span>Contact info stays private until you both say yes</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  No awkward rejections or unwanted spam
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Your phone number and social media handles are hidden by
                  default. Contact details are only revealed when both of you
                  have explicitly expressed mutual interest.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            FINAL CTA SECTION
            ===================================================================== */}
        <section className="relative px-6 py-32 overflow-hidden flex items-center justify-center">
          <ScrollRevealedVideo 
            src="/videos/hero-loop.mp4" 
            poster="/videos/hero-poster.jpg"
            dimmed={true} 
          />
          
          <div className="relative z-30 text-center space-y-8 max-w-2xl mx-auto bg-black/30 p-10 rounded-3xl backdrop-blur-sm border border-white/10">
            <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              Ready to find a roommate who fits your routine?
            </h3>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto drop-shadow-md">
              Join students in your city using lifestyle scoring to make living
              decisions with confidence.
            </p>
            <div className="pt-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-[#5B4EE5] px-10 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
