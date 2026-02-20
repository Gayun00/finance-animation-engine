import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { LottieElement } from "./LottieElement";
import { EASINGS } from "../animations/easings";

interface LottieShowcaseProps {
  src: string;
  loop?: boolean;
  speed?: number;
  /** Size when big in center */
  bigSize?: number;
  /** Size after shrinking */
  smallSize?: number;
  /** Frames to hold at big center */
  holdFrames?: number;
  /** Frames for shrink+move animation */
  transitionFrames?: number;
  /** Target X position after moving (CSS left %) */
  targetX?: string;
  /** Target Y position after moving (CSS top %) */
  targetY?: string;
  /** Whether to stay visible after moving, or fade out */
  fadeOut?: boolean;
}

export const LottieShowcase: React.FC<LottieShowcaseProps> = ({
  src,
  loop = true,
  speed = 1,
  bigSize = 600,
  smallSize = 180,
  holdFrames = 40,
  transitionFrames = 20,
  targetX = "15%",
  targetY = "25%",
  fadeOut = false,
}) => {
  const frame = useCurrentFrame();

  // Phase 1: entrance (0 ~ 15f)
  const entranceScale = interpolate(frame, [0, 15], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASINGS.kurzgesagt,
  });
  const entranceOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: hold at center (15 ~ 15+holdFrames)
  const moveStart = 15 + holdFrames;
  const moveEnd = moveStart + transitionFrames;

  // Phase 3: shrink + move (moveStart ~ moveEnd)
  const moveProgress = interpolate(frame, [moveStart, moveEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASINGS.kurzgesagt,
  });

  const currentSize = interpolate(moveProgress, [0, 1], [bigSize, smallSize]);

  // Center position: 50%, 45% → target position
  const xPercent = interpolate(moveProgress, [0, 1], [50, parseFloat(targetX)]);
  const yPercent = interpolate(moveProgress, [0, 1], [45, parseFloat(targetY)]);

  // After move, optionally fade out
  let finalOpacity = entranceOpacity;
  if (fadeOut && frame > moveEnd) {
    finalOpacity = interpolate(frame, [moveEnd, moveEnd + 15], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const scale = frame < moveStart ? entranceScale : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: finalOpacity,
        }}
      >
        <LottieElement
          src={src}
          loop={loop}
          speed={speed}
          style={{ width: currentSize, height: currentSize }}
        />
      </div>
    </AbsoluteFill>
  );
};
