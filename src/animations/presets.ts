import type { AnimationPreset } from "../types";

export interface PresetConfig {
  opacity: { from: number; to: number };
  scale?: { from: number; to: number };
  translateX?: { from: number; to: number };
  translateY?: { from: number; to: number };
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
  none: {
    opacity: { from: 1, to: 1 },
    defaultDuration: 0,
  },
};
