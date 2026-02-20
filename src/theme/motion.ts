export const MOTION = {
  defaultEasing: "kurzgesagt" as const,
  duration: {
    fast: 8,
    normal: 15,
    slow: 25,
    dramatic: 40,
  },
  spacing: {
    stagger: 6, // frames between staggered elements
  },
  layout: {
    width: 1920,
    height: 1080,
    padding: 80,
    centerX: 960,
    centerY: 540,
  },
} as const;
