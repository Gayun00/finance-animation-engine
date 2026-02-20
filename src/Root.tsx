import React from "react";
import { Composition } from "remotion";
import { FinanceVideo } from "./composition/FinanceVideo";
import { sampleSequence } from "./data/sample-sequence";
import { spaceEconomySequence } from "./data/space-economy-sequence";
import { presetDemoSequence } from "./data/preset-demo-sequence";
import { builderSequence } from "./data/builder-sequence";
import { loadFonts } from "./fonts/load-fonts";
import type { SceneSequence } from "./types";

// Load fonts at module level
loadFonts();

function calcTotalFrames(seq: SceneSequence): number {
  return seq.scenes.reduce((sum, scene, index) => {
    let frames = scene.durationInFrames;
    if (index > 0 && scene.transition && scene.transition.type !== "none") {
      frames -= scene.transition.duration ?? 15;
    }
    return sum + frames;
  }, 0);
}

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FinanceVideo"
        component={FinanceVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={calcTotalFrames(sampleSequence)}
        fps={sampleSequence.fps}
        width={sampleSequence.width}
        height={sampleSequence.height}
        defaultProps={{
          sequence: sampleSequence,
        }}
      />
      <Composition
        id="SpaceEconomy"
        component={FinanceVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={calcTotalFrames(spaceEconomySequence)}
        fps={spaceEconomySequence.fps}
        width={spaceEconomySequence.width}
        height={spaceEconomySequence.height}
        defaultProps={{
          sequence: spaceEconomySequence,
        }}
      />
      <Composition
        id="PresetDemo"
        component={FinanceVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={calcTotalFrames(presetDemoSequence)}
        fps={presetDemoSequence.fps}
        width={presetDemoSequence.width}
        height={presetDemoSequence.height}
        defaultProps={{
          sequence: presetDemoSequence,
        }}
      />
      {builderSequence.scenes.length > 0 && (
        <Composition
          id="BuilderOutput"
          component={FinanceVideo as unknown as React.ComponentType<Record<string, unknown>>}
          durationInFrames={calcTotalFrames(builderSequence)}
          fps={builderSequence.fps}
          width={builderSequence.width}
          height={builderSequence.height}
          defaultProps={{
            sequence: builderSequence,
          }}
        />
      )}
    </>
  );
};
