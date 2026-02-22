#!/usr/bin/env npx tsx
/**
 * 캐릭터 SVG 신체부위 라벨링 + 걷기 모션 Lottie 조립
 *
 * Usage:
 *   npx tsx experiment/svg-to-lottie/label-body-parts.ts <character.svg> [--motion walk|idle|wave] [--output <out.json>]
 *
 * 레이어 계층:
 *   root (null) → body_ctrl (null) → body (shape)
 *                                   → head (shape)
 *                                   → l_arm (shape)
 *                                   → r_arm (shape)
 *               → l_leg (shape)
 *               → r_leg (shape)
 *
 * 각 부위는 자신의 anchor point에서 회전하여 관절 모션을 구현.
 */

import fs from "fs";
import path from "path";
import { parseSvg, stripBackground, type ParsedSvg } from "./parse-svg.js";
import { svgPathToLottieShape } from "./path-to-lottie.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

type BodyPart = "head" | "body" | "l_arm" | "r_arm" | "l_leg" | "r_leg" | "other";
const BODY_PARTS: BodyPart[] = ["head", "body", "l_arm", "r_arm", "l_leg", "r_leg", "other"];

type CharMotion = "walk" | "idle" | "wave" | "none";

interface LabeledPath {
  pathIndex: number;
  label: BodyPart;
  d: string;
  fill: [number, number, number, number];
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
}

function getBbox(d: string) {
  const coords = d.match(/[\d.]+/g)?.map(Number) || [];
  const xs = coords.filter((_, i) => i % 2 === 0);
  const ys = coords.filter((_, i) => i % 2 === 1);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
  };
}

// ── Labeling ──

async function labelPaths(parsed: ParsedSvg): Promise<LabeledPath[]> {
  if (ANTHROPIC_API_KEY) {
    const result = await claudeLabel(parsed);
    if (result) return result;
  }
  console.log("Using position-based heuristic labeling");
  return heuristicLabel(parsed);
}

async function claudeLabel(parsed: ParsedSvg): Promise<LabeledPath[] | null> {
  const descs = parsed.paths.map((p, idx) => {
    const bb = getBbox(p.d);
    return `Path ${idx}: bbox=(${Math.round(bb.minX)},${Math.round(bb.minY)})-(${Math.round(bb.maxX)},${Math.round(bb.maxY)}), fill=${p.fillRaw}`;
  });

  const prompt = `Analyze this SVG character (viewBox ${parsed.viewBox.w}x${parsed.viewBox.h}, Y down).
${descs.join("\n")}

Label each as: head, body, l_arm, r_arm, l_leg, r_leg, other
Reply ONLY JSON: [{"index":0,"label":"head"},...]`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { content: { text: string }[] };
    const text = data.content[0]?.text || "";
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) return null;
    const labels = JSON.parse(m[0]) as { index: number; label: string }[];
    return labels.map((l) => ({
      pathIndex: l.index,
      label: (BODY_PARTS.includes(l.label as BodyPart) ? l.label : "other") as BodyPart,
      d: parsed.paths[l.index].d,
      fill: parsed.paths[l.index].fill,
      bbox: getBbox(parsed.paths[l.index].d),
    }));
  } catch {
    return null;
  }
}

function heuristicLabel(parsed: ParsedSvg): LabeledPath[] {
  // Find character bounding box (exclude paths that are too large = background)
  const pathInfos = parsed.paths.map((p, idx) => {
    const bb = getBbox(p.d);
    return { idx, ...bb, centerX: (bb.minX + bb.maxX) / 2, centerY: (bb.minY + bb.maxY) / 2, w: bb.maxX - bb.minX, h: bb.maxY - bb.minY };
  });

  // Find character center (weighted by path size)
  const charPaths = pathInfos.filter(p => p.w < parsed.viewBox.w * 0.9);
  const charMinY = Math.min(...charPaths.map(p => p.minY));
  const charMaxY = Math.max(...charPaths.map(p => p.maxY));
  const charMinX = Math.min(...charPaths.map(p => p.minX));
  const charMaxX = Math.max(...charPaths.map(p => p.maxX));
  const charH = charMaxY - charMinY;
  const charMidX = (charMinX + charMaxX) / 2;

  return pathInfos.map((info) => {
    const relY = (info.centerY - charMinY) / charH;
    let label: BodyPart;

    if (relY < 0.3) {
      label = "head";
    } else if (relY < 0.6) {
      if (Math.abs(info.centerX - charMidX) > charH * 0.2 && info.w < charH * 0.3) {
        label = info.centerX < charMidX ? "l_arm" : "r_arm";
      } else {
        label = "body";
      }
    } else if (relY < 0.8) {
      if (Math.abs(info.centerX - charMidX) > charH * 0.15 && info.w < charH * 0.3) {
        label = info.centerX < charMidX ? "l_arm" : "r_arm";
      } else {
        label = "body";
      }
    } else {
      label = info.centerX < charMidX ? "l_leg" : "r_leg";
    }

    return {
      pathIndex: info.idx,
      label,
      d: parsed.paths[info.idx].d,
      fill: parsed.paths[info.idx].fill,
      bbox: { minX: info.minX, minY: info.minY, maxX: info.maxX, maxY: info.maxY },
    };
  });
}

// ── Motion Keyframes ──

const EASE_IO = { x: [0.42], y: [0] };
const EASE_IO_O = { x: [0.58], y: [1] };

function walkKeyframes(fps: number, duration: number) {
  // Walking cycle: ~1 second per step
  const cycle = fps; // frames per full walk cycle
  const steps = Math.floor(duration / cycle);
  const kfCount = steps * 4 + 1; // 4 keyframes per cycle

  function oscillate(amplitude: number, phase: number) {
    const kf: Record<string, unknown>[] = [];
    for (let step = 0; step <= steps * 4; step++) {
      const frame = Math.round((step / 4) * cycle);
      if (frame > duration) break;
      const quarter = step % 4;
      let val: number;
      if (quarter === 0) val = 0;
      else if (quarter === 1) val = amplitude * (phase > 0 ? 1 : -1);
      else if (quarter === 2) val = 0;
      else val = amplitude * (phase > 0 ? -1 : 1);

      const entry: Record<string, unknown> = { t: frame, s: [val] };
      if (step < steps * 4) {
        entry.i = EASE_IO;
        entry.o = EASE_IO_O;
      }
      kf.push(entry);
    }
    return kf;
  }

  return {
    // Body: slight Y bounce (2 bounces per walk cycle)
    body_y: (() => {
      const kf: Record<string, unknown>[] = [];
      for (let step = 0; step <= steps * 4; step++) {
        const frame = Math.round((step / 4) * cycle);
        if (frame > duration) break;
        const quarter = step % 4;
        const val = (quarter === 1 || quarter === 3) ? -8 : 0;
        const entry: Record<string, unknown> = { t: frame, s: [val] };
        if (step < steps * 4) { entry.i = EASE_IO; entry.o = EASE_IO_O; }
        kf.push(entry);
      }
      return kf;
    })(),
    // Legs: ±20° rotation, opposite phase
    l_leg_r: oscillate(20, 1),
    r_leg_r: oscillate(20, -1),
    // Arms: ±15° rotation, opposite to corresponding leg
    l_arm_r: oscillate(15, -1),
    r_arm_r: oscillate(15, 1),
    // Head: slight ±3° tilt
    head_r: oscillate(3, 1),
  };
}

function idleKeyframes(fps: number, duration: number) {
  const half = Math.round(duration / 2);
  return {
    body_y: [
      { t: 0, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: half, s: [-5], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [0] },
    ],
    l_leg_r: [] as Record<string, unknown>[],
    r_leg_r: [] as Record<string, unknown>[],
    l_arm_r: [
      { t: 0, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: half, s: [3], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [0] },
    ],
    r_arm_r: [
      { t: 0, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: half, s: [-3], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [0] },
    ],
    head_r: [
      { t: 0, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: half, s: [2], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [0] },
    ],
  };
}

function waveKeyframes(fps: number, duration: number) {
  const q = Math.round(duration / 4);
  return {
    body_y: [] as Record<string, unknown>[],
    l_leg_r: [] as Record<string, unknown>[],
    r_leg_r: [] as Record<string, unknown>[],
    l_arm_r: [] as Record<string, unknown>[],
    // Right arm waves back and forth
    r_arm_r: [
      { t: 0, s: [-30], i: EASE_IO, o: EASE_IO_O },
      { t: q, s: [-50], i: EASE_IO, o: EASE_IO_O },
      { t: q * 2, s: [-30], i: EASE_IO, o: EASE_IO_O },
      { t: q * 3, s: [-50], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [-30] },
    ],
    head_r: [
      { t: 0, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: q, s: [5], i: EASE_IO, o: EASE_IO_O },
      { t: q * 2, s: [0], i: EASE_IO, o: EASE_IO_O },
      { t: q * 3, s: [5], i: EASE_IO, o: EASE_IO_O },
      { t: duration, s: [0] },
    ],
  };
}

// ── Lottie Build ──

function buildCharacterLottie(
  labeled: LabeledPath[],
  viewBox: { w: number; h: number },
  name: string,
  motion: CharMotion,
) {
  const fps = 30;
  const duration = 90;

  // Group paths by body part
  const groups = new Map<BodyPart, LabeledPath[]>();
  for (const lp of labeled) {
    const arr = groups.get(lp.label) || [];
    arr.push(lp);
    groups.set(lp.label, arr);
  }

  // Calculate anchor points for each body part (joint positions)
  function getGroupBbox(part: BodyPart) {
    const paths = groups.get(part);
    if (!paths || paths.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of paths) {
      minX = Math.min(minX, p.bbox.minX);
      minY = Math.min(minY, p.bbox.minY);
      maxX = Math.max(maxX, p.bbox.maxX);
      maxY = Math.max(maxY, p.bbox.maxY);
    }
    return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }

  const bodyBbox = getGroupBbox("body");
  const headBbox = getGroupBbox("head");

  // Anchor points: where the joint is for rotation
  const anchors: Record<string, [number, number]> = {
    // Body center
    body: bodyBbox ? [bodyBbox.cx, bodyBbox.minY] : [viewBox.w / 2, viewBox.h * 0.35],
    // Head rotates from neck (bottom of head)
    head: headBbox ? [headBbox.cx, headBbox.maxY] : [viewBox.w / 2, viewBox.h * 0.25],
    // Arms rotate from shoulder (top of arm)
    l_arm: (() => {
      const bb = getGroupBbox("l_arm");
      return bb ? [bb.cx, bb.minY] : [viewBox.w * 0.35, viewBox.h * 0.35];
    })() as [number, number],
    r_arm: (() => {
      const bb = getGroupBbox("r_arm");
      return bb ? [bb.cx, bb.minY] : [viewBox.w * 0.65, viewBox.h * 0.35];
    })() as [number, number],
    // Legs rotate from hip (top of leg)
    l_leg: (() => {
      const bb = getGroupBbox("l_leg");
      return bb ? [bb.cx, bb.minY] : [viewBox.w * 0.42, viewBox.h * 0.6];
    })() as [number, number],
    r_leg: (() => {
      const bb = getGroupBbox("r_leg");
      return bb ? [bb.cx, bb.minY] : [viewBox.w * 0.58, viewBox.h * 0.6];
    })() as [number, number],
  };

  // Get motion keyframes
  const kf = motion === "walk" ? walkKeyframes(fps, duration)
    : motion === "idle" ? idleKeyframes(fps, duration)
    : motion === "wave" ? waveKeyframes(fps, duration)
    : null;

  const ROOT_IND = 1;
  const BODY_CTRL_IND = 2;
  let nextInd = 3;

  const layers: Record<string, unknown>[] = [];

  // Root null layer
  layers.push({
    ddd: 0, ind: ROOT_IND, ty: 3, nm: "root", sr: 1,
    ks: {
      o: { a: 0, k: 100, ix: 11 },
      r: { a: 0, k: 0, ix: 10 },
      p: { a: 0, k: [viewBox.w / 2, viewBox.h / 2, 0], ix: 2 },
      a: { a: 0, k: [viewBox.w / 2, viewBox.h / 2, 0], ix: 1 },
      s: { a: 0, k: [100, 100, 100], ix: 6 },
    },
    ao: 0, ip: 0, op: duration, st: 0, bm: 0,
  });

  // Body controller null (for body bounce)
  const bodyCtrlKs: Record<string, unknown> = {
    o: { a: 0, k: 100, ix: 11 },
    r: { a: 0, k: 0, ix: 10 },
    a: { a: 0, k: [0, 0, 0], ix: 1 },
    s: { a: 0, k: [100, 100, 100], ix: 6 },
  };

  if (kf && kf.body_y.length > 0) {
    // Animate Y position for body bounce
    bodyCtrlKs.p = {
      a: 1, ix: 2, k: kf.body_y.map((k) => ({
        ...k, s: [0, (k.s as number[])[0], 0],
      })),
    };
  } else {
    bodyCtrlKs.p = { a: 0, k: [0, 0, 0], ix: 2 };
  }

  layers.push({
    ddd: 0, ind: BODY_CTRL_IND, ty: 3, nm: "body_ctrl", parent: ROOT_IND,
    sr: 1, ks: bodyCtrlKs,
    ao: 0, ip: 0, op: duration, st: 0, bm: 0,
  });

  // Create shape layers per body part
  const partOrder: BodyPart[] = ["l_leg", "r_leg", "body", "l_arm", "r_arm", "head", "other"];
  for (const part of partOrder) {
    const paths = groups.get(part);
    if (!paths || paths.length === 0) continue;

    const parentInd = ["head", "l_arm", "r_arm", "body", "other"].includes(part) ? BODY_CTRL_IND : ROOT_IND;

    // Build shape group
    const shapeItems: Record<string, unknown>[] = [];
    for (let si = 0; si < paths.length; si++) {
      const lottieShapes = svgPathToLottieShape(paths[si].d);
      for (const s of lottieShapes) {
        shapeItems.push({
          ty: "sh", ind: shapeItems.length, ix: shapeItems.length + 1,
          ks: { a: 0, k: { i: s.i, o: s.o, v: s.v, c: s.c }, ix: 2 },
          nm: `Path ${shapeItems.length + 1}`, hd: false,
        });
      }
      const [r, g, b, a] = paths[si].fill;
      shapeItems.push({
        ty: "fl",
        c: { a: 0, k: [r, g, b, 1], ix: 4 },
        o: { a: 0, k: a * 100, ix: 5 },
        r: 1, bm: 0, nm: `Fill ${si + 1}`, hd: false,
      });
    }
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

    // Anchor point = joint position for rotation
    const anchor = anchors[part] || [viewBox.w / 2, viewBox.h / 2];

    // Build layer transform with optional rotation keyframes
    const layerKs: Record<string, unknown> = {
      o: { a: 0, k: 100, ix: 11 },
      p: { a: 0, k: [anchor[0], anchor[1], 0], ix: 2 },
      a: { a: 0, k: [anchor[0], anchor[1], 0], ix: 1 },
      s: { a: 0, k: [100, 100, 100], ix: 6 },
    };

    // Apply rotation keyframes per body part
    const rotKf = kf ? ({
      head: kf.head_r,
      l_arm: kf.l_arm_r,
      r_arm: kf.r_arm_r,
      l_leg: kf.l_leg_r,
      r_leg: kf.r_leg_r,
    } as Record<string, Record<string, unknown>[]>)[part] : undefined;

    if (rotKf && rotKf.length > 0) {
      layerKs.r = { a: 1, k: rotKf, ix: 10 };
    } else {
      layerKs.r = { a: 0, k: 0, ix: 10 };
    }

    const ind = nextInd++;
    layers.push({
      ddd: 0, ind, ty: 4, nm: part, parent: parentInd,
      sr: 1, ks: layerKs, ao: 0,
      shapes: [{
        ty: "gr", it: shapeItems,
        nm: `${part}_group`, np: shapeItems.length,
        cix: 2, bm: 0, ix: 1, hd: false,
      }],
      ip: 0, op: duration, st: 0, bm: 0,
    });
  }

  return {
    v: "5.7.6", fr: fps, ip: 0, op: duration,
    w: viewBox.w, h: viewBox.h, nm: name,
    ddd: 0, assets: [], layers, markers: [],
  };
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npx tsx label-body-parts.ts <character.svg> [--motion walk|idle|wave|none] [--output <out.json>]");
    process.exit(0);
  }

  const inputFile = args[0];
  let outputFile: string | undefined;
  let motion: CharMotion = "walk";

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
    if (args[i] === "--motion" && args[i + 1]) motion = args[++i] as CharMotion;
  }

  const svgText = fs.readFileSync(inputFile, "utf-8");
  let parsed = parseSvg(svgText);
  const beforeStrip = parsed.paths.length;
  parsed = stripBackground(parsed);
  if (parsed.paths.length < beforeStrip) console.log("Background path removed");

  console.log(`Parsed: ${parsed.paths.length} paths, viewBox=${parsed.viewBox.w}x${parsed.viewBox.h}`);

  const labeled = await labelPaths(parsed);

  const counts = new Map<BodyPart, number>();
  for (const lp of labeled) counts.set(lp.label, (counts.get(lp.label) || 0) + 1);
  console.log("Labels:", Object.fromEntries(counts));

  const baseName = path.basename(inputFile, path.extname(inputFile));
  const lottie = buildCharacterLottie(labeled, parsed.viewBox, baseName, motion);

  const suffix = motion !== "none" ? `_${motion}` : "_character";
  const outPath = outputFile ?? inputFile.replace(/\.svg$/i, `${suffix}.json`);
  fs.writeFileSync(outPath, JSON.stringify(lottie, null, 2));
  console.log(`Character Lottie written: ${outPath} (${lottie.layers.length} layers, motion=${motion})`);
}

main().catch(console.error);
