import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE_ZONE } from "../theme/layout";

interface TopBottomLayoutProps {
  children: React.ReactNode;
  /** Top area height in px */
  topHeight?: number;
  /** Gap between top and bottom */
  gap?: number;
}

export const TopBottomLayout: React.FC<TopBottomLayoutProps> = ({
  children,
  topHeight = 200,
  gap = 40,
}) => {
  const childArray = React.Children.toArray(children);
  const top = childArray[0];
  const bottom = childArray.slice(1);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.right}px ${SAFE_ZONE.bottom}px ${SAFE_ZONE.left}px`,
        gap,
      }}
    >
      <div
        style={{
          height: topHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {top}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        {bottom}
      </div>
    </AbsoluteFill>
  );
};
