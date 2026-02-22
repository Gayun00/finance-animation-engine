import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Img } from "remotion";

export type MotionPreset = "none" | "float" | "bounce" | "pulse" | "rotate" | "swing";

interface Props {
  imageUrl: string;
  motion: MotionPreset;
  bgColor: string;
}

export const AssetPreviewComposition: React.FC<Props> = ({ imageUrl, motion, bgColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const t = frame / fps; // time in seconds

  const transform = computeTransform(motion, t);
  const opacity = computeOpacity(motion, t);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        overflow: "hidden",
      }}
    >
      <Img
        src={imageUrl}
        style={{
          maxWidth: "70%",
          maxHeight: "70%",
          objectFit: "contain",
          transform,
          opacity,
        }}
      />
    </div>
  );
};

function computeTransform(motion: MotionPreset, t: number): string {
  switch (motion) {
    case "float": {
      const y = Math.sin(t * Math.PI * 0.8) * 18;
      return `translateY(${y}px)`;
    }
    case "bounce": {
      const cycle = t % 1.2;
      const y = cycle < 0.6
        ? interpolate(cycle, [0, 0.3, 0.6], [0, -35, 0])
        : interpolate(cycle, [0.6, 0.8, 1.0, 1.2], [0, -12, 0, 0]);
      const scaleX = cycle < 0.1
        ? interpolate(cycle, [0, 0.1], [1.03, 1])
        : 1;
      const scaleY = cycle < 0.1
        ? interpolate(cycle, [0, 0.1], [0.96, 1])
        : 1;
      return `translateY(${y}px) scaleX(${scaleX}) scaleY(${scaleY})`;
    }
    case "pulse": {
      const s = 1 + Math.sin(t * Math.PI) * 0.06;
      return `scale(${s})`;
    }
    case "rotate": {
      const deg = (t * 90) % 360;
      return `rotate(${deg}deg)`;
    }
    case "swing": {
      const deg = Math.sin(t * Math.PI) * 10;
      return `rotate(${deg}deg)`;
    }
    default:
      return "none";
  }
}

function computeOpacity(motion: MotionPreset, t: number): number {
  if (motion === "pulse") {
    return interpolate(Math.sin(t * Math.PI), [-1, 1], [0.85, 1]);
  }
  return 1;
}
