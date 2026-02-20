import type { AnimationPreset } from "../types";

export interface PresetConfig {
  opacity: { from: number; to: number };
  scale?: { from: number; to: number };
  translateX?: { from: number; to: number };
  translateY?: { from: number; to: number };
  /** clip-path circle radius % (from → to). 75% covers full 16:9 frame. */
  circleClip?: { from: number; to: number };
  defaultDuration: number; // frames
}

export const PRESETS: Record<AnimationPreset, PresetConfig> = {
  fade_in: {
    opacity: { from: 0, to: 1 },
    defaultDuration: 15,
  },
  scale_in: {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.5, to: 1 },
    defaultDuration: 20,
  },
  slide_up: {
    opacity: { from: 0, to: 1 },
    translateY: { from: 60, to: 0 },
    defaultDuration: 18,
  },
  slide_left: {
    opacity: { from: 0, to: 1 },
    translateX: { from: 100, to: 0 },
    defaultDuration: 18,
  },
  slide_right: {
    opacity: { from: 0, to: 1 },
    translateX: { from: -100, to: 0 },
    defaultDuration: 18,
  },
  slide_left_far: {
    opacity: { from: 0, to: 1 },
    translateX: { from: 1000, to: 0 },
    defaultDuration: 24,
  },
  slide_right_far: {
    opacity: { from: 0, to: 1 },
    translateX: { from: -1000, to: 0 },
    defaultDuration: 24,
  },
  exit_left_far: {
    opacity: { from: 1, to: 0 },
    translateX: { from: 0, to: -1000 },
    defaultDuration: 24,
  },
  exit_right_far: {
    opacity: { from: 1, to: 0 },
    translateX: { from: 0, to: 1000 },
    defaultDuration: 24,
  },
  bounce_in: {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.3, to: 1 },
    defaultDuration: 25,
  },
  pop_in: {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.8, to: 1 },
    defaultDuration: 12,
  },
  circle_reveal: {
    opacity: { from: 1, to: 1 },
    circleClip: { from: 0, to: 75 },
    defaultDuration: 20,
  },
  spring_up: {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.6, to: 1 },
    translateY: { from: 300, to: 0 },
    defaultDuration: 30,
  },
  none: {
    opacity: { from: 1, to: 1 },
    defaultDuration: 0,
  },
};
