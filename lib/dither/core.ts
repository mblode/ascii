import type { DitherParameters, NoiseTexture } from "./types";
import { applyBrightness, applyContrast, hexToRgb, wrap } from "./utils";

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize an image using Canvas API
 */
function _resizeImage(
  img: HTMLImageElement,
  maxWidth?: number,
  maxHeight?: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let width = img.width;
  let height = img.height;

  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  // CRITICAL FIX: Floor dimensions before use to prevent fractional pixels
  const flooredWidth = Math.floor(width);
  const flooredHeight = Math.floor(height);

  const canvas = document.createElement("canvas");
  canvas.width = flooredWidth;
  canvas.height = flooredHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, flooredWidth, flooredHeight);

  return { canvas, width: flooredWidth, height: flooredHeight };
}

/**
 * Apply blue noise dithering to an image
 * Adapted from blue-noise-typescript/src/dither.ts for browser use
 */
export async function applyDither(
  imageFile: File,
  noise: NoiseTexture,
  params: DitherParameters
): Promise<ImageData> {
  const fg = hexToRgb(params.foreground);
  const bg = hexToRgb(params.background);

  // Load image
  const img = await loadImage(imageFile);

  // Calculate target dimensions before pixelation
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (
    params.maxWidth !== null &&
    params.maxWidth !== undefined &&
    img.width > params.maxWidth
  ) {
    targetHeight = Math.floor((img.height * params.maxWidth) / img.width);
    targetWidth = params.maxWidth;
  }

  // Calculate dimensions for dithering (downscaled by pixelSize)
  const pixelSize = Math.floor(params.pixelSize);
  const ditherWidth = Math.max(1, Math.floor(targetWidth / pixelSize));
  const ditherHeight = Math.max(1, Math.floor(targetHeight / pixelSize));

  // Create canvas for downscaled image (this is what we'll dither)
  const canvas = document.createElement("canvas");
  canvas.width = ditherWidth;
  canvas.height = ditherHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, ditherWidth, ditherHeight);

  const width = ditherWidth;
  const height = ditherHeight;

  // Get image data
  let imageData = ctx.getImageData(0, 0, width, height);

  // Apply tone adjustments
  if (params.brightness !== 0) {
    imageData = applyBrightness(imageData, params.brightness);
  }

  if (params.contrast !== 0) {
    imageData = applyContrast(imageData, params.contrast);
  }

  // Convert to grayscale
  const grayscaleData = new Uint8ClampedArray(width * height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    grayscaleData[i / 4] = avg;
  }

  // Apply dithering algorithm (copied from dither.ts:111-138)
  const outputData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const wrapX = wrap(noise.width, x);
      const wrapY = wrap(noise.height, y);

      const noiseIdx = wrapY * noise.width + wrapX;
      const imageIdx = y * width + x;
      const outputIdx = imageIdx * 4;

      const noiseLuma = noise.data[noiseIdx];
      const imageLuma = grayscaleData[imageIdx];

      const isBright = imageLuma > noiseLuma;

      if (isBright) {
        outputData[outputIdx] = bg.r;
        outputData[outputIdx + 1] = bg.g;
        outputData[outputIdx + 2] = bg.b;
      } else {
        outputData[outputIdx] = fg.r;
        outputData[outputIdx + 1] = fg.g;
        outputData[outputIdx + 2] = fg.b;
      }
      outputData[outputIdx + 3] = 255; // Alpha
    }
  }

  // If pixelSize > 1, upscale using nearest-neighbor to create blocky pixels
  if (pixelSize > 1) {
    const upscaledWidth = targetWidth;
    const upscaledHeight = targetHeight;
    const upscaledData = new Uint8ClampedArray(
      upscaledWidth * upscaledHeight * 4
    );

    // Nearest-neighbor upscaling
    for (let y = 0; y < upscaledHeight; y++) {
      for (let x = 0; x < upscaledWidth; x++) {
        // Map to source pixel
        const srcX = Math.min(width - 1, Math.floor(x / pixelSize));
        const srcY = Math.min(height - 1, Math.floor(y / pixelSize));
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * upscaledWidth + x) * 4;

        upscaledData[dstIdx] = outputData[srcIdx];
        upscaledData[dstIdx + 1] = outputData[srcIdx + 1];
        upscaledData[dstIdx + 2] = outputData[srcIdx + 2];
        upscaledData[dstIdx + 3] = 255;
      }
    }

    return new ImageData(upscaledData, upscaledWidth, upscaledHeight);
  }

  return new ImageData(outputData, width, height);
}
