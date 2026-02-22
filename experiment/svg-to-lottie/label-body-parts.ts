#!/usr/bin/env npx tsx
/**
 * 캐릭터 SVG 신체부위 라벨링 + Lottie 조립
 *
 * 1. SVG를 파싱하여 각 path를 개별 이미지로 렌더링
 * 2. Claude Vision API로 각 path가 어느 신체부위인지 라벨링
 * 3. 라벨링된 path를 body part 레이어로 그룹핑하여 캐릭터 Lottie 생성
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx experiment/svg-to-lottie/label-body-parts.ts <character.svg>
 *
 * 레이어 계층 (참조: public/animations/character/*.json):
 *   root (null) → body → head, l_arm, r_arm
 *                      → l_leg, r_leg
 */

import fs from "fs";
import path from "path";
import { parseSvg, type ParsedSvg } from "./parse-svg.js";
import { svgPathToLottieShape } from "./path-to-lottie.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

type BodyPart = "head" | "body" | "l_arm" | "r_arm" | "l_leg" | "r_leg" | "other";
const BODY_PARTS: BodyPart[] = ["head", "body", "l_arm", "r_arm", "l_leg", "r_leg", "other"];

interface LabeledPath {
  pathIndex: number;
  label: BodyPart;
  d: string;
  fill: [number, number, number, number];
}

/**
 * Claude Vision을 사용하여 각 path의 신체부위를 라벨링한다.
 * SVG 전체 이미지와 각 path의 위치/크기 정보를 전달.
 */
async function labelPaths(parsed: ParsedSvg, svgText: string): Promise<LabeledPath[]> {
  if (!ANTHROPIC_API_KEY) {
    console.log("No ANTHROPIC_API_KEY - using position-based heuristic labeling");
    return heuristicLabel(parsed);
  }

  // Prepare path descriptions with bounding box info
  const pathDescriptions = parsed.paths.map((p, idx) => {
    // Extract approximate bounding box from path coordinates
    const coords = p.d.match(/[\d.]+/g)?.map(Number) || [];
    const xs = coords.filter((_, i) => i % 2 === 0);
    const ys = coords.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      index: idx,
      bbox: { minX, minY, maxX, maxY },
      centerY: (minY + maxY) / 2,
      fill: p.fillRaw,
    };
  });

  const prompt = `You are analyzing an SVG character illustration. The SVG has a viewBox of ${parsed.viewBox.w}x${parsed.viewBox.h}.
Below are ${parsed.paths.length} paths with their bounding boxes (in SVG coordinates where Y increases downward).

${pathDescriptions.map((p) => `Path ${p.index}: bbox=(${Math.round(p.bbox.minX)},${Math.round(p.bbox.minY)})-(${Math.round(p.bbox.maxX)},${Math.round(p.bbox.maxY)}), fill=${p.fill}`).join("\n")}

Label each path as one of: head, body, l_arm, r_arm, l_leg, r_leg, other
Consider that in the SVG coordinate system: head is at the top (lowest Y), legs at the bottom (highest Y).

Respond with ONLY a JSON array like: [{"index":0,"label":"head"},{"index":1,"label":"body"},...]`;

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

  if (!res.ok) {
    console.warn(`Claude API failed (${res.status}), falling back to heuristic`);
    return heuristicLabel(parsed);
  }

  const data = await res.json() as { content: { text: string }[] };
  const text = data.content[0]?.text || "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn("Could not parse Claude response, falling back to heuristic");
    return heuristicLabel(parsed);
  }

  const labels = JSON.parse(jsonMatch[0]) as { index: number; label: string }[];
  return labels.map((l) => ({
    pathIndex: l.index,
    label: (BODY_PARTS.includes(l.label as BodyPart) ? l.label : "other") as BodyPart,
    d: parsed.paths[l.index].d,
    fill: parsed.paths[l.index].fill,
  }));
}

/**
 * Y좌표 기반 휴리스틱 라벨링 (API 없을 때 폴백)
 */
function heuristicLabel(parsed: ParsedSvg): LabeledPath[] {
  const pathInfos = parsed.paths.map((p, idx) => {
    const coords = p.d.match(/[\d.]+/g)?.map(Number) || [];
    const ys = coords.filter((_, i) => i % 2 === 1);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerY = (minY + maxY) / 2;
    const xs = coords.filter((_, i) => i % 2 === 0);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    return { idx, centerY, centerX, minY, maxY, height: maxY - minY };
  });

  // Sort by centerY to segment into vertical zones
  const sortedByY = [...pathInfos].sort((a, b) => a.centerY - b.centerY);
  const totalHeight = parsed.viewBox.h;
  const midX = parsed.viewBox.w / 2;

  return pathInfos.map((info) => {
    const relY = info.centerY / totalHeight;
    let label: BodyPart;

    if (relY < 0.3) {
      label = "head";
    } else if (relY < 0.55) {
      if (Math.abs(info.centerX - midX) > totalHeight * 0.15) {
        label = info.centerX < midX ? "l_arm" : "r_arm";
      } else {
        label = "body";
      }
    } else if (relY < 0.75) {
      if (Math.abs(info.centerX - midX) > totalHeight * 0.1) {
        label = info.centerX < midX ? "l_arm" : "r_arm";
      } else {
        label = "body";
      }
    } else {
      label = info.centerX < midX ? "l_leg" : "r_leg";
    }

    return {
      pathIndex: info.idx,
      label,
      d: parsed.paths[info.idx].d,
      fill: parsed.paths[info.idx].fill,
    };
  });
}

/**
 * 라벨링된 paths를 body part별로 그룹핑하여 캐릭터 Lottie를 생성한다.
 * 레이어 계층: root(null) → body → head, l_arm, r_arm / root → l_leg, r_leg
 */
function buildCharacterLottie(
  labeled: LabeledPath[],
  viewBox: { w: number; h: number },
  name: string,
) {
  const fps = 30;
  const duration = 90;

  const groups = new Map<BodyPart, LabeledPath[]>();
  for (const lp of labeled) {
    const arr = groups.get(lp.label) || [];
    arr.push(lp);
    groups.set(lp.label, arr);
  }

  const cx = viewBox.w / 2;
  const cy = viewBox.h / 2;

  // Layer indices
  const ROOT_IND = 1;
  const BODY_IND = 2;
  let nextInd = 3;

  const staticKs = {
    o: { a: 0, k: 100, ix: 11 },
    r: { a: 0, k: 0, ix: 10 },
    p: { a: 0, k: [cx, cy, 0], ix: 2 },
    a: { a: 0, k: [cx, cy, 0], ix: 1 },
    s: { a: 0, k: [100, 100, 100], ix: 6 },
  };

  const layers: Record<string, unknown>[] = [];

  // Root null layer
  layers.push({
    ddd: 0, ind: ROOT_IND, ty: 3, nm: "root",
    sr: 1, ks: { ...staticKs }, ao: 0,
    ip: 0, op: duration, st: 0, bm: 0,
  });

  // Body null layer (parent: root)
  layers.push({
    ddd: 0, ind: BODY_IND, ty: 3, nm: "body_ctrl", parent: ROOT_IND,
    sr: 1,
    ks: {
      o: { a: 0, k: 100, ix: 11 },
      r: { a: 0, k: 0, ix: 10 },
      p: { a: 0, k: [0, 0, 0], ix: 2 },
      a: { a: 0, k: [0, 0, 0], ix: 1 },
      s: { a: 0, k: [100, 100, 100], ix: 6 },
    },
    ao: 0, ip: 0, op: duration, st: 0, bm: 0,
  });

  // Create shape layers for each body part group
  const partOrder: BodyPart[] = ["head", "l_arm", "r_arm", "body", "l_leg", "r_leg", "other"];
  for (const part of partOrder) {
    const paths = groups.get(part);
    if (!paths || paths.length === 0) continue;

    // Determine parent: head/arms → body, legs → root, other → root
    const parentInd = ["head", "l_arm", "r_arm", "body"].includes(part) ? BODY_IND : ROOT_IND;

    const shapeItems: Record<string, unknown>[] = [];
    for (let si = 0; si < paths.length; si++) {
      const lottieShapes = svgPathToLottieShape(paths[si].d);
      for (let ssi = 0; ssi < lottieShapes.length; ssi++) {
        const s = lottieShapes[ssi];
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

    const ind = nextInd++;
    layers.push({
      ddd: 0, ind, ty: 4, nm: part, parent: parentInd,
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [0, 0, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
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

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npx tsx label-body-parts.ts <character.svg> [--output <out.json>]");
    process.exit(0);
  }

  const inputFile = args[0];
  let outputFile: string | undefined;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
  }

  const svgText = fs.readFileSync(inputFile, "utf-8");
  const parsed = parseSvg(svgText);

  console.log(`Parsed: ${parsed.paths.length} paths, viewBox=${parsed.viewBox.w}x${parsed.viewBox.h}`);

  const labeled = await labelPaths(parsed, svgText);

  // Print label summary
  const counts = new Map<BodyPart, number>();
  for (const lp of labeled) {
    counts.set(lp.label, (counts.get(lp.label) || 0) + 1);
  }
  console.log("Labels:", Object.fromEntries(counts));

  const baseName = path.basename(inputFile, path.extname(inputFile));
  const lottie = buildCharacterLottie(labeled, parsed.viewBox, baseName);

  const outPath = outputFile ?? inputFile.replace(/\.svg$/i, "_character.json");
  fs.writeFileSync(outPath, JSON.stringify(lottie, null, 2));
  console.log(`Character Lottie written: ${outPath} (${lottie.layers.length} layers)`);
}

main().catch(console.error);
