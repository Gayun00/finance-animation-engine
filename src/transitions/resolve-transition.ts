import {
  linearTiming,
  type TransitionPresentation,
  type TransitionTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colorWipe } from "./ColorWipePresentation";
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
        presentation: fade() as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "wipe_left":
      return {
        presentation: wipe({
          direction: "from-left",
        }) as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "wipe_right":
      return {
        presentation: wipe({
          direction: "from-right",
        }) as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "color_wipe":
      return {
        presentation: colorWipe({
          color: config.color,
        }) as TransitionPresentation<Record<string, unknown>>,
        timing: linearTiming({ durationInFrames }),
      };
    case "none":
    default:
      return null;
  }
}
