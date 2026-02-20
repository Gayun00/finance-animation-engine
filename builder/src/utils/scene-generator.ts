import type { PresetMetadata, TransitionType, SlotDefinition } from "../types/preset-meta";
import { getPresetById } from "../data/preset-registry";
import { getAssetById, type AssetEntry } from "../data/asset-catalog";

// Minimal output types matching the engine's SceneSequence
export interface SceneSequenceOutput {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneOutput[];
}

interface ParallaxLayerOutput {
  speed: number;
  splitDirection: "none" | "horizontal";
  elements: ElementOutput[];
}

interface SceneOutput {
  id: string;
  title: string;
  durationInFrames: number;
  background: Record<string, unknown>;
  transition?: Record<string, unknown>;
  elements: ElementOutput[];
  cameraMotion?: Record<string, unknown>;
  parallaxLayers?: ParallaxLayerOutput[];
}

interface ElementOutput {
  id: string;
  component: string;
  props: Record<string, unknown>;
  animation?: Record<string, unknown>;
  startFrame?: number;
  durationInFrames?: number;
  containerStyle?: Record<string, unknown>;
  parallax?: Record<string, unknown>;
  splitSide?: "left" | "right";
}

export interface SceneConfig {
  id: string;
  presetId: string;
  title: string;
  durationInFrames: number;
  subtitle: string;
  slotAssignments: Record<string, string | null>; // slotId -> assetId
  transitionType: TransitionType;
  transitionDuration: number;
  transitionColor?: string;
  labelOverrides?: Record<string, string>; // for timeline/split labels
}

// Detect static image vs Lottie by file extension
function isStaticImageFile(file: string): boolean {
  return /\.(webp|png|jpg|jpeg|svg|gif)$/i.test(file);
}

// Build element from slot + asset, auto-detecting component type
function buildElementFromSlot(
  sceneId: string,
  slot: SlotDefinition,
  asset: AssetEntry
): ElementOutput {
  const srcPath = `animations/${asset.file}`;
  const isImage = isStaticImageFile(asset.file);

  const component = isImage ? "StaticImage" : slot.component;
  const props = isImage
    ? { src: srcPath, width: "100%", height: "100%", objectFit: "cover" }
    : { ...slot.defaultProps, src: srcPath };

  return {
    id: `${sceneId}-${slot.id}`,
    component,
    props,
    containerStyle: slot.position.containerStyle as Record<string, unknown>,
    startFrame: slot.defaultStartFrame,
    durationInFrames: slot.defaultDurationInFrames,
    animation: {
      preset: slot.defaultAnimation.preset,
      duration: slot.defaultAnimation.duration,
      easing: slot.defaultAnimation.easing,
      exitPreset: slot.defaultAnimation.exitPreset,
      exitDuration: slot.defaultAnimation.exitDuration,
    },
    splitSide: slot.splitSide,
  };
}

// Accumulate preset: generate wave positions
function generateAccumulateElements(
  sceneId: string,
  assetFile: string,
  preset: PresetMetadata
): ElementOutput[] {
  const elements: ElementOutput[] = [];
  const waves = [
    { count: 1, startFrame: 10, size: 160 },
    { count: 3, startFrame: 60, size: 140 },
    { count: 8, startFrame: 130, size: 120 },
  ];

  const positions = [
    // Wave 1: center
    [{ top: "40%", left: "47%" }],
    // Wave 2: triangle around center
    [{ top: "25%", left: "30%" }, { top: "25%", left: "60%" }, { top: "55%", left: "45%" }],
    // Wave 3: spread
    [
      { top: "15%", left: "18%" }, { top: "15%", left: "45%" }, { top: "15%", left: "72%" },
      { top: "38%", left: "15%" }, { top: "38%", left: "72%" },
      { top: "58%", left: "22%" }, { top: "58%", left: "65%" }, { top: "60%", left: "45%" },
    ],
  ];

  waves.forEach((wave, wi) => {
    positions[wi].forEach((pos, pi) => {
      elements.push({
        id: `${sceneId}-w${wi + 1}-${pi + 1}`,
        component: "LottieElement",
        props: {
          src: `animations/${assetFile}`,
          loop: true,
          speed: 0.85 + Math.random() * 0.35,
          style: { width: wave.size, height: wave.size },
        },
        containerStyle: { position: "absolute", ...pos },
        startFrame: wave.startFrame + pi * 8,
        animation: { preset: "scale_in", duration: wi === 2 ? 12 : 15, easing: "kurzgesagt" },
      });
    });
  });

  return elements;
}

// Depth preset: generate parallax layers
function generateDepthScene(
  config: SceneConfig,
  preset: PresetMetadata
): { parallaxLayers: ParallaxLayerOutput[]; elements: ElementOutput[] } {
  const pConfig = preset.parallaxConfig!;
  const elements: ElementOutput[] = []; // non-parallax elements (popup, fixed)
  const parallaxLayers: ParallaxLayerOutput[] = [];

  // Build parallax layers
  for (const layerConfig of pConfig.layers) {
    const layerElements: ElementOutput[] = [];

    for (const slot of preset.slots) {
      // Match slot to layer by prefix
      if (!slot.parallaxLayer || slot.parallaxLayer !== layerConfig.slotPrefix) continue;

      const assetId = config.slotAssignments[slot.id];
      if (!assetId) continue;
      const asset = getAssetById(assetId);
      if (!asset) continue;

      layerElements.push(buildElementFromSlot(config.id, slot, asset));
    }

    parallaxLayers.push({
      speed: layerConfig.speed,
      splitDirection: layerConfig.splitDirection,
      elements: layerElements,
    });
  }

  // Non-parallax slots (e.g., popup) go into regular elements
  for (const slot of preset.slots) {
    if (slot.parallaxLayer) continue; // already handled above
    const assetId = config.slotAssignments[slot.id];
    if (!assetId) continue;
    const asset = getAssetById(assetId);
    if (!asset) continue;

    elements.push(buildElementFromSlot(config.id, slot, asset));
  }

  return { parallaxLayers, elements };
}

export function generateSceneSequence(
  scenes: SceneConfig[],
  meta: { id: string; title: string; fps: number; width: number; height: number }
): SceneSequenceOutput {
  return {
    ...meta,
    scenes: scenes.map((config, index) => generateScene(config, index)),
  };
}

function generateScene(config: SceneConfig, index: number): SceneOutput {
  const preset = getPresetById(config.presetId);
  if (!preset) throw new Error(`Preset "${config.presetId}" not found`);

  const elements: ElementOutput[] = [];

  // 1. Fixed decorative elements
  preset.fixedElements.forEach((fixed, i) => {
    elements.push({
      id: `${config.id}-fixed-${i}`,
      component: fixed.component,
      props: { ...fixed.props },
      containerStyle: fixed.containerStyle as Record<string, unknown> | undefined,
      animation: fixed.animation
        ? { preset: fixed.animation.preset, duration: fixed.animation.duration }
        : undefined,
    });
  });

  // 2. Slot-assigned elements
  let parallaxLayers: ParallaxLayerOutput[] | undefined;

  if (preset.parallaxConfig) {
    // Depth-style preset: generate parallax layers
    const depth = generateDepthScene(config, preset);
    parallaxLayers = depth.parallaxLayers;
    elements.push(...depth.elements);
  } else if (config.presetId === "accumulate") {
    const assetId = config.slotAssignments["asset"];
    const asset = assetId ? getAssetById(assetId) : null;
    if (asset) {
      elements.push(...generateAccumulateElements(config.id, asset.file, preset));
    }
  } else {
    for (const slot of preset.slots) {
      const assetId = config.slotAssignments[slot.id];
      if (!assetId) continue;
      const asset = getAssetById(assetId);
      if (!asset) continue;

      elements.push(buildElementFromSlot(config.id, slot, asset));
    }
  }

  // 3. Subtitle
  if (config.subtitle) {
    elements.push({
      id: `${config.id}-subtitle`,
      component: "Subtitle",
      props: { text: config.subtitle },
      startFrame: 10,
      animation: { preset: "fade_in", duration: 15 },
    });
  }

  // 4. Assemble scene
  const scene: SceneOutput = {
    id: config.id,
    title: config.title,
    durationInFrames: config.durationInFrames,
    background: preset.defaultBackground as unknown as Record<string, unknown>,
    elements,
  };

  if (parallaxLayers && parallaxLayers.length > 0) {
    scene.parallaxLayers = parallaxLayers;
  }

  if (index > 0 && config.transitionType !== "none") {
    scene.transition = {
      type: config.transitionType,
      duration: config.transitionDuration,
      ...(config.transitionColor ? { color: config.transitionColor } : {}),
    };
  }

  if (preset.defaultCameraMotion) {
    scene.cameraMotion = preset.defaultCameraMotion as unknown as Record<string, unknown>;
  }

  return scene;
}
