import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type SlideUpProps = Record<string, never>;

const SlideUpPresentation: React.FC<
  TransitionPresentationComponentProps<SlideUpProps>
> = ({ children, presentationProgress, presentationDirection }) => {
  const style = useMemo((): React.CSSProperties => {
    if (presentationDirection === "exiting") {
      // Exiting scene slides up and out
      const translateY = -presentationProgress * 1080;
      return {
        transform: `translateY(${translateY}px)`,
      };
    }

    // Entering scene slides up from below
    const translateY = (1 - presentationProgress) * 1080;
    return {
      transform: `translateY(${translateY}px)`,
    };
  }, [presentationProgress, presentationDirection]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const slideUp = (): TransitionPresentation<SlideUpProps> => ({
  component: SlideUpPresentation,
  props: {},
});
