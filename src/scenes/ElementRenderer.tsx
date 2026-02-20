import React from "react";
import { Sequence } from "remotion";
import { AnimationWrapper } from "../animations/AnimationWrapper";
import { COMPONENT_REGISTRY } from "../components/registry";
import type { SceneElement } from "../types";

interface ElementRendererProps {
  element: SceneElement;
  sceneDuration: number;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  sceneDuration,
}) => {
  const Component = COMPONENT_REGISTRY[element.component];

  if (!Component) {
    console.warn(`Component "${element.component}" not found in registry`);
    return null;
  }

  const startFrame = element.startFrame ?? 0;
  const duration = Math.max(1, element.durationInFrames ?? sceneDuration - startFrame);

  return (
    <Sequence from={startFrame} durationInFrames={duration} name={element.id}>
      <AnimationWrapper
        animation={element.animation}
        parallax={element.parallax}
        style={element.containerStyle}
        totalFrames={duration}
        sceneDuration={sceneDuration}
      >
        <Component {...element.props} />
      </AnimationWrapper>
    </Sequence>
  );
};
