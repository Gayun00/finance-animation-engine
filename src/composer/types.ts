import type { TransitionType, BackgroundConfig, AnimationConfig, CameraMotionConfig } from "../types";

// ── Script Input Types ──

export type SectionType =
  | "intro"
  | "explain"
  | "chart"
  | "comparison"
  | "callout"
  | "outro";

export interface ScriptDirective {
  type: string;
  params: Record<string, unknown>;
}

export interface SceneOverrides {
  /** Override the auto-selected transition for this scene */
  transition?: TransitionType;
  /** Asset IDs to render as full-scene background layers */
  bgAssetIds?: string[];
  /** Asset IDs to exclude from this scene */
  excludeAssetIds?: string[];
  /** Override enter animation per foreground element index (0-based) */
  elementEnter?: Record<number, string>;
}

export interface ScriptSection {
  type: SectionType;
  narration: string;
  duration: number; // seconds
  directive?: ScriptDirective;
  overrides?: SceneOverrides;
}

// ── Composer Output Types ──

export type LayoutType =
  | "FullScreen"
  | "CenterLayout"
  | "SplitLayout"
  | "TopBottomLayout"
  | "GridLayout"
  | "FocusLayout";

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementAnimation {
  enter: {
    type: string;
    durationInFrames: number;
    easing?: string;
    direction?: string;
  };
  during?: {
    type: string;
    durationInFrames: number;
  };
  exit?: {
    type: string;
    durationInFrames: number;
  };
}

export interface ComposedElement {
  component: string;
  props: Record<string, unknown>;
  position: ElementPosition;
  enterAt: number; // frame
  durationInFrames?: number; // if set, element disappears after this many frames
  animation: ElementAnimation;
}

export interface ComposedScene {
  layout: LayoutType;
  layoutProps?: Record<string, unknown>;
  background: BackgroundConfig;
  elements: ComposedElement[];
  transition: {
    type: TransitionType;
    durationInFrames: number;
    color?: string;
  } | null;
  cameraMotion?: CameraMotionConfig;
}
