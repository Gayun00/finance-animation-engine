/**
 * Lottie JSON assembler
 * Takes parsed SVG paths and builds a valid Lottie JSON structure.
 * Each SVG path becomes an individual shape layer for future per-layer animation.
 */

import type { SvgPath, ParsedSvg } from "./parse-svg.js";
import { svgPathToLottieShape } from "./path-to-lottie.js";
import { getMotionTransform, type MotionPreset } from "./motion-presets.js";

export interface LottieJson {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: unknown[];
  layers: LottieLayer[];
  markers: unknown[];
}

interface LottieLayer {
  ddd: number;
  ind: number;
  ty: number; // 3=null, 4=shape
  nm: string;
  parent?: number;
  sr: number;
  ks: Record<string, unknown>;
  ao: number;
  shapes?: ShapeItem[];
  ip: number;
  op: number;
  st: number;
  bm: number;
}

interface LayerTransform {
  o: StaticProp;  // opacity
  r: StaticProp;  // rotation
  p: StaticProp;  // position
  a: StaticProp;  // anchor
  s: StaticProp;  // scale
}

interface StaticProp {
  a: 0;
  k: number | number[];
  ix?: number;
}

interface ShapeItem {
  ty: string;
  [key: string]: unknown;
}

function makeStaticTransform(): LayerTransform {
  return {
    o: { a: 0, k: 100, ix: 11 },
    r: { a: 0, k: 0, ix: 10 },
    p: { a: 0, k: [0, 0, 0], ix: 2 },
    a: { a: 0, k: [0, 0, 0], ix: 1 },
    s: { a: 0, k: [100, 100, 100], ix: 6 },
  };
}

function buildShapeGroup(
  path: SvgPath,
  index: number,
): ShapeItem {
  const lottieShapes = svgPathToLottieShape(path.d);

  const shapeItems: ShapeItem[] = [];

  // Add each subpath as a shape ("sh")
  for (let si = 0; si < lottieShapes.length; si++) {
    const s = lottieShapes[si];
    shapeItems.push({
      ty: "sh",
      ind: si,
      ix: si + 1,
      ks: {
        a: 0,
        k: {
          i: s.i,
          o: s.o,
          v: s.v,
          c: s.c,
        },
        ix: 2,
      },
      nm: `Path ${si + 1}`,
      hd: false,
    });
  }

  // Add fill
  const [r, g, b, a] = path.fill;
  shapeItems.push({
    ty: "fl",
    c: { a: 0, k: [r, g, b, 1], ix: 4 },
    o: { a: 0, k: a * 100, ix: 5 },
    r: 1,  // fill rule: non-zero
    bm: 0,
    nm: "Fill 1",
    hd: false,
  });

  // Add transform
  shapeItems.push({
    ty: "tr",
    p: { a: 0, k: [0, 0], ix: 2 },
    a: { a: 0, k: [0, 0], ix: 1 },
    s: { a: 0, k: [100, 100], ix: 3 },
    r: { a: 0, k: 0, ix: 6 },
    o: { a: 0, k: 100, ix: 7 },
    sk: { a: 0, k: 0, ix: 4 },
    sa: { a: 0, k: 0, ix: 5 },
    nm: "Transform",
  });

  return {
    ty: "gr",
    it: shapeItems,
    nm: `Group ${index + 1}`,
    np: shapeItems.length,
    cix: 2,
    bm: 0,
    ix: 1,
    hd: false,
  };
}

export interface BuildOptions {
  name?: string;
  fps?: number;
  durationFrames?: number;
  motion?: MotionPreset;
}

export function buildLottie(
  parsed: ParsedSvg,
  opts: BuildOptions = {},
): LottieJson {
  const {
    name = "converted",
    fps = 30,
    durationFrames = 90,
    motion,
  } = opts;

  const { viewBox, paths } = parsed;

  // Reserve ind=0 for null parent if motion is set
  const indOffset = motion ? 1 : 0;

  const shapeLayers: LottieLayer[] = paths.map((path, idx) => ({
    ddd: 0,
    ind: idx + 1 + indOffset,
    ty: 4,  // shape layer
    nm: `path_${idx + 1}`,
    ...(motion ? { parent: 1 } : {}),
    sr: 1,
    ks: makeStaticTransform(),
    ao: 0,
    shapes: [buildShapeGroup(path, idx)],
    ip: 0,
    op: durationFrames,
    st: 0,
    bm: 0,
  }));

  const layers: LottieLayer[] = [];

  if (motion) {
    // Null parent layer with animated transform
    const cx = viewBox.w / 2;
    const cy = viewBox.h / 2;
    const motionKs = getMotionTransform(motion, fps, durationFrames, cx, cy);
    layers.push({
      ddd: 0,
      ind: 1,
      ty: 3, // null layer
      nm: `motion_${motion}`,
      sr: 1,
      ks: {
        ...motionKs,
        a: { a: 0, k: [cx, cy, 0], ix: 1 },
      },
      ao: 0,
      ip: 0,
      op: durationFrames,
      st: 0,
      bm: 0,
    });
  }

  layers.push(...shapeLayers);

  return {
    v: "5.7.6",
    fr: fps,
    ip: 0,
    op: durationFrames,
    w: viewBox.w,
    h: viewBox.h,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
    markers: [],
  };
}
