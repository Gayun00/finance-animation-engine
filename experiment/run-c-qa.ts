/**
 * 실험 C: Vision QA — 10항목 × 5점 자동 채점
 * SVG 코드를 분석하여 품질 채점
 */
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { resolve } from "path";
import { PRODUCTION_ICONS } from "./prompts-production";

const client = new Anthropic();
const INPUT_DIR = resolve(__dirname, "outputs/round-c");
const PROD_DIR = resolve(__dirname, "outputs/production");
const QA_LOG_PATH = resolve(__dirname, "outputs/round-c/qa-log.json");

const PASS_THRESHOLD = 38; // 50점 만점 중 38점
const DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface QAResult {
  id: string;
  name: string;
  scores: Record<string, number>;
  total: number;
  pass: boolean;
  issues?: string[];
  fix_suggestions?: string[];
}

async function qaIcon(
  icon: (typeof PRODUCTION_ICONS)[number]
): Promise<QAResult> {
  const svgPath = `${INPUT_DIR}/${icon.id}.svg`;
  const svg = readFileSync(svgPath, "utf-8");

  const prompt = `You are a quality assurance reviewer for SVG icons in a Kurzgesagt-style financial animation set.

Analyze this SVG icon and score it on 10 criteria (1-5 each):

### Icon: ${icon.name} (${icon.id})
Expected: ${icon.description}
Expected colors: ${icon.colors}

\`\`\`svg
${svg}
\`\`\`

**Scoring criteria (1-5 each):**
1. flat_vector: Flat vector style, no 3D or realistic textures
2. color_match: Uses dark navy background (#1B2838) + vibrant accent colors
3. no_outlines: No thick outlines/strokes (fill-only)
4. clean_shapes: Clean geometric shapes
5. glow_effect: Consistent subtle glow (feGaussianBlur filter present)
6. transparent_bg: Dark navy background (#1B2838) present
7. identifiable: Clearly recognizable as the intended object
8. animation_ready: Suitable for motion graphics overlay
9. no_artifacts: No generation artifacts or malformed SVG
10. consistent_style: Matches the set's overall style (dark bg, warm accents, organic shapes)

Output ONLY valid JSON:
{
  "scores": {
    "flat_vector": N,
    "color_match": N,
    "no_outlines": N,
    "clean_shapes": N,
    "glow_effect": N,
    "transparent_bg": N,
    "identifiable": N,
    "animation_ready": N,
    "no_artifacts": N,
    "consistent_style": N
  },
  "total": N,
  "issues": ["issue1", "issue2"],
  "fix_suggestions": ["suggestion1"]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      id: icon.id,
      name: icon.name,
      scores: {},
      total: 0,
      pass: false,
      issues: ["Failed to parse QA response"],
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const total =
    parsed.total ||
    Object.values(parsed.scores as Record<string, number>).reduce(
      (a, b) => a + b,
      0
    );
  const pass = total >= PASS_THRESHOLD;

  return {
    id: icon.id,
    name: icon.name,
    scores: parsed.scores,
    total,
    pass,
    issues: parsed.issues,
    fix_suggestions: parsed.fix_suggestions,
  };
}

async function main() {
  console.log(`=== Phase C: QA (${PRODUCTION_ICONS.length} icons, threshold: ${PASS_THRESHOLD}/50) ===\n`);

  if (!existsSync(PROD_DIR)) mkdirSync(PROD_DIR, { recursive: true });

  const results: QAResult[] = [];
  let passCount = 0;
  let failCount = 0;
  let totalScore = 0;

  for (let i = 0; i < PRODUCTION_ICONS.length; i++) {
    const icon = PRODUCTION_ICONS[i];
    const progress = `[${i + 1}/${PRODUCTION_ICONS.length}]`;
    console.log(`${progress} QA: ${icon.id}...`);

    const result = await qaIcon(icon);
    results.push(result);
    totalScore += result.total;

    if (result.pass) {
      console.log(`  ✓ PASS (${result.total}/50)`);
      // Copy to production
      copyFileSync(`${INPUT_DIR}/${icon.id}.svg`, `${PROD_DIR}/${icon.id}.svg`);
      passCount++;
    } else {
      console.log(`  ✗ FAIL (${result.total}/50)`);
      if (result.issues?.length) {
        console.log(`    Issues: ${result.issues.join(", ")}`);
      }
      failCount++;
    }

    if (i < PRODUCTION_ICONS.length - 1) await sleep(DELAY_MS);
  }

  const avgScore = (totalScore / PRODUCTION_ICONS.length).toFixed(1);

  // Save log
  writeFileSync(
    QA_LOG_PATH,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        threshold: PASS_THRESHOLD,
        total: PRODUCTION_ICONS.length,
        passed: passCount,
        failed: failCount,
        passRate: `${((passCount / PRODUCTION_ICONS.length) * 100).toFixed(1)}%`,
        avgScore,
        results,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n=== QA SUMMARY ===`);
  console.log(`Total: ${PRODUCTION_ICONS.length}`);
  console.log(`Pass: ${passCount} (${((passCount / PRODUCTION_ICONS.length) * 100).toFixed(1)}%)`);
  console.log(`Fail: ${failCount}`);
  console.log(`Avg Score: ${avgScore}/50`);
  console.log(`Production ready: ${passCount} icons in outputs/production/`);

  if (failCount > 0) {
    console.log(`\nFailed icons:`);
    results
      .filter((r) => !r.pass)
      .forEach((r) => {
        console.log(`  - ${r.id} (${r.total}/50): ${r.issues?.join(", ")}`);
        if (r.fix_suggestions?.length) {
          console.log(`    Fix: ${r.fix_suggestions.join(", ")}`);
        }
      });
  }
}

main().catch(console.error);
