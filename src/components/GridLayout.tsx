import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE_ZONE } from "../theme/layout";

interface GridLayoutProps {
  children: React.ReactNode;
  /** Number of columns */
  columns?: number;
  /** Gap between cells */
  gap?: number;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = 40,
}) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.right}px ${SAFE_ZONE.bottom}px ${SAFE_ZONE.left}px`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          width: SAFE_ZONE.contentWidth,
          maxHeight: SAFE_ZONE.contentHeight,
          placeItems: "center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
