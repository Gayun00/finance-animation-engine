#!/usr/bin/env npx tsx
/**
 * Shape Transplant — 다른 캐릭터 Lottie에서 shape을 추출하여
 * Person Walking 리깅 템플릿에 이식
 *
 * Usage:
 *   npx tsx transplant-shapes.ts --donor <donor.json> --mapping <name> [--output <out.json>]
 *
 * 동작:
 * 1. donor Lottie에서 각 레이어의 shape 데이터 추출
 * 2. body part 매핑에 따라 Person Walking의 해당 레이어에 shape 교체
 * 3. 좌표계 변환 (donor 캔버스 → rig 캔버스)
 */

import fs from "fs";
import path from "path";

const RIG_PATH = "/Users/gygygygy/Downloads/Person Walking (1).json";

// Person Walking body part ↔ layer ind
const RIG_PARTS: Record<string, number> = {
  torso: 6,
  head: 3,
  r_upper_arm: 1,
  r_forearm: 2,
  l_upper_arm: 4,
  l_forearm: 5,
  r_upper_leg: 7,
  r_lower_leg: 8,
  l_upper_leg: 9,
  l_lower_leg: 10,
};

// Body part → donor layer ind mappings for each character
interface DonorMapping {
  name: string;
  // Map: rig body part → array of donor layer inds (merged into one layer)
  parts: Record<string, number[]>;
  // Optional: precomp asset id (for Cool Man which wraps in precomp)
  precompId?: string;
}

const MAPPINGS: Record<string, DonorMapping> = {
  rock_woman: {
    name: "Rock Woman",
    parts: {
      torso: [6],         // C - Chest
      head: [7, 1, 2],    // V - Face + O - Mouth + C - Hair detail
      r_upper_arm: [4],   // B - Right upper arm
      r_forearm: [5],     // A - Right forearm+hand
      l_upper_arm: [14],  // B - Left upper arm
      l_forearm: [15],    // A - Left forearm+hand
      r_upper_leg: [8],   // P - Right leg
      r_lower_leg: [13, 12],  // T + C - Right lower leg + shoe
      l_upper_leg: [11],  // P - Left leg
      l_lower_leg: [10, 9],   // T + C - Left lower leg + shoe
    },
  },
  child_girl: {
    name: "Child Girl",
    parts: {
      torso: [6],         // C - Dress/Torso
      head: [7],          // V - Face/Head
      r_upper_arm: [4],   // B - Right arm+sleeve
      r_forearm: [5],     // A - Right hand
      l_upper_arm: [18],  // B - Left arm+sleeve
      l_forearm: [19],    // A - Left hand
      r_upper_leg: [8],   // P - Right leg
      r_lower_leg: [10, 9],  // T + C
      l_upper_leg: [11],  // P - Left leg
      l_lower_leg: [17, 16], // T + C
    },
  },
  cool_man: {
    name: "Cool Man",
    precompId: "comp_0",
    parts: {
      torso: [13, 12],       // body Outlines front + collar
      head: [4, 5],          // Head + neck
      r_upper_arm: [8],      // right shoulder
      r_forearm: [10, 9],    // right arm + hand
      l_upper_arm: [21],     // left shoulder (back)
      l_forearm: [23, 22],   // left arm + hand
      r_upper_leg: [15, 14], // right thigh + knee
      r_lower_leg: [16, 6],  // right shin + shoe
      l_upper_leg: [19, 18], // left thigh + knee
      l_lower_leg: [20, 7],  // left shin + shoe
    },
  },
};

// ── Shape extraction ──

interface ExtractedShape {
  // All Lottie shape items (sh + fl + st etc.) from the donor layer
  items: Record<string, unknown>[];
  // Bounding box of all paths
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
}

function getShapeBbox(shapeData: { v: number[][] }): { minX: number; minY: number; maxX: number; maxY: number } {
  const xs = shapeData.v.map((p: number[]) => p[0]);
  const ys = shapeData.v.map((p: number[]) => p[1]);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
  };
}

function collectItemsRecursive(
  items: Record<string, unknown>[],
  collected: Record<string, unknown>[],
  bboxRef: { minX: number; minY: number; maxX: number; maxY: number },
) {
  for (const item of items) {
    if (item.ty === "tr") continue;

    if (item.ty === "gr" && Array.isArray(item.it)) {
      // Recurse into nested groups
      collectItemsRecursive(item.it as Record<string, unknown>[], collected, bboxRef);
      continue;
    }

    if (item.ty === "sh") {
      const ks = item.ks as { k: Record<string, unknown>; a?: number };
      let shapeData: { v: number[][] } | null = null;
      if (ks?.a === 1) {
        const kf = ks.k as unknown as Record<string, unknown>[];
        if (Array.isArray(kf) && kf.length > 0) {
          const s = kf[0].s;
          if (Array.isArray(s) && s.length > 0) {
            shapeData = (typeof s[0] === "object" && "v" in (s[0] as Record<string, unknown>))
              ? s[0] as { v: number[][] }
              : null;
          } else if (s && typeof s === "object" && "v" in (s as Record<string, unknown>)) {
            shapeData = s as { v: number[][] };
          }
        }
      } else if (ks?.k && typeof ks.k === "object" && "v" in ks.k) {
        shapeData = ks.k as { v: number[][] };
      }
      if (shapeData?.v) {
        const bb = getShapeBbox(shapeData);
        bboxRef.minX = Math.min(bboxRef.minX, bb.minX);
        bboxRef.minY = Math.min(bboxRef.minY, bb.minY);
        bboxRef.maxX = Math.max(bboxRef.maxX, bb.maxX);
        bboxRef.maxY = Math.max(bboxRef.maxY, bb.maxY);
      }
    }

    collected.push(item);
  }
}

function extractShapes(layers: Record<string, unknown>[], layerInds: number[]): ExtractedShape {
  const allItems: Record<string, unknown>[] = [];
  const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  for (const ind of layerInds) {
    const layer = layers.find((l) => (l as { ind: number }).ind === ind) as Record<string, unknown> | undefined;
    if (!layer) continue;

    const shapes = (layer.shapes || []) as Record<string, unknown>[];
    for (const shape of shapes) {
      if (shape.ty === "gr" && Array.isArray(shape.it)) {
        collectItemsRecursive(shape.it as Record<string, unknown>[], allItems, bbox);
      }
    }
  }

  return { items: allItems, bbox };
}

// ── Coordinate transform ──

function transformShapeItems(
  items: Record<string, unknown>[],
  srcBbox: { minX: number; minY: number; maxX: number; maxY: number },
  targetW: number,
  targetH: number,
  rigAnchor: [number, number],
): Record<string, unknown>[] {
  const srcW = srcBbox.maxX - srcBbox.minX;
  const srcH = srcBbox.maxY - srcBbox.minY;
  const srcCx = (srcBbox.minX + srcBbox.maxX) / 2;
  const srcCy = (srcBbox.minY + srcBbox.maxY) / 2;

  // Scale to fit target size while maintaining aspect ratio
  const scale = Math.min(targetW / (srcW || 1), targetH / (srcH || 1));

  // Offset: translate src center to rig anchor point
  const offsetX = rigAnchor[0] - srcCx * scale;
  const offsetY = rigAnchor[1] - srcCy * scale;

  return items.map((item) => {
    const copy = JSON.parse(JSON.stringify(item));

    if (copy.ty === "sh") {
      const ks = copy.ks as { k: Record<string, unknown>; a?: number };
      if (ks?.a === 1) {
        // Animated shape — transform each keyframe
        const kf = ks.k as unknown as { s: Record<string, unknown>[] }[];
        if (Array.isArray(kf)) {
          for (const frame of kf) {
            if (frame.s) {
              for (const s of frame.s) {
                transformVertices(s as { v: number[][]; i: number[][]; o: number[][] }, scale, offsetX, offsetY);
              }
            }
            // Also handle 'e' (end value) if present
            const e = (frame as Record<string, unknown>).e;
            if (Array.isArray(e)) {
              for (const s of e as Record<string, unknown>[]) {
                transformVertices(s as { v: number[][]; i: number[][]; o: number[][] }, scale, offsetX, offsetY);
              }
            }
          }
        }
      } else if (ks?.k) {
        transformVertices(ks.k as { v: number[][]; i: number[][]; o: number[][] }, scale, offsetX, offsetY);
      }
    }

    return copy;
  });
}

function transformVertices(
  shape: { v: number[][]; i: number[][]; o: number[][] },
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  if (!shape?.v) return;
  for (let i = 0; i < shape.v.length; i++) {
    shape.v[i] = [shape.v[i][0] * scale + offsetX, shape.v[i][1] * scale + offsetY];
    // Tangent handles scale but don't offset (they're relative)
    if (shape.i?.[i]) shape.i[i] = [shape.i[i][0] * scale, shape.i[i][1] * scale];
    if (shape.o?.[i]) shape.o[i] = [shape.o[i][0] * scale, shape.o[i][1] * scale];
  }
}

// ── Get rig layer info ──

function getRigLayerInfo(layer: Record<string, unknown>): { anchor: [number, number]; shapeSize: [number, number] } {
  const ks = layer.ks as Record<string, unknown>;
  const a = ks?.a as { k: number[] };
  const anchor: [number, number] = a?.k ? [a.k[0], a.k[1]] : [0, 0];

  // Get shape bounding box for target size reference
  const shapes = (layer.shapes || []) as Record<string, unknown>[];
  let shapeW = 50, shapeH = 120; // defaults
  for (const shape of shapes) {
    if (shape.ty !== "gr") continue;
    for (const item of (shape.it || []) as Record<string, unknown>[]) {
      if (item.ty === "sh") {
        const sk = item.ks as { k: { v: number[][] } };
        if (sk?.k?.v) {
          const bb = getShapeBbox(sk.k);
          shapeW = bb.maxX - bb.minX;
          shapeH = bb.maxY - bb.minY;
        }
      }
    }
  }

  return { anchor, shapeSize: [shapeW, shapeH] };
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  let donorFile = "";
  let mappingName = "";
  let outputFile: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--donor" && args[i + 1]) donorFile = args[++i];
    else if (args[i] === "--mapping" && args[i + 1]) mappingName = args[++i];
    else if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
  }

  if (!mappingName) {
    console.log("Usage: npx tsx transplant-shapes.ts --donor <donor.json> --mapping <name> [--output <out.json>]");
    console.log(`Mappings: ${Object.keys(MAPPINGS).join(", ")}`);
    process.exit(0);
  }

  const mapping = MAPPINGS[mappingName];
  if (!mapping) {
    console.error(`Unknown mapping: ${mappingName}. Available: ${Object.keys(MAPPINGS).join(", ")}`);
    process.exit(1);
  }

  // Load rig
  const rig = JSON.parse(fs.readFileSync(RIG_PATH, "utf-8"));
  console.log(`Rig: Person Walking (${rig.w}x${rig.h}, ${rig.layers.length} layers)`);

  // Load donor
  const donor = JSON.parse(fs.readFileSync(donorFile, "utf-8"));
  let donorLayers = donor.layers as Record<string, unknown>[];

  // If precomp, get layers from asset
  if (mapping.precompId) {
    const asset = (donor.assets as Record<string, unknown>[])?.find(
      (a) => a.id === mapping.precompId,
    );
    if (asset) {
      donorLayers = (asset.layers || []) as Record<string, unknown>[];
      console.log(`Donor: ${mapping.name} (precomp ${mapping.precompId}, ${donorLayers.length} layers)`);
    }
  } else {
    console.log(`Donor: ${mapping.name} (${donorLayers.length} layers)`);
  }

  // Build result from rig
  const result = JSON.parse(JSON.stringify(rig));

  // Process each body part
  for (const [partName, rigInd] of Object.entries(RIG_PARTS)) {
    const donorInds = mapping.parts[partName];
    if (!donorInds || donorInds.length === 0) {
      console.log(`  ${partName}: no donor mapping, keeping original`);
      continue;
    }

    // Extract shapes from donor
    const extracted = extractShapes(donorLayers, donorInds);
    if (extracted.items.length === 0) {
      console.log(`  ${partName}: no shapes found in donor layers [${donorInds}]`);
      continue;
    }

    // Get rig layer info
    const rigLayer = (result.layers as Record<string, unknown>[]).find(
      (l) => (l as { ind: number }).ind === rigInd,
    );
    if (!rigLayer) continue;

    const { anchor, shapeSize } = getRigLayerInfo(rigLayer);

    // Transform donor shapes to rig coordinate space
    const transformed = transformShapeItems(
      extracted.items,
      extracted.bbox,
      shapeSize[0] * 1.1, // slight padding
      shapeSize[1] * 1.1,
      anchor,
    );

    // Add default transform
    transformed.push({
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

    // Replace shape group in rig layer
    const rigShapes = (rigLayer.shapes || []) as Record<string, unknown>[];
    if (rigShapes.length > 0 && rigShapes[0].ty === "gr") {
      rigShapes[0].it = transformed;
      rigShapes[0].np = transformed.length;
    }

    const fillCount = transformed.filter((i) => i.ty === "fl").length;
    const pathCount = transformed.filter((i) => i.ty === "sh").length;
    console.log(`  ${partName}: ${pathCount} paths, ${fillCount} fills from layers [${donorInds}]`);
  }

  // Update metadata
  result.nm = `${mappingName}_transplant`;

  const outPath = outputFile ?? `experiment/outputs/character/${mappingName}_transplant.json`;
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nOutput: ${outPath}`);
}

main();
