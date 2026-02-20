import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE_ZONE } from "../theme/layout";

interface SplitLayoutProps {
  children: React.ReactNode;
  /** Left side ratio (0-1), default 0.4 */
  ratio?: number;
  /** Gap between left and right in px */
  gap?: number;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  children,
  ratio = 0.4,
  gap = 60,
}) => {
  const childArray = React.Children.toArray(children);
  const left = childArray[0];
  const right = childArray.slice(1);

  const leftWidth = SAFE_ZONE.contentWidth * ratio - gap / 2;
  const rightWidth = SAFE_ZONE.contentWidth * (1 - ratio) - gap / 2;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "row",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.right}px ${SAFE_ZONE.bottom}px ${SAFE_ZONE.left}px`,
        gap,
      }}
    >
      <div
        style={{
          width: leftWidth,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {left}
      </div>
      <div
        style={{
          width: rightWidth,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        {right}
      </div>
    </AbsoluteFill>
  );
};
