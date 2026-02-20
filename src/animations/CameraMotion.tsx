import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EASINGS } from "./easings";
import type { CameraMotionConfig } from "../types";

interface CameraMotionProps {
  config: CameraMotionConfig;
  durationInFrames: number;
  children: React.ReactNode;
}

export const CameraMotion: React.FC<CameraMotionProps> = ({
  config,
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const easing = EASINGS[config.easing ?? "smooth_out"];

  const endScale = config.endScale ?? 1.15;
  const panX = config.panX ?? 0;
  const panY = config.panY ?? 0;

  let scale: number;
  let translateX: number;
  let translateY: number;

  switch (config.type) {
    case "ken_burns": {
      const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing,
      });
      scale = interpolate(progress, [0, 1], [1, endScale]);
      translateX = interpolate(progress, [0, 1], [0, panX]);
      translateY = interpolate(progress, [0, 1], [0, panY]);
      break;
    }

    case "zoom_focus": {
      const half = Math.floor(durationInFrames / 2);
      if (frame <= half) {
        // First half: zoom in
        const progress = interpolate(frame, [0, half], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing,
        });
        scale = interpolate(progress, [0, 1], [1, endScale]);
      } else {
        // Second half: zoom out
        const progress = interpolate(frame, [half, durationInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing,
        });
        scale = interpolate(progress, [0, 1], [endScale, 1]);
      }
      translateX = 0;
      translateY = 0;
      break;
    }

    case "drift": {
      const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing,
      });
      scale = 1;
      translateX = interpolate(progress, [0, 1], [0, panX]);
      translateY = 0;
      break;
    }

    default:
      scale = 1;
      translateX = 0;
      translateY = 0;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};
