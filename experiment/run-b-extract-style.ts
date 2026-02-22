/**
 * 실험 B: Reference SVG에서 스타일 설명 추출
 *
 * Claude SVG는 코드이므로, 3개의 reference SVG를 분석하여
 * 일관된 스타일 설명을 추출한다.
 * Claude Vision 대신 코드 분석 + Claude 텍스트 분석을 사용.
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const client = new Anthropic();
const REF_DIR = resolve(__dirname, "reference");
const OUTPUT_PATH = resolve(__dirname, "outputs/round-b/extracted-style.txt");

async function main() {
  // Read all 3 reference SVGs
  const refs = [
    { name: "ref_01 (gold coin)", svg: readFileSync(`${REF_DIR}/ref_01.svg`, "utf-8") },
    { name: "ref_02 (chart up)", svg: readFileSync(`${REF_DIR}/ref_02.svg`, "utf-8") },
    { name: "ref_03 (piggy bank)", svg: readFileSync(`${REF_DIR}/ref_03.svg`, "utf-8") },
  ];

  const prompt = `Analyze these 3 SVG icon files and extract a detailed style description that can be used to generate new icons in the EXACT same style.

${refs.map((r) => `### ${r.name}\n\`\`\`svg\n${r.svg}\n\`\`\``).join("\n\n")}

Extract and describe:
1. **Color palette** — exact hex codes used, background color, accent colors
2. **Shape style** — geometric primitives used (circle, rect, polygon, path), rounded corners
3. **Glow effect** — filter details (feGaussianBlur stdDeviation values, feMerge technique)
4. **Background treatment** — how background is rendered
5. **Detail level** — complexity of shapes, number of elements per icon
6. **Proportions** — viewBox size, icon positioning within canvas, typical element sizes
7. **Color application** — gradients vs flat fills, opacity usage

Output a single, cohesive style guide paragraph (200-300 words) that another AI could use to replicate this exact style. Include specific hex values, SVG techniques, and element sizing.`;

  console.log("Analyzing 3 reference SVGs...");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const styleDescription =
    response.content[0].type === "text" ? response.content[0].text : "";

  writeFileSync(OUTPUT_PATH, styleDescription, "utf-8");
  console.log(`Style description saved to: ${OUTPUT_PATH}`);
  console.log("\n--- Extracted Style ---");
  console.log(styleDescription);
}

main().catch(console.error);
