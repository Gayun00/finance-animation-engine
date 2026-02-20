/**
 * "우주 경제의 시대" — auto-composed via Scene Composer pipeline.
 *
 * Set COMPOSE_MODE=llm and ANTHROPIC_API_KEY to use LLM-based composition.
 * Default: rule-based composition.
 */

import type { SceneSequence } from "../types";
import type { ScriptSection, ComposedScene } from "../composer/types";
import { composeSequence } from "../composer/composer";
import { toSceneSequence } from "../composer/to-scene-sequence";

const SCRIPT: ScriptSection[] = [
  {
    type: "intro",
    narration:
      "2030년, 인류의 경제는 더 이상 지구에만 머물지 않습니다. 우주 경제의 시대가 열리고 있습니다.",
    duration: 6.0,
    overrides: {
      transition: "slide_up",
      excludeAssetIds: ["orbit_planet", "abstract_bg", "bg_lines"],
      elementEnter: { 1: "circle_reveal" }, // 로켓: 원형 확장 등장
    },
  },
  {
    type: "explain",
    narration:
      "테슬라, 스트라이프, 그리고 수많은 AI 기업들이 우주 산업에 뛰어들고 있습니다. 이 기업들의 매출 성장률은 놀라울 정도입니다.",
    duration: 9.0,
    directive: {
      type: "chart",
      params: { type: "growth", metric: "revenue", years: 10 },
    },
    overrides: {
      transition: "slide_up",
    },
  },
  {
    type: "chart",
    narration:
      "우주 산업의 시장 규모는 매년 15%씩 성장하고 있으며, 2030년에는 1조 달러를 돌파할 것으로 예상됩니다.",
    duration: 8.0,
    directive: {
      type: "chart",
      params: { type: "line", rate: 15, years: 10 },
    },
    overrides: {
      bgAssetIds: ["orbit_planet"], // 행성을 배경으로
    },
  },
  {
    type: "explain",
    narration:
      "로켓 발사 비용이 급격히 낮아지면서 우주 화물 운송이 현실화되고 있습니다. 돈의 흐름이 지구에서 우주로 이동하고 있죠.",
    duration: 8.5,
  },
  {
    type: "comparison",
    narration:
      "지구 기반 투자와 우주 기반 투자, 10년 후 수익률을 비교해보겠습니다.",
    duration: 7.0,
    directive: {
      type: "compare",
      params: {
        A: "지구 투자",
        B: "우주 투자",
        metric: "10년 수익률",
        valueA: "120%",
        valueB: "340%",
      },
    },
  },
  {
    type: "callout",
    narration:
      "핵심은 타이밍입니다. 우주 경제는 지금이 초기 진입의 골든타임입니다.",
    duration: 5.5,
    overrides: {
      bgAssetIds: ["gold_sparkle"], // 전구 뒤에 반짝이 배경
    },
  },
  {
    type: "explain",
    narration:
      "두 명의 투자자가 대화를 나눕니다. 한 명은 전통 시장을, 다른 한 명은 우주 산업을 선택했습니다. 10년 후, 그들의 자산 차이를 분석해보겠습니다.",
    duration: 10.0,
  },
  {
    type: "chart",
    narration:
      "코인과 우주 산업 투자금의 흐름을 비교한 그래프입니다. 우주 산업이 안정적인 우상향을 보이고 있습니다.",
    duration: 8.0,
    directive: {
      type: "chart",
      params: {
        type: "compound_vs_simple",
        principal: 5000,
        rate: 15,
        years: 10,
      },
    },
  },
  {
    type: "outro",
    narration:
      "우주 경제의 시대, 당신의 선택은? 구독과 좋아요로 응원해주세요.",
    duration: 5.0,
  },
];

const SCENE_TITLES = [
  "우주 경제의 시대",
  "기업들의 진출",
  "시장 규모 성장",
  "비용 절감과 흐름",
  "투자 수익률 비교",
  "골든타임",
  "두 투자자의 선택",
  "투자금 흐름 비교",
  "엔딩",
];

const SEQUENCE_OPTIONS = {
  id: "space-economy",
  title: "우주 경제의 시대",
};

function buildSequence(composed: ComposedScene[]): SceneSequence {
  return toSceneSequence(
    composed,
    SCRIPT.map((s) => s.duration),
    SCENE_TITLES,
    SEQUENCE_OPTIONS,
  );
}

// Default: rule-based composition (sync)
const composed = composeSequence(SCRIPT);
export const spaceEconomySequence: SceneSequence = buildSequence(composed);

// LLM mode: async composition via COMPOSE_MODE=llm
export async function getSpaceEconomySequenceLLM(): Promise<SceneSequence> {
  const llmComposed = await composeSequence(SCRIPT, { mode: "llm" });
  return buildSequence(llmComposed);
}
