import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EASINGS } from "./easings";
import { PRESETS } from "./presets";
import type { AnimationConfig } from "../types";

interface AnimationWrapperProps {
  animation?: AnimationConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
  totalFrames?: number; // needed for exit animation timing
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  animation,
  children,
  style,
  totalFrames,
}) => {
  const frame = useCurrentFrame();

  if (!animation || animation.preset === "none") {
    return <div style={style}>{children}</div>;
  }

  // ── Enter animation ──
  const enterPreset = PRESETS[animation.preset];
  const delay = animation.delay ?? 0;
  const enterDuration = animation.duration ?? enterPreset.defaultDuration;
  const enterEasing = EASINGS[animation.easing ?? "kurzgesagt"];

  const enterProgress = interpolate(frame - delay, [0, enterDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: enterEasing,
  });

  // ── Exit animation ──
  const exitPresetKey = animation.exitPreset;
  let exitProgress = 0; // 0 = not exiting, 1 = fully exited
  let exitPreset = exitPresetKey ? PRESETS[exitPresetKey] : null;

  if (exitPreset && totalFrames) {
    const exitDuration = animation.exitDuration ?? exitPreset.defaultDuration;
    const exitStart = totalFrames - exitDuration;
    exitProgress = interpolate(frame, [exitStart, totalFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: enterEasing,
    });
  }

  // ── Compose enter + exit values ──

  // Opacity: enter fades in, exit fades out
  let opacity = interpolate(
    enterProgress,
    [0, 1],
    [enterPreset.opacity.from, enterPreset.opacity.to]
  );
  if (exitPreset && exitProgress > 0) {
    const exitOpacity = interpolate(
      exitProgress,
      [0, 1],
      [exitPreset.opacity.from, exitPreset.opacity.to]
    );
    opacity = Math.min(opacity, exitOpacity);
  }

  const transforms: string[] = [];

  // Scale
  if (enterPreset.scale) {
    const scale = interpolate(
      enterProgress,
      [0, 1],
      [enterPreset.scale.from, enterPreset.scale.to]
    );
    transforms.push(`scale(${scale})`);
  }

  // TranslateX: enter + exit combined
  let tx = 0;
  if (enterPreset.translateX) {
    tx = interpolate(
      enterProgress,
      [0, 1],
      [enterPreset.translateX.from, enterPreset.translateX.to]
    );
  }
  if (exitPreset?.translateX && exitProgress > 0) {
    const exitTx = interpolate(
      exitProgress,
      [0, 1],
      [exitPreset.translateX.from, exitPreset.translateX.to]
    );
    tx += exitTx;
  }
  if (tx !== 0) {
    transforms.push(`translateX(${tx}px)`);
  }

  // TranslateY
  let ty = 0;
  if (enterPreset.translateY) {
    ty = interpolate(
      enterProgress,
      [0, 1],
      [enterPreset.translateY.from, enterPreset.translateY.to]
    );
  }
  if (exitPreset?.translateY && exitProgress > 0) {
    const exitTy = interpolate(
      exitProgress,
      [0, 1],
      [exitPreset.translateY.from, exitPreset.translateY.to]
    );
    ty += exitTy;
  }
  if (ty !== 0) {
    transforms.push(`translateY(${ty}px)`);
  }

  // Circle clip
  let clipPath: string | undefined;
  if (enterPreset.circleClip) {
    const radius = interpolate(
      enterProgress,
      [0, 1],
      [enterPreset.circleClip.from, enterPreset.circleClip.to]
    );
    clipPath = `circle(${radius}% at 50% 50%)`;
  }

  return (
    <div
      style={{
        ...style,
        opacity,
        transform: transforms.length > 0 ? transforms.join(" ") : undefined,
        clipPath,
      }}
    >
      {children}
    </div>
  );
};
