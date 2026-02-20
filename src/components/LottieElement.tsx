import React, { useEffect, useMemo, useState } from "react";
import {
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";

interface LottieElementProps {
  src: string;
  loop?: boolean;
  speed?: number;
  /** When set with loop=false, speed is auto-calculated so the full animation fits this duration. */
  fitDurationInFrames?: number;
  style?: React.CSSProperties;
}

export const LottieElement: React.FC<LottieElementProps> = ({
  src,
  loop = true,
  speed = 1,
  fitDurationInFrames,
  style,
}) => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));
  const [data, setData] = useState<LottieAnimationData | null>(null);
  const { fps } = useVideoConfig();

  useEffect(() => {
    const url = src.startsWith("http") ? src : staticFile(src);
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load Lottie:", err);
        continueRender(handle);
      });
  }, [src, handle]);

  const memoized = useMemo(() => data, [data]);

  // Auto-calculate playbackRate to fit the full animation within fitDurationInFrames
  const effectiveSpeed = useMemo(() => {
    if (!memoized || loop || !fitDurationInFrames) return speed;
    const lottieFrames = (memoized as any).op - ((memoized as any).ip ?? 0);
    const lottieFps = (memoized as any).fr ?? 30;
    const nativeDurationSec = lottieFrames / lottieFps;
    const targetDurationSec = fitDurationInFrames / fps;
    if (targetDurationSec <= 0) return speed;
    return nativeDurationSec / targetDurationSec;
  }, [memoized, loop, fitDurationInFrames, fps, speed]);

  if (!memoized) return null;

  return (
    <Lottie
      animationData={memoized}
      loop={loop}
      playbackRate={effectiveSpeed}
      style={style}
    />
  );
};
