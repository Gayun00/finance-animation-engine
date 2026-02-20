import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme/colors";
import { TYPOGRAPHY } from "../theme/typography";

interface TitleCardProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  accentColor = COLORS.finance.gold,
}) => {
  const frame = useCurrentFrame();

  // Underline animation
  const lineWidth = interpolate(frame, [20, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        padding: 80,
      }}
    >
      <h1
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.heading,
          fontSize: TYPOGRAPHY.size.hero,
          color: COLORS.text.primary,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          width: `${lineWidth}%`,
          maxWidth: 400,
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
        }}
      />
      {subtitle && (
        <p
          style={{
            fontFamily: TYPOGRAPHY.fontFamily.body,
            fontSize: TYPOGRAPHY.size.h3,
            color: COLORS.text.secondary,
            textAlign: "center",
            margin: 0,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};
