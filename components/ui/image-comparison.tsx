"use client";

import { ArrowExpandHorIcon } from "@fingertip/icons";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageComparisonProps {
  beforeSource: CanvasImageSource;
  afterImageData: ImageData;
  beforeLabel?: string;
  afterLabel?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export function ImageComparison({
  beforeSource,
  afterImageData,
  beforeLabel = "Original",
  afterLabel = "Dithered",
  dimensions,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const latestClientXRef = useRef<number | null>(null);

  const width = dimensions?.width ?? afterImageData.width;
  const height = dimensions?.height ?? afterImageData.height;

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) {
      return;
    }
    const rect = sliderRef.current.getBoundingClientRect();
    const newSliderPosition = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newSliderPosition)));
  }, []);

  const onDragging = useCallback(
    (e: PointerEvent) => {
      if (!(sliderRef.current && isDraggingRef.current)) {
        return;
      }

      latestClientXRef.current = e.clientX;

      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const latest = latestClientXRef.current;
        if (latest === null || !isDraggingRef.current) {
          return;
        }
        updateSliderPosition(latest);
      });
    },
    [updateSliderPosition]
  );

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    latestClientXRef.current = null;
    document.removeEventListener("pointermove", onDragging);
    document.removeEventListener("pointerup", stopDragging);
  }, [onDragging]);

  const startDragging = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      updateSliderPosition(e.clientX);
      document.addEventListener("pointermove", onDragging);
      document.addEventListener("pointerup", stopDragging);
    },
    [onDragging, stopDragging, updateSliderPosition]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      document.removeEventListener("pointermove", onDragging);
      document.removeEventListener("pointerup", stopDragging);
    };
  }, [onDragging, stopDragging]);

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
      ref={sliderRef}
      style={{
        aspectRatio: `${width} / ${height}`,
        maxHeight: "90vh",
        maxWidth: `min(100%, calc(90vh * ${aspectRatio}))`,
      }}
    >
      {/* After Image (Right side - background) */}
      <div className="absolute inset-0">
        <canvas
          aria-label={afterLabel}
          className="size-full [image-rendering:pixelated]"
          ref={afterCanvasRef}
          role="img"
        />
      </div>

      {/* Before Image (Left side - clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0% 100%)`,
        }}
      >
        <canvas
          aria-label={beforeLabel}
          className="size-full"
          ref={beforeCanvasRef}
          role="img"
        />
      </div>

      {/* Labels */}
      {beforeLabel && (
        <div className="absolute top-3 left-3 z-10">
          <div className="rounded-md bg-background/90 px-2 py-1 font-medium text-xs shadow-sm backdrop-blur-sm">
            {beforeLabel}
          </div>
        </div>
      )}

      {afterLabel && (
        <div className="absolute top-3 right-3 z-10">
          <div className="rounded-md bg-background/90 px-2 py-1 font-medium text-xs shadow-sm backdrop-blur-sm">
            {afterLabel}
          </div>
        </div>
      )}

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 z-20 flex -translate-x-1/2 cursor-ew-resize items-center justify-center"
        onPointerDown={startDragging}
        style={{ left: `${sliderPosition}%`, touchAction: "none" }}
      >
        {/* Slider Button */}
        <div className="relative z-10 flex size-11 items-center justify-center rounded-full bg-background text-foreground shadow-md ring-1 ring-border md:size-9">
          <ArrowExpandHorIcon
            aria-label="Drag to compare images"
            className="h-5 w-5"
            role="img"
          />
        </div>

        {/* Vertical Line */}
        <div className="absolute h-full w-0.5 bg-border" />
      </div>
    </div>
  );
}
