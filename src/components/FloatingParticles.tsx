import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type ParticleShape = "dot" | "star" | "ring";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  shape?: ParticleShape;
  opacity?: number;
  seed?: number;
}

// Deterministic pseudo-random based on seed
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const StarSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const RingSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </svg>
);

const DotDiv: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
    }}
  />
);

const SHAPE_COMPONENTS: Record<ParticleShape, React.FC<{ size: number; color: string }>> = {
  dot: DotDiv,
  star: StarSvg,
  ring: RingSvg,
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 12,
  color = "rgba(255,255,255,0.6)",
  size = 8,
  speed = 1,
  shape = "dot",
  opacity = 0.2,
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const rand = seededRandom(seed);

  const ShapeComponent = SHAPE_COMPONENTS[shape];

  const particles = React.useMemo(() => {
    const r = seededRandom(seed);
    return Array.from({ length: count }, () => ({
      startX: r() * 100,
      startY: r() * 100,
      driftX: (r() - 0.5) * 60,
      driftY: (r() - 0.5) * 40,
      scaleBase: 0.6 + r() * 0.8,
      phaseDrift: r() * Math.PI * 2,
      phaseScale: r() * Math.PI * 2,
      sizeMultiplier: 0.5 + r() * 1,
    }));
  }, [count, seed]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const progress = frame / Math.max(durationInFrames, 1);

        const x = p.startX + p.driftX * progress * speed;
        const y = p.startY + p.driftY * progress * speed;

        const scale = interpolate(
          Math.sin(frame * 0.03 * speed + p.phaseScale),
          [-1, 1],
          [p.scaleBase * 0.8, p.scaleBase * 1.2]
        );

        const particleOpacity = interpolate(
          Math.sin(frame * 0.02 * speed + p.phaseDrift),
          [-1, 1],
          [0.4, 1]
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: particleOpacity,
            }}
          >
            <ShapeComponent size={size * p.sizeMultiplier} color={color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
