import type React from "react";

// Re-define minimal types to avoid importing remotion transitive deps
export type AnimationPreset =
  | "scale_in" | "fade_in" | "slide_up" | "slide_left" | "slide_right"
  | "slide_left_far" | "slide_right_far" | "exit_left_far" | "exit_right_far"
  | "bounce_in" | "pop_in" | "circle_reveal" | "spring_up" | "none";

export type EasingName = "kurzgesagt" | "bounce_in" | "snap" | "smooth_out" | "dramatic_in" | "linear";

export type TransitionType =
  | "fade" | "wipe_left" | "wipe_right" | "color_wipe" | "circle_shrink"
  | "circle_wipe" | "zoom_in" | "zoom_out" | "slide_up" | "cross_dissolve" | "none";

export type BackgroundType = "solid" | "gradient" | "radial";

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  colors?: [string, string];
  angle?: number;
}

export interface CameraMotionConfig {
  type: "ken_burns" | "zoom_focus" | "drift";
  endScale?: number;
  panX?: number;
  panY?: number;
}

export type AssetCategory = "background" | "element" | "character" | "effect" | "emoji";

/** A single configurable slot within a preset */
export interface SlotDefinition {
  id: string;
  label: string;
  description: string;
  required: boolean;
  allowedCategories: readonly AssetCategory[];
  suggestedAssetIds?: string[];
  defaultAssetId?: string;
  position: { containerStyle: React.CSSProperties };
  defaultAnimation: {
    preset: AnimationPreset;
    duration: number;
    easing?: EasingName;
    exitPreset?: AnimationPreset;
    exitDuration?: number;
  };
  defaultStartFrame?: number;
  defaultDurationInFrames?: number;
  component: string;
  defaultProps?: Record<string, unknown>;
  parallax?: {
    speed: number;
    direction?: "horizontal" | "vertical" | "both" | "zoom";
    range?: number;
  };
}

/** Fixed decorative element (particles, orbs, etc.) */
export interface FixedElement {
  component: string;
  props: Record<string, unknown>;
  containerStyle?: React.CSSProperties;
  animation?: { preset: AnimationPreset; duration: number };
}

/** Metadata for one of the 8 scene presets */
export interface PresetMetadata {
  id: string;
  name: string;
  icon: string;
  description: string;
  guide: string;
  defaultDurationInFrames: number;
  defaultBackground: BackgroundConfig;
  defaultCameraMotion?: CameraMotionConfig;
  defaultTransition?: { type: TransitionType; duration?: number; color?: string };
  fixedElements: FixedElement[];
  slots: SlotDefinition[];
}
