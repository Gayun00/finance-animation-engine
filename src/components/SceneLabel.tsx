import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TYPOGRAPHY } from "../theme/typography";

type LabelPosition = "top-left" | "top-right" | "bottom-left";

interface SceneLabelProps {
  text: string;
  color?: string;
  position?: LabelPosition;
  fontSize?: number;
}

const POSITION_STYLES: Record<LabelPosition, React.CSSProperties> = {
  "top-left": { top: 48, left: 60 },
  "top-right": { top: 48, right: 60 },
  "bottom-left": { bottom: 120, left: 60 },
};

export const SceneLabel: React.FC<SceneLabelProps> = ({
  text,
  color = "#F5A623",
  position = "top-left",
  fontSize = TYPOGRAPHY.size.h3,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 12], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...POSITION_STYLES[position],
          opacity,
          transform: `translateY(${translateY}px)`,
          backgroundColor: color,
          borderRadius: 12,
          padding: "10px 28px",
        }}
      >
        <span
          style={{
            fontFamily: TYPOGRAPHY.fontFamily.heading,
            fontSize,
            color: "#ffffff",
            fontWeight: TYPOGRAPHY.weight.bold,
            lineHeight: 1.3,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
