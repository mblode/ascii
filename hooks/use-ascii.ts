"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AsciiRenderOptions, AsciiRenderResult } from "@/lib/ascii/types";
import { renderAsciiAsync } from "@/lib/ascii/worker-client";
import { useDebounce } from "./use-debounce";

/**
 * Simplified ASCII render parameters exposed to the UI.
 */
export interface AsciiParameters {
  foreground: string;
  background: string;
  contrastExponent: number;
  columns: number;
}

const DEFAULT_PARAMETERS: AsciiParameters = {
  foreground: "#ffffff",
  background: "#000000",
  contrastExponent: 2,
  columns: 100,
};

const MAX_IMAGE_DIMENSION = 1400;

const getScaledDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number; scale: number } => {
  const maxSide = Math.max(width, height);
  if (maxSide <= maxDimension) {
    return { width, height, scale: 1 };
  }

  const scale = maxDimension / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    img.src = url;
  });
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
  const fontSize = Math.round(cellHeight * 0.85);

  return {
    foreground: params.foreground,
    background: params.background,
    brightness: 0,
    contrast: 0,
    contrastExponent: Math.max(1, params.contrastExponent),
    directionalContrastExponent: Math.min(
      8,
      Math.max(1, params.contrastExponent * 2)
    ),
    cellWidth,
    cellHeight,
    font: { family: "Courier New, Courier, monospace", size: fontSize },
    maxWidth: null,
    sampleCount: 3,
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
  const [renderDimensions, setRenderDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const loadRequestIdRef = useRef(0);
  const renderRequestIdRef = useRef(0);

  // Debounce parameters for real-time updates (300ms)
  const debouncedParams = useDebounce(parameters, 300);

  // Load and scale image when a new file is uploaded.
  useEffect(() => {
    if (!uploadedImage) {
      setAsciiResult(null);
      setPreviewCanvas(null);
      setRenderDimensions(null);
      setIsProcessing(false);
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    renderRequestIdRef.current += 1;
    setPreviewCanvas(null);
    setAsciiResult(null);
    setIsProcessing(true);

    const loadImage = async () => {
      try {
        const img = await loadImageFromFile(uploadedImage);
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        const scaled = getScaledDimensions(
          originalWidth,
          originalHeight,
          MAX_IMAGE_DIMENSION
        );

        setRenderDimensions((prev) => {
          if (
            prev &&
            prev.width === scaled.width &&
            prev.height === scaled.height
          ) {
            return prev;
          }
          return { width: scaled.width, height: scaled.height };
        });

        const canvas = document.createElement("canvas");
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, scaled.width, scaled.height);

        if (requestId !== loadRequestIdRef.current) {
          return;
        }
        setPreviewCanvas(canvas);
      } catch (error) {
        console.error("Image load error:", error);
        if (requestId === loadRequestIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    loadImage();
  }, [uploadedImage]);

  // Render ASCII whenever parameters or the scaled source changes.
  useEffect(() => {
    if (!previewCanvas) {
      return;
    }

    const requestId = ++renderRequestIdRef.current;
    setIsProcessing(true);

    const processAscii = async () => {
      try {
        const ctx = previewCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        const imageData = ctx.getImageData(
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
        );

        const renderOptions = toRenderOptions(debouncedParams, imageData.width);
        const result = await renderAsciiAsync(imageData, renderOptions);

        if (requestId !== renderRequestIdRef.current) {
          return;
        }
        setAsciiResult(result);
      } catch (error) {
        console.error("ASCII rendering error:", error);
      } finally {
        if (requestId === renderRequestIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    processAscii();
  }, [debouncedParams, previewCanvas]);

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
    previewCanvas,
    renderDimensions,
    setUploadedImage,
    updateParameters,
  };
}
