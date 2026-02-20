/**
 * 장면 모드 3가지 데모 — composeSequence로 실행하고 결과 확인
 */
import { composeSequence } from "../composer";
import type { ScriptSection } from "../types";

const DEMO_SCRIPT: ScriptSection[] = [
  // 1. 강한 배경 모드 — bgAssetIds로 배경 에셋 지정
  {
    type: "intro",
    narration: "우주 경제의 시대가 열리고 있습니다. 궤도 위의 새로운 시장을 살펴보겠습니다.",
    duration: 6,
    overrides: { bgAssetIds: ["abstract_bg"] },
  },
  // 2. 캐릭터 모드 — narration에 캐릭터 매칭 키워드
  {
    type: "explain",
    narration: "두 사람이 대화하며 아이디어를 설명합니다. 투자의 핵심은 복리입니다.",
    duration: 9,
  },
  // 3. 단순 배경 모드 — element만 매칭되는 일반 장면
  {
    type: "chart",
    narration: "성장 차트를 보면 복리의 위력이 드러납니다. 그래프가 기하급수적으로 상승합니다.",
    duration: 8,
  },
  // 4. 단순 배경 + 이모지 키워드
  {
    type: "callout",
    narration: "이 사실에 충격받으셨나요? 대박이죠! 사랑할 수밖에 없는 투자법입니다.",
    duration: 5,
  },
  // 5. 캐릭터 모드 — 걷는 사람
  {
    type: "explain",
    narration: "한 남자가 걸어가며 돈의 흐름을 설명합니다. 송금과 이체의 원리를 알아봅시다.",
    duration: 8,
  },
  // 6. 강한 배경 모드 — 배경 키워드 매칭 (bgAssetIds 없이)
  {
    type: "outro",
    narration: "배경 라인이 흐르는 가운데, 오늘의 핵심을 정리하겠습니다. 반짝이는 별처럼 빛나는 투자를 하세요.",
    duration: 5,
  },
];

const scenes = composeSequence(DEMO_SCRIPT);

scenes.forEach((scene, i) => {
  const section = DEMO_SCRIPT[i];
  const components = scene.elements.map((e) => e.component);
  const hasLottieOverlay = components.includes("LottieOverlay");
  const hasFloating = components.includes("FloatingParticles");
  const hasGradientOrb = components.includes("GradientOrb");
  const hasCharSlideIn = scene.elements.some(
    (e) => e.component === "LottieElement" && e.animation.enter.type === "slide_in"
  );

  let mode = "simple_background";
  if (hasCharSlideIn) mode = "character";
  else if (hasLottieOverlay) mode = "strong_background";

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Scene ${i + 1} [${section.type}] → 모드: ${mode}`);
  console.log(`Narration: "${section.narration.slice(0, 40)}..."`);
  console.log(`Layout: ${scene.layout} | Transition: ${scene.transition?.type ?? "none"}`);
  console.log(`Elements (${scene.elements.length}):`);
  for (const el of scene.elements) {
    const src = (el.props as Record<string, unknown>).src as string | undefined;
    const name = src ? src.replace("animations/", "") : "";
    console.log(
      `  - ${el.component}${name ? ` [${name}]` : ""} | enterAt: ${el.enterAt} | enter: ${el.animation.enter.type}`
    );
  }
});
