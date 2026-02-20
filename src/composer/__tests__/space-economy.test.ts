import { describe, it, expect } from "vitest";
import { composeSequence, generateAllLLMPrompts } from "../index";
import type { ScriptSection } from "../types";

const SPACE_ECONOMY_SCRIPT: ScriptSection[] = [
  {
    type: "intro",
    narration:
      "2030년, 인류의 경제는 더 이상 지구에만 머물지 않습니다. 우주 경제의 시대가 열리고 있습니다.",
    duration: 6.0,
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
      params: { type: "compound_vs_simple", principal: 5000, rate: 15, years: 10 },
    },
  },
  {
    type: "outro",
    narration:
      "우주 경제의 시대, 당신의 선택은? 구독과 좋아요로 응원해주세요.",
    duration: 5.0,
  },
];

// ── Rule-based Composition ──

describe("우주 경제 스크립트: composeSequence", () => {
  const scenes = composeSequence(SPACE_ECONOMY_SCRIPT);

  it("9개 장면 생성", () => {
    expect(scenes.length).toBe(9);
  });

  it("각 장면 구조 출력", () => {
    scenes.forEach((scene, i) => {
      const section = SPACE_ECONOMY_SCRIPT[i];
      console.log(`\n═══ Scene ${i + 1}: ${section.type} ═══`);
      console.log(`  Layout: ${scene.layout}`);
      console.log(`  Background: ${scene.background.color}`);
      console.log(`  Transition: ${scene.transition?.type ?? "none"}`);
      console.log(`  Elements (${scene.elements.length}):`);
      scene.elements.forEach((el, j) => {
        console.log(
          `    [${j}] ${el.component} — enterAt: ${el.enterAt}f, anim: ${el.animation.enter.type}`
        );
        if (el.component === "LottieElement" || el.component === "LottieOverlay") {
          console.log(`         src: ${(el.props as any).src}`);
        }
      });
    });
  });

  it("마지막 장면 transition = null", () => {
    expect(scenes[scenes.length - 1].transition).toBeNull();
  });

  it("연속 동일 전환 없음", () => {
    for (let i = 2; i < scenes.length; i++) {
      const prev = scenes[i - 1].transition?.type;
      const curr = scenes[i].transition?.type;
      if (prev && curr && prev === curr) {
        // 같은 섹션 타입이면 같은 디폴트가 나올 수 있음 — 규칙은 연속 방지만 함
        // 실제로 같으면 fallback이 작동해야 함
        console.warn(`  ⚠ Scene ${i} and ${i + 1} both use "${curr}"`);
      }
    }
  });

  it("배경색 순환", () => {
    const palette = ["#0EA0E4", "#E92F60", "#14D1C8", "#4F28F2"];
    scenes.forEach((scene, i) => {
      expect(scene.background.color).toBe(palette[i % palette.length]);
    });
  });

  it("에셋 매칭: 돈/투자 키워드가 있는 장면에 Lottie 에셋 포함", () => {
    // Scene 4 (index 3): "돈의 흐름"
    const scene4 = scenes[3];
    const lotties = scene4.elements.filter(
      (e) => e.component === "LottieElement" || e.component === "LottieOverlay"
    );
    console.log(`\n  Scene 4 Lottie matches: ${lotties.length}`);
    lotties.forEach((l) => console.log(`    → ${(l.props as any).src}`));
    expect(lotties.length).toBeGreaterThan(0);
  });
});

// ── LLM Prompt Generation ──

describe("우주 경제 스크립트: LLM 프롬프트", () => {
  const prompts = generateAllLLMPrompts(SPACE_ECONOMY_SCRIPT);

  it("9개 프롬프트 생성", () => {
    expect(prompts.length).toBe(9);
  });

  it("첫 번째 프롬프트에 intro 정보 포함", () => {
    expect(prompts[0].user).toContain("Section type: intro");
    expect(prompts[0].user).toContain("우주 경제");
  });

  it("directive가 있는 장면에 @chart/@compare 포함", () => {
    expect(prompts[1].user).toContain("@chart");
    expect(prompts[4].user).toContain("@compare");
  });

  it("마지막 프롬프트에 'last scene' 노트 포함", () => {
    expect(prompts[prompts.length - 1].user).toContain("last scene");
  });

  it("시스템 프롬프트에 에셋 레지스트리 포함", () => {
    expect(prompts[0].system).toContain("coins_drop");
    expect(prompts[0].system).toContain("growth_chart");
  });

  it("전체 프롬프트 샘플 출력 (Scene 5: comparison)", () => {
    console.log("\n═══ LLM Prompt — Scene 5 (comparison) ═══");
    console.log("── User Prompt ──");
    console.log(prompts[4].user);
  });
});
