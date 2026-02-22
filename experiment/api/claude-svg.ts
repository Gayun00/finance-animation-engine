/**
 * Claude SVG — Anthropic SDK로 SVG 코드 생성
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";
import { IconPrompt, STYLE_PREFIX } from "../prompts";

const client = new Anthropic();

export async function generateClaudeSvg(
  icon: IconPrompt,
  outputPath: string
): Promise<{ success: boolean; path: string; error?: string }> {
  const prompt = `Generate an SVG icon with these specifications:

${STYLE_PREFIX}

Icon: ${icon.description}.
Color palette: ${icon.colors}.

Requirements:
- SVG viewBox="0 0 512 512"
- Use fill only (no stroke/outlines)
- Background: dark navy rectangle (#1B2838)
- Add subtle glow using feGaussianBlur filter
- Clean geometric shapes
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
      return { success: false, path: outputPath, error: "No SVG found in response" };
    }

    writeFileSync(outputPath, svgMatch[0], "utf-8");
    return { success: true, path: outputPath };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, path: outputPath, error: msg };
  }
}
