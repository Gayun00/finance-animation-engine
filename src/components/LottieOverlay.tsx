import React from "react";
import { AbsoluteFill } from "remotion";
import { LottieElement } from "./LottieElement";

interface LottieOverlayProps {
  src: string;
  loop?: boolean;
  speed?: number;
  fitDurationInFrames?: number;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Scale up to fill the frame, hiding transparent edges */
  cover?: boolean;
}

export const LottieOverlay: React.FC<LottieOverlayProps> = ({
  src,
  loop = true,
  speed = 1,
  fitDurationInFrames,
  opacity = 0.3,
  blendMode = "screen",
  cover = false,
}) => {
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <LottieElement
        src={src}
        loop={loop}
        speed={speed}
        fitDurationInFrames={fitDurationInFrames}
        style={{
          width: "100%",
          height: "100%",
          ...(cover ? { transform: "scale(1.4)", transformOrigin: "center center" } : {}),
        }}
      />
    </AbsoluteFill>
  );
};
