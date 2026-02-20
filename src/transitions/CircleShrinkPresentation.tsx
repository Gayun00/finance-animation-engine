import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type CircleShrinkProps = {
  color?: string;
};

/**
 * Circle shrink transition:
 * - Exiting scene shrinks into a circle at center, pauses briefly, then disappears
 * - Entering scene is revealed behind it
 */
const CircleShrinkPresentation: React.FC<
  TransitionPresentationComponentProps<CircleShrinkProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const bgColor = passedProps.color ?? "#E92F60";

  const style = useMemo((): React.CSSProperties => {
    if (presentationDirection === "entering") {
      // Entering scene: just sit behind, fade in at the end
      const opacity = presentationProgress < 0.3 ? 0 : Math.min(1, (presentationProgress - 0.3) / 0.3);
      return { opacity };
    }

    // Exiting scene: shrink to circle, pause, then vanish
    // Phase 1 (0~0.5): shrink from full to small circle
    // Phase 2 (0.5~0.7): hold/pause at small circle
    // Phase 3 (0.7~1.0): scale down to 0 and disappear
    let circleRadius: number;
    let scale: number;
    let opacity: number;

    if (presentationProgress < 0.5) {
      // Shrink: circle goes from 100% to 15%
      const p = presentationProgress / 0.5;
      const eased = 1 - Math.pow(1 - p, 2); // ease-out
      circleRadius = 100 - eased * 85; // 100% → 15%
      scale = 1;
      opacity = 1;
    } else if (presentationProgress < 0.7) {
      // Pause at small circle
      circleRadius = 15;
      scale = 1;
      opacity = 1;
    } else {
      // Shrink to nothing and fade
      const p = (presentationProgress - 0.7) / 0.3;
      const eased = p * p; // ease-in
      circleRadius = 15 * (1 - eased); // 15% → 0%
      scale = 1 - eased * 0.3; // slight scale down
      opacity = 1 - eased;
    }

    return {
      clipPath: `circle(${circleRadius}% at 50% 50%)`,
      transform: `scale(${scale})`,
      opacity,
    };
  }, [presentationDirection, presentationProgress]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const circleShrink = (
  props?: CircleShrinkProps
): TransitionPresentation<CircleShrinkProps> => {
  return {
    component: CircleShrinkPresentation,
    props: props ?? {},
  };
};
