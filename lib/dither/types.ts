export interface DitherParameters {
  foreground: string; // Hex color
  background: string; // Hex color
  contrast: number; // -100 to 100 (0 = original)
  brightness: number; // -100 to 100 (0 = original)
  noiseSize: number; // 64, 128, 256 (internal, not exposed in UI)
  maxWidth?: number | null; // Max width in pixels, null = original size
  pixelSize: number; // 1 = no pixelation, 2 = 2x2 blocks, 4 = 4x4 blocks, etc.
}

export interface NoiseTexture {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
