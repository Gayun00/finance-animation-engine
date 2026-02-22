/**
 * 실험 B: extracted-style.txt + 새 아이콘 5종 생성
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { ROUND_B_ICONS } from "./prompts-round-b";

const client = new Anthropic();
const STYLE_PATH = resolve(__dirname, "outputs/round-b/extracted-style.txt");
const OUTPUT_DIR = resolve(__dirname, "outputs/round-b");

async function main() {
  const styleDescription = readFileSync(STYLE_PATH, "utf-8");

  console.log("=== Round B: Style-Guided SVG Generation ===\n");

  for (const icon of ROUND_B_ICONS) {
    console.log(`Generating: ${icon.id} (${icon.name})...`);

    const prompt = `Generate an SVG icon following this EXACT style guide:

${styleDescription}

Generate icon: ${icon.description}
Color palette: ${icon.colors}
Same flat vector style, same dark navy background (#1B2838), same glow treatment.

Requirements:
- SVG viewBox="0 0 512 512"
- Use fill only (no stroke/outlines)
- Background: dark navy rectangle (#1B2838) as first element
- Add glow using feGaussianBlur filter (stdDeviation="8") with feMerge
- Center main subject around coordinate 256
- Use 5-12 primary elements
- Clean geometric shapes (circles, ellipses, rectangles, polygons)
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

      if (svgMatch) {
        const outputPath = `${OUTPUT_DIR}/${icon.id}.svg`;
        writeFileSync(outputPath, svgMatch[0], "utf-8");
        console.log(`  -> Saved: ${outputPath}`);
      } else {
        console.error(`  -> FAILED: No SVG in response`);
      }
    } catch (err) {
      console.error(`  -> ERROR: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
