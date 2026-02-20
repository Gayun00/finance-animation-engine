import React from "react";
import { Composition } from "remotion";
import { FinanceVideo } from "./composition/FinanceVideo";
import { sampleSequence } from "./data/sample-sequence";
import { loadFonts } from "./fonts/load-fonts";

// Load fonts at module level
loadFonts();

export const Root: React.FC = () => {
  // Calculate total duration accounting for transition overlaps
  const totalFrames = sampleSequence.scenes.reduce((sum, scene, index) => {
    let frames = scene.durationInFrames;
    // Transitions overlap, reducing total duration
    if (index > 0 && scene.transition && scene.transition.type !== "none") {
      frames -= scene.transition.duration ?? 15;
    }
    return sum + frames;
  }, 0);

  return (
    <Composition
      id="FinanceVideo"
      component={FinanceVideo as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={totalFrames}
      fps={sampleSequence.fps}
      width={sampleSequence.width}
      height={sampleSequence.height}
      defaultProps={{
        sequence: sampleSequence,
      }}
    />
  );
};
