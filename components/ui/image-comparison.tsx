"use client";

import { useEffect, useRef, useState } from "react";

interface ImageComparisonProps {
  beforeSource: CanvasImageSource;
  afterImageData: ImageData;
  dimensions?: {
    width: number;
    height: number;
  };
}

export function ImageComparison({
  beforeSource,
  afterImageData,
  dimensions,
}: ImageComparisonProps) {
  const [showOriginal, setShowOriginal] = useState(false);
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
          aria-label="Dithered"
          className="size-full [image-rendering:pixelated]"
          ref={afterCanvasRef}
          role="img"
        />
      </div>

      <div className={showOriginal ? "block" : "hidden"}>
        <canvas
          aria-label="Original"
          className="size-full"
          ref={beforeCanvasRef}
          role="img"
        />
      </div>

      <button
        className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-md bg-background/90 px-2 py-1 font-medium text-xs shadow-sm ring-1 ring-border backdrop-blur-sm"
        onClick={() => setShowOriginal((prev) => !prev)}
        type="button"
      >
        {showOriginal ? "Original" : "Dithered"}
      </button>
    </div>
  );
}
