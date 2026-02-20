import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { COLORS } from "../theme/colors";

type ColorWipeProps = {
  color?: string;
};

const ColorWipePresentation: React.FC<
  TransitionPresentationComponentProps<ColorWipeProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const color = passedProps.color ?? COLORS.primary.main;

  const style = useMemo((): React.CSSProperties => {
    if (presentationDirection === "entering") {
      const clipProgress = Math.max(0, (presentationProgress - 0.3) / 0.7);
      return {
        clipPath: `inset(0 ${(1 - clipProgress) * 100}% 0 0)`,
      };
    }
    const clipProgress = Math.min(1, presentationProgress / 0.7);
    return {
      clipPath: `inset(0 0 0 ${clipProgress * 100}%)`,
    };
  }, [presentationDirection, presentationProgress]);

  const overlayStyle = useMemo((): React.CSSProperties => {
    const barWidth = 30;
    const position = presentationProgress * (100 + barWidth * 2) - barWidth;
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `linear-gradient(90deg,
        transparent ${position - barWidth}%,
        ${color} ${position - barWidth / 2}%,
        ${color} ${position + barWidth / 2}%,
        transparent ${position + barWidth}%)`,
      zIndex: 2,
      pointerEvents: "none" as const,
    };
  }, [color, presentationProgress]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      <AbsoluteFill style={overlayStyle} />
    </AbsoluteFill>
  );
};

export const colorWipe = (
  props?: ColorWipeProps
): TransitionPresentation<ColorWipeProps> => {
  return {
    component: ColorWipePresentation,
    props: props ?? {},
  };
};
