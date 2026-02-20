import React from "react";
import { Img, staticFile } from "remotion";

interface StaticImageProps {
  src: string;
  width?: number | string;
  height?: number | string;
  objectFit?: React.CSSProperties["objectFit"];
  opacity?: number;
  style?: React.CSSProperties;
}

export const StaticImage: React.FC<StaticImageProps> = ({
  src,
  width = "100%",
  height = "100%",
  objectFit = "cover",
  opacity = 1,
  style,
}) => {
  return (
    <Img
      src={staticFile(src)}
      style={{
        width,
        height,
        objectFit,
        opacity,
        ...style,
      }}
    />
  );
};
