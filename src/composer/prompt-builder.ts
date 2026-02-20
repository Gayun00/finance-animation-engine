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
  "FloatingParticles",
  "GeometricDecor",
  "GradientOrb",
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
  "transition": { "type": "<TransitionType>", "durationInFrames": number, "color"?: string } | null,
  "cameraMotion"?: { "type": "ken_burns" | "zoom_focus" | "drift", "endScale"?: number, "panX"?: number, "panY"?: number }
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

## Asset Categories (5 types)

| Category | Role | Scene Position |
|----------|------|----------------|
| background | Full-screen background animation | Behind everything |
| effect | Atmospheric decoration (particles, sparkle) | Above background, below elements |
| element | Information delivery (icons, charts, logos) | Content area |
| emoji | Emotion/reaction (expressions) | Popup at emphasis points |
| character | Action subject | Motion driver |

## Scene Modes (auto-selected by asset composition)

### 1. Strong Background Mode
When a \`background\` asset is present or bgAssetIds override is set.
- Background animation plays as full-screen LottieOverlay
- Maximum 1-2 foreground elements (keep it clean)
- No auto-added particles/orbs (background is already rich)

### 2. Simple Background Mode
When no background or character asset is matched.
- Auto-adds effect layers: FloatingParticles + GradientOrb for visual density
- 3-5 foreground elements with stagger timing
- Best for solid-color or gradient backgrounds

### 3. Character Mode
When a \`character\` asset is matched.
- Character placed first (left side, looping)
- Elements stagger in/out on the right, synchronized with character presence
- Maximum 3 supporting elements

## Decoration Components (for visual density)

### FloatingParticles
Floating particle overlay for atmosphere. Props:
- count: number (default 12) — number of particles
- color: string (default "rgba(255,255,255,0.6)")
- size: number (default 8) — particle size in px
- speed: number (default 1) — drift speed multiplier
- shape: "dot" | "star" | "ring"
- opacity: number (default 0.2)
- seed: number (default 42) — deterministic randomness

### GeometricDecor
SVG geometric shapes for background decoration. Props:
- shapes: Array<{ type: "circle"|"triangle"|"hexagon"|"ring", x: number, y: number, size: number, rotationSpeed?: number, opacity?: number, color?: string }>
- color: string (default color for all shapes)
- opacity: number (default 0.2)

### GradientOrb
Soft bokeh/glow light orb. Props:
- color: string (default "#4FC3F7")
- size: number (default 300) — diameter in px
- x: number (default 50) — percentage position
- y: number (default 50) — percentage position
- pulseSpeed: number (default 1)
- opacity: number (default 0.15)
- blur: number (default 60) — CSS blur in px

## Camera Motion
Each scene can have camera motion applied to all elements except Subtitle:
- "ken_burns": slow zoom + pan (intro/outro). endScale, panX, panY
- "zoom_focus": zoom into center (charts/callouts). endScale
- "drift": gentle horizontal drift (explanations). panX

## Design Guidelines — Visual Density
- **Layer density**: Each scene MUST have at least 3 layers: background decoration + main content + particles/glow
- **Decoration placement**: Decorations go in margins, NOT overlapping main content. Use opacity 0.1–0.3
- **Camera selection**: intro → ken_burns, emphasis/callout → zoom_focus, explanation → drift
- **Transition direction**: Match narration motion (upward → slide_up, etc.)
- **Rhythm**: Minimum 6-frame stagger between element entries. Maximum 3 elements entering simultaneously

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
