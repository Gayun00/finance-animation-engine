import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

type ShapeType = "circle" | "triangle" | "hexagon" | "ring";

interface ShapeConfig {
  type: ShapeType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // pixels
  rotationSpeed?: number; // degrees per frame
  opacity?: number;
  color?: string;
}

interface GeometricDecorProps {
  shapes: ShapeConfig[];
  color?: string; // default color if not per-shape
  opacity?: number;
}

const ShapeSvg: React.FC<{
  type: ShapeType;
  size: number;
  color: string;
}> = ({ type, size, color }) => {
  const half = size / 2;

  switch (type) {
    case "circle":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half * 0.9} fill={color} />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon
            points={`${half},${size * 0.05} ${size * 0.95},${size * 0.95} ${size * 0.05},${size * 0.95}`}
            fill={color}
          />
        </svg>
      );
    case "hexagon": {
      const cx = half;
      const cy = half;
      const r = half * 0.9;
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={points} fill={color} />
        </svg>
      );
    }
    case "ring":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={half}
            cy={half}
            r={half * 0.8}
            fill="none"
            stroke={color}
            strokeWidth={size * 0.06}
          />
        </svg>
      );
  }
};

export const GeometricDecor: React.FC<GeometricDecorProps> = ({
  shapes,
  color: defaultColor = "rgba(255,255,255,0.15)",
  opacity: globalOpacity = 0.2,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {shapes.map((shape, i) => {
        const rotation = (shape.rotationSpeed ?? 0.5) * frame;
        const shapeOpacity = shape.opacity ?? globalOpacity;
        const fillColor = shape.color ?? defaultColor;

        // Subtle pulse: scale oscillation
        const scale = interpolate(
          Math.sin(frame * 0.025 + i * 1.5),
          [-1, 1],
          [0.9, 1.1]
        );

        // Subtle opacity oscillation
        const opacityPulse = interpolate(
          Math.sin(frame * 0.02 + i * 2),
          [-1, 1],
          [shapeOpacity * 0.7, shapeOpacity]
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              opacity: opacityPulse,
            }}
          >
            <ShapeSvg type={shape.type} size={shape.size} color={fillColor} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
