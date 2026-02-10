"use client";

import { useEffect, useRef } from "react";

interface ImageComparisonProps {
  beforeSource: CanvasImageSource;
  afterImageData: ImageData;
  showOriginal: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export function ImageComparison({
  beforeSource,
  afterImageData,
  showOriginal,
  dimensions,
}: ImageComparisonProps) {
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);

  const width = dimensions?.width ?? afterImageData.width;
  const height = dimensions?.height ?? afterImageData.height;

  useEffect(() => {
    if (!afterCanvasRef.current) {
      return;
    }

    const canvas = afterCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.putImageData(afterImageData, 0, 0);
  }, [afterImageData, height, width]);

  useEffect(() => {
    if (!beforeCanvasRef.current) {
      return;
    }

    const canvas = beforeCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(beforeSource, 0, 0, width, height);
  }, [beforeSource, height, width]);

  const aspectRatio = width / height;

  return (
    <div
      className="relative mx-auto w-full max-w-full overflow-hidden rounded-lg shadow-sm"
      style={{
        aspectRatio: `${width} / ${height}`,
        maxHeight: "90vh",
        maxWidth: `min(100%, calc(90vh * ${aspectRatio}))`,
      }}
    >
      <div className={showOriginal ? "hidden" : "block"}>
        <canvas
          aria-label="ASCII rendering"
          className="size-full [image-rendering:pixelated]"
          ref={afterCanvasRef}
          role="img"
        />
      </div>

      <div className={showOriginal ? "block" : "hidden"}>
        <canvas
          aria-label="Original image"
          className="size-full"
          ref={beforeCanvasRef}
          role="img"
        />
      </div>
    </div>
  );
}
