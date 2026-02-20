import React from "react";
import { AbsoluteFill } from "remotion";
import { Spotlight } from "./Spotlight";

interface FocusLayoutProps {
  children: React.ReactNode;
  /** Spotlight center X */
  focusX?: number;
  /** Spotlight center Y */
  focusY?: number;
  /** Spotlight radius */
  radius?: number;
  /** Dim area opacity */
  dimOpacity?: number;
}

export const FocusLayout: React.FC<FocusLayoutProps> = ({
  children,
  focusX = 960,
  focusY = 540,
  radius = 300,
  dimOpacity = 0.7,
}) => {
  return (
    <AbsoluteFill>
      {/* Content behind spotlight */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </AbsoluteFill>
      {/* Spotlight overlay dims everything except focus area */}
      <Spotlight
        x={focusX}
        y={focusY}
        radius={radius}
        dimOpacity={dimOpacity}
      />
    </AbsoluteFill>
  );
};
