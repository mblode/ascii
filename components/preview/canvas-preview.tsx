"use client";

import { Images1Icon } from "@fingertip/icons";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageComparison } from "@/components/ui/image-comparison";
import { Skeleton } from "@/components/ui/skeleton";

const HOLD_DELAY_MS = 150;

interface CanvasPreviewProps {
  uploadedImage: File | null;
  ditheredImage: ImageData | null;
  previewCanvas: HTMLCanvasElement | null;
  isProcessing: boolean;
  showOriginal: boolean;
  onBrowse?: () => void;
}

export function CanvasPreview({
  uploadedImage,
  ditheredImage,
  previewCanvas,
  isProcessing,
  showOriginal,
  onBrowse,
}: CanvasPreviewProps) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  const handlePointerDown = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
    }, HOLD_DELAY_MS);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const effectiveShowOriginal = showOriginal || isHolding;

  const handleBrowseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onBrowse?.();
  };
  const comparisonDimensions = ditheredImage
    ? { width: ditheredImage.width, height: ditheredImage.height }
    : null;

  if (!uploadedImage) {
    return (
      <div className="flex w-full max-w-2xl cursor-pointer items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-border border-dashed p-12 text-center">
          <Images1Icon
            aria-hidden="true"
            className="h-16 w-16 text-muted-foreground"
          />
          <div className="flex flex-col gap-1">
            <p
              className="font-medium text-foreground"
              style={{ textWrap: "balance" }}
            >
              Drop an image here
            </p>
            <p
              className="text-muted-foreground text-sm leading-[1.6]"
              style={{ textWrap: "pretty" }}
            >
              or drag and drop anywhere on this area
            </p>
          </div>
          {onBrowse && (
            <button
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 font-medium text-sm shadow-xs transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={handleBrowseClick}
              type="button"
            >
              Browse
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-center">
      {previewCanvas && ditheredImage ? (
        <>
          <button
            aria-label="Hold to compare with original"
            className="data-motion-scale fade-in-0 zoom-in-95 block w-full max-w-full animate-in cursor-pointer touch-manipulation select-none appearance-none border-none bg-transparent p-0 text-left duration-250 [animation-timing-function:var(--ease-enter)] focus-visible:outline-hidden"
            onContextMenu={(e) => e.preventDefault()}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            type="button"
          >
            <ImageComparison
              afterImageData={ditheredImage}
              beforeSource={previewCanvas}
              dimensions={comparisonDimensions ?? undefined}
              showOriginal={effectiveShowOriginal}
            />
          </button>
          {effectiveShowOriginal && (
            <div className="fade-in-0 pointer-events-none absolute inset-0 flex animate-in items-start justify-center pt-4 duration-150">
              <div className="rounded-full bg-background/90 px-3 py-1.5 font-medium text-sm shadow-sm ring-1 ring-border backdrop-blur-sm">
                Original
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="fade-in-0 pointer-events-none absolute inset-0 flex animate-in items-center justify-center rounded-lg bg-background/80 duration-200">
              <div className="data-motion-scale fade-in-0 zoom-in-95 animate-in rounded-full bg-background px-3 py-1.5 font-medium text-sm shadow-sm ring-1 ring-border duration-200 [animation-timing-function:var(--ease-enter)]">
                Processing&hellip;
              </div>
            </div>
          )}
        </>
      ) : (
        isProcessing && (
          <div className="flex h-[600px] w-[800px] max-w-[90vw] items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )
      )}
    </div>
  );
}
