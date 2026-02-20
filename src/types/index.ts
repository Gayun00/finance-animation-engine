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
  | "bounce_in"
  | "pop_in"
  | "none";

export interface AnimationConfig {
  preset: AnimationPreset;
  delay?: number; // frames
  duration?: number; // frames
  easing?: EasingName;
}

// ── Transition ──
export type TransitionType = "fade" | "wipe_left" | "wipe_right" | "color_wipe" | "none";

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

// ── Scene Element ──
export interface SceneElement {
  id: string;
  component: string; // registry key
  props: Record<string, unknown>;
  animation?: AnimationConfig;
  startFrame?: number;
  durationInFrames?: number;
  containerStyle?: React.CSSProperties;
}

// ── Scene ──
export interface Scene {
  id: string;
  title: string;
  durationInFrames: number;
  background: BackgroundConfig;
  transition?: TransitionConfig;
  elements: SceneElement[];
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
