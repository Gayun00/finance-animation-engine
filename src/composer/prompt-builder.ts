/**
 * LLM Prompt Builder — assembles the system prompt for the Scene Composer.
 *
 * Injects available layouts, components, assets, transitions,
 * color palette, and motion rules into a structured prompt.
 */

import type { ScriptSection, ComposedScene, LayoutType } from "./types";
import type { TransitionType } from "../types";
import { ASSET_REGISTRY } from "./asset-matcher";
import { FEW_SHOT_EXAMPLES } from "./few-shot-examples";
import {
  TRANSITION_DEFAULTS,
  COLOR_WIPE_COLORS,
  LAYOUT_BY_TYPE,
  LAYOUT_BY_DIRECTIVE,
  ELEMENT_ORDERING,
  ELEMENT_SIZING,
  RECOMMENDED_MOTION,
} from "./rules";
import { COLORS } from "../theme/colors";
import { SAFE_ZONE } from "../theme/layout";

// ── Available Components (from registry) ──

const AVAILABLE_COMPONENTS = [
  "TitleCard",
  "EndCard",
  "CountUpNumber",
  "CompoundInterestChart",
  "CalloutBox",
  "LottieElement",
  "LottieOverlay",
  "LottieShowcase",
  "Subtitle",
  "Spotlight",
];

const AVAILABLE_LAYOUTS: LayoutType[] = [
  "FullScreen",
  "CenterLayout",
  "SplitLayout",
  "TopBottomLayout",
  "GridLayout",
  "FocusLayout",
];

const AVAILABLE_TRANSITIONS: TransitionType[] = [
  "fade",
  "wipe_left",
  "wipe_right",
  "color_wipe",
  "zoom_in",
  "zoom_out",
  "slide_up",
  "cross_dissolve",
];

// ── Output JSON Schema ──

const OUTPUT_SCHEMA = `{
  "layout": "<LayoutType>",
  "layoutProps"?: { "ratio"?: number, "columns"?: number, "topHeight"?: number },
  "background": { "type": "solid" | "gradient", "color"?: string, "from"?: string, "to"?: string, "angle"?: number },
  "elements": [
    {
      "component": "<ComponentName>",
      "props": { ... },
      "position": { "x": number, "y": number },
      "enterAt": number,  // frame number
      "animation": {
        "enter": { "type": string, "durationInFrames": number, "easing"?: string, "direction"?: string },
        "during"?: { "type": string, "durationInFrames": number },
        "exit"?: { "type": string, "durationInFrames": number }
      }
    }
  ],
  "transition": { "type": "<TransitionType>", "durationInFrames": number, "color"?: string } | null
}`;

// ── Prompt Assembly ──

export interface PromptContext {
  section: ScriptSection;
  prevTransition: TransitionType | null;
  sceneIndex: number;
  totalScenes: number;
}

/**
 * Build the full system prompt for the Scene Composer LLM.
 */
export function buildSystemPrompt(): string {
  return `You are a motion graphics director for financial education videos in Kurzgesagt style.
Your task is to compose scene layouts from script sections.

## Available Layouts
${JSON.stringify(AVAILABLE_LAYOUTS)}

## Available Components
${JSON.stringify(AVAILABLE_COMPONENTS)}

## Available Assets (Lottie)
${JSON.stringify(
  ASSET_REGISTRY.map((a) => ({
    id: a.id,
    file: a.file,
    tags: a.tags,
    category: a.category,
  })),
  null,
  2
)}

## Available Transitions
${JSON.stringify(AVAILABLE_TRANSITIONS)}

## Color Palette
${JSON.stringify(COLORS, null, 2)}

## Color Wipe Colors
${JSON.stringify(COLOR_WIPE_COLORS)}

## Safe Zone
${JSON.stringify(SAFE_ZONE)}

## Layout Defaults by Section Type
${JSON.stringify(LAYOUT_BY_TYPE)}

## Layout Overrides by Directive
${JSON.stringify(LAYOUT_BY_DIRECTIVE)}

## Transition Defaults by Section Type
${JSON.stringify(TRANSITION_DEFAULTS)}

## Element Sizing Defaults
${JSON.stringify(ELEMENT_SIZING, null, 2)}

## Element Ordering Rules
- Enter order: ${ELEMENT_ORDERING.enterOrder.join(" → ")}
- Stagger delay: ${ELEMENT_ORDERING.staggerDelay} frames (0.2s at 30fps)
- Max simultaneous: ${ELEMENT_ORDERING.maxSimultaneous}
- Exit starts ${ELEMENT_ORDERING.exitStartBeforeEnd} frames before scene end

## Motion Recommendations
${JSON.stringify(RECOMMENDED_MOTION, null, 2)}

## Rules
1. Scene duration MUST match narration duration exactly
2. Default easing: KURZGESAGT [0.32, 0, 0.15, 1]
3. Screen must not be empty for more than 0.5s (15 frames at 30fps)
4. Maximum 3 elements entering simultaneously
5. Maximum 5 elements per scene
6. Chart animations start 0.3s (9 frames) after data is mentioned in narration
7. Never use the same transition type consecutively
8. Visual continuity: the last element of scene N should relate to the first element of scene N+1

## Output Format
${OUTPUT_SCHEMA}`;
}

/**
 * Build the user prompt for a single section.
 */
export function buildUserPrompt(ctx: PromptContext): string {
  const { section, prevTransition, sceneIndex, totalScenes } = ctx;

  let prompt = `Compose scene ${sceneIndex + 1}/${totalScenes}.

Section type: ${section.type}
Narration: "${section.narration}"
Duration: ${section.duration}s (${Math.round(section.duration * 30)} frames at 30fps)
Previous transition: ${prevTransition ?? "none (first scene)"}`;

  if (section.directive) {
    prompt += `\nDirective: @${section.directive.type} ${JSON.stringify(section.directive.params)}`;
  }

  if (section.type === "outro") {
    prompt += `\nNote: This is the last scene. Transition should be null.`;
  }

  prompt += `\n\nRespond with a single JSON object matching the output format.`;

  return prompt;
}

/**
 * Build the few-shot examples section.
 */
export function buildFewShotSection(): string {
  return `## Few-shot Examples

${FEW_SHOT_EXAMPLES.map(
  (ex, i) => `### Example ${i + 1}
Input: ${JSON.stringify(ex.input)}
Output: ${JSON.stringify(ex.output)}`
).join("\n\n")}`;
}

/**
 * Build the complete prompt (system + few-shot) for one-shot usage.
 */
export function buildFullPrompt(ctx: PromptContext): {
  system: string;
  user: string;
} {
  const system = buildSystemPrompt() + "\n\n" + buildFewShotSection();
  const user = buildUserPrompt(ctx);
  return { system, user };
}
