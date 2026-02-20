import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EASINGS } from "./easings";
import { PRESETS } from "./presets";
import type { AnimationConfig, ParallaxConfig } from "../types";

interface AnimationWrapperProps {
  animation?: AnimationConfig;
  parallax?: ParallaxConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
  totalFrames?: number; // needed for exit animation timing
  sceneDuration?: number; // total scene frames for parallax
}

function useParallax(
  frame: number,
  parallax: ParallaxConfig | undefined,
  sceneDuration: number
): { px: number; py: number } {
  if (!parallax) return { px: 0, py: 0 };
  const { speed, direction = "horizontal", range = 120 } = parallax;
  const progress = interpolate(frame, [0, sceneDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const offset = (speed - 1) * range * progress;
  const horiz = direction === "horizontal" || direction === "both";
  const vert = direction === "vertical" || direction === "both";
  return { px: horiz ? -offset : 0, py: vert ? -offset * 0.6 : 0 };
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  animation,
  parallax,
  children,
  style,
  totalFrames,
  sceneDuration = totalFrames ?? 300,
}) => {
  const frame = useCurrentFrame();
  const { px, py } = useParallax(frame, parallax, sceneDuration);

  if (!animation || animation.preset === "none") {
    const pTransform =
      px !== 0 || py !== 0
        ? `translate(${px}px, ${py}px)`
        : undefined;
    return <div style={{ ...style, transform: pTransform }}>{children}</div>;
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
  tx += px; // parallax horizontal
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
  ty += py; // parallax vertical
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
