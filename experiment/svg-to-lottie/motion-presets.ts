/**
 * Lottie motion preset keyframes
 *
 * 6 presets: float, bounce, rotate, pulse, swing, fade_in
 * Each returns animated ks (transform) properties for a null parent layer.
 *
 * Reference: builder/src/components/AssetPreviewComposition.tsx CSS motions
 */

export type MotionPreset = "float" | "bounce" | "rotate" | "pulse" | "swing" | "fade_in";

export const ALL_PRESETS: MotionPreset[] = ["float", "bounce", "rotate", "pulse", "swing", "fade_in"];

interface AnimatedProp {
  a: 1;
  k: Keyframe[];
  ix?: number;
}

interface StaticProp {
  a: 0;
  k: number | number[];
  ix?: number;
}

interface Keyframe {
  t: number;        // frame
  s: number[];      // start value
  i?: { x: number[]; y: number[] }; // in easing
  o?: { x: number[]; y: number[] }; // out easing
}

type Prop = AnimatedProp | StaticProp;

interface MotionTransform {
  o: Prop;   // opacity
  r: Prop;   // rotation
  p: Prop;   // position [x, y, 0]
  a: Prop;   // anchor
  s: Prop;   // scale [sx, sy, 100]
}

// Easing helpers
const LINEAR = { x: [0.333], y: [0.333] };
const EASE_IN_OUT = { x: [0.42], y: [0] };
const EASE_OUT = { x: [0.0], y: [1] };

function staticProp(val: number | number[], ix: number): StaticProp {
  return { a: 0, k: val, ix };
}

/**
 * Apply a motion preset to generate transform keyframes.
 * @param preset - motion type
 * @param fps - frame rate (default 30)
 * @param duration - total frames (default 90 = 3s@30fps)
 * @param cx - center X (anchor X for the motion layer)
 * @param cy - center Y (anchor Y for the motion layer)
 */
export function getMotionTransform(
  preset: MotionPreset,
  fps = 30,
  duration = 90,
  cx = 0,
  cy = 0,
): MotionTransform {
  const base: MotionTransform = {
    o: staticProp(100, 11),
    r: staticProp(0, 10),
    p: staticProp([cx, cy, 0], 2),
    a: staticProp([0, 0, 0], 1),
    s: staticProp([100, 100, 100], 6),
  };

  switch (preset) {
    case "float": {
      // Gentle Y oscillation: 0 → -30 → 0 → -30 → 0 over duration
      const half = Math.round(duration / 2);
      const amp = 30; // pixels
      base.p = {
        a: 1,
        k: [
          { t: 0, s: [cx, cy, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: half, s: [cx, cy - amp, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: duration, s: [cx, cy, 0] },
        ],
        ix: 2,
      };
      break;
    }

    case "bounce": {
      // Bounce: Y drops, scale squashes on landing
      const t1 = Math.round(duration * 0.25); // up
      const t2 = Math.round(duration * 0.5);   // land
      const t3 = Math.round(duration * 0.65);  // small bounce
      const t4 = Math.round(duration * 0.8);   // settle
      const amp = 35;
      const ampSmall = 12;

      base.p = {
        a: 1,
        k: [
          { t: 0, s: [cx, cy, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t1, s: [cx, cy - amp, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t2, s: [cx, cy, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t3, s: [cx, cy - ampSmall, 0], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t4, s: [cx, cy, 0] },
        ],
        ix: 2,
      };
      // Squash on landing
      base.s = {
        a: 1,
        k: [
          { t: 0, s: [100, 100, 100], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t2, s: [105, 95, 100], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: t2 + 4, s: [100, 100, 100] },
        ],
        ix: 6,
      };
      break;
    }

    case "rotate": {
      // Continuous 360° rotation over duration
      base.r = {
        a: 1,
        k: [
          { t: 0, s: [0], i: { x: [0.333], y: [0.333] }, o: { x: [0.333], y: [0.333] } },
          { t: duration, s: [360] },
        ],
        ix: 10,
      };
      break;
    }

    case "pulse": {
      // Scale 100→106→100 with subtle opacity
      const half = Math.round(duration / 2);
      base.s = {
        a: 1,
        k: [
          { t: 0, s: [100, 100, 100], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: half, s: [106, 106, 100], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: duration, s: [100, 100, 100] },
        ],
        ix: 6,
      };
      base.o = {
        a: 1,
        k: [
          { t: 0, s: [100], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: half, s: [85], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: duration, s: [100] },
        ],
        ix: 11,
      };
      break;
    }

    case "swing": {
      // Rotation ±10° oscillation
      const q1 = Math.round(duration * 0.25);
      const q2 = Math.round(duration * 0.5);
      const q3 = Math.round(duration * 0.75);
      base.r = {
        a: 1,
        k: [
          { t: 0, s: [0], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: q1, s: [10], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: q2, s: [0], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: q3, s: [-10], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: duration, s: [0] },
        ],
        ix: 10,
      };
      break;
    }

    case "fade_in": {
      // Opacity 0→100 in first 30% + slight scale up
      const fadeEnd = Math.round(duration * 0.3);
      base.o = {
        a: 1,
        k: [
          { t: 0, s: [0], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
          { t: fadeEnd, s: [100] },
        ],
        ix: 11,
      };
      base.s = {
        a: 1,
        k: [
          { t: 0, s: [90, 90, 100], i: { x: [0.42, 0.42, 0.42], y: [0, 0, 0] }, o: { x: [0.58, 0.58, 0.58], y: [1, 1, 1] } },
          { t: fadeEnd, s: [100, 100, 100] },
        ],
        ix: 6,
      };
      break;
    }
  }

  return base;
}
