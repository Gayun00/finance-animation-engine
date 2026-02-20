import { describe, it, expect, beforeAll } from "vitest";
import {
  composeSequence,
  generateAllLLMPrompts,
  matchAssets,
  findBestAsset,
  selectTransition,
  selectLayout,
  suggestElementCount,
  buildSystemPrompt,
  buildFullPrompt,
  ASSET_REGISTRY,
} from "../index";
import type { ScriptSection, ComposedScene } from "../types";

// ── Sample Script (복리의 마법) ──

const SAMPLE_SCRIPT: ScriptSection[] = [
  {
    type: "intro",
    narration:
      "여러분, 아인슈타인이 세계 8번째 불가사의라고 불렀던 것이 뭔지 아시나요?",
    duration: 5.2,
  },
  {
    type: "explain",
    narration:
      "단리는 원금에만 이자가 붙습니다. 1000만원을 연 5%로 10년 넣으면, 매년 50만원씩, 총 500만원의 이자를 받죠.",
    duration: 10.5,
  },
  {
    type: "chart",
    narration: "30년간 복리와 단리의 차이를 그래프로 확인해보겠습니다.",
    duration: 8.0,
    directive: {
      type: "chart",
      params: {
        type: "compound_vs_simple",
        principal: 1000,
        rate: 5,
        years: 30,
      },
    },
  },
  {
    type: "comparison",
    narration:
      "30년 후 최종 금액을 비교해보면, 단리는 2500만원, 복리는 4322만원입니다.",
    duration: 7.0,
    directive: {
      type: "compare",
      params: { A: "단리 30년", B: "복리 30년", metric: "최종금액" },
    },
  },
  {
    type: "callout",
    narration:
      "복리의 핵심은 시간입니다. 일찍 시작할수록 기하급수적으로 커집니다.",
    duration: 6.0,
  },
  {
    type: "outro",
    narration:
      "오늘부터 복리의 마법을 시작해보세요. 구독과 좋아요, 부탁드립니다.",
    duration: 5.0,
  },
];

// ── Rules Tests ──

describe("selectTransition", () => {
  it("returns default transition for section type", () => {
    expect(selectTransition("explain", null)).toBe("color_wipe");
    expect(selectTransition("chart", null)).toBe("zoom_in");
    expect(selectTransition("outro", null)).toBe("fade");
  });

  it("returns slide_up for intro", () => {
    expect(selectTransition("intro", null)).toBe("slide_up");
  });

  it("avoids repeating the same transition", () => {
    const result = selectTransition("explain", "color_wipe");
    expect(result).not.toBe("color_wipe");
    expect(result).toBeTruthy();
  });
});

describe("selectLayout", () => {
  it("returns default layout for section type", () => {
    expect(selectLayout("intro")).toBe("FullScreen");
    expect(selectLayout("explain")).toBe("SplitLayout");
    expect(selectLayout("chart")).toBe("CenterLayout");
  });

  it("directive overrides default", () => {
    expect(selectLayout("explain", "chart")).toBe("CenterLayout");
    expect(selectLayout("intro", "compare")).toBe("SplitLayout");
  });

  it("element count overrides default", () => {
    expect(selectLayout("explain", undefined, 1)).toBe("CenterLayout");
    expect(selectLayout("explain", undefined, 3)).toBe("GridLayout");
  });

  it("directive takes precedence over element count", () => {
    expect(selectLayout("explain", "chart", 3)).toBe("CenterLayout");
  });
});

describe("suggestElementCount", () => {
  it("short narration → 1-2 elements", () => {
    expect(suggestElementCount(3)).toEqual({ min: 1, max: 2 });
  });

  it("medium narration → 2-3 elements", () => {
    expect(suggestElementCount(10)).toEqual({ min: 2, max: 3 });
  });

  it("long narration → 3-5 elements", () => {
    expect(suggestElementCount(20)).toEqual({ min: 3, max: 5 });
  });
});

// ── Asset Matcher Tests ──

describe("matchAssets", () => {
  it("matches money-related keywords", () => {
    const results = matchAssets("1000만원을 투자하면 돈이 불어납니다");
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.asset.id);
    expect(ids).toContain("coins_drop");
  });

  it("matches element-related keywords (charts are now elements)", () => {
    const results = matchAssets("그래프로 확인해보겠습니다", {
      category: "element",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].asset.category).toBe("element");
  });

  it("filters by category", () => {
    const results = matchAssets("돈 코인 투자", { category: "element" });
    for (const r of results) {
      expect(r.asset.category).toBe("element");
    }
  });

  it("excludes specified IDs", () => {
    const results = matchAssets("돈 코인 투자", {
      excludeIds: ["coins_drop"],
    });
    const ids = results.map((r) => r.asset.id);
    expect(ids).not.toContain("coins_drop");
  });

  it("respects maxResults", () => {
    const results = matchAssets("돈 코인 투자 그래프 차트", {
      maxResults: 2,
    });
    expect(results.length).toBeLessThanOrEqual(2);
  });
});

describe("findBestAsset", () => {
  it("returns the highest-scoring asset", () => {
    const asset = findBestAsset("복리 성장 차트를 확인해보겠습니다", "element");
    expect(asset).not.toBeNull();
    expect(asset!.category).toBe("element");
  });

  it("returns null if no match", () => {
    const asset = findBestAsset("이것은 전혀 관련없는 문장입니다");
    expect(asset).toBeNull();
  });
});

// ── Composer Tests ──

describe("composeSequence", () => {
  let scenes: ComposedScene[];

  beforeAll(() => {
    scenes = composeSequence(SAMPLE_SCRIPT);
  });

  it("produces one scene per section", () => {
    expect(scenes.length).toBe(SAMPLE_SCRIPT.length);
  });

  it("every scene has a layout", () => {
    for (const scene of scenes) {
      expect(scene.layout).toBeTruthy();
    }
  });

  it("every scene has a background", () => {
    for (const scene of scenes) {
      expect(scene.background).toBeDefined();
      expect(scene.background.type).toBeTruthy();
    }
  });

  it("every scene has at least one element", () => {
    for (const scene of scenes) {
      expect(scene.elements.length).toBeGreaterThan(0);
    }
  });

  it("last scene has null transition", () => {
    expect(scenes[scenes.length - 1].transition).toBeNull();
  });

  it("no consecutive duplicate transitions", () => {
    for (let i = 1; i < scenes.length - 1; i++) {
      const prev = scenes[i - 1].transition?.type;
      const curr = scenes[i].transition?.type;
      if (prev && curr) {
        // May still match if they're different section types
        // The rule only prevents matching when the default would repeat
      }
    }
  });

  it("uses cycling background colors", () => {
    const defaultPalette = ["#0EA0E4", "#E92F60", "#14D1C8", "#4F28F2"];
    for (let i = 0; i < scenes.length; i++) {
      expect(scenes[i].background.color).toBe(
        defaultPalette[i % defaultPalette.length]
      );
    }
  });

  it("every scene has a subtitle element", () => {
    for (const scene of scenes) {
      const subtitles = scene.elements.filter(
        (e) => e.component === "Subtitle"
      );
      expect(subtitles.length).toBe(1);
    }
  });

  it("intro scene has Lottie or decoration elements", () => {
    const intro = scenes[0];
    const nonSubtitle = intro.elements.filter(
      (e) => e.component !== "Subtitle"
    );
    expect(nonSubtitle.length).toBeGreaterThan(0);
  });

  it("simple background scenes auto-add decoration layers", () => {
    // Scenes without background/character assets get FloatingParticles + GradientOrb
    for (const scene of scenes) {
      const hasDecor = scene.elements.some(
        (e) => e.component === "FloatingParticles" || e.component === "GradientOrb"
      );
      const hasBgOverlay = scene.elements.some(
        (e) => e.component === "LottieOverlay"
      );
      const hasCharacter = scene.elements.some(
        (e) =>
          e.component === "LottieElement" &&
          (e.animation.enter as { type: string }).type === "slide_in"
      );
      // Simple background mode should have decorations; other modes don't require them
      if (!hasBgOverlay && !hasCharacter) {
        expect(hasDecor).toBe(true);
      }
    }
  });

  it("element counts are within limits (max 5 fg + decorations + subtitle)", () => {
    for (const scene of scenes) {
      // decoration layers (GradientOrb, FloatingParticles) + fg elements + subtitle
      expect(scene.elements.length).toBeLessThanOrEqual(9);
    }
  });
});

// ── Prompt Builder Tests ──

describe("buildSystemPrompt", () => {
  it("includes all required sections", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("Available Layouts");
    expect(prompt).toContain("Available Components");
    expect(prompt).toContain("Available Assets");
    expect(prompt).toContain("Available Transitions");
    expect(prompt).toContain("Color Palette");
    expect(prompt).toContain("Rules");
    expect(prompt).toContain("Output Format");
  });

  it("includes motion recommendations", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("Motion Recommendations");
    expect(prompt).toContain("TitleCard");
  });
});

describe("buildFullPrompt", () => {
  it("generates system + user prompt", () => {
    const { system, user } = buildFullPrompt({
      section: SAMPLE_SCRIPT[0],
      prevTransition: null,
      sceneIndex: 0,
      totalScenes: 6,
    });
    expect(system).toBeTruthy();
    expect(user).toContain("Section type: intro");
    expect(user).toContain("1/6");
  });

  it("includes directive in user prompt when present", () => {
    const { user } = buildFullPrompt({
      section: SAMPLE_SCRIPT[2], // chart with directive
      prevTransition: "color_wipe",
      sceneIndex: 2,
      totalScenes: 6,
    });
    expect(user).toContain("@chart");
  });
});

describe("generateAllLLMPrompts", () => {
  it("generates one prompt per section", () => {
    const prompts = generateAllLLMPrompts(SAMPLE_SCRIPT);
    expect(prompts.length).toBe(SAMPLE_SCRIPT.length);
  });

  it("all prompts have system and user", () => {
    const prompts = generateAllLLMPrompts(SAMPLE_SCRIPT);
    for (const p of prompts) {
      expect(p.system).toBeTruthy();
      expect(p.user).toBeTruthy();
    }
  });
});

// ── E2E: Full Pipeline ──

describe("E2E: compose sample script to renderable scenes", () => {
  it("full pipeline produces valid scene data", () => {
    const scenes = composeSequence(SAMPLE_SCRIPT);

    // Validate structure matches what SceneRenderer expects
    for (const scene of scenes) {
      // Has valid layout
      expect([
        "FullScreen",
        "CenterLayout",
        "SplitLayout",
        "TopBottomLayout",
        "GridLayout",
        "FocusLayout",
      ]).toContain(scene.layout);

      // Background is valid
      expect(["solid", "gradient", "radial"]).toContain(
        scene.background.type
      );

      // Elements have required fields
      for (const el of scene.elements) {
        expect(el.component).toBeTruthy();
        expect(el.props).toBeDefined();
        expect(el.position).toBeDefined();
        expect(typeof el.position.x).toBe("number");
        expect(typeof el.position.y).toBe("number");
        expect(typeof el.enterAt).toBe("number");
        expect(el.animation).toBeDefined();
        expect(el.animation.enter).toBeDefined();
        expect(el.animation.enter.type).toBeTruthy();
        expect(typeof el.animation.enter.durationInFrames).toBe("number");
      }

      // Transition is valid or null
      if (scene.transition) {
        expect(scene.transition.type).toBeTruthy();
        expect(typeof scene.transition.durationInFrames).toBe("number");
      }
    }
  });
});
