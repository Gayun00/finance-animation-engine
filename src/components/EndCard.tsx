import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme/colors";
import { TYPOGRAPHY } from "../theme/typography";

interface EndCardProps {
  channelName: string;
  cta?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  channelName,
  cta = "구독과 좋아요 부탁드립니다!",
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [20, 35], [0, 1], {
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
        gap: 32,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: TYPOGRAPHY.fontFamily.heading,
          fontSize: TYPOGRAPHY.size.h1,
          color: COLORS.text.primary,
          textAlign: "center",
        }}
      >
        {channelName}
      </div>
      <div
        style={{
          opacity: ctaOpacity,
          fontFamily: TYPOGRAPHY.fontFamily.body,
          fontSize: TYPOGRAPHY.size.h3,
          color: COLORS.finance.gold,
          textAlign: "center",
          padding: "16px 48px",
          border: `2px solid ${COLORS.finance.gold}`,
          borderRadius: 12,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
