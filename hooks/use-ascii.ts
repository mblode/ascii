"use client";

import { useCallback, useEffect, useState } from "react";
import { renderAscii } from "@/lib/ascii/core";
import type { AsciiRenderOptions, AsciiRenderResult } from "@/lib/ascii/types";
import { useDebounce } from "./use-debounce";

/**
 * Simplified ASCII render parameters exposed to the UI.
 */
export interface AsciiParameters {
  foreground: string;
  background: string;
  contrast: number;
  columns: number;
}

const DEFAULT_PARAMETERS: AsciiParameters = {
  foreground: "#ffffff",
  background: "#000000",
  contrast: 0,
  columns: 100,
};

/**
 * Convert simplified AsciiParameters to full AsciiRenderOptions.
 * Derives cell dimensions from target columns and source image width.
 */
const toRenderOptions = (
  params: AsciiParameters,
  imageWidth: number
): AsciiRenderOptions => {
  // Derive cell size from target columns
  const cellWidth = Math.max(1, Math.floor(imageWidth / params.columns));
  const cellHeight = Math.round(cellWidth * 1.75);

  return {
    foreground: params.foreground,
    background: params.background,
    brightness: 0,
    contrast: params.contrast,
    contrastExponent: 2.0,
    directionalContrastExponent: 3.0,
    cellWidth,
    cellHeight,
    maxWidth: null,
    sampleCount: 12,
    output: "both",
  };
};

/**
 * Hook for ASCII rendering with debounced parameter updates.
 */
export function useAscii() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [asciiResult, setAsciiResult] = useState<AsciiRenderResult | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<AsciiParameters>(DEFAULT_PARAMETERS);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Debounce parameters for real-time updates (300ms)
  const debouncedParams = useDebounce(parameters, 300);

  // Process image when parameters or uploaded image changes
  useEffect(() => {
    if (!uploadedImage) {
      setAsciiResult(null);
      return;
    }

    const processAscii = async () => {
      setIsProcessing(true);

      try {
        // Load image to get original dimensions
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const imgEl = new Image();
          imgEl.onload = () => {
            URL.revokeObjectURL(imgEl.src);
            resolve(imgEl);
          };
          imgEl.onerror = reject;
          imgEl.src = URL.createObjectURL(uploadedImage);
        });

        // Set original dimensions if this is a new image
        if (!originalDimensions || originalDimensions.width !== img.width) {
          setOriginalDimensions({ width: img.width, height: img.height });
        }

        // Draw image to canvas to get ImageData
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Apply ASCII rendering with image dimensions
        const renderOptions = toRenderOptions(debouncedParams, imageData.width);
        const result = renderAscii(imageData, renderOptions);

        setAsciiResult(result);
      } catch (error) {
        console.error("ASCII rendering error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processAscii();
  }, [uploadedImage, debouncedParams, originalDimensions]);

  const updateParameters = useCallback((updates: Partial<AsciiParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  // For compatibility with existing UI, expose ditheredImage as alias
  const ditheredImage = asciiResult?.imageData ?? null;

  return {
    uploadedImage,
    asciiResult,
    ditheredImage,
    asciiGrid: asciiResult?.grid ?? null,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  };
}
