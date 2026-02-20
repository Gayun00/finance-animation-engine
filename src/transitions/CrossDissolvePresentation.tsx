import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type CrossDissolveProps = Record<string, never>;

/**
 * Cross dissolve: both scenes overlap with opacity crossfade.
 * Unlike simple fade, both are visible simultaneously in the middle.
 */
const CrossDissolvePresentation: React.FC<
  TransitionPresentationComponentProps<CrossDissolveProps>
> = ({ children, presentationProgress, presentationDirection }) => {
  const style = useMemo((): React.CSSProperties => {
    if (presentationDirection === "exiting") {
      return { opacity: 1 - presentationProgress };
    }
    return { opacity: presentationProgress };
  }, [presentationProgress, presentationDirection]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const crossDissolve = (): TransitionPresentation<CrossDissolveProps> => ({
  component: CrossDissolvePresentation,
  props: {},
});
