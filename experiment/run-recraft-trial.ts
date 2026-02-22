import fs from "fs";
import path from "path";

const API_KEY = process.env.RECRAFT_API_KEY || "";
const BASE_URL = "https://external.api.recraft.ai/v1";
const REF_DIR = "/tmp/recraft-refs";
const OUT_DIR = path.resolve(__dirname, "outputs/trial");

// 5 reference images selected for financial icon style
const REFERENCE_FILES = [
  "스크린샷 2026-02-22 오후 3.58.27.png", // buildings + chart
  "스크린샷 2026-02-22 오후 3.58.30.png", // money stacks
  "스크린샷 2026-02-22 오후 3.59.00.png", // bank + coin
  "스크린샷 2026-02-22 오후 3.57.44.png", // money stack isometric
  "스크린샷 2026-02-22 오후 3.58.35.png", // area chart
];

// 5 trial icons
const TRIAL_ICONS = [
  { id: "01_gold_coin", prompt: "A golden coin with dollar sign, floating with soft shadow beneath, financial icon" },
  { id: "02_chart", prompt: "A rising line chart with green upward trend, financial growth graph icon" },
  { id: "03_piggy_bank", prompt: "A cute piggy bank with a coin being inserted, savings icon" },
  { id: "04_arrow", prompt: "An upward arrow with sparkle effect, growth and increase icon" },
  { id: "05_lightbulb", prompt: "A glowing lightbulb with dollar sign inside, financial idea icon" },
];

async function createStyle(): Promise<string> {
  console.log("=== Creating custom style from 5 references ===");

  const formData = new FormData();
  formData.append("style", "digital_illustration");

  for (const filename of REFERENCE_FILES) {
    const filePath = path.join(REF_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`Reference not found: ${filename}`);
      process.exit(1);
    }
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer], { type: "image/png" });
    formData.append("files", blob, filename);
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

async function generateIcon(styleId: string, icon: { id: string; prompt: string }): Promise<void> {
  console.log(`Generating: ${icon.id}...`);

  const body = {
    prompt: icon.prompt,
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
    console.error(`generate failed for ${icon.id}: ${res.status} ${text}`);
    return;
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error(`No URL returned for ${icon.id}`);
    return;
  }

  // Download image
  const imgRes = await fetch(imageUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

  // Detect format from content-type
  const contentType = imgRes.headers.get("content-type") || "";
  const ext = contentType.includes("svg") ? "svg" : "png";
  const outPath = path.join(OUT_DIR, `${icon.id}.${ext}`);
  fs.writeFileSync(outPath, imgBuffer);
  console.log(`  Saved: ${outPath} (${imgBuffer.length} bytes)`);
}

async function main() {
  // Clean old trial files
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (f.startsWith("0") && (f.endsWith(".svg") || f.endsWith(".png"))) {
        fs.unlinkSync(path.join(OUT_DIR, f));
      }
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Step 1: Create style
  const styleId = await createStyle();
  console.log(`\nStyle ID: ${styleId}\n`);

  // Save style_id for later use
  fs.writeFileSync(
    path.join(OUT_DIR, "style-info.json"),
    JSON.stringify({ styleId, references: REFERENCE_FILES, createdAt: new Date().toISOString() }, null, 2)
  );

  // Step 2: Generate 5 trial icons
  for (const icon of TRIAL_ICONS) {
    await generateIcon(styleId, icon);
    // Rate limit spacing
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n=== Trial generation complete ===");
  console.log(`Output: ${OUT_DIR}`);
  console.log(`Style ID: ${styleId}`);
}

main().catch(console.error);
