/**
 * 실험 C: 30개 아이콘 배치 생성
 * extracted-style.txt + Phase B 피드백 반영
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PRODUCTION_ICONS } from "./prompts-production";

const client = new Anthropic();
const STYLE_PATH = resolve(__dirname, "outputs/round-b/extracted-style.txt");
const OUTPUT_DIR = resolve(__dirname, "outputs/round-c");
const LOG_PATH = resolve(__dirname, "outputs/round-c/batch-log.json");

const DELAY_MS = 3000; // rate limit 방지

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateIcon(
  styleDescription: string,
  icon: (typeof PRODUCTION_ICONS)[number]
): Promise<{ id: string; success: boolean; error?: string }> {
  const prompt = `Generate an SVG icon following this EXACT style guide:

${styleDescription}

ADDITIONAL STYLE RULES (from consistency evaluation):
- Use organic, rounded shapes — avoid angular or architectural forms
- Keep detail level consistent: 5-12 primary geometric elements per icon
- Center main subject around coordinate 256 with radius 80-140px
- Use radial gradients with cx="0.3" cy="0.3" for top-left highlighting
- All elements should feel soft and rounded, like gaming UI icons

Generate icon: ${icon.description}
Color palette: ${icon.colors}
Dark navy background (#1B2838). Glow filter with feGaussianBlur stdDeviation="8".

Requirements:
- SVG viewBox="0 0 512 512"
- Use fill only (no stroke/outlines)
- Background: <rect width="512" height="512" fill="#1B2838"/> as first element
- Add glow using feGaussianBlur filter with feMerge
- Output ONLY the SVG code, nothing else`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);

    if (!svgMatch) {
      return { id: icon.id, success: false, error: "No SVG in response" };
    }

    writeFileSync(`${OUTPUT_DIR}/${icon.id}.svg`, svgMatch[0], "utf-8");
    return { id: icon.id, success: true };
  } catch (err) {
    return {
      id: icon.id,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const styleDescription = readFileSync(STYLE_PATH, "utf-8");

  console.log(`=== Phase C: Batch Generation (${PRODUCTION_ICONS.length} icons) ===\n`);

  const results: Array<{
    id: string;
    success: boolean;
    error?: string;
    time: string;
  }> = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCTION_ICONS.length; i++) {
    const icon = PRODUCTION_ICONS[i];
    const progress = `[${i + 1}/${PRODUCTION_ICONS.length}]`;

    // Skip if already generated
    if (existsSync(`${OUTPUT_DIR}/${icon.id}.svg`)) {
      console.log(`${progress} ${icon.id} — already exists, skipping`);
      results.push({
        id: icon.id,
        success: true,
        time: new Date().toISOString(),
      });
      successCount++;
      continue;
    }

    console.log(`${progress} Generating: ${icon.id} (${icon.name})...`);
    const result = await generateIcon(styleDescription, icon);

    if (result.success) {
      console.log(`  ✓ Saved`);
      successCount++;
    } else {
      console.error(`  ✗ FAILED: ${result.error}`);
      failCount++;
    }

    results.push({ ...result, time: new Date().toISOString() });

    // Rate limit
    if (i < PRODUCTION_ICONS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save log
  const log = {
    timestamp: new Date().toISOString(),
    total: PRODUCTION_ICONS.length,
    success: successCount,
    failed: failCount,
    successRate: `${((successCount / PRODUCTION_ICONS.length) * 100).toFixed(1)}%`,
    results,
  };
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${PRODUCTION_ICONS.length}`);
  console.log(`Success: ${successCount} (${log.successRate})`);
  console.log(`Failed: ${failCount}`);
  console.log(`Log: ${LOG_PATH}`);
}

main().catch(console.error);
