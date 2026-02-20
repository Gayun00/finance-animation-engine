import React from "react";
import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { AnimationWrapper } from "../animations/AnimationWrapper";
import { COMPONENT_REGISTRY } from "../components/registry";
import type { ParallaxLayerData, SceneElement } from "../types";

interface ParallaxSceneProps {
  layers: ParallaxLayerData[];
  durationInFrames: number;
  maxScale?: number;
}

// Kurzgesagt easeOutQuart — smooth deceleration
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export const ParallaxScene: React.FC<ParallaxSceneProps> = ({
  layers,
  durationInFrames,
  maxScale = 1.5,
}) => {
  const frame = useCurrentFrame();
  const progress = easeOutQuart(Math.min(1, frame / durationInFrames));

  return (
    <>
      {layers.map((layer, layerIndex) => {
        // Layer-level scale: closer layers scale faster
        const layerScale = interpolate(
          progress,
          [0, 1],
          [1, 1 + (maxScale - 1) * layer.speed]
        );

        // Layer-level translateY: upward = forward motion feel
        const layerTranslateY = interpolate(
          progress,
          [0, 1],
          [0, -30 * layer.speed]
        );

        // Split amount for foreground horizontal split
        const splitAmount =
          layer.splitDirection === "horizontal"
            ? interpolate(progress, [0, 1], [0, 200 * layer.speed])
            : 0;

        return (
          <div
            key={layerIndex}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: layerIndex + 1,
              transform: `scale(${layerScale}) translateY(${layerTranslateY}px)`,
              transformOrigin: "center center",
            }}
          >
            {layer.elements.map((el) => {
              // Calculate split offset for this element
              let splitX = 0;
              if (layer.splitDirection === "horizontal" && el.splitSide) {
                splitX =
                  el.splitSide === "left" ? -splitAmount : splitAmount;
              }

              // Merge splitX into containerStyle
              const mergedStyle: React.CSSProperties = splitX !== 0
                ? {
                    ...el.containerStyle,
                    transform: [
                      el.containerStyle?.transform,
                      `translateX(${splitX}px)`,
                    ]
                      .filter(Boolean)
                      .join(" "),
                  }
                : { ...el.containerStyle };

              const Component = COMPONENT_REGISTRY[el.component];
              if (!Component) return null;

              const startFrame = el.startFrame ?? 0;
              const duration = Math.max(
                1,
                el.durationInFrames ?? durationInFrames - startFrame
              );

              return (
                <Sequence
                  key={el.id}
                  from={startFrame}
                  durationInFrames={duration}
                  name={el.id}
                >
                  <AnimationWrapper
                    animation={el.animation}
                    style={mergedStyle}
                    totalFrames={duration}
                    sceneDuration={durationInFrames}
                  >
                    <Component {...el.props} />
                  </AnimationWrapper>
                </Sequence>
              );
            })}
          </div>
        );
      })}
    </>
  );
};
