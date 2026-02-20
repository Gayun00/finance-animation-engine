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
  selectCameraMotion,
  suggestElementCount,
  ELEMENT_ORDERING,
  COLOR_WIPE_COLORS,
} from "./rules";
import {
  matchAssets,
  findBestAsset,
  SECTION_ASSET_HINTS,
  ASSET_REGISTRY,
  type AssetEntry,
} from "./asset-matcher";
import { buildFullPrompt, type PromptContext } from "./prompt-builder";

// ── Rule-based Composer ──

export interface ComposeOptions {
  fps?: number;
  colorPalette?: string[];
  mode?: "rules" | "llm";
}

const DEFAULT_FPS = 30;
const DEFAULT_PALETTE = ["#0EA0E4", "#E92F60", "#14D1C8", "#4F28F2"];

/**
 * Compose a full sequence of scenes from script sections.
 * When mode is "llm", delegates to LLM-based composition (async).
 * When mode is "rules" (default), uses deterministic rule-based logic (sync).
 */
export function composeSequence(
  sections: ScriptSection[],
  options?: ComposeOptions & { mode?: "rules" }
): ComposedScene[];
export function composeSequence(
  sections: ScriptSection[],
  options: ComposeOptions & { mode: "llm" }
): Promise<ComposedScene[]>;
export function composeSequence(
  sections: ScriptSection[],
  options?: ComposeOptions
): ComposedScene[] | Promise<ComposedScene[]> {
  if (options?.mode === "llm") {
    return import("./llm-compose").then(({ composeSequenceWithLLM }) =>
      composeSequenceWithLLM(sections, options)
    );
  }
  return composeSequenceSync(sections, options);
}

function composeSequenceSync(
  sections: ScriptSection[],
  options?: ComposeOptions
): ComposedScene[] {
  const fps = options?.fps ?? DEFAULT_FPS;
  const palette = options?.colorPalette ?? DEFAULT_PALETTE;
  let prevTransition: TransitionType | null = null;
  const globalUsedIds = new Set<string>();

  return sections.map((section, i) => {
    const scene = composeScene(section, {
      prevTransition,
      sceneIndex: i,
      totalScenes: sections.length,
      fps,
      bgColor: palette[i % palette.length],
      globalUsedIds,
    });

    // Track used asset IDs to avoid repeating across scenes
    for (const el of scene.elements) {
      const src = (el.props as Record<string, unknown>).src as string | undefined;
      if (src) {
        const entry = ASSET_REGISTRY.find((a) => `animations/${a.file}` === src);
        if (entry) globalUsedIds.add(entry.id);
      }
    }

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
  globalUsedIds: Set<string>;
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

  // 2. Select transition (override takes precedence)
  const isLast = ctx.sceneIndex === ctx.totalScenes - 1;
  const transitionType = isLast
    ? null
    : section.overrides?.transition
      ?? selectTransition(section.type, ctx.prevTransition, section.narration);

  // 3. Select camera motion
  const cameraMotion = selectCameraMotion(section.type, ctx.sceneIndex);

  // 4. Build elements
  const elements = buildElements(section, layout, fps, totalFrames, ctx.globalUsedIds);

  // 5. Build transition config
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
    cameraMotion,
  };
}

// ── Scene Mode Types ──

type SceneMode = "strong_background" | "simple_background" | "character";

/**
 * Determine scene mode based on matched assets and overrides.
 *
 * 1. character asset present → character mode
 * 2. bgAssetIds override or background asset matched → strong background mode
 * 3. otherwise → simple background mode
 */
function determineSceneMode(
  assetMatches: import("./asset-matcher").AssetMatch[],
  overrides?: ScriptSection["overrides"]
): SceneMode {
  const hasCharacter = assetMatches.some((m) => m.asset.category === "character");
  if (hasCharacter) return "character";

  const hasBgOverride = (overrides?.bgAssetIds ?? []).length > 0;
  const hasBgAsset = assetMatches.some((m) => m.asset.category === "background");
  if (hasBgOverride || hasBgAsset) return "strong_background";

  return "simple_background";
}

function buildElements(
  section: ScriptSection,
  layout: LayoutType,
  fps: number,
  totalFrames: number,
  globalUsedIds: Set<string>
): ComposedElement[] {
  const elements: ComposedElement[] = [];
  const overrides = section.overrides;

  // Collect IDs to exclude
  const excludeIds = new Set([
    ...globalUsedIds,
    ...(overrides?.excludeAssetIds ?? []),
  ]);

  // ── Background layers (explicitly specified via overrides) ──
  const bgAssetIds = new Set(overrides?.bgAssetIds ?? []);
  for (const id of bgAssetIds) {
    const asset = ASSET_REGISTRY.find((a) => a.id === id);
    if (asset) {
      elements.push(makeBgElement(asset, totalFrames));
      excludeIds.add(id);
    }
  }

  // ── Match all assets by narration ──
  const allMatches = matchAssets(section.narration, {
    maxResults: 10,
    excludeIds: [...excludeIds],
  });

  // Fallback: pick by section category hints
  if (allMatches.length === 0) {
    const categories = SECTION_ASSET_HINTS[section.type] ?? ["element"];
    for (const cat of categories) {
      const fallback = findBestAsset(section.type, cat, [...excludeIds]);
      if (fallback) {
        allMatches.push({ asset: fallback, score: 0 });
        break;
      }
    }
  }

  // ── Determine scene mode ──
  const mode = determineSceneMode(allMatches, overrides);

  // ── Mode-specific element composition ──
  switch (mode) {
    case "strong_background":
      buildStrongBgElements(allMatches, elements, totalFrames, fps, layout, overrides);
      break;
    case "character":
      buildCharacterElements(allMatches, elements, totalFrames, fps, layout, overrides);
      break;
    case "simple_background":
    default:
      buildSimpleBgElements(allMatches, elements, totalFrames, fps, layout, section.duration, overrides);
      break;
  }

  // Subtitle (always last)
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

/**
 * Strong background mode: background asset as LottieOverlay + max 2 foreground elements.
 */
function buildStrongBgElements(
  matches: import("./asset-matcher").AssetMatch[],
  elements: ComposedElement[],
  totalFrames: number,
  fps: number,
  layout: LayoutType,
  overrides?: ScriptSection["overrides"]
): void {
  const MAX_FG = 2;

  // Add background assets as overlays
  for (const m of matches) {
    if (m.asset.category === "background") {
      elements.push(makeBgElement(m.asset, totalFrames));
    }
  }

  // Foreground: non-background elements, capped at 2
  const fgMatches = matches.filter((m) => m.asset.category !== "background");
  const fgCount = Math.min(fgMatches.length, MAX_FG);
  const subtitleBuffer = 15;
  const availableFrames = totalFrames - subtitleBuffer;
  const targetSlice = 3 * fps;
  const sliceDuration =
    fgCount > 0
      ? Math.min(targetSlice, Math.floor(availableFrames / fgCount))
      : 0;

  const usedIds = new Set<string>();
  let fgIndex = 0;
  for (const match of fgMatches) {
    if (fgIndex >= fgCount) break;
    if (usedIds.has(match.asset.id)) continue;
    usedIds.add(match.asset.id);

    const enterAt = fgIndex * sliceDuration;
    const el = makeLottieElement(match.asset, enterAt, layout, sliceDuration);

    const enterOverride = overrides?.elementEnter?.[fgIndex];
    if (enterOverride) el.animation.enter.type = enterOverride;

    elements.push(el);
    fgIndex++;
  }
}

/**
 * Simple background mode: auto-add effect layers (FloatingParticles/GradientOrb) + 3-5 foreground elements.
 */
function buildSimpleBgElements(
  matches: import("./asset-matcher").AssetMatch[],
  elements: ComposedElement[],
  totalFrames: number,
  fps: number,
  layout: LayoutType,
  durationSec: number,
  overrides?: ScriptSection["overrides"]
): void {
  const { max } = suggestElementCount(durationSec);

  // Auto-add decoration layers for visual density
  elements.push({
    component: "GradientOrb",
    props: { color: "#4FC3F7", size: 350, x: 70, y: 30, opacity: 0.12, blur: 70 },
    position: { x: 960, y: 540 },
    enterAt: 0,
    animation: {
      enter: { type: "fade_in", durationInFrames: 20 },
    },
  });
  elements.push({
    component: "FloatingParticles",
    props: {
      count: 12,
      color: "rgba(255,255,255,0.5)",
      size: 6,
      speed: 0.8,
      shape: "dot" as const,
      opacity: 0.18,
    },
    position: { x: 960, y: 540 },
    enterAt: 0,
    animation: {
      enter: { type: "fade_in", durationInFrames: 15 },
    },
  });

  // Foreground: effect + element assets
  const fgMatches = matches.filter(
    (m) => m.asset.category === "element" || m.asset.category === "effect" || m.asset.category === "emoji"
  );
  const fgCount = Math.min(fgMatches.length, max);
  const subtitleBuffer = 15;
  const availableFrames = totalFrames - subtitleBuffer;
  const targetSlice = 3 * fps;
  const sliceDuration =
    fgCount > 0
      ? Math.min(targetSlice, Math.floor(availableFrames / fgCount))
      : 0;

  const usedIds = new Set<string>();
  let fgIndex = 0;
  for (const match of fgMatches) {
    if (fgIndex >= fgCount) break;
    if (usedIds.has(match.asset.id)) continue;
    usedIds.add(match.asset.id);

    const enterAt = fgIndex * sliceDuration;
    const el = makeLottieElement(match.asset, enterAt, layout, sliceDuration);

    const enterOverride = overrides?.elementEnter?.[fgIndex];
    if (enterOverride) el.animation.enter.type = enterOverride;

    elements.push(el);
    fgIndex++;
  }
}

/**
 * Character mode: character asset placed first, then elements stagger in/out around character actions.
 */
function buildCharacterElements(
  matches: import("./asset-matcher").AssetMatch[],
  elements: ComposedElement[],
  totalFrames: number,
  fps: number,
  layout: LayoutType,
  overrides?: ScriptSection["overrides"]
): void {
  const MAX_FG = 3;

  // Place character first
  const charMatch = matches.find((m) => m.asset.category === "character");
  if (charMatch) {
    elements.push({
      component: "LottieElement",
      props: {
        src: `animations/${charMatch.asset.file}`,
        loop: true,
        fitDurationInFrames: totalFrames,
      },
      position: { x: 350, y: 540 },
      enterAt: 0,
      durationInFrames: totalFrames,
      animation: {
        enter: { type: "slide_in", durationInFrames: 12 },
      },
    });
  }

  // Stagger remaining elements alongside character
  const fgMatches = matches.filter((m) => m.asset.category !== "character");
  const fgCount = Math.min(fgMatches.length, MAX_FG);
  const subtitleBuffer = 15;
  const availableFrames = totalFrames - subtitleBuffer;
  const targetSlice = 3 * fps;
  const sliceDuration =
    fgCount > 0
      ? Math.min(targetSlice, Math.floor(availableFrames / fgCount))
      : 0;

  const usedIds = new Set<string>();
  let fgIndex = 0;
  for (const match of fgMatches) {
    if (fgIndex >= fgCount) break;
    if (usedIds.has(match.asset.id)) continue;
    usedIds.add(match.asset.id);

    const enterAt = fgIndex * sliceDuration;
    const el = makeLottieElement(match.asset, enterAt, layout, sliceDuration);
    // Position elements on the right side (character is on left)
    el.position = { x: 1200, y: 450 + fgIndex * 120 };

    const enterOverride = overrides?.elementEnter?.[fgIndex];
    if (enterOverride) el.animation.enter.type = enterOverride;

    elements.push(el);
    fgIndex++;
  }
}

// ── Element Factories ──

function makeBgElement(
  asset: AssetEntry,
  totalFrames: number
): ComposedElement {
  return {
    component: "LottieOverlay",
    props: {
      src: `animations/${asset.file}`,
      loop: true,
      opacity: 0.25,
      blendMode: "screen",
      cover: true,
    },
    position: { x: 960, y: 540 },
    enterAt: 0,
    durationInFrames: totalFrames,
    animation: {
      enter: { type: "fade_in", durationInFrames: 15 },
    },
  };
}

function makeLottieElement(
  asset: AssetEntry,
  enterAt: number,
  layout: LayoutType,
  durationInFrames?: number
): ComposedElement {
  return {
    component: "LottieElement",
    props: {
      src: `animations/${asset.file}`,
      loop: false,
      fitDurationInFrames: durationInFrames,
    },
    position: { x: 960, y: 540 },
    enterAt,
    ...(durationInFrames ? { durationInFrames } : {}),
    animation: {
      enter: {
        type: "scale_in",
        durationInFrames: 12,
      },
      exit: {
        type: "fade_out",
        durationInFrames: 9,
      },
    },
  };
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
      selectTransition(section.type, prevTransition, section.narration) ?? null;
    return prompt;
  });
}
