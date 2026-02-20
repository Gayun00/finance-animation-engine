import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type ZoomProps = {
  mode: "in" | "out";
};

const ZoomPresentation: React.FC<
  TransitionPresentationComponentProps<ZoomProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const isZoomIn = passedProps.mode === "in";

  const style = useMemo((): React.CSSProperties => {
    const p = presentationProgress;

    if (presentationDirection === "exiting") {
      // Exiting scene
      const scale = isZoomIn
        ? 1 + p * 2 // zoom in: scale up 1→3
        : 1 - p * 0.7; // zoom out: scale down 1→0.3
      const opacity = 1 - p;
      return {
        transform: `scale(${scale})`,
        opacity,
      };
    }

    // Entering scene
    const scale = isZoomIn
      ? 3 - p * 2 // zoom in: scale down 3→1
      : 0.3 + p * 0.7; // zoom out: scale up 0.3→1
    const opacity = p;
    return {
      transform: `scale(${scale})`,
      opacity,
    };
  }, [presentationProgress, presentationDirection, isZoomIn]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const zoomIn = (): TransitionPresentation<ZoomProps> => ({
  component: ZoomPresentation,
  props: { mode: "in" },
});

export const zoomOut = (): TransitionPresentation<ZoomProps> => ({
  component: ZoomPresentation,
  props: { mode: "out" },
});
