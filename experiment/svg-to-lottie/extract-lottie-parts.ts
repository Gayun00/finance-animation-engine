#!/usr/bin/env npx tsx
/**
 * Lottie → 파트별 SVG 추출
 *
 * 잘 리깅된 Lottie 캐릭터에서 각 레이어의 shape를 개별 SVG로 추출한다.
 * 이를 통해 캐릭터 "템플릿 구조"를 파악하고, 같은 구조로 베리에이션을 만들 수 있다.
 *
 * Usage:
 *   npx tsx experiment/svg-to-lottie/extract-lottie-parts.ts <lottie.json> [--outdir <dir>]
 *
 * Output:
 *   <outdir>/
 *     _manifest.json        — 레이어 구조, 부모관계, 앵커포인트, 키프레임 요약
 *     01_torso.svg          — 각 파트 SVG
 *     02_head.svg
 *     ...
 *     _full_preview.svg     — 전체 파트 조합 미리보기 (색상 구분)
 */

import fs from "fs";
import path from "path";

interface LottieShape {
  v: number[][];
  i: number[][];
  o: number[][];
  c: boolean;
}

interface LayerInfo {
  ind: number;
  nm: string;
  ty: number;
  parent: number | null;
  anchor: [number, number];
  position: [number, number];
  rotation: number;
  scale: [number, number];
  animated: string[];
  paths: { d: string; fill: string; opacity: number }[];
  children: number[];
}

// ── Lottie shape → SVG path d ──

function lottieShapeToSvgPath(shape: LottieShape): string {
  const { v, i, o, c } = shape;
  if (!v || v.length === 0) return "";

  const parts: string[] = [];
  parts.push(`M${v[0][0].toFixed(2)},${v[0][1].toFixed(2)}`);

  for (let idx = 1; idx < v.length; idx++) {
    const prev = v[idx - 1];
    const curr = v[idx];
    // out tangent of previous vertex (absolute)
    const ox = prev[0] + (o[idx - 1]?.[0] || 0);
    const oy = prev[1] + (o[idx - 1]?.[1] || 0);
    // in tangent of current vertex (absolute)
    const ix = curr[0] + (i[idx]?.[0] || 0);
    const iy = curr[1] + (i[idx]?.[1] || 0);

    const isLine =
      Math.abs(ox - prev[0]) < 0.01 &&
      Math.abs(oy - prev[1]) < 0.01 &&
      Math.abs(ix - curr[0]) < 0.01 &&
      Math.abs(iy - curr[1]) < 0.01;

    if (isLine) {
      parts.push(`L${curr[0].toFixed(2)},${curr[1].toFixed(2)}`);
    } else {
      parts.push(
        `C${ox.toFixed(2)},${oy.toFixed(2)} ${ix.toFixed(2)},${iy.toFixed(2)} ${curr[0].toFixed(2)},${curr[1].toFixed(2)}`,
      );
    }
  }

  if (c) {
    // Close: curve from last vertex back to first
    const last = v[v.length - 1];
    const first = v[0];
    const ox = last[0] + (o[v.length - 1]?.[0] || 0);
    const oy = last[1] + (o[v.length - 1]?.[1] || 0);
    const ix = first[0] + (i[0]?.[0] || 0);
    const iy = first[1] + (i[0]?.[1] || 0);

    const isLine =
      Math.abs(ox - last[0]) < 0.01 &&
      Math.abs(oy - last[1]) < 0.01 &&
      Math.abs(ix - first[0]) < 0.01 &&
      Math.abs(iy - first[1]) < 0.01;

    if (isLine) {
      parts.push("Z");
    } else {
      parts.push(
        `C${ox.toFixed(2)},${oy.toFixed(2)} ${ix.toFixed(2)},${iy.toFixed(2)} ${first[0].toFixed(2)},${first[1].toFixed(2)}Z`,
      );
    }
  }

  return parts.join(" ");
}

// ── Extract fill color from Lottie items ──

function extractFill(items: Record<string, unknown>[]): { color: string; opacity: number } {
  for (const item of items) {
    if (item.ty === "fl") {
      const c = (item.c as { k: number[] })?.k || [0, 0, 0];
      const r = Math.round((c[0] || 0) * 255);
      const g = Math.round((c[1] || 0) * 255);
      const b = Math.round((c[2] || 0) * 255);
      const o = (item.o as { k: number })?.k ?? 100;
      return { color: `rgb(${r},${g},${b})`, opacity: o / 100 };
    }
  }
  return { color: "rgb(128,128,128)", opacity: 1 };
}

// ── Get static value from possibly animated property ──

function getStaticVal(prop: Record<string, unknown> | undefined, fallback: number[]): number[] {
  if (!prop) return fallback;
  if (prop.a === 1) {
    // Animated — take first keyframe value
    const kf = prop.k as { s: number[] }[];
    if (Array.isArray(kf) && kf.length > 0 && kf[0].s) return kf[0].s;
  }
  if (Array.isArray(prop.k)) return prop.k as number[];
  if (typeof prop.k === "number") return [prop.k];
  return fallback;
}

function isAnimated(prop: Record<string, unknown> | undefined): boolean {
  return !!prop && prop.a === 1;
}

// ── Summarize keyframes ──

function summarizeKeyframes(prop: Record<string, unknown> | undefined): string | null {
  if (!prop || prop.a !== 1) return null;
  const kf = prop.k as { t: number; s: number[] }[];
  if (!Array.isArray(kf)) return null;
  const vals = kf.filter((k) => k.s).map((k) => k.s[0]);
  if (vals.length === 0) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return `${kf.length} keyframes, range [${min.toFixed(1)}, ${max.toFixed(1)}]`;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(
      "Usage: npx tsx extract-lottie-parts.ts <lottie.json> [--outdir <dir>]",
    );
    process.exit(0);
  }

  const inputFile = args[0];
  let outDir: string | undefined;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--outdir" && args[i + 1]) outDir = args[++i];
  }

  const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  const w: number = data.w;
  const h: number = data.h;
  const fps: number = data.fr;
  const ip: number = data.ip;
  const op: number = data.op;

  const baseName = path.basename(inputFile, ".json").replace(/\s+/g, "_");
  outDir = outDir ?? path.join(path.dirname(inputFile), `_parts_${baseName}`);
  fs.mkdirSync(outDir, { recursive: true });

  // Name mapping for common minified Lottie layer names
  const BODY_PART_NAMES: Record<string, string> = {};
  let partCounter = 0;

  // Parse all layers
  const layerInfos: LayerInfo[] = [];

  for (const layer of data.layers) {
    const ks = layer.ks || {};
    const anchorVal = getStaticVal(ks.a, [0, 0, 0]);
    const posVal = getStaticVal(ks.p, [0, 0, 0]);
    const rotVal = getStaticVal(ks.r, [0]);
    const scaleVal = getStaticVal(ks.s, [100, 100, 100]);

    const animated: string[] = [];
    if (isAnimated(ks.p)) animated.push("position");
    if (isAnimated(ks.r)) animated.push("rotation");
    if (isAnimated(ks.s)) animated.push("scale");
    if (isAnimated(ks.o)) animated.push("opacity");

    // Extract paths from shapes
    const paths: { d: string; fill: string; opacity: number }[] = [];

    for (const shape of layer.shapes || []) {
      if (shape.ty === "gr") {
        const items: Record<string, unknown>[] = shape.it || [];
        const { color, opacity } = extractFill(items);
        for (const item of items) {
          if (item.ty === "sh") {
            const shapeData = (item.ks as { k: LottieShape })?.k;
            if (shapeData?.v) {
              const d = lottieShapeToSvgPath(shapeData);
              if (d) paths.push({ d, fill: color, opacity });
            }
          }
        }
      }
    }

    layerInfos.push({
      ind: layer.ind,
      nm: layer.nm,
      ty: layer.ty,
      parent: layer.parent ?? null,
      anchor: [anchorVal[0], anchorVal[1]],
      position: [posVal[0], posVal[1]],
      rotation: rotVal[0],
      scale: [scaleVal[0], scaleVal[1]],
      animated,
      paths,
      children: [],
    });
  }

  // Build children lists
  const byInd = new Map(layerInfos.map((l) => [l.ind, l]));
  for (const l of layerInfos) {
    if (l.parent != null) {
      const parentLayer = byInd.get(l.parent);
      if (parentLayer) parentLayer.children.push(l.ind);
    }
  }

  // Assign readable names
  let nameIdx = 1;
  function assignName(info: LayerInfo): string {
    const prefix = String(nameIdx++).padStart(2, "0");
    const typeSuffix = info.ty === 3 ? "_ctrl" : "";
    // Use original name if readable, otherwise generic
    const nmClean = info.nm.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    const readable = nmClean.length > 1 ? nmClean : `part${info.ind}`;
    return `${prefix}_${readable}${typeSuffix}`;
  }

  // Process in hierarchy order (roots first, then children)
  const roots = layerInfos.filter((l) => l.parent == null);
  const ordered: LayerInfo[] = [];
  function walk(info: LayerInfo) {
    ordered.push(info);
    for (const childInd of info.children) {
      const child = byInd.get(childInd);
      if (child) walk(child);
    }
  }
  for (const r of roots) walk(r);

  // Generate SVGs and manifest
  const manifest: Record<string, unknown>[] = [];
  const allSvgPaths: { d: string; fill: string; opacity: number; name: string }[] = [];

  for (const info of ordered) {
    const name = assignName(info);
    BODY_PART_NAMES[info.ind] = name;

    const ks = (data.layers as Record<string, unknown>[]).find(
      (l: Record<string, unknown>) => l.ind === info.ind,
    )?.ks as Record<string, unknown> | undefined;

    const kfSummary: Record<string, string> = {};
    if (ks) {
      for (const [propName, propKey] of [
        ["position", "p"],
        ["rotation", "r"],
        ["scale", "s"],
        ["opacity", "o"],
      ] as const) {
        const summary = summarizeKeyframes(
          ks[propKey] as Record<string, unknown>,
        );
        if (summary) kfSummary[propName] = summary;
      }
    }

    const entry: Record<string, unknown> = {
      name,
      originalName: info.nm,
      ind: info.ind,
      type: info.ty === 3 ? "null" : info.ty === 4 ? "shape" : `type_${info.ty}`,
      parent: info.parent != null ? BODY_PART_NAMES[info.parent] || `ind_${info.parent}` : null,
      anchor: info.anchor,
      position: info.position,
      rotation: info.rotation,
      scale: info.scale,
      animated: info.animated,
      keyframes: kfSummary,
      pathCount: info.paths.length,
      fills: [...new Set(info.paths.map((p) => p.fill))],
    };
    manifest.push(entry);

    // Write individual SVG
    if (info.paths.length > 0) {
      const svgPaths = info.paths
        .map(
          (p) =>
            `  <path d="${p.d}" fill="${p.fill}" opacity="${p.opacity}" />`,
        )
        .join("\n");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${svgPaths}\n</svg>`;
      fs.writeFileSync(path.join(outDir!, `${name}.svg`), svg);

      for (const p of info.paths) {
        allSvgPaths.push({ ...p, name });
      }
    }
  }

  // Write combined preview SVG
  const previewPaths = allSvgPaths
    .map(
      (p) =>
        `  <path d="${p.d}" fill="${p.fill}" opacity="${p.opacity}" />`,
    )
    .join("\n");
  const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n  <rect width="${w}" height="${h}" fill="#1a1a2e" />\n${previewPaths}\n</svg>`;
  fs.writeFileSync(path.join(outDir!, "_full_preview.svg"), previewSvg);

  // Write manifest
  const fullManifest = {
    source: path.basename(inputFile),
    canvas: { w, h },
    fps,
    frames: { in: ip, out: op, duration: op - ip },
    layers: manifest,
    hierarchy: buildHierarchyTree(manifest),
  };
  fs.writeFileSync(
    path.join(outDir!, "_manifest.json"),
    JSON.stringify(fullManifest, null, 2),
  );

  console.log(`\nExtracted to: ${outDir}`);
  console.log(`  ${manifest.filter((m) => (m.pathCount as number) > 0).length} part SVGs`);
  console.log(`  ${allSvgPaths.length} total paths`);
  console.log(`  _manifest.json — layer structure + keyframe summary`);
  console.log(`  _full_preview.svg — combined preview\n`);

  // Print hierarchy
  console.log("=== Layer Hierarchy ===\n");
  function printTree(entry: Record<string, unknown>, depth: number) {
    const prefix = "  ".repeat(depth) + "├─ ";
    const fills = (entry.fills as string[]) || [];
    const anim = (entry.animated as string[]) || [];
    const kf = entry.keyframes as Record<string, string>;
    const kfStr = Object.entries(kf || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    console.log(
      `${prefix}${entry.name}  [${entry.pathCount} paths]  ${fills.join(", ")}  ${anim.length > 0 ? `*${anim.join(",")}*` : ""}${kfStr ? `  {${kfStr}}` : ""}`,
    );
  }

  const rootEntries = manifest.filter((m) => m.parent == null);
  function printManifestTree(entries: Record<string, unknown>[], depth: number) {
    for (const e of entries) {
      printTree(e, depth);
      const childEntries = manifest.filter((m) => m.parent === e.name);
      printManifestTree(childEntries, depth + 1);
    }
  }
  printManifestTree(rootEntries, 0);
}

function buildHierarchyTree(
  manifest: Record<string, unknown>[],
): Record<string, unknown> {
  const tree: Record<string, unknown> = {};
  const rootEntries = manifest.filter((m) => m.parent == null);

  function addChildren(parentName: string): Record<string, unknown> {
    const children = manifest.filter((m) => m.parent === parentName);
    const node: Record<string, unknown> = {};
    for (const c of children) {
      node[c.name as string] = addChildren(c.name as string);
    }
    return node;
  }

  for (const r of rootEntries) {
    tree[r.name as string] = addChildren(r.name as string);
  }
  return tree;
}

main();
