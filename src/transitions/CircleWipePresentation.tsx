import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type CircleWipeProps = Record<string, never>;

/**
 * Circle wipe (iris) transition — 3 phases:
 * 1. Circle expands from 0% to a small preview size
 * 2. Brief pause at the small size
 * 3. Circle expands to cover the full frame
 */
const CircleWipePresentation: React.FC<
  TransitionPresentationComponentProps<CircleWipeProps>
> = ({ children, presentationProgress, presentationDirection }) => {
  // 75% radius covers the full 16:9 frame corner-to-corner from center
  const MAX_RADIUS = 75;
  const PEEK_RADIUS = 18;

  const style = useMemo((): React.CSSProperties => {
    if (presentationDirection === "entering") {
      let radius: number;

      if (presentationProgress < 0.35) {
        // Phase 1: expand to small preview
        const p = presentationProgress / 0.35;
        const eased = 1 - Math.pow(1 - p, 2);
        radius = eased * PEEK_RADIUS;
      } else if (presentationProgress < 0.5) {
        // Phase 2: hold at small size
        radius = PEEK_RADIUS;
      } else {
        // Phase 3: expand to full
        const p = (presentationProgress - 0.5) / 0.5;
        const eased = 1 - Math.pow(1 - p, 2);
        radius = PEEK_RADIUS + eased * (MAX_RADIUS - PEEK_RADIUS);
      }

      return {
        clipPath: `circle(${radius}% at 50% 50%)`,
      };
    }
    // Exiting scene: fully visible, sits behind
    return { opacity: 1 };
  }, [presentationDirection, presentationProgress]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const circleWipe = (
  props?: CircleWipeProps
): TransitionPresentation<CircleWipeProps> => {
  return {
    component: CircleWipePresentation,
    props: props ?? {},
  };
};
