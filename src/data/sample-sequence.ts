import type { SceneSequence } from "../types";
import { COLORS } from "../theme/colors";

export const sampleSequence: SceneSequence = {
  id: "compound-interest-demo",
  title: "복리의 마법",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    // ── Scene 1: 코인 단독 (5s = 150f) ──
    {
      id: "scene-title",
      title: "타이틀",
      durationInFrames: 150,
      background: {
        type: "solid",
        color: "#0EA0E4",
      },
      elements: [
        {
          id: "title-coins",
          component: "LottieElement",
          props: {
            src: "animations/Coins drop.json",
            loop: true,
            speed: 2,
            style: { width: 800, height: 800 },
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
        {
          id: "title-subtitle",
          component: "Subtitle",
          props: {
            text: "복리의 마법 — 시간이 만들어내는 부의 기적",
          },
          startFrame: 10,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ── Scene 2: 돈 아이콘 릴레이 (7s = 210f) ──
    {
      id: "scene-countup",
      title: "1000만 → 7612만",
      durationInFrames: 210,
      background: {
        type: "solid",
        color: "#E92F60",
      },
      transition: {
        type: "wipe_left",
        duration: 20,
      },
      elements: [
        // 1) 코인 — 크게 등장 → 축소 → 왼쪽 위로 이동
        {
          id: "showcase-coin",
          component: "LottieShowcase",
          props: {
            src: "animations/Fake 3D vector coin.json",
            loop: true,
            speed: 0.8,
            bigSize: 550,
            smallSize: 160,
            holdFrames: 35,
            transitionFrames: 20,
            targetX: "18",
            targetY: "25",
          },
        },
        // 2) Money — 크게 등장 → 축소 → 오른쪽 위로 이동
        {
          id: "showcase-money",
          component: "LottieShowcase",
          props: {
            src: "animations/Money.json",
            loop: true,
            speed: 1,
            bigSize: 550,
            smallSize: 160,
            holdFrames: 35,
            transitionFrames: 20,
            targetX: "82",
            targetY: "25",
          },
          startFrame: 65,
        },
        // 3) Money Transfer — 크게 등장 → 축소 → 아래 가운데로 이동
        {
          id: "showcase-transfer",
          component: "LottieShowcase",
          props: {
            src: "animations/Money Transfer.json",
            loop: true,
            speed: 1,
            bigSize: 550,
            smallSize: 160,
            holdFrames: 35,
            transitionFrames: 20,
            targetX: "50",
            targetY: "78",
          },
          startFrame: 130,
        },
        {
          id: "countup-subtitle",
          component: "Subtitle",
          props: {
            text: "1,000만원을 30년간 연 7% 복리 투자하면 약 7,612만원",
          },
          startFrame: 10,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ── Scene 3: 차트 크게 + 돈 겹침 (6s = 180f) ──
    {
      id: "scene-chart",
      title: "복리 vs 단리 차트",
      durationInFrames: 180,
      background: {
        type: "solid",
        color: "#14D1C8",
      },
      transition: {
        type: "wipe_left",
        duration: 20,
      },
      elements: [
        {
          id: "chart-growth-center",
          component: "LottieElement",
          props: {
            src: "animations/Growth Chart.json",
            loop: true,
            speed: 0.7,
            style: { width: 1440, height: 810 },
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
        {
          id: "chart-money-right",
          component: "LottieElement",
          props: {
            src: "animations/Money.json",
            loop: true,
            speed: 1,
            style: { width: 320, height: 320 },
          },
          containerStyle: {
            position: "absolute",
            top: "30%",
            right: "3%",
          },
          startFrame: 12,
          animation: { preset: "slide_left", duration: 18 },
        },
        {
          id: "chart-subtitle",
          component: "Subtitle",
          props: {
            text: "복리와 단리의 차이는 시간이 지날수록 기하급수적으로 벌어집니다",
          },
          startFrame: 30,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ── Scene 4: Conversation 단독 (4s = 120f) ──
    {
      id: "scene-insight",
      title: "핵심 인사이트",
      durationInFrames: 120,
      background: {
        type: "solid",
        color: "#4F28F2",
      },
      transition: {
        type: "wipe_left",
        duration: 20,
      },
      elements: [
        {
          id: "insight-idea-center",
          component: "LottieElement",
          props: {
            src: "animations/Conversation Two Friend & Get Idea.json",
            loop: true,
            speed: 0.8,
            style: { width: 700, height: 700 },
          },
          containerStyle: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -52%)",
          },
          animation: { preset: "scale_in", duration: 20, easing: "kurzgesagt" },
        },
        {
          id: "insight-subtitle",
          component: "Subtitle",
          props: {
            text: "복리의 핵심은 '시간'입니다. 일찍 시작할수록 복리 효과는 기하급수적으로 커집니다.",
          },
          startFrame: 15,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },

    // ── Scene 5: 엔딩 (3s = 90f) ──
    {
      id: "scene-end",
      title: "엔딩",
      durationInFrames: 90,
      background: {
        type: "solid",
        color: "#0EA0E4",
      },
      transition: {
        type: "wipe_left",
        duration: 20,
      },
      elements: [
        {
          id: "end-confetti",
          component: "LottieElement",
          props: {
            src: "animations/confetti.json",
            loop: false,
            speed: 1,
            style: { width: 900, height: 900 },
          },
          containerStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          },
          animation: { preset: "scale_in", duration: 15, easing: "kurzgesagt" },
        },
        {
          id: "end-subtitle",
          component: "Subtitle",
          props: {
            text: "구독과 좋아요 부탁드립니다!",
          },
          startFrame: 20,
          animation: { preset: "fade_in", duration: 15 },
        },
      ],
    },
  ],
};
