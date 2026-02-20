import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface GradientOrbProps {
  color?: string;
  size?: number; // pixels
  x?: number; // percentage 0-100
  y?: number; // percentage 0-100
  pulseSpeed?: number; // multiplier, 1 = default
  opacity?: number;
  blur?: number; // pixels
}

export const GradientOrb: React.FC<GradientOrbProps> = ({
  color = "#4FC3F7",
  size = 300,
  x = 50,
  y = 50,
  pulseSpeed = 1,
  opacity = 0.15,
  blur = 60,
}) => {
  const frame = useCurrentFrame();

  // Slow position drift
  const driftX = interpolate(
    Math.sin(frame * 0.008 * pulseSpeed),
    [-1, 1],
    [-15, 15]
  );
  const driftY = interpolate(
    Math.cos(frame * 0.006 * pulseSpeed),
    [-1, 1],
    [-10, 10]
  );

  // Size pulse
  const scale = interpolate(
    Math.sin(frame * 0.015 * pulseSpeed),
    [-1, 1],
    [0.85, 1.15]
  );

  // Opacity pulse
  const opacityPulse = interpolate(
    Math.sin(frame * 0.012 * pulseSpeed + 1),
    [-1, 1],
    [opacity * 0.6, opacity]
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(${scale})`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: `blur(${blur}px)`,
          opacity: opacityPulse,
        }}
      />
    </AbsoluteFill>
  );
};
