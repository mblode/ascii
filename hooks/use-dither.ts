
"use client";

import { useCallback, useEffect, useState } from "react";
import { applyDither } from "@/lib/dither/core";
import type { DitherParameters } from "@/lib/dither/types";
import { loadNoiseTexture, NOISE_TEXTURES } from "@/lib/noise/textures";
import { useDebounce } from "./use-debounce";

const DEFAULT_PARAMETERS: DitherParameters = {
  foreground: "#000000",
  background: "#ffffff",
  contrast: 0,
  brightness: 0,
  noiseSize: 256,
  maxWidth: null,
  pixelSize: 1,
};

export function useDither() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [ditheredImage, setDitheredImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parameters, setParameters] =
    useState<DitherParameters>(DEFAULT_PARAMETERS);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Debounce parameters for real-time updates (300ms)
  const debouncedParams = useDebounce(parameters, 300);

  // Process image when parameters or uploaded image changes
  useEffect(() => {
    if (!uploadedImage) {
      setDitheredImage(null);
      return;
    }

    const processDither = async () => {
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

        // Set original dimensions and calculate pixelSize if this is a new image
        if (!originalDimensions || originalDimensions.width !== img.width) {
          setOriginalDimensions({ width: img.width, height: img.height });

          // Calculate pixelSize as originalWidth / 512 and reset maxWidth to use original size
          const calculatedPixelSize = Math.max(1, Math.round(img.width / 512));
          setParameters((prev) => ({
            ...prev,
            pixelSize: calculatedPixelSize,
            maxWidth: null,
          }));
        }

        // Find noise texture
        const noiseTexture = NOISE_TEXTURES.find(
          (t) => t.size === debouncedParams.noiseSize
        );
        if (!noiseTexture) {
          throw new Error("Noise texture not found");
        }

        // Load noise texture
        const noise = await loadNoiseTexture(noiseTexture.dataUrl);

        // Apply dithering
        const result = await applyDither(uploadedImage, noise, debouncedParams);

        setDitheredImage(result);
      } catch (error) {
        console.error("Dithering error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processDither();
  }, [uploadedImage, debouncedParams, originalDimensions]);

  const updateParameters = useCallback((updates: Partial<DitherParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  };
}
