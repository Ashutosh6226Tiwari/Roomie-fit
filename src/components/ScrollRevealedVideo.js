"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollRevealedVideo({
  src,
  poster,
  scrimOpacity = "0.7",
  className = "",
  dimmed = false,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true); // Trigger lazy load
            setIsVisible(true);
            // Only play if we have a video ref and reduce motion is false
            if (videoRef.current && !reduceMotion) {
              // Catch DOMException on play (e.g., auto-play policies)
              videoRef.current.play().catch((e) => console.log("Video play blocked:", e));
            }
          } else {
            setIsVisible(false);
            if (videoRef.current && !reduceMotion) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "200px 0px", // Trigger loading slightly before scrolling into view
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 bg-[#0a0a0f] transition-opacity duration-700 ease-out z-10"
        style={{ opacity: isVisible ? 0 : 1 }}
      />
      {shouldLoad && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: isVisible ? (dimmed ? 0.25 : 1) : 0 }}
          muted
          loop
          playsInline
          poster={poster}
        >
          {!reduceMotion && <source src={src} type="video/mp4" />}
        </video>
      )}
      {!shouldLoad && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${poster})`, opacity: isVisible ? (dimmed ? 0.25 : 1) : 0 }}
        />
      )}
      
      {/* Dark gradient scrim overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, rgba(10,10,15,${scrimOpacity}), rgba(10,10,15,0.35))`,
        }}
      />
    </div>
  );
}
