import React from "react";
import { AbsoluteFill } from "remotion";
import { LottieElement } from "./LottieElement";

interface LottieOverlayProps {
  src: string;
  loop?: boolean;
  speed?: number;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

export const LottieOverlay: React.FC<LottieOverlayProps> = ({
  src,
  loop = true,
  speed = 1,
  opacity = 0.3,
  blendMode = "screen",
}) => {
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
      }}
    >
      <LottieElement
        src={src}
        loop={loop}
        speed={speed}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};
