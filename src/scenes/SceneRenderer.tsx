import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneBackground } from "./SceneBackground";
import { ElementRenderer } from "./ElementRenderer";
import { LottieOverlay } from "../components/LottieOverlay";
import type { Scene } from "../types";

interface SceneRendererProps {
  scene: Scene;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  return (
    <AbsoluteFill>
      <SceneBackground config={scene.background} />
      {/* Render elements in declaration order — later items appear on top */}
      {scene.elements.map((el) => {
        const startFrame = el.startFrame ?? 0;
        const duration = el.durationInFrames ?? scene.durationInFrames - startFrame;

        // LottieOverlay bypasses AnimationWrapper
        if (el.component === "LottieOverlay") {
          return (
            <Sequence
              key={el.id}
              from={startFrame}
              durationInFrames={duration}
              name={el.id}
            >
              <LottieOverlay {...(el.props as any)} />
            </Sequence>
          );
        }

        return (
          <ElementRenderer
            key={el.id}
            element={el}
            sceneDuration={scene.durationInFrames}
          />
        );
      })}
    </AbsoluteFill>
  );
};
