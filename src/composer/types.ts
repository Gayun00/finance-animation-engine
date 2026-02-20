import type { TransitionType, BackgroundConfig, AnimationConfig } from "../types";

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

export interface ScriptSection {
  type: SectionType;
  narration: string;
  duration: number; // seconds
  directive?: ScriptDirective;
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
}
