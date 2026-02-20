import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme/colors";
import { TYPOGRAPHY } from "../theme/typography";
import { EASINGS } from "../animations/easings";
import { LottieElement } from "./LottieElement";

interface CalloutBoxProps {
  text: string;
  subtext?: string;
  accentColor?: string;
  icon?: string; // emoji
  lottieIcon?: string; // Lottie animation src path
}

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  text,
  subtext,
  accentColor = COLORS.primary.main,
  icon,
  lottieIcon,
}) => {
  const frame = useCurrentFrame();

  const boxScale = interpolate(frame, [0, 18], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASINGS.kurzgesagt,
  });

  const borderWidth = interpolate(frame, [0, 25], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtextOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          transform: `scale(${boxScale})`,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderLeft: `${borderWidth}px solid ${accentColor}`,
          borderRadius: 16,
          padding: "48px 64px",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {lottieIcon ? (
            <LottieElement
              src={lottieIcon}
              loop
              speed={0.8}
              style={{ width: 56, height: 56, flexShrink: 0 }}
            />
          ) : icon ? (
            <span style={{ fontSize: TYPOGRAPHY.size.h1 }}>{icon}</span>
          ) : null}
          <span
            style={{
              fontFamily: TYPOGRAPHY.fontFamily.body,
              fontSize: TYPOGRAPHY.size.h2,
              color: COLORS.text.primary,
              fontWeight: TYPOGRAPHY.weight.bold,
              lineHeight: 1.4,
            }}
          >
            {text}
          </span>
        </div>
        {subtext && (
          <p
            style={{
              fontFamily: TYPOGRAPHY.fontFamily.body,
              fontSize: TYPOGRAPHY.size.body,
              color: COLORS.text.secondary,
              margin: 0,
              opacity: subtextOpacity,
              paddingLeft: icon ? 76 : 0,
              lineHeight: 1.6,
            }}
          >
            {subtext}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
