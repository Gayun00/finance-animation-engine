#!/usr/bin/env npx tsx
/**
 * SVG → Lottie CLI converter
 *
 * Usage:
 *   npx tsx experiment/svg-to-lottie/convert.ts <input.svg> [options]
 *
 * Options:
 *   --output <path>    Output file path (default: input with .json extension)
 *   --name <name>      Animation name
 *   --motion <preset>  Motion preset: float, bounce, rotate, pulse, swing, fade_in
 *
 * Examples:
 *   npx tsx experiment/svg-to-lottie/convert.ts experiment/outputs/trial/05_lightbulb.svg
 *   npx tsx experiment/svg-to-lottie/convert.ts experiment/outputs/trial/05_lightbulb.svg --motion float
 */

import * as fs from "fs";
import * as path from "path";
import { parseSvg } from "./parse-svg.js";
import { buildLottie } from "./build-lottie.js";
import { ALL_PRESETS, type MotionPreset } from "./motion-presets.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log("Usage: npx tsx convert.ts <input.svg> [--output <out.json>] [--name <name>] [--motion <preset>]");
    console.log(`  presets: ${ALL_PRESETS.join(", ")}`);
    process.exit(0);
  }

  const inputFile = args[0];
  let outputFile: string | undefined;
  let name: string | undefined;
  let motion: MotionPreset | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === "--name" && args[i + 1]) {
      name = args[++i];
    } else if (args[i] === "--motion" && args[i + 1]) {
      const val = args[++i] as MotionPreset;
      if (!ALL_PRESETS.includes(val)) {
        console.error(`Unknown motion preset: ${val}. Available: ${ALL_PRESETS.join(", ")}`);
        process.exit(1);
      }
      motion = val;
    }
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
  }

  const svgText = fs.readFileSync(inputFile, "utf-8");
  const parsed = parseSvg(svgText);

  console.log(`Parsed SVG: viewBox=${parsed.viewBox.w}x${parsed.viewBox.h}, ${parsed.paths.length} paths, ${parsed.gradients.size} gradients`);

  const baseName = name ?? path.basename(inputFile, path.extname(inputFile));
  const lottie = buildLottie(parsed, { name: baseName, motion });

  const suffix = motion ? `_${motion}` : "";
  const outPath = outputFile ?? inputFile.replace(/\.svg$/i, `${suffix}.json`);
  fs.writeFileSync(outPath, JSON.stringify(lottie, null, 2));

  const motionInfo = motion ? `, motion=${motion}` : "";
  console.log(`Lottie written: ${outPath} (${lottie.layers.length} layers, ${lottie.w}x${lottie.h}${motionInfo})`);
}

main();
