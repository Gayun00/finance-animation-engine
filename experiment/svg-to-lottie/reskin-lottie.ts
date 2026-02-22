#!/usr/bin/env npx tsx
/**
 * Lottie 캐릭터 리스킨 — 템플릿 Lottie의 fill 색상을 새 팔레트로 교체
 *
 * Usage:
 *   npx tsx experiment/svg-to-lottie/reskin-lottie.ts <template.json> --palette <palette.json> [--output <out.json>]
 *
 * palette.json 형식:
 * {
 *   "name": "purple_girl",
 *   "mapping": {
 *     "head": { "fills": ["#9933CC", "#F0A0C0", "#3322AA"] },
 *     "body": { "fills": ["#3366CC", "#2855BB", "#4477DD"] },
 *     ...
 *   }
 * }
 *
 * 또는 단순 색상 매핑:
 * {
 *   "name": "purple_girl",
 *   "colorMap": {
 *     "rgb(119,65,51)": "#9933CC",   // 원래 머리색 → 보라
 *     "rgb(179,96,75)": "#F0A0C0",   // 원래 피부색 → 핑크
 *     ...
 *   }
 * }
 */

import fs from "fs";
import path from "path";

interface ColorMap {
  [originalColor: string]: string;
}

function hexToRgb01(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function rgb01ToKey(c: number[]): string {
  const r = Math.round((c[0] || 0) * 255);
  const g = Math.round((c[1] || 0) * 255);
  const b = Math.round((c[2] || 0) * 255);
  return `rgb(${r},${g},${b})`;
}

function findClosestColor(key: string, colorMap: ColorMap): string | null {
  if (colorMap[key]) return colorMap[key];
  // Fuzzy match: find closest RGB within threshold
  const m = key.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return null;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  let bestDist = 30; // max distance threshold
  let bestMatch: string | null = null;
  for (const mapKey of Object.keys(colorMap)) {
    const m2 = mapKey.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!m2) continue;
    const dist = Math.abs(r - +m2[1]) + Math.abs(g - +m2[2]) + Math.abs(b - +m2[3]);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = colorMap[mapKey];
    }
  }
  return bestMatch;
}

function applyColorMap(lottie: Record<string, unknown>, colorMap: ColorMap): Record<string, unknown> {
  const json = JSON.stringify(lottie);

  // Build replacement map: find all fill color arrays and replace
  const result = JSON.parse(json);

  function walkItems(items: Record<string, unknown>[]) {
    for (const item of items) {
      if (item.ty === "fl") {
        const c = item.c as { k: number[]; a: number };
        if (c && Array.isArray(c.k) && c.a === 0) {
          const key = rgb01ToKey(c.k);
          const newColor = findClosestColor(key, colorMap);
          if (newColor) {
            const [r, g, b] = hexToRgb01(newColor);
            c.k = [r, g, b, c.k[3] ?? 1];
          }
        }
      }
      // Recurse into groups
      if (item.ty === "gr" && Array.isArray(item.it)) {
        walkItems(item.it as Record<string, unknown>[]);
      }
    }
  }

  for (const layer of (result.layers || []) as Record<string, unknown>[]) {
    const shapes = layer.shapes as Record<string, unknown>[];
    if (shapes) {
      for (const shape of shapes) {
        if (shape.ty === "gr" && Array.isArray(shape.it)) {
          walkItems(shape.it as Record<string, unknown>[]);
        }
      }
    }
  }

  return result;
}

// ── Predefined palettes ──

const PALETTES: Record<string, ColorMap> = {
  // Bearded Man Walking original colors → Purple Girl (from reference images)
  purple_girl: {
    // Head: brown skin → pink skin, dark brown beard → purple hair, medium brown → pink
    "rgb(119,65,51)": "#CC66FF",   // 머리카락 (dark brown → 밝은 보라)
    "rgb(114,61,48)": "#9933CC",   // 머리카락 뒷면 (darker brown → 진한 보라)
    "rgb(179,96,75)": "#F5A0C0",   // 얼굴 피부 (tan → 핑크)
    // Torso: teal shirt → blue top
    "rgb(119,167,170)": "#4466CC", // 셔츠 메인 (teal → 파란)
    "rgb(59,121,128)": "#334499",  // 셔츠 어두운면 (dark teal → 진파란)
    "rgb(60,122,128)": "#334499",  // 셔츠 어두운면 variant
    "rgb(80,162,171)": "#5577DD",  // 셔츠 밝은면 (light teal → 밝파란)
    "rgb(80,163,171)": "#5577DD",  // 셔츠 밝은면 variant
    // Legs: cyan pants → dark green pants
    "rgb(150,221,223)": "#2D8B57", // 바지 (cyan → 초록)
    "rgb(149,221,223)": "#2D8B57", // 바지 (약간 다른 cyan)
    // Arms/legs skin: salmon → pink skin
    "rgb(251,160,159)": "#F5A0C0", // 피부 밝은 (salmon → 핑크)
    "rgb(250,159,159)": "#F5A0C0", // 피부 밝은 variant
    "rgb(251,119,121)": "#E080A0", // 피부 악센트 (darker salmon)
    "rgb(228,145,144)": "#E890B0", // 피부 어두운 (darker salmon → 진핑크)
    "rgb(227,145,144)": "#E890B0", // 피부 어두운 variant
    // Upper arm sleeves: dark teal → dark blue
    "rgb(49,84,84)": "#2B3D8F",    // 소매 오른쪽 (dark teal → 네이비)
    "rgb(48,83,83)": "#2B3D8F",    // 소매 variant
    "rgb(40,68,68)": "#233380",    // 소매 왼쪽 (darker teal → 진네이비)
    "rgb(40,68,67)": "#233380",    // 소매 variant
    "rgb(39,68,68)": "#233380",    // 소매 variant
    "rgb(30,51,50)": "#1A2260",    // 소매 가장 어두운 (→ 진네이비)
    // Feet: dark red → purple shoes
    "rgb(102,2,8)": "#6622AA",     // 신발 (dark red → 진보라)
    "rgb(102,2,7)": "#6622AA",     // 신발 variant
    // Black stays as dark accent
    "rgb(0,0,0)": "#1A0033",       // 순검정 → 매우 진한 보라
  },

  // Orange variant (다른 옷 색상)
  orange_girl: {
    "rgb(119,65,51)": "#CC66FF", "rgb(114,61,48)": "#9933CC", "rgb(179,96,75)": "#F5A0C0",
    "rgb(119,167,170)": "#E07030", "rgb(59,121,128)": "#C05520", "rgb(60,122,128)": "#C05520",
    "rgb(80,162,171)": "#F08040", "rgb(80,163,171)": "#F08040",
    "rgb(150,221,223)": "#2D4B77", "rgb(149,221,223)": "#2D4B77",
    "rgb(251,160,159)": "#F5A0C0", "rgb(250,159,159)": "#F5A0C0", "rgb(251,119,121)": "#E080A0",
    "rgb(228,145,144)": "#E890B0", "rgb(227,145,144)": "#E890B0",
    "rgb(49,84,84)": "#B04820", "rgb(48,83,83)": "#B04820",
    "rgb(40,68,68)": "#A04018", "rgb(40,68,67)": "#A04018", "rgb(39,68,68)": "#A04018", "rgb(30,51,50)": "#802010",
    "rgb(102,2,8)": "#6622AA", "rgb(102,2,7)": "#6622AA",
    "rgb(0,0,0)": "#1A0033",
  },

  // Kurzgesagt-inspired
  kurzgesagt: {
    "rgb(119,65,51)": "#FF6B35", "rgb(114,61,48)": "#E05525", "rgb(179,96,75)": "#FFD5C2",
    "rgb(119,167,170)": "#2EC4B6", "rgb(59,121,128)": "#1AA3A0", "rgb(60,122,128)": "#1AA3A0",
    "rgb(80,162,171)": "#3ED5C8", "rgb(80,163,171)": "#3ED5C8",
    "rgb(150,221,223)": "#1B2845", "rgb(149,221,223)": "#1B2845",
    "rgb(251,160,159)": "#FFD5C2", "rgb(250,159,159)": "#FFD5C2", "rgb(251,119,121)": "#F0B0A0",
    "rgb(228,145,144)": "#F0C0A8", "rgb(227,145,144)": "#F0C0A8",
    "rgb(49,84,84)": "#20A090", "rgb(48,83,83)": "#20A090",
    "rgb(40,68,68)": "#188878", "rgb(40,68,67)": "#188878", "rgb(39,68,68)": "#188878", "rgb(30,51,50)": "#0E6658",
    "rgb(102,2,8)": "#0B132B", "rgb(102,2,7)": "#0B132B",
    "rgb(0,0,0)": "#050A15",
  },
};

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npx tsx reskin-lottie.ts <template.json> --palette <name|file.json> [--output <out.json>]");
    console.log("\nBuilt-in palettes:", Object.keys(PALETTES).join(", "));
    process.exit(0);
  }

  const inputFile = args[0];
  let paletteName = "purple_girl";
  let outputFile: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--palette" && args[i + 1]) paletteName = args[++i];
    if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
  }

  const lottie = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

  // Load palette
  let colorMap: ColorMap;
  if (PALETTES[paletteName]) {
    colorMap = PALETTES[paletteName];
    console.log(`Using built-in palette: ${paletteName}`);
  } else if (fs.existsSync(paletteName)) {
    const paletteData = JSON.parse(fs.readFileSync(paletteName, "utf-8"));
    colorMap = paletteData.colorMap || {};
    console.log(`Using palette file: ${paletteName}`);
  } else {
    console.error(`Palette "${paletteName}" not found. Available: ${Object.keys(PALETTES).join(", ")}`);
    process.exit(1);
  }

  // Collect original colors for comparison
  const originalColors = new Set<string>();
  function scanColors(items: Record<string, unknown>[]) {
    for (const item of items) {
      if (item.ty === "fl") {
        const c = item.c as { k: number[] };
        if (c?.k) originalColors.add(rgb01ToKey(c.k));
      }
      if (item.ty === "gr" && Array.isArray(item.it)) scanColors(item.it as Record<string, unknown>[]);
    }
  }
  for (const layer of lottie.layers) {
    for (const shape of layer.shapes || []) {
      if (shape.ty === "gr") scanColors(shape.it);
    }
  }

  console.log(`\nOriginal colors (${originalColors.size}):`);
  for (const c of originalColors) {
    const mapped = colorMap[c];
    console.log(`  ${c} → ${mapped || "(unchanged)"}`);
  }

  const unmapped = [...originalColors].filter(c => !colorMap[c]);
  if (unmapped.length > 0) {
    console.log(`\nWarning: ${unmapped.length} colors not mapped`);
  }

  // Apply reskin
  const reskinned = applyColorMap(lottie, colorMap);

  // Update name
  reskinned.nm = `${paletteName}_walking`;

  // Write output
  const baseName = path.basename(inputFile, ".json");
  const outPath = outputFile ?? path.join(path.dirname(inputFile), `${baseName}_${paletteName}.json`);
  fs.writeFileSync(outPath, JSON.stringify(reskinned, null, 2));

  console.log(`\nReskinned Lottie written: ${outPath}`);
  console.log(`Layers: ${reskinned.layers.length}, Canvas: ${reskinned.w}x${reskinned.h}`);
}

main();
