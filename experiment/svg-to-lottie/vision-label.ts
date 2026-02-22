#!/usr/bin/env npx tsx
/**
 * Claude Vision 기반 캐릭터 SVG 부위 라벨링
 *
 * 원본 PNG + path별 bbox/색상 정보를 Claude Vision에 보내서
 * 각 path가 어느 신체 부위인지 판단
 *
 * Usage:
 *   npx tsx vision-label.ts <character.svg> [--output <labels.json>]
 */

import fs from "fs";
import path from "path";
import { parseSvg, stripBackground } from "./parse-svg.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

type BodyPart = "head" | "hair" | "face" | "body" | "l_arm" | "r_arm" | "l_leg" | "r_leg" | "other";

// Simplified parts for Person Walking rig compatibility
const VALID_PARTS: BodyPart[] = ["head", "hair", "face", "body", "l_arm", "r_arm", "l_leg", "r_leg", "other"];

// Map fine-grained labels to rig parts
const RIG_MAP: Record<string, string> = {
  head: "head", hair: "head", face: "head",
  body: "body",
  l_arm: "l_arm", l_hand: "l_arm",
  r_arm: "r_arm", r_hand: "r_arm",
  l_leg: "l_leg", l_foot: "l_leg",
  r_leg: "r_leg", r_foot: "r_leg",
  other: "other",
};

function getBbox(d: string) {
  const coords = d.match(/[\d.]+/g)?.map(Number) || [];
  const xs = coords.filter((_, i) => i % 2 === 0);
  const ys = coords.filter((_, i) => i % 2 === 1);
  if (xs.length === 0) return null;
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

async function labelWithVision(
  pngPath: string,
  pathDescriptions: string[],
  viewBox: { w: number; h: number },
): Promise<{ index: number; label: string }[]> {
  const content: Record<string, unknown>[] = [];

  // Send character PNG
  const pngData = fs.readFileSync(pngPath);
  content.push({
    type: "image",
    source: { type: "base64", media_type: "image/png", data: pngData.toString("base64") },
  });

  const prompt = `You are analyzing a flat-design character illustration. The character SVG has ${pathDescriptions.length} separate paths. Below I describe each path's position and color relative to a ${viewBox.w}x${viewBox.h} canvas (Y-axis goes DOWN, so smaller Y = higher on screen).

${pathDescriptions.join("\n")}

For each path, identify which body part it belongs to. Use these labels:
- head (skull, ears)
- hair (hair, hat, headwear)
- face (eyes, nose, mouth, eyebrows, facial features)
- body (torso, shirt, dress, collar)
- l_arm (character's LEFT arm + hand — usually on the right side of the image for front-facing or back side for side-facing characters)
- r_arm (character's RIGHT arm + hand — usually on the left side of the image for front-facing)
- l_leg (character's LEFT leg + foot)
- r_leg (character's RIGHT leg + foot)
- other (shadow, background element, accessory)

IMPORTANT: Look at the image carefully. The character may be facing right (side view). In that case:
- The arm/leg closer to the viewer is the RIGHT side
- The arm/leg farther from viewer is the LEFT side
- Use position (which is closer to front/back) and color brightness to distinguish

Reply ONLY with a JSON array:
[{"index": 0, "label": "hair"}, {"index": 1, "label": "face"}, ...]`;

  content.push({ type: "text", text: prompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error: ${res.status} ${errText}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  const text = data.content[0]?.text || "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array in response: ${text.slice(0, 300)}`);

  return JSON.parse(match[0]);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npx tsx vision-label.ts <character.svg> [--output <labels.json>]");
    process.exit(0);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  const inputFile = args[0];
  let outputFile: string | undefined;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) outputFile = args[++i];
  }

  // Find corresponding PNG
  const pngPath = inputFile.replace(/\.svg$/, ".png");
  if (!fs.existsSync(pngPath)) {
    console.error(`PNG not found: ${pngPath}. Recraft should have generated it alongside the SVG.`);
    process.exit(1);
  }

  console.log(`SVG: ${inputFile}`);
  console.log(`PNG: ${pngPath}`);

  // Parse SVG
  const svgText = fs.readFileSync(inputFile, "utf-8");
  let parsed = parseSvg(svgText);
  const beforeStrip = parsed.paths.length;
  parsed = stripBackground(parsed);
  console.log(`Paths: ${parsed.paths.length} (removed ${beforeStrip - parsed.paths.length} background)`);

  // Build path descriptions
  const descriptions = parsed.paths.map((p, idx) => {
    const bb = getBbox(p.d);
    if (!bb) return `Path ${idx}: (empty)`;
    const relTop = (bb.minY / parsed.viewBox.h * 100).toFixed(0);
    const relBot = (bb.maxY / parsed.viewBox.h * 100).toFixed(0);
    const relLeft = (bb.minX / parsed.viewBox.w * 100).toFixed(0);
    const relRight = (bb.maxX / parsed.viewBox.w * 100).toFixed(0);
    return `Path ${idx}: position=(${relLeft}%-${relRight}% horizontal, ${relTop}%-${relBot}% vertical), size=${bb.w.toFixed(0)}x${bb.h.toFixed(0)}, fill=${p.fillRaw}`;
  });

  console.log("\nPath descriptions:");
  descriptions.forEach((d) => console.log(`  ${d}`));

  // Label with Claude Vision
  console.log("\nSending to Claude Vision (Sonnet)...");
  const labels = await labelWithVision(pngPath, descriptions, parsed.viewBox);

  // Map to rig-compatible labels
  const rigLabels = labels.map((l) => ({
    index: l.index,
    visionLabel: l.label,
    rigLabel: RIG_MAP[l.label] || "other",
  }));

  console.log("\nLabeling results:");
  const grouped = new Map<string, number[]>();
  for (const { index, visionLabel, rigLabel } of rigLabels) {
    console.log(`  Path ${index}: ${visionLabel} → rig: ${rigLabel}`);
    const arr = grouped.get(rigLabel) || [];
    arr.push(index);
    grouped.set(rigLabel, arr);
  }

  console.log("\nRig groups:");
  for (const [label, indices] of grouped) {
    console.log(`  ${label}: paths [${indices.join(", ")}]`);
  }

  // Save result
  const result = {
    source: path.basename(inputFile),
    png: path.basename(pngPath),
    viewBox: parsed.viewBox,
    pathCount: parsed.paths.length,
    labels: rigLabels,
    rigGroups: Object.fromEntries(grouped),
    paths: parsed.paths.map((p, idx) => {
      const rl = rigLabels.find((l) => l.index === idx);
      const bb = getBbox(p.d);
      return {
        index: idx,
        label: rl?.rigLabel || "other",
        visionLabel: rl?.visionLabel || "other",
        fill: p.fillRaw,
        bbox: bb,
      };
    }),
  };

  const outPath = outputFile ?? inputFile.replace(/\.svg$/, "_labels.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nLabels saved: ${outPath}`);
}

main().catch(console.error);
