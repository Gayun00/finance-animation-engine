import React from "react";
import { AbsoluteFill } from "remotion";

interface CenterLayoutProps {
  children: React.ReactNode;
  gap?: number;
}

export const CenterLayout: React.FC<CenterLayoutProps> = ({
  children,
  gap = 20,
}) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap,
        padding: 80,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
