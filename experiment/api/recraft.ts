/**
 * Recraft V3 — MCP 서버를 통해 생성
 *
 * 이 프로젝트에서 Recraft는 API 키 대신 Claude Code의 MCP 도구로 직접 호출한다.
 * 이 파일은 프롬프트 구성 로직 + 결과 기록용.
 *
 * MCP 호출 파라미터:
 *   - style: "vector_illustration"
 *   - substyle: "flat_2"
 *   - size: "1024x1024"
 *   - model: "recraftv3"
 */

import { IconPrompt, STYLE_PREFIX } from "../prompts";

export function buildRecraftPrompt(icon: IconPrompt): string {
  // Recraft는 스타일 파라미터를 별도로 받으므로 프롬프트는 내용만
  return `${icon.description}. Color palette: ${icon.colors}. Dark navy background (#1B2838). Soft glow effect. Clean and minimal.`;
}

export const RECRAFT_CONFIG = {
  style: "vector_illustration" as const,
  substyle: "flat_2" as const,
  size: "1024x1024" as const,
  model: "recraftv3" as const,
};
