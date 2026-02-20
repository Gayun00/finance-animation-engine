import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EASINGS } from "./easings";
import { PRESETS } from "./presets";
import type { AnimationConfig } from "../types";

interface AnimationWrapperProps {
  animation?: AnimationConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  animation,
  children,
  style,
}) => {
  const frame = useCurrentFrame();

  if (!animation || animation.preset === "none") {
    return <div style={style}>{children}</div>;
  }

  const preset = PRESETS[animation.preset];
  const delay = animation.delay ?? 0;
  const duration = animation.duration ?? preset.defaultDuration;
  const easing = EASINGS[animation.easing ?? "kurzgesagt"];

  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  const opacity = interpolate(
    progress,
    [0, 1],
    [preset.opacity.from, preset.opacity.to]
  );

  const transforms: string[] = [];

  if (preset.scale) {
    const scale = interpolate(
      progress,
      [0, 1],
      [preset.scale.from, preset.scale.to]
    );
    transforms.push(`scale(${scale})`);
  }

  if (preset.translateX) {
    const tx = interpolate(
      progress,
      [0, 1],
      [preset.translateX.from, preset.translateX.to]
    );
    transforms.push(`translateX(${tx}px)`);
  }

  if (preset.translateY) {
    const ty = interpolate(
      progress,
      [0, 1],
      [preset.translateY.from, preset.translateY.to]
    );
    transforms.push(`translateY(${ty}px)`);
  }

  return (
    <div
      style={{
        ...style,
        opacity,
        transform: transforms.length > 0 ? transforms.join(" ") : undefined,
      }}
    >
      {children}
    </div>
  );
};
