import type { SceneSequence } from "../types";

/**
 * 프리셋 데모 — 쿠르츠게작트 스타일 8종 장면 프리셋
 *
 * A. world    — 세계관 씬 (도시 야경 + 떠다니는 요소)
 * B. hero     — 센터 포커스 + 글로우
 * C. data     — 데이터 비주얼
 * D. grid     — 그리드 나열
 * E. walk     — 횡스크롤 파노라마
 * F. timeline — 타임라인
 * G. split    — 삼분할 비교
 * H. accumulate — 축적/증가
 */
export const presetDemoSequence: SceneSequence = {
  id: "preset-demo",
  title: "프리셋 데모",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    // ══════════════════════════════════════════
    // A: world — 세계관 씬
    // 도시 야경 배경 + 전경 에셋 + 파티클
    // ══════════════════════════════════════════
    {
      id: "preset-world",
      title: "World 프리셋",
      durationInFrames: 240, // 8s
      background: {
        type: "radial",
        colors: ["#141445", "#0B0B2B"],
      },
      elements: [
        // Layer 1: 도시 야경 배경
        {
          id: "world-bg",
          component: "LottieOverlay",
          props: {
            src: "animations/background/Cityscape at night.json",
            loop: true,
            opacity: 0.35,
            blendMode: "screen",
            cover: true,
          },
        },
        // Layer 1b: 파티클 (별/구름 느낌) — 배경 레이어, 느리게
        {
          id: "world-particles",
          component: "FloatingParticles",
          props: {
            count: 20,
            color: "rgba(255,255,255,0.5)",
            size: 4,
            speed: 0.4,
            shape: "dot",
            opacity: 0.15,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
          parallax: { speed: 0.3, direction: "horizontal" },
        },
        // Layer 2: 코인 — 중간 레이어
        {
          id: "world-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Coins drop.json",
            loop: false,
            speed: 4,
            style: { width: 280, height: 280 },
          },
          containerStyle: {
            position: "absolute",
            top: "12%",
            right: "18%",
          },
          startFrame: 15,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
          parallax: { speed: 1.0, direction: "horizontal" },
        },
        // Layer 2: 성장 차트 — 중간 레이어
        {
          id: "world-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Growth Chart.json",
            loop: false,
            speed: 1.2,
            style: { width: 320, height: 320 },
          },
          containerStyle: {
            position: "absolute",
            top: "8%",
            left: "15%",
          },
          startFrame: 30,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
          parallax: { speed: 1.0, direction: "horizontal" },
        },
        // Layer 3: 로켓 — 전경 레이어, 빠르게
        {
          id: "world-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/Rocket in space with the UFO.json",
            loop: true,
            speed: 0.8,
            style: { width: 250, height: 250 },
          },
          containerStyle: {
            position: "absolute",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          startFrame: 45,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
          parallax: { speed: 1.5, direction: "horizontal" },
        },
        // 자막
        {
          id: "world-subtitle",
          component: "Subtitle",
          props: {
            text: "투자의 세계에 오신 것을 환영합니다",
          },
          startFrame: 10,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
      cameraMotion: { type: "ken_burns", endScale: 1.05, panX: 10, panY: -5 },
    },

    // ══════════════════════════════════════════
    // B: hero — 센터 포커스 + 글로우
    // 중앙 지구본 + GradientOrb 발광 + 파티클
    // ══════════════════════════════════════════
    {
      id: "preset-hero",
      title: "Hero 프리셋",
      durationInFrames: 210, // 7s
      background: {
        type: "radial",
        colors: ["#2A1050", "#1B0B3B"],
      },
      transition: {
        type: "color_wipe",
        duration: 18,
        color: "#4FC3F7",
      },
      elements: [
        // Layer 1: GradientOrb 좌측 글로우
        {
          id: "hero-orb-1",
          component: "GradientOrb",
          props: {
            color: "#7B4FFF",
            size: 500,
            x: 30,
            y: 50,
            opacity: 0.2,
            blur: 80,
            pulseSpeed: 0.8,
          },
          animation: { preset: "fade_in", duration: 25 },
        },
        // Layer 1: GradientOrb 우측 글로우
        {
          id: "hero-orb-2",
          component: "GradientOrb",
          props: {
            color: "#4FC3F7",
            size: 400,
            x: 70,
            y: 45,
            opacity: 0.18,
            blur: 70,
            pulseSpeed: 1.2,
          },
          animation: { preset: "fade_in", duration: 25 },
        },
        // Layer 1: 파티클 (별)
        {
          id: "hero-particles",
          component: "FloatingParticles",
          props: {
            count: 18,
            color: "rgba(255,255,255,0.5)",
            size: 4,
            speed: 0.5,
            shape: "star",
            opacity: 0.12,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // Layer 2: 지구본 — 정중앙
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
    // C: data — 데이터 비주얼
    // 중앙 차트 + SceneLabel + 파티클
    // ══════════════════════════════════════════
    {
      id: "preset-data",
      title: "Data 프리셋",
      durationInFrames: 210, // 7s
      background: {
        type: "solid",
        color: "#0B0B2B",
      },
      transition: {
        type: "fade",
        duration: 15,
      },
      elements: [
        // Layer 1: 미세 파티클
        {
          id: "data-particles",
          component: "FloatingParticles",
          props: {
            count: 10,
            color: "rgba(79,195,247,0.4)",
            size: 3,
            speed: 0.3,
            shape: "dot",
            opacity: 0.1,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // Layer 2: Growth Chart 크게
        {
          id: "data-chart",
          component: "LottieElement",
          props: {
            src: "animations/element/Growth Chart.json",
            loop: false,
            speed: 0.8,
            style: { width: 800, height: 600 },
          },
          containerStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          },
          animation: { preset: "scale_in", duration: 20, easing: "kurzgesagt" },
        },
        // Layer 2: 성장 화살표 우측 상단
        {
          id: "data-arrow",
          component: "LottieElement",
          props: {
            src: "animations/element/growth-arrow.json",
            loop: true,
            speed: 1,
            style: { width: 180, height: 180 },
          },
          containerStyle: {
            position: "absolute",
            top: "15%",
            right: "12%",
          },
          startFrame: 25,
          animation: { preset: "slide_up", duration: 15, easing: "kurzgesagt" },
        },
        // Layer 3: SceneLabel 좌상단
        {
          id: "data-label",
          component: "SceneLabel",
          props: {
            text: "성장률 비교",
            color: "#4FC3F7",
            position: "top-left",
          },
          startFrame: 10,
          animation: { preset: "fade_in", duration: 12 },
        },
        // 자막
        {
          id: "data-subtitle",
          component: "Subtitle",
          props: {
            text: "복리 효과로 자산은 기하급수적으로 성장합니다",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ══════════════════════════════════════════
    // D: grid — 그리드 나열
    // 밝은 배경 + 3x2 그리드 에셋 + stagger 등장
    // ══════════════════════════════════════════
    {
      id: "preset-grid",
      title: "Grid 프리셋",
      durationInFrames: 270, // 9s
      background: {
        type: "solid",
        color: "#F5A623",
      },
      transition: {
        type: "color_wipe",
        duration: 18,
        color: "#F5A623",
      },
      elements: [
        // Layer 1: 미세 파티클
        {
          id: "grid-particles",
          component: "FloatingParticles",
          props: {
            count: 8,
            color: "rgba(0,0,0,0.15)",
            size: 6,
            speed: 0.3,
            shape: "ring",
            opacity: 0.08,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // Layer 3: SceneLabel
        {
          id: "grid-label",
          component: "SceneLabel",
          props: {
            text: "기업 분석",
            color: "#1B0B3B",
            position: "top-left",
          },
          startFrame: 5,
          animation: { preset: "fade_in", duration: 12 },
        },
        // Row 1, Col 1: Tesla
        {
          id: "grid-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Tesla Company.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "18%",
            left: "12%",
          },
          startFrame: 15,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Row 1, Col 2: Company Business
        {
          id: "grid-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Company Business.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "18%",
            left: "40%",
          },
          startFrame: 25,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Row 1, Col 3: Analysis
        {
          id: "grid-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/Analysis.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "18%",
            left: "68%",
          },
          startFrame: 35,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Row 2, Col 1: Stripe
        {
          id: "grid-el-4",
          component: "LottieElement",
          props: {
            src: "animations/element/Stripe.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "52%",
            left: "12%",
          },
          startFrame: 45,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Row 2, Col 2: Gemini
        {
          id: "grid-el-5",
          component: "LottieElement",
          props: {
            src: "animations/element/Gemini Logo.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "52%",
            left: "40%",
          },
          startFrame: 55,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Row 2, Col 3: Adidas Shoes
        {
          id: "grid-el-6",
          component: "LottieElement",
          props: {
            src: "animations/element/Adidas Shoes.json",
            loop: true,
            speed: 0.8,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "52%",
            left: "68%",
          },
          startFrame: 65,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // 자막
        {
          id: "grid-subtitle",
          component: "Subtitle",
          props: {
            text: "글로벌 기업 포트폴리오 — 테슬라, 스트라이프, 제미니 외",
          },
          startFrame: 20,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ══════════════════════════════════════════
    // E: walk — 횡스크롤 파노라마 (기존 강화)
    // 도시 야경 + 캐릭터 좌측 고정 + 에셋 통과
    // ══════════════════════════════════════════
    {
      id: "preset-walk",
      title: "Walk 프리셋",
      durationInFrames: 270, // 9s
      background: {
        type: "gradient",
        colors: ["#1B2838", "#0B0B2B"],
        angle: 180,
      },
      transition: {
        type: "wipe_left",
        duration: 15,
      },
      elements: [
        // Layer 1: 도시 야경
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
        // Layer 1: 파티클
        {
          id: "walk-particles",
          component: "FloatingParticles",
          props: {
            count: 12,
            color: "rgba(255,255,255,0.4)",
            size: 3,
            speed: 0.5,
            shape: "dot",
            opacity: 0.1,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
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
        // 에셋 1: 코인
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
    // F: timeline — 타임라인
    // 수평선 + 포인트마다 에셋 순차 등장
    // ══════════════════════════════════════════
    {
      id: "preset-timeline",
      title: "Timeline 프리셋",
      durationInFrames: 300, // 10s
      background: {
        type: "solid",
        color: "#0B0B2B",
      },
      transition: {
        type: "fade",
        duration: 15,
      },
      elements: [
        // Layer 1: 파티클
        {
          id: "timeline-particles",
          component: "FloatingParticles",
          props: {
            count: 10,
            color: "rgba(255,255,255,0.3)",
            size: 3,
            speed: 0.3,
            shape: "dot",
            opacity: 0.08,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // Layer 3: SceneLabel
        {
          id: "timeline-label",
          component: "SceneLabel",
          props: {
            text: "투자 타임라인",
            color: "#4FC3F7",
            position: "top-left",
          },
          startFrame: 5,
          animation: { preset: "fade_in", duration: 12 },
        },
        // 포인트 1: 코인 (2020)
        {
          id: "timeline-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Coins drop.json",
            loop: false,
            speed: 4,
            style: { width: 200, height: 200 },
          },
          containerStyle: {
            position: "absolute",
            top: "22%",
            left: "15%",
          },
          startFrame: 20,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 라벨 1
        {
          id: "timeline-year-1",
          component: "SceneLabel",
          props: {
            text: "2020",
            color: "rgba(255,255,255,0.15)",
            position: "top-left",
            fontSize: 22,
          },
          containerStyle: {
            position: "absolute",
            top: "58%",
            left: "13%",
          },
          startFrame: 25,
          animation: { preset: "fade_in", duration: 10 },
        },
        // 포인트 2: 성장 차트 (2022)
        {
          id: "timeline-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Growth Chart.json",
            loop: false,
            speed: 1,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "20%",
            left: "42%",
          },
          startFrame: 70,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 라벨 2
        {
          id: "timeline-year-2",
          component: "SceneLabel",
          props: {
            text: "2022",
            color: "rgba(255,255,255,0.15)",
            position: "top-left",
            fontSize: 22,
          },
          containerStyle: {
            position: "absolute",
            top: "58%",
            left: "40%",
          },
          startFrame: 75,
          animation: { preset: "fade_in", duration: 10 },
        },
        // 포인트 3: Money (2024)
        {
          id: "timeline-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/Money.json",
            loop: true,
            speed: 1,
            style: { width: 220, height: 220 },
          },
          containerStyle: {
            position: "absolute",
            top: "20%",
            left: "70%",
          },
          startFrame: 120,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 라벨 3
        {
          id: "timeline-year-3",
          component: "SceneLabel",
          props: {
            text: "2024",
            color: "rgba(255,255,255,0.15)",
            position: "top-left",
            fontSize: 22,
          },
          containerStyle: {
            position: "absolute",
            top: "58%",
            left: "68%",
          },
          startFrame: 125,
          animation: { preset: "fade_in", duration: 10 },
        },
        // 자막
        {
          id: "timeline-subtitle",
          component: "Subtitle",
          props: {
            text: "시간이 지날수록 투자의 가치는 커집니다",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ══════════════════════════════════════════
    // G: split — 삼분할 비교
    // 3개 패널 가로 나란히 + stagger 등장
    // ══════════════════════════════════════════
    {
      id: "preset-split",
      title: "Split 프리셋",
      durationInFrames: 240, // 8s
      background: {
        type: "solid",
        color: "#0B0B2B",
      },
      transition: {
        type: "wipe_right",
        duration: 15,
      },
      elements: [
        // Layer 1: 파티클
        {
          id: "split-particles",
          component: "FloatingParticles",
          props: {
            count: 8,
            color: "rgba(255,255,255,0.3)",
            size: 3,
            speed: 0.3,
            shape: "dot",
            opacity: 0.08,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // 패널 1 배경 (좌)
        {
          id: "split-bg-1",
          component: "GradientOrb",
          props: {
            color: "#7B4FFF",
            size: 600,
            x: 16,
            y: 50,
            opacity: 0.08,
            blur: 100,
          },
          animation: { preset: "fade_in", duration: 20 },
        },
        // 패널 2 배경 (중)
        {
          id: "split-bg-2",
          component: "GradientOrb",
          props: {
            color: "#4FC3F7",
            size: 600,
            x: 50,
            y: 50,
            opacity: 0.08,
            blur: 100,
          },
          animation: { preset: "fade_in", duration: 20 },
        },
        // 패널 3 배경 (우)
        {
          id: "split-bg-3",
          component: "GradientOrb",
          props: {
            color: "#00D2A0",
            size: 600,
            x: 84,
            y: 50,
            opacity: 0.08,
            blur: 100,
          },
          animation: { preset: "fade_in", duration: 20 },
        },
        // 패널 1: 코인
        {
          id: "split-el-1",
          component: "LottieElement",
          props: {
            src: "animations/element/Fake 3D vector coin.json",
            loop: true,
            speed: 1,
            style: { width: 280, height: 280 },
          },
          containerStyle: {
            position: "absolute",
            top: "22%",
            left: "5%",
            width: "30%",
            display: "flex",
            justifyContent: "center",
          },
          startFrame: 15,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 패널 1 라벨
        {
          id: "split-label-1",
          component: "SceneLabel",
          props: {
            text: "코인",
            color: "#7B4FFF",
            fontSize: 24,
          },
          containerStyle: {
            position: "absolute",
            top: "62%",
            left: "12%",
          },
          startFrame: 25,
          animation: { preset: "fade_in", duration: 12 },
        },
        // 패널 2: 성장 차트
        {
          id: "split-el-2",
          component: "LottieElement",
          props: {
            src: "animations/element/Growth Chart.json",
            loop: false,
            speed: 0.8,
            style: { width: 280, height: 280 },
          },
          containerStyle: {
            position: "absolute",
            top: "22%",
            left: "35%",
            width: "30%",
            display: "flex",
            justifyContent: "center",
          },
          startFrame: 35,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 패널 2 라벨
        {
          id: "split-label-2",
          component: "SceneLabel",
          props: {
            text: "성장",
            color: "#4FC3F7",
            fontSize: 24,
          },
          containerStyle: {
            position: "absolute",
            top: "62%",
            left: "45%",
          },
          startFrame: 45,
          animation: { preset: "fade_in", duration: 12 },
        },
        // 패널 3: Money
        {
          id: "split-el-3",
          component: "LottieElement",
          props: {
            src: "animations/element/Money.json",
            loop: true,
            speed: 1,
            style: { width: 280, height: 280 },
          },
          containerStyle: {
            position: "absolute",
            top: "22%",
            left: "65%",
            width: "30%",
            display: "flex",
            justifyContent: "center",
          },
          startFrame: 55,
          animation: { preset: "scale_in", duration: 18, easing: "kurzgesagt" },
        },
        // 패널 3 라벨
        {
          id: "split-label-3",
          component: "SceneLabel",
          props: {
            text: "수익",
            color: "#00D2A0",
            fontSize: 24,
          },
          containerStyle: {
            position: "absolute",
            top: "62%",
            left: "78%",
          },
          startFrame: 65,
          animation: { preset: "fade_in", duration: 12 },
        },
        // 자막
        {
          id: "split-subtitle",
          component: "Subtitle",
          props: {
            text: "투자의 3요소 — 자본, 성장, 수익",
          },
          startFrame: 20,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ══════════════════════════════════════════
    // H: accumulate — 축적/증가
    // 1개에서 시작 → 점점 많아짐 + GradientOrb 글로우
    // ══════════════════════════════════════════
    {
      id: "preset-accumulate",
      title: "Accumulate 프리셋",
      durationInFrames: 300, // 10s
      background: {
        type: "radial",
        colors: ["#2A1050", "#1B0B3B"],
      },
      transition: {
        type: "zoom_in",
        duration: 15,
      },
      elements: [
        // Layer 1: GradientOrb 글로우
        {
          id: "accum-orb",
          component: "GradientOrb",
          props: {
            color: "#FFD700",
            size: 600,
            x: 50,
            y: 50,
            opacity: 0.12,
            blur: 90,
            pulseSpeed: 0.6,
          },
          animation: { preset: "fade_in", duration: 25 },
        },
        // Layer 1: 파티클
        {
          id: "accum-particles",
          component: "FloatingParticles",
          props: {
            count: 15,
            color: "rgba(255,215,0,0.4)",
            size: 4,
            speed: 0.4,
            shape: "star",
            opacity: 0.1,
          },
          containerStyle: { position: "absolute", inset: 0 },
          animation: { preset: "fade_in", duration: 20 },
        },
        // Wave 1: 1개 코인 (중앙)
        {
          id: "accum-w1-1",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1,
            style: { width: 160, height: 160 },
          },
          containerStyle: {
            position: "absolute",
            top: "40%",
            left: "47%",
          },
          startFrame: 10,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Wave 2: +3개 (총 4개)
        {
          id: "accum-w2-1",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.1,
            style: { width: 140, height: 140 },
          },
          containerStyle: {
            position: "absolute",
            top: "25%",
            left: "30%",
          },
          startFrame: 60,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        {
          id: "accum-w2-2",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 0.9,
            style: { width: 140, height: 140 },
          },
          containerStyle: {
            position: "absolute",
            top: "25%",
            left: "60%",
          },
          startFrame: 68,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        {
          id: "accum-w2-3",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.05,
            style: { width: 140, height: 140 },
          },
          containerStyle: {
            position: "absolute",
            top: "55%",
            left: "45%",
          },
          startFrame: 76,
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        // Wave 3: +8개 더 (총 12개) — 화면 채우기
        {
          id: "accum-w3-1",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.2,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "15%",
            left: "18%",
          },
          startFrame: 130,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-2",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 0.95,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "15%",
            left: "45%",
          },
          startFrame: 138,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-3",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.1,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "15%",
            left: "72%",
          },
          startFrame: 146,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-4",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.0,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "38%",
            left: "15%",
          },
          startFrame: 154,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-5",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 0.85,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "38%",
            left: "72%",
          },
          startFrame: 162,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-6",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.15,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "58%",
            left: "22%",
          },
          startFrame: 170,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-7",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 0.9,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "58%",
            left: "65%",
          },
          startFrame: 178,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        {
          id: "accum-w3-8",
          component: "LottieElement",
          props: {
            src: "animations/element/coin-spin.json",
            loop: true,
            speed: 1.05,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: "60%",
            left: "45%",
          },
          startFrame: 186,
          animation: { preset: "scale_in", duration: 12, easing: "kurzgesagt" },
        },
        // 자막
        {
          id: "accum-subtitle",
          component: "Subtitle",
          props: {
            text: "복리의 마법 — 하나가 열둘이 되는 과정",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
      cameraMotion: { type: "ken_burns", endScale: 1.06, panX: 0, panY: -8 },
    },
  ],
};
