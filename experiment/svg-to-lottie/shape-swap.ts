#!/usr/bin/env npx tsx
/**
 * Shape Swap — 리깅 템플릿의 shape을 다른 캐릭터의 shape으로 교체
 *
 * Person Walking (1)의 리깅(키프레임, 계층, 앵커)을 유지하면서
 * shape 데이터만 교체하여 다른 외양의 걷는 캐릭터를 만든다.
 *
 * Usage:
 *   npx tsx shape-swap.ts --rig <rig.json> --skin <skin-name> [--output <out.json>]
 *
 * Built-in skins: stick, round, blocky, girl, woman
 * Or provide a JSON file with custom shapes.
 */

import fs from "fs";
import path from "path";

// ── Shape generators ──
// Each returns Lottie shape data: { v, i, o, c } for a rounded rectangle / custom shape

interface LottieShape {
  v: number[][];
  i: number[][];
  o: number[][];
  c: boolean;
}

interface FillDef {
  color: [number, number, number];
  opacity?: number;
}

interface PartDef {
  shapes: LottieShape[];
  fills: FillDef[];
}

type SkinDef = Record<string, PartDef>;

// Helper: create a rounded rectangle shape
function roundedRect(cx: number, cy: number, w: number, h: number, r: number): LottieShape {
  const hw = w / 2, hh = h / 2;
  r = Math.min(r, hw, hh);
  const k = 0.5522847498; // Bezier approximation of quarter circle
  const kr = k * r;

  return {
    v: [
      [cx - hw + r, cy - hh],      // top-left after corner
      [cx + hw - r, cy - hh],      // top-right before corner
      [cx + hw, cy - hh + r],      // right-top after corner
      [cx + hw, cy + hh - r],      // right-bottom before corner
      [cx + hw - r, cy + hh],      // bottom-right after corner
      [cx - hw + r, cy + hh],      // bottom-left before corner
      [cx - hw, cy + hh - r],      // left-bottom after corner
      [cx - hw, cy - hh + r],      // left-top before corner
    ],
    i: [
      [0, 0], [-kr, 0], [0, -kr], [0, 0],
      [kr, 0], [0, 0], [0, kr], [0, 0],
    ],
    o: [
      [0, 0], [kr, 0], [0, 0], [0, kr],
      [0, 0], [-kr, 0], [0, 0], [0, -kr],
    ],
    c: true,
  };
}

// Helper: create an ellipse
function ellipse(cx: number, cy: number, rx: number, ry: number): LottieShape {
  const k = 0.5522847498;
  return {
    v: [
      [cx, cy - ry],   // top
      [cx + rx, cy],    // right
      [cx, cy + ry],    // bottom
      [cx - rx, cy],    // left
    ],
    i: [
      [-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k],
    ],
    o: [
      [rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k],
    ],
    c: true,
  };
}

// Person Walking layer mapping
const BODY_MAP: Record<number, string> = {
  6: "torso",
  3: "head",
  1: "r_upper_arm",
  2: "r_forearm",
  4: "l_upper_arm",
  5: "l_forearm",
  7: "r_upper_leg",
  8: "r_lower_leg",
  9: "l_upper_leg",
  10: "l_lower_leg",
};

// ── Skin definitions ──

function hexToRgb01(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function makeSkin(palette: {
  hair: string; skin: string; skinDark: string;
  shirt: string; shirtDark: string;
  pants: string; pantsDark: string;
  shoes: string;
}, proportions: {
  headW: number; headH: number; headR: number;
  torsoW: number; torsoH: number; torsoR: number;
  upperArmW: number; upperArmH: number;
  forearmW: number; forearmH: number;
  upperLegW: number; upperLegH: number;
  lowerLegW: number; lowerLegH: number;
}): SkinDef {
  const p = proportions;

  return {
    head: {
      shapes: [ellipse(0, -p.headH / 2, p.headW / 2, p.headH / 2)],
      fills: [{ color: hexToRgb01(palette.hair) }],
    },
    torso: {
      shapes: [roundedRect(0, 0, p.torsoW, p.torsoH, p.torsoR)],
      fills: [{ color: hexToRgb01(palette.shirt) }],
    },
    r_upper_arm: {
      shapes: [roundedRect(0, 0, p.upperArmW, p.upperArmH, p.upperArmW / 3)],
      fills: [{ color: hexToRgb01(palette.shirtDark) }],
    },
    r_forearm: {
      shapes: [roundedRect(0, 0, p.forearmW, p.forearmH, p.forearmW / 3)],
      fills: [{ color: hexToRgb01(palette.skin) }],
    },
    l_upper_arm: {
      shapes: [roundedRect(0, 0, p.upperArmW, p.upperArmH, p.upperArmW / 3)],
      fills: [{ color: hexToRgb01(palette.shirtDark) }],
    },
    l_forearm: {
      shapes: [roundedRect(0, 0, p.forearmW, p.forearmH, p.forearmW / 3)],
      fills: [{ color: hexToRgb01(palette.skin) }],
    },
    r_upper_leg: {
      shapes: [roundedRect(0, 0, p.upperLegW, p.upperLegH, p.upperLegW / 3)],
      fills: [{ color: hexToRgb01(palette.pants) }],
    },
    r_lower_leg: {
      shapes: [roundedRect(0, 0, p.lowerLegW, p.lowerLegH, p.lowerLegW / 3)],
      fills: [{ color: hexToRgb01(palette.shoes) }],
    },
    l_upper_leg: {
      shapes: [roundedRect(0, 0, p.upperLegW, p.upperLegH, p.upperLegW / 3)],
      fills: [{ color: hexToRgb01(palette.pantsDark) }],
    },
    l_lower_leg: {
      shapes: [roundedRect(0, 0, p.lowerLegW, p.lowerLegH, p.lowerLegW / 3)],
      fills: [{ color: hexToRgb01(palette.shoes) }],
    },
  };
}

const SKINS: Record<string, SkinDef> = {
  // Purple girl from reference images
  girl: makeSkin(
    {
      hair: "#9933CC", skin: "#F5A0C0", skinDark: "#E890B0",
      shirt: "#4466CC", shirtDark: "#2B3D8F",
      pants: "#2D8B57", pantsDark: "#236B44",
      shoes: "#6622AA",
    },
    {
      headW: 60, headH: 55, headR: 30,
      torsoW: 60, torsoH: 160, torsoR: 12,
      upperArmW: 28, upperArmH: 100,
      forearmW: 24, forearmH: 100,
      upperLegW: 32, upperLegH: 110,
      lowerLegW: 28, lowerLegH: 110,
    },
  ),

  // Kurzgesagt style
  kurzgesagt: makeSkin(
    {
      hair: "#FF6B35", skin: "#FFD5C2", skinDark: "#F0C0A8",
      shirt: "#2EC4B6", shirtDark: "#20A090",
      pants: "#1B2845", pantsDark: "#141E33",
      shoes: "#0B132B",
    },
    {
      headW: 65, headH: 60, headR: 32,
      torsoW: 65, torsoH: 170, torsoR: 14,
      upperArmW: 30, upperArmH: 105,
      forearmW: 26, forearmH: 105,
      upperLegW: 34, upperLegH: 115,
      lowerLegW: 30, lowerLegH: 115,
    },
  ),

  // Chunky/blocky character
  blocky: makeSkin(
    {
      hair: "#FF4444", skin: "#FFE0B2", skinDark: "#FFCC80",
      shirt: "#FFB300", shirtDark: "#FF8F00",
      pants: "#5C6BC0", pantsDark: "#3949AB",
      shoes: "#37474F",
    },
    {
      headW: 80, headH: 70, headR: 20,
      torsoW: 90, torsoH: 180, torsoR: 10,
      upperArmW: 40, upperArmH: 95,
      forearmW: 36, forearmH: 95,
      upperLegW: 44, upperLegH: 105,
      lowerLegW: 38, lowerLegH: 105,
    },
  ),

  // Slim/tall character
  slim: makeSkin(
    {
      hair: "#263238", skin: "#D7CCC8", skinDark: "#BCAAA4",
      shirt: "#EC407A", shirtDark: "#C2185B",
      pants: "#1565C0", pantsDark: "#0D47A1",
      shoes: "#212121",
    },
    {
      headW: 48, headH: 48, headR: 24,
      torsoW: 48, torsoH: 200, torsoR: 8,
      upperArmW: 20, upperArmH: 120,
      forearmW: 18, forearmH: 120,
      upperLegW: 26, upperLegH: 130,
      lowerLegW: 22, lowerLegH: 130,
    },
  ),

  // Child/small character
  child: makeSkin(
    {
      hair: "#774133", skin: "#FA9F9F", skinDark: "#EA9594",
      shirt: "#F12F2F", shirtDark: "#DD6206",
      pants: "#2C3EA6", pantsDark: "#273792",
      shoes: "#ACBE25",
    },
    {
      headW: 75, headH: 70, headR: 35,
      torsoW: 55, torsoH: 130, torsoR: 15,
      upperArmW: 24, upperArmH: 80,
      forearmW: 22, forearmH: 80,
      upperLegW: 28, upperLegH: 85,
      lowerLegW: 24, lowerLegH: 85,
    },
  ),
};

// ── Shape replacement ──

function replaceShapes(rig: Record<string, unknown>, skin: SkinDef): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(rig));

  for (const layer of result.layers as Record<string, unknown>[]) {
    const ind = layer.ind as number;
    const partName = BODY_MAP[ind];
    if (!partName || !skin[partName]) continue;

    const partDef = skin[partName];
    const shapes = layer.shapes as Record<string, unknown>[];
    if (!shapes || shapes.length === 0) continue;

    // Replace shape group contents
    for (const shapeGroup of shapes) {
      if (shapeGroup.ty !== "gr") continue;
      const items = shapeGroup.it as Record<string, unknown>[];
      if (!items) continue;

      // Remove old shape and fill items, keep transform
      const transform = items.find((i) => i.ty === "tr");
      const newItems: Record<string, unknown>[] = [];

      // Add new shapes and fills
      for (let si = 0; si < partDef.shapes.length; si++) {
        const shape = partDef.shapes[si];
        const fill = partDef.fills[si] || partDef.fills[0];

        newItems.push({
          ty: "sh",
          ind: si,
          ix: si + 1,
          ks: { a: 0, k: shape, ix: 2 },
          nm: `Path ${si + 1}`,
          hd: false,
        });

        newItems.push({
          ty: "fl",
          c: { a: 0, k: [...fill.color, 1], ix: 4 },
          o: { a: 0, k: (fill.opacity ?? 1) * 100, ix: 5 },
          r: 1,
          bm: 0,
          nm: `Fill ${si + 1}`,
          hd: false,
        });
      }

      if (transform) newItems.push(transform);
      shapeGroup.it = newItems;
    }
  }

  return result;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  let rigFile = "/Users/gygygygy/Downloads/Person Walking (1).json";
  let skinName = "girl";
  let outputFile: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--rig" && args[i + 1]) rigFile = args[++i];
    else if (args[i] === "--skin" && args[i + 1]) skinName = args[++i];
    else if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
    else if (i === 0 && !args[i].startsWith("--")) skinName = args[i];
  }

  if (skinName === "all") {
    // Generate all skins
    const rig = JSON.parse(fs.readFileSync(rigFile, "utf-8"));
    for (const name of Object.keys(SKINS)) {
      const result = replaceShapes(rig, SKINS[name]);
      result.nm = `${name}_walking`;
      const outPath = `experiment/outputs/character/${name}_walking_v2.json`;
      fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
      console.log(`  ${name} → ${outPath}`);
    }
    return;
  }

  const skin = SKINS[skinName];
  if (!skin) {
    console.error(`Skin "${skinName}" not found. Available: ${Object.keys(SKINS).join(", ")}, all`);
    process.exit(1);
  }

  const rig = JSON.parse(fs.readFileSync(rigFile, "utf-8"));
  console.log(`Rig: ${path.basename(rigFile)} (${rig.layers.length} layers)`);
  console.log(`Skin: ${skinName}`);

  const result = replaceShapes(rig, skin);
  result.nm = `${skinName}_walking`;

  const outPath = outputFile ?? `experiment/outputs/character/${skinName}_walking_v2.json`;
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`Output: ${outPath} (${result.layers.length} layers, ${result.w}x${result.h})`);
}

main();
