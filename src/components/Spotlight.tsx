import React from "react";
import { AbsoluteFill } from "remotion";

interface SpotlightProps {
  /** Center X position */
  x?: number;
  /** Center Y position */
  y?: number;
  /** Spotlight radius in px */
  radius?: number;
  /** Opacity of the dim area (0-1) */
  dimOpacity?: number;
  /** Dim color */
  dimColor?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  x = 960,
  y = 540,
  radius = 300,
  dimOpacity = 0.7,
  dimColor = "#000000",
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 0%, transparent 100%), ${dimColor}`,
        maskImage: `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 0%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 0%, black 100%)`,
        opacity: dimOpacity,
        pointerEvents: "none",
      }}
    />
  );
};
