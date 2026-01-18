"use client";

import { Images1Icon } from "@fingertip/icons";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ImageComparison } from "@/components/ui/image-comparison";
import { Skeleton } from "@/components/ui/skeleton";

interface CanvasPreviewProps {
  uploadedImage: File | null;
  ditheredImage: ImageData | null;
  isProcessing: boolean;
  onBrowse?: () => void;
}

export function CanvasPreview({
  uploadedImage,
  ditheredImage,
  isProcessing,
  onBrowse,
}: CanvasPreviewProps) {
  const handleBrowseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onBrowse?.();
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ditheredImageUrl, setDitheredImageUrl] = useState<string | null>(null);
  const comparisonDimensions = ditheredImage
    ? { width: ditheredImage.width, height: ditheredImage.height }
    : null;

  // Convert uploaded image to blob URL
  const originalImageUrl = useMemo(() => {
    if (!uploadedImage) {
      return null;
    }
    return URL.createObjectURL(uploadedImage);
  }, [uploadedImage]);

  // Convert dithered ImageData to blob URL
  useEffect(() => {
    if (!(ditheredImage && canvasRef.current)) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(ditheredImage, 0, 0);
      setDitheredImageUrl(canvas.toDataURL("image/png"));
    }
  }, [ditheredImage]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
      }
    };
  }, [originalImageUrl]);

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
      {originalImageUrl && ditheredImageUrl ? (
        <>
          <section
            aria-label="Image comparison showing original and dithered versions"
            className="data-motion-scale fade-in-0 zoom-in-95 block w-full max-w-full animate-in duration-250 [animation-timing-function:var(--ease-enter)]"
          >
            <ImageComparison
              afterImage={ditheredImageUrl}
              afterLabel="Dithered"
              beforeImage={originalImageUrl}
              beforeLabel="Original"
              dimensions={comparisonDimensions ?? undefined}
            />
          </section>
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
      <canvas className="hidden" ref={canvasRef} />
    </div>
  );
}
