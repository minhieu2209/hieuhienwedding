"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Fall back to the original local image if the optimization endpoint fails.
export default function WeddingImage({ quality = 90, alt, onError, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState("");
  const source = typeof props.src === "string" ? props.src : "default" in props.src ? props.src.default.src : props.src.src;
  return <Image {...props} alt={alt} quality={quality} unoptimized={props.unoptimized || failedSource === source} onError={event => {
    if (failedSource !== source) setFailedSource(source);
    onError?.(event);
  }} />;
}
