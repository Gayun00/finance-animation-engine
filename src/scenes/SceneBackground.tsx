import React from "react";
import { AbsoluteFill } from "remotion";
import type { BackgroundConfig } from "../types";
import { COLORS } from "../theme/colors";

interface SceneBackgroundProps {
  config: BackgroundConfig;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ config }) => {
  let background: string;

  switch (config.type) {
    case "gradient": {
      const [c1, c2] = config.colors ?? [COLORS.bg.dark, COLORS.bg.mid];
      const angle = config.angle ?? 135;
      background = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
      break;
    }
    case "radial": {
      const [c1, c2] = config.colors ?? [COLORS.bg.light, COLORS.bg.dark];
      background = `radial-gradient(ellipse at center, ${c1}, ${c2})`;
      break;
    }
    case "solid":
    default:
      background = config.color ?? COLORS.bg.dark;
      break;
  }

  return <AbsoluteFill style={{ background }} />;
};
