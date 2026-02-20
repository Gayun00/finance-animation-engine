/**
 * Converts ComposedScene[] → SceneSequence for the Remotion renderer.
 */

import type { ComposedScene, ComposedElement } from "./types";
import type {
  SceneSequence,
  Scene,
  SceneElement,
  AnimationPreset,
  EasingName,
  TransitionType,
} from "../types";

const ANIMATION_PRESET_MAP: Record<string, AnimationPreset> = {
  scale_in: "scale_in",
  fade_in: "fade_in",
  bounce_in: "bounce_in",
  slide_in: "slide_up",
  slide_up: "slide_up",
  draw_line: "fade_in",
  count_up: "fade_in",
  pop_in: "pop_in",
  circle_reveal: "circle_reveal",
};

const EASING_MAP: Record<string, EasingName> = {
  KURZGESAGT: "kurzgesagt",
  BOUNCE_IN: "bounce_in",
  SNAP: "snap",
  SMOOTH_OUT: "smooth_out",
};

function mapPreset(type: string): AnimationPreset {
  return ANIMATION_PRESET_MAP[type] ?? "fade_in";
}

function mapEasing(easing?: string): EasingName | undefined {
  if (!easing) return undefined;
  return EASING_MAP[easing] ?? "kurzgesagt";
}

function convertElement(el: ComposedElement, index: number): SceneElement {
  return {
    id: `el-${index}-${el.component.toLowerCase()}`,
    component: el.component,
    props: el.props,
    startFrame: el.enterAt,
    durationInFrames: el.durationInFrames,
    animation: {
      preset: mapPreset(el.animation.enter.type),
      duration: el.animation.enter.durationInFrames,
      easing: mapEasing(el.animation.enter.easing),
    },
    containerStyle:
      el.component === "Subtitle"
        ? undefined
        : {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          },
  };
}

function convertScene(
  composed: ComposedScene,
  index: number,
  durationSec: number,
  fps: number,
  title: string
): Scene {
  const durationInFrames = Math.round(durationSec * fps);

  const scene: Scene = {
    id: `scene-${index + 1}`,
    title,
    durationInFrames,
    background: {
      type: composed.background.type as "solid" | "gradient" | "radial",
      color: composed.background.color,
    },
    elements: composed.elements.map((el, i) => convertElement(el, i)),
  };

  if (composed.transition) {
    scene.transition = {
      type: composed.transition.type as TransitionType,
      duration: composed.transition.durationInFrames,
      ...(composed.transition.color
        ? { color: composed.transition.color }
        : {}),
    };
  }

  if (composed.cameraMotion) {
    scene.cameraMotion = composed.cameraMotion;
  }

  return scene;
}

export interface ToSequenceOptions {
  id: string;
  title: string;
  fps?: number;
  width?: number;
  height?: number;
}

export function toSceneSequence(
  composed: ComposedScene[],
  durations: number[],
  titles: string[],
  options: ToSequenceOptions
): SceneSequence {
  const fps = options.fps ?? 30;

  return {
    id: options.id,
    title: options.title,
    fps,
    width: options.width ?? 1920,
    height: options.height ?? 1080,
    scenes: composed.map((scene, i) =>
      convertScene(scene, i, durations[i], fps, titles[i] ?? `Scene ${i + 1}`)
    ),
  };
}
