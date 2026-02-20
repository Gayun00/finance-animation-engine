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
  const overlays = scene.elements.filter(
    (el) => el.component === "LottieOverlay"
  );
  const content = scene.elements.filter(
    (el) => el.component !== "LottieOverlay"
  );

  return (
    <AbsoluteFill>
      <SceneBackground config={scene.background} />
      {/* Overlays rendered directly, bypassing AnimationWrapper */}
      {overlays.map((el) => {
        const startFrame = el.startFrame ?? 0;
        const duration = el.durationInFrames ?? scene.durationInFrames - startFrame;
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
      })}
      {/* Content elements go through normal ElementRenderer pipeline */}
      {content.map((element) => (
        <ElementRenderer
          key={element.id}
          element={element}
          sceneDuration={scene.durationInFrames}
        />
      ))}
    </AbsoluteFill>
  );
};
