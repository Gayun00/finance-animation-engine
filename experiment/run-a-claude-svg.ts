/**
 * 실험 A: Claude SVG 5개 아이콘 생성
 */
import "dotenv/config";
import { TEST_ICONS } from "./prompts";
import { generateClaudeSvg } from "./api/claude-svg";
import { resolve } from "path";

const OUTPUT_DIR = resolve(__dirname, "outputs/round-a");

async function main() {
  console.log("=== Claude SVG Generation ===\n");

  for (const icon of TEST_ICONS) {
    const outputPath = `${OUTPUT_DIR}/${icon.id}_claude.svg`;
    console.log(`Generating: ${icon.id} (${icon.name})...`);

    const result = await generateClaudeSvg(icon, outputPath);

    if (result.success) {
      console.log(`  -> Saved: ${result.path}`);
    } else {
      console.error(`  -> FAILED: ${result.error}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
