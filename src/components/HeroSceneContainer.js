"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ZeroGravityHero3D with SSR disabled for pure client-side WebGL canvas rendering
const ZeroGravityHero3D = dynamic(() => import("./ZeroGravityHero3D"), {
  ssr: false,
});

export default function HeroSceneContainer() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      <ZeroGravityHero3D />
    </div>
  );
}
