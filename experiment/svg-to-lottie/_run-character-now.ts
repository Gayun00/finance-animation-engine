#!/usr/bin/env npx tsx
/**
 * 캐릭터 POC: Recraft API로 스타일 생성 + 캐릭터 SVG 생성
 * 레퍼런스 5장 → 커스텀 스타일 → 3개 포즈 SVG
 */

import fs from "fs";
import path from "path";

const API_KEY = "2i7LGoN3td0XthJjMTcfVfNW3DJYiDc2FM19TGEHPN2wCU4ZBAqUtR377dP8QKFq";
const BASE_URL = "https://external.api.recraft.ai/v1";
const REF_DIR = path.resolve(__dirname, "../reference/character");
const OUT_DIR = path.resolve(__dirname, "../outputs/character");

// 캐릭터 특징이 가장 잘 보이는 5장 선택
const REFERENCES = [
  "07_face.png",      // 얼굴 클로즈업 - 스타일 핵심
  "03_waving.png",    // 전신 + 손 흔들기
  "04_sofa.png",      // 옆모습 앉기
  "08_crawling.png",  // 전신 포즈
  "01_studying.png",  // 앉아서 공부
];

const CHARACTERS = [
  {
    id: "char_standing_side",
    prompt: "A character standing in side view facing right, full body visible, arms at sides, simple flat illustration style, solid color background, no text",
  },
  {
    id: "char_walking_side",
    prompt: "A character walking to the right in side view, one leg forward, arms swinging, full body visible, simple flat illustration style, solid color background, no text",
  },
  {
    id: "char_waving_side",
    prompt: "A character standing in side view facing right, raising one hand and waving, full body visible, simple flat illustration style, solid color background, no text",
  },
];

async function createStyle(): Promise<string> {
  console.log("=== Creating character style ===");
  const formData = new FormData();
  formData.append("style", "vector_illustration");

  for (const filename of REFERENCES) {
    const filePath = path.join(REF_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing: ${filePath}`);
      process.exit(1);
    }
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer], { type: "image/png" });
    formData.append("files", blob, filename);
    console.log(`  ref: ${filename} (${buffer.length} bytes)`);
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
  console.log(`Style ID: ${data.id}\n`);
  return data.id;
}

async function generate(styleId: string, char: { id: string; prompt: string }) {
  console.log(`Generating ${char.id}...`);

  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: char.prompt,
      model: "recraftv3",
      style_id: styleId,
      size: "1024x1024",
      response_format: "url",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  FAIL ${char.id}: ${res.status} ${text}`);
    return;
  }

  const data = await res.json();
  const url = data.data?.[0]?.url;
  if (!url) {
    console.error(`  No URL for ${char.id}`);
    return;
  }

  const imgRes = await fetch(url);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const ct = imgRes.headers.get("content-type") || "";
  const ext = ct.includes("svg") ? "svg" : "png";
  const outPath = path.join(OUT_DIR, `${char.id}.${ext}`);
  fs.writeFileSync(outPath, buf);
  console.log(`  Saved: ${outPath} (${buf.length} bytes, ${ext})`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const styleId = await createStyle();

  fs.writeFileSync(
    path.join(OUT_DIR, "character-style-info.json"),
    JSON.stringify({ styleId, references: REFERENCES, createdAt: new Date().toISOString() }, null, 2),
  );

  for (const char of CHARACTERS) {
    await generate(styleId, char);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n=== Done ===");
  console.log(`Output: ${OUT_DIR}`);
}

main().catch(console.error);
