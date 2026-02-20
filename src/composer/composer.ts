/**
 * Scene Composer Pipeline — orchestrates rules + asset matching + prompt building.
 *
 * Two modes:
 * 1. Rule-based: deterministic composition using rules.ts (no LLM needed)
 * 2. LLM-assisted: generates prompt for LLM to compose scenes (prompt-builder.ts)
 */

import type {
  ScriptSection,
  ComposedScene,
  ComposedElement,
  LayoutType,
} from "./types";
import type { TransitionType } from "../types";
import {
  selectTransition,
  selectLayout,
  suggestElementCount,
  ELEMENT_ORDERING,
  RECOMMENDED_MOTION,
  ELEMENT_SIZING,
  COLOR_WIPE_COLORS,
} from "./rules";
import {
  matchAssets,
  findBestAsset,
  SECTION_ASSET_HINTS,
  type AssetEntry,
} from "./asset-matcher";
import { buildFullPrompt, type PromptContext } from "./prompt-builder";

// ── Rule-based Composer ──

export interface ComposeOptions {
  fps?: number;
  colorPalette?: string[];
}

const DEFAULT_FPS = 30;
const DEFAULT_PALETTE = ["#0EA0E4", "#E92F60", "#14D1C8", "#4F28F2"];

/**
 * Compose a full sequence of scenes from script sections using rule-based logic.
 */
export function composeSequence(
  sections: ScriptSection[],
  options?: ComposeOptions
): ComposedScene[] {
  const fps = options?.fps ?? DEFAULT_FPS;
  const palette = options?.colorPalette ?? DEFAULT_PALETTE;
  let prevTransition: TransitionType | null = null;

  return sections.map((section, i) => {
    const scene = composeScene(section, {
      prevTransition,
      sceneIndex: i,
      totalScenes: sections.length,
      fps,
      bgColor: palette[i % palette.length],
    });

    prevTransition = scene.transition?.type ?? null;
    return scene;
  });
}

interface SceneContext {
  prevTransition: TransitionType | null;
  sceneIndex: number;
  totalScenes: number;
  fps: number;
  bgColor: string;
}

function composeScene(
  section: ScriptSection,
  ctx: SceneContext
): ComposedScene {
  const { fps, bgColor } = ctx;
  const totalFrames = Math.round(section.duration * fps);

  // 1. Select layout
  const layout = selectLayout(
    section.type,
    section.directive?.type
  );

  // 2. Select transition
  const isLast = ctx.sceneIndex === ctx.totalScenes - 1;
  const transitionType = isLast
    ? null
    : selectTransition(section.type, ctx.prevTransition);

  // 3. Build elements
  const elements = buildElements(section, layout, fps, totalFrames);

  // 4. Build transition config
  const transition = transitionType
    ? {
        type: transitionType,
        durationInFrames: transitionType === "color_wipe" ? 15 : 12,
        ...(transitionType === "color_wipe"
          ? { color: COLOR_WIPE_COLORS.default }
          : {}),
      }
    : null;

  return {
    layout,
    background: { type: "solid", color: bgColor },
    elements,
    transition,
  };
}

function buildElements(
  section: ScriptSection,
  layout: LayoutType,
  fps: number,
  totalFrames: number
): ComposedElement[] {
  const elements: ComposedElement[] = [];
  const { min, max } = suggestElementCount(section.duration);
  const stagger = ELEMENT_ORDERING.staggerDelay;

  // Get recommended asset categories for this section type
  const categoryHints = SECTION_ASSET_HINTS[section.type] ?? ["icon"];

  // Find matching assets
  const assetMatches = matchAssets(section.narration, {
    maxResults: max,
  });

  // Build primary content element based on section type
  switch (section.type) {
    case "intro":
      elements.push(makeTitleElement(section));
      break;
    case "explain":
      elements.push(makeExplainElement(section, fps));
      break;
    case "chart":
      elements.push(makeChartElement(section, fps));
      break;
    case "comparison":
      elements.push(makeComparisonElement(section, fps));
      break;
    case "callout":
      elements.push(makeCalloutElement(section, fps));
      break;
    case "outro":
      elements.push(makeOutroElement(section));
      break;
  }

  // Add matched Lottie assets as supporting elements
  const usedIds = new Set<string>();
  for (const match of assetMatches) {
    if (elements.length >= max) break;
    if (usedIds.has(match.asset.id)) continue;
    usedIds.add(match.asset.id);

    const enterAt = elements.length * stagger;
    elements.push(makeLottieElement(match.asset, enterAt, layout));
  }

  // Add subtitle
  elements.push({
    component: "Subtitle",
    props: { text: section.narration },
    position: { x: 960, y: 950 },
    enterAt: 0,
    animation: {
      enter: { type: "fade_in", durationInFrames: 10 },
    },
  });

  return elements;
}

// ── Element Factories ──

function makeTitleElement(section: ScriptSection): ComposedElement {
  const motion = RECOMMENDED_MOTION.TitleCard;
  return {
    component: "TitleCard",
    props: {
      title: extractTitle(section.narration),
      subtitle: "",
    },
    position: { x: 960, y: 540 },
    enterAt: 0,
    animation: {
      enter: {
        type: motion.enter,
        durationInFrames: 18,
        easing: "BOUNCE_IN",
      },
    },
  };
}

function makeExplainElement(
  section: ScriptSection,
  fps: number
): ComposedElement {
  const motion = RECOMMENDED_MOTION.CountUpNumber;
  const numbers = extractNumbers(section.narration);
  if (numbers.length > 0) {
    return {
      component: "CountUpNumber",
      props: {
        from: 0,
        to: numbers[0],
        suffix: "만원",
      },
      position: { x: 960, y: 400 },
      enterAt: Math.round(0.3 * fps),
      animation: {
        enter: { type: motion.enter, durationInFrames: 15 },
        during: { type: motion.during, durationInFrames: 30 },
      },
    };
  }

  return {
    component: "CalloutBox",
    props: {
      text: section.narration.slice(0, 40),
      type: "info",
    },
    position: { x: 960, y: 450 },
    enterAt: Math.round(0.3 * fps),
    animation: {
      enter: { type: "scale_in", durationInFrames: 15 },
    },
  };
}

function makeChartElement(
  section: ScriptSection,
  fps: number
): ComposedElement {
  const motion = RECOMMENDED_MOTION.CompoundInterestChart;
  const params = section.directive?.params ?? {};
  return {
    component: "CompoundInterestChart",
    props: {
      rate: (params.rate as number) ?? 5,
      years: (params.years as number) ?? 30,
      principal: (params.principal as number) ?? 1000,
      compareSingle: true,
    },
    position: { x: 960, y: 500 },
    enterAt: Math.round(0.3 * fps),
    animation: {
      enter: { type: motion.enter, durationInFrames: 45 },
    },
  };
}

function makeComparisonElement(
  section: ScriptSection,
  fps: number
): ComposedElement {
  const params = section.directive?.params ?? {};
  return {
    component: "ComparisonTable" as string,
    props: {
      items: [
        {
          label: (params.A as string) ?? "A",
          value: "",
          color: "#90A4AE",
        },
        {
          label: (params.B as string) ?? "B",
          value: "",
          color: "#81C784",
        },
      ],
      highlightWinner: true,
    },
    position: { x: 960, y: 450 },
    enterAt: Math.round(0.3 * fps),
    animation: {
      enter: {
        type: "slide_in",
        direction: "up",
        durationInFrames: 15,
      },
    },
  };
}

function makeCalloutElement(
  section: ScriptSection,
  fps: number
): ComposedElement {
  const motion = RECOMMENDED_MOTION.CalloutBox;
  return {
    component: "CalloutBox",
    props: {
      text: section.narration.slice(0, 30),
      type: "highlight",
    },
    position: { x: 960, y: 400 },
    enterAt: Math.round(0.3 * fps),
    animation: {
      enter: {
        type: motion.enter,
        durationInFrames: 15,
        easing: "BOUNCE_IN",
      },
      during: { type: motion.during, durationInFrames: 24 },
    },
  };
}

function makeOutroElement(section: ScriptSection): ComposedElement {
  const motion = RECOMMENDED_MOTION.EndCard;
  return {
    component: "EndCard",
    props: {
      channelName: "금융의 정석",
      subscribeText: "구독과 좋아요",
    },
    position: { x: 960, y: 540 },
    enterAt: 0,
    animation: {
      enter: {
        type: motion.enter,
        durationInFrames: 18,
        easing: "KURZGESAGT",
      },
    },
  };
}

function makeLottieElement(
  asset: AssetEntry,
  enterAt: number,
  layout: LayoutType
): ComposedElement {
  const isOverlay = asset.category === "decoration" || asset.category === "effect";
  const component = isOverlay ? "LottieOverlay" : "LottieElement";
  const motion = RECOMMENDED_MOTION[isOverlay ? "LottieElement" : "LottieElement"];

  return {
    component,
    props: {
      src: `animations/${asset.file}`,
      loop: asset.category !== "effect",
      speed: 1,
    },
    position: { x: 960, y: 540 },
    enterAt,
    animation: {
      enter: {
        type: motion.enter,
        durationInFrames: 12,
      },
    },
  };
}

// ── Text Extraction Helpers ──

function extractTitle(narration: string): string {
  // Take a short meaningful phrase from the narration
  const cleaned = narration.replace(/[?？!！]/g, "");
  if (cleaned.length <= 20) return cleaned;
  return cleaned.slice(0, 20) + "…";
}

function extractNumbers(narration: string): number[] {
  const matches = narration.match(/(\d+(?:,\d+)*)/g);
  if (!matches) return [];
  return matches.map((m) => parseInt(m.replace(/,/g, ""), 10)).filter(Boolean);
}

// ── LLM-assisted Composer ──

/**
 * Generate the prompt for an LLM to compose a single scene.
 * Returns system and user prompts ready to send to an LLM API.
 */
export function generateLLMPrompt(
  section: ScriptSection,
  sceneIndex: number,
  totalScenes: number,
  prevTransition: TransitionType | null
): { system: string; user: string } {
  const ctx: PromptContext = {
    section,
    prevTransition,
    sceneIndex,
    totalScenes,
  };
  return buildFullPrompt(ctx);
}

/**
 * Generate prompts for all sections in a script.
 */
export function generateAllLLMPrompts(
  sections: ScriptSection[]
): Array<{ system: string; user: string }> {
  let prevTransition: TransitionType | null = null;

  return sections.map((section, i) => {
    const prompt = generateLLMPrompt(
      section,
      i,
      sections.length,
      prevTransition
    );
    // Use the rule-based default for tracking prev transition
    prevTransition =
      selectTransition(section.type, prevTransition) ?? null;
    return prompt;
  });
}
