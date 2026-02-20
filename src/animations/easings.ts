import { Easing } from "remotion";
import type { EasingName } from "../types";

// Kurzgesagt's signature easing: fast start, smooth settle
const kurzgesagt = Easing.bezier(0.25, 1, 0.5, 1);

const bounceIn = Easing.bounce;

const snap = Easing.bezier(0.68, -0.55, 0.27, 1.55);

const smoothOut = Easing.out(Easing.ease);

const dramaticIn = Easing.bezier(0.6, 0, 0.1, 1);

const linear = Easing.linear;

export const EASINGS: Record<EasingName, (t: number) => number> = {
  kurzgesagt,
  bounce_in: bounceIn,
  snap,
  smooth_out: smoothOut,
  dramatic_in: dramaticIn,
  linear,
};
