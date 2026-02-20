import type { SectionType, LayoutType } from "./types";
import type { TransitionType, CameraMotionConfig } from "../types";

// ── Transition Selection Rules ──

export const TRANSITION_DEFAULTS: Record<SectionType, TransitionType | null> = {
  intro: "slide_up",
  explain: "color_wipe",
  chart: "zoom_in",
  comparison: "slide_up",
  callout: "zoom_in",
  outro: "fade",
};

export const COLOR_WIPE_COLORS: Record<string, string> = {
  profit: "#81C784",
  loss: "#E57373",
  info: "#4FC3F7",
  highlight: "#FFD54F",
  default: "#4FC3F7",
};

// Narration-based transition overrides
const UPWARD_MOTION = /로켓|발사|launch|rocket|상승|올라/;

/**
 * Pick a transition that doesn't repeat the previous one.
 * Narration content can override the default (e.g. upward motion → slide_up).
 */
export function selectTransition(
  sectionType: SectionType,
  prevTransition: TransitionType | null,
  narration?: string
): TransitionType | null {
  let chosen = TRANSITION_DEFAULTS[sectionType];
  if (chosen === null) return null;

  // Content-aware override
  if (narration && UPWARD_MOTION.test(narration)) {
    chosen = "slide_up";
  }

  // Rule: don't repeat the same transition consecutively
  if (chosen === prevTransition) {
    const fallbacks: TransitionType[] = [
      "color_wipe",
      "wipe_left",
      "fade",
      "zoom_in",
      "slide_up",
      "cross_dissolve",
      "circle_wipe",
    ];
    return fallbacks.find((t) => t !== prevTransition) ?? "fade";
  }

  return chosen;
}

// ── Layout Selection Rules ──

export const LAYOUT_BY_TYPE: Record<SectionType, LayoutType> = {
  intro: "FullScreen",
  explain: "SplitLayout",
  chart: "CenterLayout",
  comparison: "SplitLayout",
  callout: "FocusLayout",
  outro: "FullScreen",
};

export const LAYOUT_BY_DIRECTIVE: Record<string, LayoutType> = {
  "@chart": "CenterLayout",
  "@compare": "SplitLayout",
  "@timeline": "FullScreen",
  "@flow": "CenterLayout",
};

export function selectLayout(
  sectionType: SectionType,
  directiveType?: string,
  elementCount?: number
): LayoutType {
  // Directive overrides everything
  if (directiveType && LAYOUT_BY_DIRECTIVE[`@${directiveType}`]) {
    return LAYOUT_BY_DIRECTIVE[`@${directiveType}`];
  }

  // Element count heuristic
  if (elementCount !== undefined) {
    if (elementCount === 1) return "CenterLayout";
    if (elementCount === 2) return "SplitLayout";
    if (elementCount >= 3) return "GridLayout";
  }

  return LAYOUT_BY_TYPE[sectionType];
}

// ── Element Ordering Rules ──

export const ELEMENT_ORDERING = {
  enterOrder: [
    "background",
    "layout_frame",
    "character",
    "label",
    "main_content",
    "data",
    "effect",
  ],
  staggerDelay: 6, // frames (0.2s at 30fps)
  maxSimultaneous: 3,
  exitStartBeforeEnd: 15, // frames (0.5s)
} as const;

// ── Element Sizing Defaults ──

export const ELEMENT_SIZING: Record<
  string,
  { width: number; height: number }
> = {
  character: { width: 400, height: 500 },
  chart: { width: 800, height: 500 },
  countUpNumber: { width: 400, height: 120 },
  calloutBox: { width: 600, height: 200 },
  comparisonTable: { width: 900, height: 400 },
  icon: { width: 120, height: 120 },
  titleCard: { width: 1200, height: 400 },
  endCard: { width: 1000, height: 600 },
};

// ── Narration Duration → Element Count ──

export function suggestElementCount(durationSec: number): {
  min: number;
  max: number;
} {
  if (durationSec < 5) return { min: 1, max: 2 };
  if (durationSec <= 15) return { min: 2, max: 3 };
  return { min: 3, max: 5 };
}

// ── Camera Motion Rules ──

const CAMERA_DEFAULTS: Record<SectionType, CameraMotionConfig> = {
  intro: { type: "ken_burns", endScale: 1.12, panX: -30, panY: 10 },
  explain: { type: "drift", panX: 25 },
  chart: { type: "zoom_focus", endScale: 1.1 },
  comparison: { type: "drift", panX: -25 },
  callout: { type: "zoom_focus", endScale: 1.15 },
  outro: { type: "ken_burns", endScale: 0.92, panX: 20, panY: -10 },
};

/**
 * Select camera motion for a section.
 * Alternates drift direction on consecutive explain/comparison sections.
 */
export function selectCameraMotion(
  sectionType: SectionType,
  sceneIndex: number
): CameraMotionConfig {
  const base = { ...CAMERA_DEFAULTS[sectionType] };

  // Alternate drift direction for even/odd scenes
  if (base.type === "drift" && sceneIndex % 2 === 0) {
    base.panX = -(base.panX ?? 25);
  }

  return base;
}

// ── Motion Combination Recommendations ──

export const RECOMMENDED_MOTION: Record<
  string,
  { enter: string; during: string; exit: string }
> = {
  Character: { enter: "slide_in", during: "float", exit: "slide_out" },
  CountUpNumber: { enter: "bounce_in", during: "pulse", exit: "fade_out" },
  AnimatedLineChart: { enter: "draw_line", during: "none", exit: "fade_out" },
  CompoundInterestChart: {
    enter: "draw_line",
    during: "none",
    exit: "fade_out",
  },
  CalloutBox: { enter: "scale_in", during: "pulse", exit: "scale_out" },
  TitleCard: { enter: "scale_in", during: "none", exit: "fade_out" },
  EndCard: { enter: "scale_in", during: "none", exit: "fade_out" },
  FloatingIcons: { enter: "fade_in", during: "float", exit: "fade_out" },
  LottieElement: { enter: "scale_in", during: "none", exit: "fade_out" },
  FloatingParticles: { enter: "fade_in", during: "float", exit: "fade_out" },
  GeometricDecor: { enter: "fade_in", during: "none", exit: "fade_out" },
  GradientOrb: { enter: "fade_in", during: "pulse", exit: "fade_out" },
  Subtitle: { enter: "fade_in", during: "none", exit: "fade_out" },
};
