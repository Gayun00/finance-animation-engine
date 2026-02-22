/**
 * 실험 B: Reference 3장 + 새 아이콘 5장 일관성 평가
 * Claude Vision/텍스트 분석으로 5기준 채점
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

const client = new Anthropic();
const REF_DIR = resolve(__dirname, "reference");
const OUTPUT_DIR = resolve(__dirname, "outputs/round-b");

async function main() {
  const refs = ["ref_01.svg", "ref_02.svg", "ref_03.svg"].map((f) => ({
    name: f,
    type: "REFERENCE",
    svg: readFileSync(`${REF_DIR}/${f}`, "utf-8"),
  }));

  const newIcons = [
    "icon_bank_building.svg",
    "icon_shield_check.svg",
    "icon_clock_money.svg",
    "icon_graph_bar.svg",
    "icon_wallet.svg",
  ].map((f) => ({
    name: f,
    type: "NEW",
    svg: readFileSync(`${OUTPUT_DIR}/${f}`, "utf-8"),
  }));

  const allIcons = [...refs, ...newIcons];

  const prompt = `You are evaluating visual consistency of an SVG icon set.

Here are 8 SVG icons. The first 3 are REFERENCE icons (the style target). The last 5 are NEW icons generated to match that style.

${allIcons.map((i) => `### ${i.type}: ${i.name}\n\`\`\`svg\n${i.svg}\n\`\`\``).join("\n\n")}

Evaluate the consistency between REFERENCE and NEW icons on these 5 criteria (1-10 each):

1. **같은 세트처럼 보이는가** — Do all 8 icons look like they belong to the same icon set?
2. **컬러 톤이 일관되는가** — Is the color treatment consistent? (background color, accent vibrancy, gradient usage)
3. **디테일 수준이 비슷한가** — Is the level of detail/complexity similar across all icons?
4. **형태 언어가 통일되는가** — Do they use the same geometric vocabulary? (same primitives, similar sizing)
5. **배경 처리가 일관되는가** — Is the background treatment identical? (color, glow filter, etc.)

For each criterion, provide:
- Score (1-10)
- Brief justification (1 sentence)

Then provide:
- Total score (/50)
- Overall assessment
- Specific outlier icons (if any) that break consistency

Format as JSON:
{
  "scores": {
    "same_set": { "score": N, "reason": "..." },
    "color_tone": { "score": N, "reason": "..." },
    "detail_level": { "score": N, "reason": "..." },
    "shape_language": { "score": N, "reason": "..." },
    "background": { "score": N, "reason": "..." }
  },
  "total": N,
  "assessment": "...",
  "outliers": ["..."]
}`;

  console.log("Evaluating consistency of 8 SVG icons...\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  console.log(text);

  // Try to parse JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const result = JSON.parse(jsonMatch[0]);
      console.log("\n=== SUMMARY ===");
      console.log(`Total: ${result.total}/50`);
      console.log(`Assessment: ${result.assessment}`);
      if (result.outliers?.length) {
        console.log(`Outliers: ${result.outliers.join(", ")}`);
      }
      console.log(
        result.total >= 35
          ? "\n✓ 수렴 성공 (35↑) → Phase C 진행 가능"
          : result.total >= 25
            ? "\n△ 프롬프트 조정 후 재시도 필요 (25~34)"
            : "\n✗ 대안 검토 필요 (24↓)"
      );
    } catch {
      console.log("\n(JSON parsing failed, see raw output above)");
    }
  }
}

main().catch(console.error);
