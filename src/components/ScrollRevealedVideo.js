"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function ScrollRevealedVideo({
  src,
  poster,
  scrimOpacity = "0.7",
  className = "",
  videoOpacity = 1,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Refs for race-condition guards and debouncing
  const hasLoadedRef = useRef(false);
  const playPromiseRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // 1. Guard first play attempt on data readiness
  const handleLoadedData = useCallback(() => {
    hasLoadedRef.current = true;
    if (isVisible && !reduceMotion) {
      safePlay();
    }
  }, [isVisible, reduceMotion]);

  // 2. Safe play handling (treat as Promise)
  const safePlay = async () => {
    if (!videoRef.current || reduceMotion) return;
    try {
      const p = videoRef.current.play();
      playPromiseRef.current = p;
      if (p !== undefined) {
        await p;
      }
    } catch (err) {
      // Ignore AbortError / NotAllowedError
      // Don't throw or break state
    }
  };

  // 2. Safe pause handling (wait for pending play promise)
  const safePause = async () => {
    if (!videoRef.current || reduceMotion) return;
    
    // 5. State guard: wait for any in-flight play() promise to settle first
    if (playPromiseRef.current !== undefined && playPromiseRef.current !== null) {
      try {
        await playPromiseRef.current;
      } catch (err) {
        // Ignore errors from the play promise
      }
    }
    
    // Once settled, safe to pause
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

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
          const isIntersecting = entry.isIntersecting;

          // 3. Debounce the IntersectionObserver callback
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          
          debounceTimeoutRef.current = setTimeout(() => {
            if (isIntersecting) {
              setShouldLoad(true); // Trigger lazy load
              setIsVisible(true);
              
              // Only attempt play if data has loaded
              if (hasLoadedRef.current && !reduceMotion) {
                safePlay();
              }
            } else {
              setIsVisible(false);
              if (!reduceMotion) {
                safePause();
              }
            }
          }, 150);
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
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
          style={{ opacity: isVisible ? videoOpacity : 0 }}
          muted={true}
          loop
          playsInline
          preload="auto"
          poster={poster}
          onLoadedData={handleLoadedData}
        >
          {!reduceMotion && <source src={src} type="video/mp4" />}
        </video>
      )}
      {!shouldLoad && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${poster})`, opacity: isVisible ? videoOpacity : 0 }}
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
