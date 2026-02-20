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
): { px: number; py: number; pScale: number } {
  if (!parallax) return { px: 0, py: 0, pScale: 1 };
  const { speed, direction = "horizontal", range = 120 } = parallax;
  const progress = interpolate(frame, [0, sceneDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (direction === "zoom") {
    // Zoom parallax: each layer scales up at different rates
    // speed 0.3 (bg) → 1.0→1.15, speed 0.8 (mid) → 1.0→1.40, speed 2.2 (fg) → 1.0→2.10
    const pScale = 1 + speed * progress * 0.5;
    return { px: 0, py: 0, pScale };
  }

  const offset = (speed - 1) * range * progress;
  const horiz = direction === "horizontal" || direction === "both";
  const vert = direction === "vertical" || direction === "both";
  return { px: horiz ? -offset : 0, py: vert ? -offset * 0.6 : 0, pScale: 1 };
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
  const { px, py, pScale } = useParallax(frame, parallax, sceneDuration);

  const isZoom = parallax?.direction === "zoom";

  if (!animation || animation.preset === "none") {
    const parts: string[] = [];
    if (style?.transform) parts.push(style.transform);
    if (px !== 0 || py !== 0) parts.push(`translate(${px}px, ${py}px)`);
    if (pScale !== 1) parts.push(`scale(${pScale})`);
    const pTransform = parts.length > 0 ? parts.join(" ") : undefined;
    return (
      <div style={{ ...style, transform: pTransform, transformOrigin: isZoom ? "50% 100%" : undefined }}>
        {children}
      </div>
    );
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

  // Scale (enter animation × parallax zoom)
  if (enterPreset.scale || pScale !== 1) {
    const enterScale = enterPreset.scale
      ? interpolate(enterProgress, [0, 1], [enterPreset.scale.from, enterPreset.scale.to])
      : 1;
    transforms.push(`scale(${enterScale * pScale})`);
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

  // Preserve original transform from containerStyle (e.g. translateX(-50%) for centering)
  const baseTransform = style?.transform;
  const animTransform = transforms.length > 0 ? transforms.join(" ") : undefined;
  const finalTransform = [baseTransform, animTransform].filter(Boolean).join(" ") || undefined;

  return (
    <div
      style={{
        ...style,
        opacity,
        transform: finalTransform,
        transformOrigin: isZoom ? "50% 100%" : undefined,
        clipPath,
      }}
    >
      {children}
    </div>
  );
};
