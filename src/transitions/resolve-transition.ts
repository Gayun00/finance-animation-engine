import {
  linearTiming,
  type TransitionPresentation,
  type TransitionTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colorWipe } from "./ColorWipePresentation";
import { circleShrink } from "./CircleShrinkPresentation";
import { circleWipe } from "./CircleWipePresentation";
import { zoomIn, zoomOut } from "./ZoomPresentation";
import { slideUp } from "./SlideUpPresentation";
import { crossDissolve } from "./CrossDissolvePresentation";
import type { TransitionConfig } from "../types";

interface ResolvedTransition {
  presentation: TransitionPresentation<Record<string, unknown>>;
  timing: TransitionTiming;
}

export function resolveTransition(
  config: TransitionConfig
): ResolvedTransition | null {
  const durationInFrames = config.duration ?? 15;

  switch (config.type) {
    case "fade":
      return {
        presentation: fade() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "wipe_left":
      return {
        presentation: wipe({
          direction: "from-left",
        }) as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "wipe_right":
      return {
        presentation: wipe({
          direction: "from-right",
        }) as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "color_wipe":
      return {
        presentation: colorWipe({
          color: config.color,
        }) as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "circle_shrink":
      return {
        presentation: circleShrink() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "circle_wipe":
      return {
        presentation: circleWipe() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "zoom_in":
      return {
        presentation: zoomIn() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "zoom_out":
      return {
        presentation: zoomOut() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "slide_up":
      return {
        presentation: slideUp() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "cross_dissolve":
      return {
        presentation: crossDissolve() as unknown as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "none":
    default:
      return null;
  }
}
