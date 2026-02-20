import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneBackground } from "./SceneBackground";
import { ElementRenderer } from "./ElementRenderer";
import { ParallaxScene } from "./ParallaxScene";
import { LottieOverlay } from "../components/LottieOverlay";
import { CameraMotion } from "../animations/CameraMotion";
import type { Scene } from "../types";

interface SceneRendererProps {
  scene: Scene;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  const renderElement = (el: (typeof scene.elements)[number]) => {
    const startFrame = el.startFrame ?? 0;
    const duration = Math.max(1, el.durationInFrames ?? scene.durationInFrames - startFrame);

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
  };

  // ── Parallax scene (depth preset) ──
  if (scene.parallaxLayers && scene.parallaxLayers.length > 0) {
    const subtitles = scene.elements.filter((el) => el.component === "Subtitle");
    const nonSubtitles = scene.elements.filter((el) => el.component !== "Subtitle");

    return (
      <AbsoluteFill>
        <SceneBackground config={scene.background} />
        <ParallaxScene
          layers={scene.parallaxLayers}
          durationInFrames={scene.durationInFrames}
        />
        {/* Non-parallax elements (popup, fixed decorations) */}
        {nonSubtitles.map(renderElement)}
        {/* Subtitle on top */}
        {subtitles.map(renderElement)}
      </AbsoluteFill>
    );
  }

  // ── Normal scene ──
  const motionElements = scene.elements.filter((el) => el.component !== "Subtitle");
  const fixedElements = scene.elements.filter((el) => el.component === "Subtitle");

  return (
    <AbsoluteFill>
      <SceneBackground config={scene.background} />
      {scene.cameraMotion ? (
        <CameraMotion
          config={scene.cameraMotion}
          durationInFrames={scene.durationInFrames}
        >
          {motionElements.map(renderElement)}
        </CameraMotion>
      ) : (
        motionElements.map(renderElement)
      )}
      {/* Subtitle stays outside camera motion — no zoom/pan */}
      {fixedElements.map(renderElement)}
    </AbsoluteFill>
  );
};
