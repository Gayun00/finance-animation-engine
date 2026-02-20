import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme/colors";
import { TYPOGRAPHY } from "../theme/typography";
import { EASINGS } from "../animations/easings";

interface CountUpNumberProps {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  duration?: number; // frames for the count-up portion
  color?: string;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n));
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  from,
  to,
  prefix = "",
  suffix = "원",
  label,
  duration = 90,
  color = COLORS.finance.gold,
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(frame, [10, 10 + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASINGS.kurzgesagt,
  });

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], {
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
        gap: 20,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: TYPOGRAPHY.fontFamily.body,
            fontSize: TYPOGRAPHY.size.h3,
            color: COLORS.text.secondary,
            opacity: labelOpacity,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.heading,
          fontSize: TYPOGRAPHY.size.hero,
          color,
          textAlign: "center",
        }}
      >
        {prefix}
        {formatNumber(value)}
        {suffix}
      </div>
    </AbsoluteFill>
  );
};
