import type { SceneSequence } from "../types";
import { COLORS } from "../theme/colors";

export const sampleSequence: SceneSequence = {
  id: "compound-interest-demo",
  title: "복리의 마법",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    // ── Scene 1: Title (4s = 120f) ──
    {
      id: "scene-title",
      title: "타이틀",
      durationInFrames: 120,
      background: {
        type: "gradient",
        colors: [COLORS.bg.dark, COLORS.bg.mid],
        angle: 135,
      },
      elements: [
        {
          id: "title-sparkle-overlay",
          component: "LottieOverlay",
          props: {
            src: "animations/Coins drop.json",
            loop: true,
            speed: 0.6,
            opacity: 0.25,
            blendMode: "screen",
          },
        },
        {
          id: "title-card",
          component: "TitleCard",
          props: {
            title: "복리의 마법",
            subtitle: "시간이 만들어내는 부의 기적",
            accentColor: COLORS.finance.gold,
          },
          animation: {
            preset: "scale_in",
            duration: 25,
            easing: "kurzgesagt",
          },
        },
      ],
    },

    // ── Scene 2: Count-up (5s = 150f) ──
    {
      id: "scene-countup",
      title: "1000만 → 7612만",
      durationInFrames: 150,
      background: {
        type: "gradient",
        colors: [COLORS.bg.mid, COLORS.bg.light],
        angle: 180,
      },
      transition: {
        type: "fade",
        duration: 15,
      },
      elements: [
        {
          id: "countup-coin-icon",
          component: "LottieElement",
          props: {
            src: "animations/Fake 3D vector coin.json",
            loop: true,
            speed: 0.8,
            style: { width: 120, height: 120 },
          },
          containerStyle: {
            position: "absolute",
            top: 80,
            right: 160,
          },
          animation: {
            preset: "pop_in",
            delay: 10,
            duration: 12,
          },
        },
        {
          id: "countup-number",
          component: "CountUpNumber",
          props: {
            from: 10000000,
            to: 76122550,
            prefix: "",
            suffix: "원",
            label: "1,000만원을 30년간 연 7% 복리 투자하면",
            duration: 100,
            color: COLORS.finance.gold,
          },
          animation: {
            preset: "fade_in",
            duration: 15,
          },
        },
        {
          id: "countup-callout",
          component: "CalloutBox",
          props: {
            text: "약 7.6배 성장!",
            accentColor: COLORS.finance.green,
          },
          startFrame: 100,
          durationInFrames: 50,
          animation: {
            preset: "slide_up",
            delay: 0,
            duration: 15,
            easing: "snap",
          },
        },
      ],
    },

    // ── Scene 3: Chart (6s = 180f) ──
    {
      id: "scene-chart",
      title: "복리 vs 단리 차트",
      durationInFrames: 180,
      background: {
        type: "gradient",
        colors: [COLORS.bg.dark, "#0d1b2a"],
        angle: 160,
      },
      transition: {
        type: "wipe_left",
        duration: 20,
      },
      elements: [
        {
          id: "chart-growth-overlay",
          component: "LottieOverlay",
          props: {
            src: "animations/Growth Chart.json",
            loop: true,
            speed: 0.5,
            opacity: 0.15,
            blendMode: "screen",
          },
        },
        {
          id: "compound-chart",
          component: "CompoundInterestChart",
          props: {
            principal: 1000,
            compoundRate: 0.07,
            simpleRate: 0.07,
            years: 30,
            drawDuration: 120,
          },
          animation: {
            preset: "fade_in",
            duration: 10,
          },
        },
      ],
    },

    // ── Scene 4: Insight (4s = 120f) ──
    {
      id: "scene-insight",
      title: "핵심 인사이트",
      durationInFrames: 120,
      background: {
        type: "radial",
        colors: [COLORS.bg.light, COLORS.bg.dark],
      },
      transition: {
        type: "color_wipe",
        duration: 20,
        color: COLORS.primary.main,
      },
      elements: [
        {
          id: "insight-callout",
          component: "CalloutBox",
          props: {
            text: "복리의 핵심은 '시간'입니다",
            subtext:
              "일찍 시작할수록, 오래 유지할수록 복리 효과는 기하급수적으로 커집니다. 워런 버핏 자산의 99%는 50세 이후에 만들어졌습니다.",
            accentColor: COLORS.finance.green,
            lottieIcon: "animations/Conversation Two Friend & Get Idea.json",
          },
          animation: {
            preset: "scale_in",
            duration: 20,
            easing: "kurzgesagt",
          },
        },
      ],
    },

    // ── Scene 5: End Card (3s = 90f) ──
    {
      id: "scene-end",
      title: "엔딩",
      durationInFrames: 90,
      background: {
        type: "gradient",
        colors: [COLORS.bg.dark, COLORS.bg.mid],
        angle: 135,
      },
      transition: {
        type: "fade",
        duration: 15,
      },
      elements: [
        {
          id: "end-confetti-overlay",
          component: "LottieOverlay",
          props: {
            src: "animations/confetti.json",
            loop: false,
            speed: 1,
            opacity: 0.4,
            blendMode: "screen",
          },
        },
        {
          id: "end-card",
          component: "EndCard",
          props: {
            channelName: "Finance Explained",
            cta: "구독과 좋아요 부탁드립니다!",
          },
          animation: {
            preset: "scale_in",
            duration: 20,
            easing: "kurzgesagt",
          },
        },
      ],
    },
  ],
};
