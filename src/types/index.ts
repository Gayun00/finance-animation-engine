import React from "react";

// ── Animation ──
export type EasingName =
  | "kurzgesagt"
  | "bounce_in"
  | "snap"
  | "smooth_out"
  | "dramatic_in"
  | "linear";

export type AnimationPreset =
  | "scale_in"
  | "fade_in"
  | "slide_up"
  | "slide_left"
  | "slide_right"
  | "slide_left_far"
  | "slide_right_far"
  | "exit_left_far"
  | "exit_right_far"
  | "bounce_in"
  | "pop_in"
  | "circle_reveal"
  | "spring_up"
  | "none";

export interface AnimationConfig {
  preset: AnimationPreset;
  delay?: number; // frames
  duration?: number; // frames
  easing?: EasingName;
  exitPreset?: AnimationPreset; // exit animation (plays at end of element's lifetime)
  exitDuration?: number; // frames
}

// ── Transition ──
export type TransitionType =
  | "fade"
  | "wipe_left"
  | "wipe_right"
  | "color_wipe"
  | "circle_shrink"
  | "circle_wipe"
  | "zoom_in"
  | "zoom_out"
  | "slide_up"
  | "cross_dissolve"
  | "none";

export interface TransitionConfig {
  type: TransitionType;
  duration?: number; // frames
  color?: string; // for color_wipe
}

// ── Background ──
export type BackgroundType = "solid" | "gradient" | "radial";

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  colors?: [string, string];
  angle?: number; // degrees, for gradient
}

// ── Camera Motion ──
export type CameraMotionType = "ken_burns" | "zoom_focus" | "drift";

export interface CameraMotionConfig {
  type: CameraMotionType;
  endScale?: number; // ken_burns / zoom_focus (default 1.15)
  panX?: number; // ken_burns / drift — pixels
  panY?: number; // ken_burns — pixels
  easing?: EasingName;
}

// ── Parallax ──
export interface ParallaxConfig {
  speed: number; // 0.3 = slow bg, 1 = normal, 1.5 = fast foreground
  direction?: "horizontal" | "vertical" | "both" | "zoom"; // default: horizontal
  range?: number; // max pixel movement (default: 120)
}

// ── Scene Element ──
export interface SceneElement {
  id: string;
  component: string; // registry key
  props: Record<string, unknown>;
  animation?: AnimationConfig;
  startFrame?: number;
  durationInFrames?: number;
  containerStyle?: React.CSSProperties;
  parallax?: ParallaxConfig;
}

// ── Scene ──
export interface Scene {
  id: string;
  title: string;
  durationInFrames: number;
  background: BackgroundConfig;
  transition?: TransitionConfig;
  elements: SceneElement[];
  cameraMotion?: CameraMotionConfig;
}

// ── Top-level Sequence ──
export interface SceneSequence {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: Scene[];
}
