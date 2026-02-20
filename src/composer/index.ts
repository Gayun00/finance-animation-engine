export type {
  SectionType,
  ScriptSection,
  ScriptDirective,
  LayoutType,
  ElementPosition,
  ElementAnimation,
  ComposedElement,
  ComposedScene,
} from "./types";

export {
  selectTransition,
  selectLayout,
  suggestElementCount,
  TRANSITION_DEFAULTS,
  COLOR_WIPE_COLORS,
  LAYOUT_BY_TYPE,
  LAYOUT_BY_DIRECTIVE,
  ELEMENT_ORDERING,
  ELEMENT_SIZING,
  RECOMMENDED_MOTION,
} from "./rules";

export {
  matchAssets,
  findBestAsset,
  ASSET_REGISTRY,
  SECTION_ASSET_HINTS,
} from "./asset-matcher";
export type { AssetEntry, AssetMatch } from "./asset-matcher";

export {
  buildSystemPrompt,
  buildUserPrompt,
  buildFewShotSection,
  buildFullPrompt,
} from "./prompt-builder";
export type { PromptContext } from "./prompt-builder";

export {
  composeSequence,
  generateLLMPrompt,
  generateAllLLMPrompts,
} from "./composer";
export type { ComposeOptions } from "./composer";

export {
  composeSectionWithLLM,
  composeSequenceWithLLM,
} from "./llm-compose";

export { FEW_SHOT_EXAMPLES } from "./few-shot-examples";

export { toSceneSequence } from "./to-scene-sequence";
export type { ToSequenceOptions } from "./to-scene-sequence";
