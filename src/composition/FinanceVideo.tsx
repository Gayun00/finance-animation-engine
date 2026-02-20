import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { resolveTransition } from "../transitions/resolve-transition";
import type { SceneSequence } from "../types";

interface FinanceVideoProps {
  sequence: SceneSequence;
}

export const FinanceVideo: React.FC<FinanceVideoProps> = ({ sequence }) => {
  return (
    <TransitionSeries>
      {sequence.scenes.map((scene, index) => {
        const elements: React.ReactNode[] = [];

        // Add transition before scene (except for the first scene)
        if (index > 0 && scene.transition && scene.transition.type !== "none") {
          const resolved = resolveTransition(scene.transition);
          if (resolved) {
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${scene.id}`}
                presentation={resolved.presentation}
                timing={resolved.timing}
              />
            );
          }
        }

        // Add scene sequence
        elements.push(
          <TransitionSeries.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
          >
            <SceneRenderer scene={scene} />
          </TransitionSeries.Sequence>
        );

        return elements;
      })}
    </TransitionSeries>
  );
};
