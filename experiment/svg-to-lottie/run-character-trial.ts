#!/usr/bin/env npx tsx
/**
 * Recraft 캐릭터 SVG 생성 스크립트
 *
 * 캐릭터 레퍼런스 이미지로 커스텀 스타일을 만들고, 캐릭터 SVG를 생성한다.
 *
 * Usage:
 *   RECRAFT_API_KEY=... npx tsx experiment/svg-to-lottie/run-character-trial.ts
 *
 * Prerequisites:
 *   - experiment/reference/character/ 에 레퍼런스 이미지 3~5장 (PNG)
 *   - RECRAFT_API_KEY 환경변수
 */

import fs from "fs";
import path from "path";

const API_KEY = process.env.RECRAFT_API_KEY || "";
const BASE_URL = "https://external.api.recraft.ai/v1";
const REF_DIR = path.resolve(__dirname, "../reference/character");
const OUT_DIR = path.resolve(__dirname, "../outputs/character");

const CHARACTER_PROMPTS = [
  {
    id: "char_01_presenter",
    prompt: "A friendly male presenter standing, full body, arms visible, simple flat style, facing forward, neutral pose",
  },
  {
    id: "char_02_thinking",
    prompt: "A friendly male presenter standing with hand on chin, thinking pose, full body, simple flat style",
  },
  {
    id: "char_03_pointing",
    prompt: "A friendly male presenter pointing to the right with one arm extended, full body, simple flat style",
  },
];

async function createCharacterStyle(): Promise<string> {
  console.log("=== Creating character custom style ===");

  if (!fs.existsSync(REF_DIR)) {
    console.error(`Reference directory not found: ${REF_DIR}`);
    console.log("Please add 3-5 character reference images to this directory.");
    process.exit(1);
  }

  const refFiles = fs.readdirSync(REF_DIR).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
  if (refFiles.length < 3) {
    console.error(`Need at least 3 reference images, found ${refFiles.length} in ${REF_DIR}`);
    process.exit(1);
  }

  const formData = new FormData();
  formData.append("style", "digital_illustration");

  for (const filename of refFiles.slice(0, 5)) {
    const filePath = path.join(REF_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer], { type: "image/png" });
    formData.append("files", blob, filename);
    console.log(`  ref: ${filename}`);
  }

  const res = await fetch(`${BASE_URL}/styles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`create_style failed: ${res.status} ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`Style created: ${data.id}`);
  return data.id;
}

async function generateCharacter(styleId: string, char: { id: string; prompt: string }): Promise<void> {
  console.log(`Generating: ${char.id}...`);

  const body = {
    prompt: char.prompt,
    model: "recraftv3",
    style_id: styleId,
    size: "1024x1024",
    response_format: "url",
  };

  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`generate failed for ${char.id}: ${res.status} ${text}`);
    return;
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error(`No URL returned for ${char.id}`);
    return;
  }

  const imgRes = await fetch(imageUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") || "";
  const ext = contentType.includes("svg") ? "svg" : "png";
  const outPath = path.join(OUT_DIR, `${char.id}.${ext}`);
  fs.writeFileSync(outPath, imgBuffer);
  console.log(`  Saved: ${outPath} (${imgBuffer.length} bytes)`);
}

async function main() {
  if (!API_KEY) {
    console.error("Set RECRAFT_API_KEY environment variable");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(REF_DIR, { recursive: true });

  const styleId = await createCharacterStyle();

  fs.writeFileSync(
    path.join(OUT_DIR, "character-style-info.json"),
    JSON.stringify({ styleId, createdAt: new Date().toISOString() }, null, 2),
  );

  for (const char of CHARACTER_PROMPTS) {
    await generateCharacter(styleId, char);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n=== Character trial complete ===");
  console.log(`Output: ${OUT_DIR}`);
  console.log(`Next step: npx tsx experiment/svg-to-lottie/label-body-parts.ts ${OUT_DIR}/char_01_presenter.svg`);
}

main().catch(console.error);
