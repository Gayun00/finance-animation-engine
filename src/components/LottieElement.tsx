import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";

interface LottieElementProps {
  src: string;
  loop?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export const LottieElement: React.FC<LottieElementProps> = ({
  src,
  loop = true,
  speed = 1,
  style,
}) => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));
  const [data, setData] = useState<LottieAnimationData | null>(null);

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

  if (!memoized) return null;

  return (
    <Lottie
      animationData={memoized}
      loop={loop}
      playbackRate={speed}
      style={style}
    />
  );
};
