import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TYPOGRAPHY } from "../theme/typography";

interface SubtitleProps {
  text: string;
  color?: string;
  fontSize?: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  color = "#ffffff",
  fontSize = TYPOGRAPHY.size.body,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 120px 80px",
      }}
    >
      <div
        style={{
          opacity,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 8,
          padding: "14px 32px",
          maxWidth: 1400,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: TYPOGRAPHY.fontFamily.body,
            fontSize,
            color,
            fontWeight: TYPOGRAPHY.weight.medium,
            lineHeight: 1.5,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
