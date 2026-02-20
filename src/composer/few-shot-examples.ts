/**
 * Few-shot examples for the Scene Composer LLM prompt.
 * Each example maps a script section input to a composed scene output.
 */
export const FEW_SHOT_EXAMPLES = [
  {
    input: {
      type: "intro",
      narration:
        "여러분, 아인슈타인이 세계 8번째 불가사의라고 불렀던 것이 뭔지 아시나요?",
      duration: 5.2,
    },
    output: {
      layout: "FullScreen",
      background: {
        type: "gradient",
        from: "#0F1923",
        to: "#1B2838",
        angle: 180,
      },
      elements: [
        {
          component: "GradientOrb",
          props: { color: "#4FC3F7", size: 400, x: 75, y: 30, opacity: 0.12, blur: 80 },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: { type: "fade_in", durationInFrames: 20 },
          },
        },
        {
          component: "TitleCard",
          props: {
            title: "복리의 마법",
            subtitle: "The Magic of Compound Interest",
          },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: { type: "scale_in", durationInFrames: 18, easing: "BOUNCE_IN" },
          },
        },
        {
          component: "FloatingParticles",
          props: {
            count: 15,
            color: "rgba(255,255,255,0.5)",
            size: 6,
            speed: 0.8,
            shape: "star",
            opacity: 0.2,
          },
          position: { x: 960, y: 540 },
          enterAt: 6,
          animation: {
            enter: { type: "fade_in", durationInFrames: 15 },
          },
        },
      ],
      transition: {
        type: "color_wipe",
        color: "#4FC3F7",
        durationInFrames: 15,
      },
      cameraMotion: { type: "ken_burns", endScale: 1.12, panX: -30, panY: 10 },
    },
  },
  {
    input: {
      type: "explain",
      narration:
        "단리는 원금에만 이자가 붙습니다. 1000만원을 연 5%로 10년 넣으면, 매년 50만원씩, 총 500만원의 이자를 받죠.",
      duration: 10.5,
    },
    output: {
      layout: "SplitLayout",
      layoutProps: { ratio: 0.4 },
      background: { type: "solid", color: "#1B2838" },
      elements: [
        {
          component: "Character",
          props: {
            assetId: "char_person_01",
            pose: "explaining",
            emotion: "neutral",
          },
          position: { x: 350, y: 600 },
          enterAt: 0,
          animation: {
            enter: {
              type: "slide_in",
              direction: "left",
              durationInFrames: 12,
            },
          },
        },
        {
          component: "CountUpNumber",
          props: { from: 0, to: 1000, suffix: "만원", prefix: "원금 " },
          position: { x: 1200, y: 300 },
          enterAt: 9,
          animation: {
            enter: { type: "scale_in", durationInFrames: 12 },
          },
        },
        {
          component: "AnimatedLineChart",
          props: {
            data: [
              { year: 0, value: 1000 },
              { year: 5, value: 1250 },
              { year: 10, value: 1500 },
            ],
            color: "#90A4AE",
            strokeWidth: 3,
            drawDuration: 30,
          },
          position: { x: 1200, y: 550 },
          enterAt: 60,
          animation: {
            enter: { type: "draw_line", durationInFrames: 30 },
          },
        },
        {
          component: "CountUpNumber",
          props: { from: 0, to: 500, suffix: "만원", prefix: "이자 " },
          position: { x: 1200, y: 800 },
          enterAt: 210,
          animation: {
            enter: { type: "bounce_in", durationInFrames: 15 },
            during: { type: "pulse", durationInFrames: 30 },
          },
        },
      ],
      transition: { type: "zoom_in", durationInFrames: 15 },
    },
  },
  {
    input: {
      type: "chart",
      narration:
        "30년간 복리와 단리의 차이를 그래프로 확인해보겠습니다.",
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
    output: {
      layout: "CenterLayout",
      background: { type: "solid", color: "#0F1923" },
      elements: [
        {
          component: "GeometricDecor",
          props: {
            shapes: [
              { type: "ring", x: 10, y: 20, size: 80, rotationSpeed: 0.3 },
              { type: "ring", x: 85, y: 75, size: 60, rotationSpeed: -0.4 },
              { type: "circle", x: 92, y: 15, size: 40, rotationSpeed: 0.2 },
            ],
            opacity: 0.15,
          },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: { type: "fade_in", durationInFrames: 15 },
          },
        },
        {
          component: "CompoundInterestChart",
          props: {
            rate: 5,
            years: 30,
            principal: 1000,
            compareSingle: true,
          },
          position: { x: 960, y: 500 },
          enterAt: 9,
          animation: {
            enter: { type: "draw_line", durationInFrames: 45 },
          },
        },
        {
          component: "CalloutBox",
          props: { text: "복리 vs 단리 30년 비교", type: "info" },
          position: { x: 960, y: 120 },
          enterAt: 0,
          animation: {
            enter: { type: "fade_in", durationInFrames: 10 },
          },
        },
      ],
      transition: { type: "fade", durationInFrames: 12 },
      cameraMotion: { type: "zoom_focus", endScale: 1.1 },
    },
  },
  {
    input: {
      type: "comparison",
      narration:
        "30년 후 최종 금액을 비교해보면, 단리는 2500만원, 복리는 4322만원입니다.",
      duration: 7.0,
      directive: {
        type: "compare",
        params: { A: "단리 30년", B: "복리 30년", metric: "최종금액" },
      },
    },
    output: {
      layout: "SplitLayout",
      layoutProps: { ratio: 0.5 },
      background: {
        type: "gradient",
        from: "#1B2838",
        to: "#0F1923",
        angle: 90,
      },
      elements: [
        {
          component: "ComparisonTable",
          props: {
            items: [
              { label: "단리 30년", value: "2,500만원", color: "#90A4AE" },
              { label: "복리 30년", value: "4,322만원", color: "#81C784" },
            ],
            highlightWinner: true,
          },
          position: { x: 960, y: 450 },
          enterAt: 9,
          animation: {
            enter: {
              type: "slide_in",
              direction: "up",
              durationInFrames: 15,
            },
          },
        },
        {
          component: "CountUpNumber",
          props: { from: 0, to: 1822, suffix: "만원", prefix: "차이 " },
          position: { x: 960, y: 750 },
          enterAt: 120,
          animation: {
            enter: { type: "bounce_in", durationInFrames: 15 },
            during: { type: "pulse", durationInFrames: 24 },
          },
        },
      ],
      transition: {
        type: "color_wipe",
        color: "#81C784",
        durationInFrames: 15,
      },
    },
  },
  {
    input: {
      type: "callout",
      narration:
        "복리의 핵심은 시간입니다. 일찍 시작할수록 기하급수적으로 커집니다.",
      duration: 6.0,
    },
    output: {
      layout: "CenterLayout",
      background: { type: "solid", color: "#1E3A5F" },
      elements: [
        {
          component: "GradientOrb",
          props: { color: "#FFD54F", size: 350, x: 50, y: 40, opacity: 0.12, blur: 70 },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: { type: "fade_in", durationInFrames: 15 },
          },
        },
        {
          component: "Spotlight",
          props: { x: 960, y: 400, radius: 300, dimOpacity: 0.7 },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: { type: "fade_in", durationInFrames: 12 },
          },
        },
        {
          component: "CalloutBox",
          props: {
            text: "복리의 핵심 = 시간",
            icon: "icon_clock",
            type: "highlight",
          },
          position: { x: 960, y: 400 },
          enterAt: 9,
          animation: {
            enter: {
              type: "scale_in",
              durationInFrames: 15,
              easing: "BOUNCE_IN",
            },
          },
        },
      ],
      transition: { type: "zoom_out", durationInFrames: 18 },
      cameraMotion: { type: "zoom_focus", endScale: 1.15 },
    },
  },
  {
    input: {
      type: "outro",
      narration:
        "오늘부터 복리의 마법을 시작해보세요. 구독과 좋아요, 부탁드립니다.",
      duration: 5.0,
    },
    output: {
      layout: "FullScreen",
      background: {
        type: "gradient",
        from: "#0F1923",
        to: "#1B2838",
        angle: 0,
      },
      elements: [
        {
          component: "EndCard",
          props: {
            channelName: "금융의 정석",
            subscribeText: "구독과 좋아요",
          },
          position: { x: 960, y: 540 },
          enterAt: 0,
          animation: {
            enter: {
              type: "scale_in",
              durationInFrames: 18,
              easing: "KURZGESAGT",
            },
          },
        },
      ],
      transition: null,
    },
  },
] as const;
