/**
 * 실험 C: 일관성 최종 검수
 * production 에셋을 8장씩 묶어서 일관성 평가
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const client = new Anthropic();
const PROD_DIR = resolve(__dirname, "outputs/production");
const DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

interface ConsistencyResult {
  group: number;
  icons: string[];
  overall_score: number;
  color_consistency: number;
  style_consistency: number;
  detail_consistency: number;
  outliers: string[];
  notes: string;
}

async function evaluateGroup(
  groupNum: number,
  files: string[]
): Promise<ConsistencyResult> {
  const svgs = files.map((f) => ({
    name: f,
    svg: readFileSync(`${PROD_DIR}/${f}`, "utf-8"),
  }));

  const prompt = `Evaluate the visual consistency of this SVG icon group (part of a larger 30-icon financial animation set).

${svgs.map((s) => `### ${s.name}\n\`\`\`svg\n${s.svg}\n\`\`\``).join("\n\n")}

Score these 4 criteria (1-10 each):
1. **overall_score**: Do these icons look like they belong to the same set?
2. **color_consistency**: Is the color palette consistent (background, accents)?
3. **style_consistency**: Is the rendering style consistent (shapes, glow, fills)?
4. **detail_consistency**: Is the level of detail/complexity similar?

Also identify any outlier icons that break consistency.

Output ONLY valid JSON:
{
  "overall_score": N,
  "color_consistency": N,
  "style_consistency": N,
  "detail_consistency": N,
  "outliers": ["filename1"],
  "notes": "brief assessment"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return {
    group: groupNum,
    icons: files,
    overall_score: parsed.overall_score || 0,
    color_consistency: parsed.color_consistency || 0,
    style_consistency: parsed.style_consistency || 0,
    detail_consistency: parsed.detail_consistency || 0,
    outliers: parsed.outliers || [],
    notes: parsed.notes || "",
  };
}

async function main() {
  const files = readdirSync(PROD_DIR).filter((f) => f.endsWith(".svg")).sort();
  const groups = chunk(files, 8);

  console.log(`=== Consistency Check (${files.length} icons, ${groups.length} groups of 8) ===\n`);

  const results: ConsistencyResult[] = [];

  for (let i = 0; i < groups.length; i++) {
    console.log(`Group ${i + 1}/${groups.length}: ${groups[i].join(", ")}...`);
    const result = await evaluateGroup(i + 1, groups[i]);
    results.push(result);
    console.log(`  Overall: ${result.overall_score}/10, Color: ${result.color_consistency}/10, Style: ${result.style_consistency}/10, Detail: ${result.detail_consistency}/10`);
    if (result.outliers.length) {
      console.log(`  Outliers: ${result.outliers.join(", ")}`);
    }
    if (i < groups.length - 1) await sleep(DELAY_MS);
  }

  // Aggregate
  const avgOverall = (results.reduce((s, r) => s + r.overall_score, 0) / results.length).toFixed(1);
  const avgColor = (results.reduce((s, r) => s + r.color_consistency, 0) / results.length).toFixed(1);
  const avgStyle = (results.reduce((s, r) => s + r.style_consistency, 0) / results.length).toFixed(1);
  const avgDetail = (results.reduce((s, r) => s + r.detail_consistency, 0) / results.length).toFixed(1);
  const allOutliers = [...new Set(results.flatMap((r) => r.outliers))];

  console.log(`\n=== CONSISTENCY SUMMARY ===`);
  console.log(`Avg Overall: ${avgOverall}/10`);
  console.log(`Avg Color: ${avgColor}/10`);
  console.log(`Avg Style: ${avgStyle}/10`);
  console.log(`Avg Detail: ${avgDetail}/10`);
  console.log(`Outliers: ${allOutliers.length ? allOutliers.join(", ") : "None"}`);

  writeFileSync(
    resolve(__dirname, "outputs/round-c/consistency-log.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), results, summary: { avgOverall, avgColor, avgStyle, avgDetail, allOutliers } }, null, 2),
    "utf-8"
  );
}

main().catch(console.error);
