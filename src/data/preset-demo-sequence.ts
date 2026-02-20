import type { SceneSequence } from "../types";

/**
 * 프리셋 데모 — 3가지 장면 프리셋을 순서대로 보여줌
 *
 * 1. walk: 캐릭터가 걷고, 에셋들이 오른쪽 밖→가운데→왼쪽 밖으로 지나감
 * 2. hero: 하나의 큰 에셋이 정중앙에 떠 있음
 * 3. cluster: 큰 에셋이 우하단, 작은 에셋들이 좌상단에 순차 표시
 */
export const presetDemoSequence: SceneSequence = {
  id: "preset-demo",
  title: "프리셋 데모",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    // ══════════════════════════════════════════
    // 프리셋 1: walk
    // 캐릭터 좌측 고정, 에셋은 화면 밖 오른쪽→가운데→왼쪽 밖
    // ══════════════════════════════════════════
    {
      id: "preset-walk",
      title: "Walk 프리셋",
      durationInFrames: 270, // 9s
      background: {
        type: "gradient",
        colors: ["#1B2838", "#0F1923"],
        angle: 180,
      },
      elements: [
        // 배경: 도시 야경
        {
          id: "walk-bg",
          component: "LottieOverlay",
          props: {
            src: "animations/background/Cityscape at night.json",
            loop: true,
            opacity: 0.3,
            blendMode: "screen",
            cover: true,
          },
        },
        // 걷는 캐릭터 — 좌측 고정
        {
          id: "walk-character",
          component: "LottieElement",
          props: {
            src: "animations/character/Bearded Man Walking.json",
            loop: true,
            speed: 1,
            style: { width: 400, height: 400 },
          },
          containerStyle: {
            position: "absolute",
            bottom: "15%",
            left: "8%",
          },
          animation: { preset: "slide_right", duration: 18, easing: "kurzgesagt" },
        },
        // 에셋 1: 코인 — 오른쪽 밖→가운데→왼쪽 밖
        {
          id: "walk-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Coins drop.json",
            loop: false,
            speed: 5,
            style: { width: 350, height: 350 },
          },
          containerStyle: {
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          startFrame: 0,
          durationInFrames: 90,
          animation: {
            preset: "slide_left_far",
            duration: 20,
            easing: "kurzgesagt",
            exitPreset: "exit_left_far",
            exitDuration: 20,
          },
        },
        // 에셋 2: 성장 차트
        {
          id: "walk-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Growth Chart.json",
            loop: false,
            speed: 1.33,
            style: { width: 400, height: 400 },
          },
          containerStyle: {
            position: "absolute",
            top: "13%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          startFrame: 90,
          durationInFrames: 90,
          animation: {
            preset: "slide_left_far",
            duration: 20,
            easing: "kurzgesagt",
            exitPreset: "exit_left_far",
            exitDuration: 20,
          },
        },
        // 에셋 3: 전구
        {
          id: "walk-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/lightbulb.json",
            loop: false,
            speed: 3.08,
            style: { width: 300, height: 300 },
          },
          containerStyle: {
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          startFrame: 180,
          durationInFrames: 90,
          animation: {
            preset: "slide_left_far",
            duration: 20,
            easing: "kurzgesagt",
            exitPreset: "exit_left_far",
            exitDuration: 20,
          },
        },
        // 자막
        {
          id: "walk-subtitle",
          component: "Subtitle",
          props: {
            text: "투자의 세계를 걸어보겠습니다. 코인, 성장, 그리고 인사이트.",
          },
          startFrame: 10,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ══════════════════════════════════════════
    // 프리셋 2: hero — 하나의 큰 에셋이 정중앙
    // ══════════════════════════════════════════
    {
      id: "preset-hero",
      title: "Hero 프리셋",
      durationInFrames: 180, // 6s
      background: {
        type: "radial",
        colors: ["#1E3A5F", "#0F1923"],
      },
      transition: {
        type: "color_wipe",
        duration: 18,
        color: "#4FC3F7",
      },
      elements: [
        // 배경 파티클
        {
          id: "hero-particles",
          component: "FloatingParticles",
          props: {
            count: 15,
            color: "rgba(255,255,255,0.4)",
            size: 5,
            speed: 0.6,
            shape: "dot",
            opacity: 0.15,
          },
          containerStyle: {
            position: "absolute",
            inset: 0,
          },
          animation: { preset: "fade_in", duration: 20 },
        },
        // 지구본 — 정중앙
        {
          id: "hero-earth",
          component: "LottieElement",
          props: {
            src: "animations/element/Earth.json",
            loop: true,
            speed: 0.5,
            style: { width: 700, height: 700 },
          },
          containerStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          },
          animation: { preset: "scale_in", duration: 24, easing: "kurzgesagt" },
        },
        // 자막
        {
          id: "hero-subtitle",
          component: "Subtitle",
          props: {
            text: "전 세계가 주목하는 글로벌 투자 시장",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
      cameraMotion: { type: "ken_burns", endScale: 1.08, panX: -15, panY: 5 },
    },

    // ══════════════════════════════════════════
    // 프리셋 3: cluster
    // 큰 에셋(지구본) 우하단, 작은 에셋들 좌상단 순차 표시
    // ══════════════════════════════════════════
    {
      id: "preset-cluster",
      title: "Cluster 프리셋",
      durationInFrames: 270, // 9s
      background: {
        type: "solid",
        color: "#0F1923",
      },
      transition: {
        type: "zoom_in",
        duration: 15,
      },
      elements: [
        // 배경 Lottie 오버레이
        {
          id: "cluster-bg",
          component: "LottieOverlay",
          props: {
            src: "animations/background/Abstract Background.json",
            loop: true,
            opacity: 0.2,
            blendMode: "screen",
            cover: true,
          },
        },
        // 큰 에셋: 지구본 — 우하단
        {
          id: "cluster-hero",
          component: "LottieElement",
          props: {
            src: "animations/element/Earth.json",
            loop: true,
            speed: 0.4,
            style: { width: 600, height: 600 },
          },
          containerStyle: {
            position: "absolute",
            bottom: "8%",
            right: "5%",
          },
          animation: { preset: "scale_in", duration: 22, easing: "kurzgesagt" },
        },
        // 작은 에셋 1: Tesla — 좌상단
        {
          id: "cluster-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Tesla Company.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "10%",
            left: "8%",
          },
          startFrame: 12,
          durationInFrames: 90,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // 작은 에셋 2: Company Business
        {
          id: "cluster-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Company Business.json",
            loop: true,
            speed: 0.8,
            style: { width: 240, height: 240 },
          },
          containerStyle: {
            position: "absolute",
            top: "10%",
            left: "8%",
          },
          startFrame: 102,
          durationInFrames: 90,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // 작은 에셋 3: Analysis
        {
          id: "cluster-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/Analysis.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "10%",
            left: "8%",
          },
          startFrame: 192,
          durationInFrames: 78,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // 자막
        {
          id: "cluster-subtitle",
          component: "Subtitle",
          props: {
            text: "글로벌 기업 분석 — 테슬라, 비즈니스 모델, 수익률",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },
  ],
};
