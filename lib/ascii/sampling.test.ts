/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  applyBrightnessContrast,
  prepareSamplingLayout,
  rgbToLuminance,
} from "./sampling";
import type { AsciiSamplingLayout } from "./types";

describe("rgbToLuminance", () => {
  it("should return 0 for pure black (0, 0, 0)", () => {
    expect(rgbToLuminance(0, 0, 0)).toBe(0);
  });

  it("should return 1 for pure white (255, 255, 255)", () => {
    expect(rgbToLuminance(255, 255, 255)).toBeCloseTo(1, 10);
  });

  it("should calculate correct luminance for pure red (255, 0, 0)", () => {
    const expected = (0.2126 * 255) / 255;
    expect(rgbToLuminance(255, 0, 0)).toBeCloseTo(expected, 5);
    expect(rgbToLuminance(255, 0, 0)).toBeCloseTo(0.2126, 5);
  });

  it("should calculate correct luminance for pure green (0, 255, 0)", () => {
    const expected = (0.7152 * 255) / 255;
    expect(rgbToLuminance(0, 255, 0)).toBeCloseTo(expected, 5);
    expect(rgbToLuminance(0, 255, 0)).toBeCloseTo(0.7152, 5);
  });

  it("should calculate correct luminance for pure blue (0, 0, 255)", () => {
    const expected = (0.0722 * 255) / 255;
    expect(rgbToLuminance(0, 0, 255)).toBeCloseTo(expected, 5);
    expect(rgbToLuminance(0, 0, 255)).toBeCloseTo(0.0722, 5);
  });

  it("should calculate correct luminance for mid-gray (128, 128, 128)", () => {
    const expected = (0.2126 * 128 + 0.7152 * 128 + 0.0722 * 128) / 255;
    expect(rgbToLuminance(128, 128, 128)).toBeCloseTo(expected, 5);
    expect(rgbToLuminance(128, 128, 128)).toBeCloseTo(0.502, 3);
  });

  it("should give highest weight to green channel", () => {
    const redLum = rgbToLuminance(100, 0, 0);
    const greenLum = rgbToLuminance(0, 100, 0);
    const blueLum = rgbToLuminance(0, 0, 100);

    expect(greenLum).toBeGreaterThan(redLum);
    expect(greenLum).toBeGreaterThan(blueLum);
    expect(redLum).toBeGreaterThan(blueLum);
  });

  it("should handle typical RGB values correctly", () => {
    // Example: A typical orange color
    const luminance = rgbToLuminance(255, 165, 0);
    const expected = (0.2126 * 255 + 0.7152 * 165 + 0.0722 * 0) / 255;
    expect(luminance).toBeCloseTo(expected, 5);
  });

  it("should return values in the 0-1 range", () => {
    const testCases = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 64, 32],
      [200, 150, 100],
      [50, 100, 150],
    ];

    for (const [r, g, b] of testCases) {
      const result = rgbToLuminance(r, g, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    }
  });
});

describe("prepareSamplingLayout", () => {
  it("should create Float32Array offsets for internal circles", () => {
    const layout: AsciiSamplingLayout = {
      internal: [
        { x: 0.5, y: 0.5, r: 0.3 },
        { x: 0.2, y: 0.8, r: 0.15 },
      ],
      external: [],
      externalInfluence: [],
    };

    const result = prepareSamplingLayout(layout, 10, 20, 5);

    expect(result.internalOffsets).toHaveLength(2);
    expect(result.internalOffsets[0]).toBeInstanceOf(Float32Array);
    expect(result.internalOffsets[1]).toBeInstanceOf(Float32Array);
  });

  it("should create Float32Array offsets for external circles", () => {
    const layout: AsciiSamplingLayout = {
      internal: [],
      external: [
        { x: 0.0, y: 0.5, r: 0.2 },
        { x: 1.0, y: 0.5, r: 0.2 },
        { x: 0.5, y: 0.0, r: 0.2 },
      ],
      externalInfluence: [],
    };

    const result = prepareSamplingLayout(layout, 10, 20, 8);

    expect(result.externalOffsets).toHaveLength(3);
    expect(result.externalOffsets[0]).toBeInstanceOf(Float32Array);
    expect(result.externalOffsets[1]).toBeInstanceOf(Float32Array);
    expect(result.externalOffsets[2]).toBeInstanceOf(Float32Array);
  });

  it("should store correct sampleCount in prepared layout", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [],
      externalInfluence: [],
    };

    const sampleCount = 12;
    const result = prepareSamplingLayout(layout, 10, 20, sampleCount);

    expect(result.sampleCount).toBe(sampleCount);
  });

  it("should store cellWidth and cellHeight in prepared layout", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [],
      externalInfluence: [],
    };

    const cellWidth = 15;
    const cellHeight = 25;
    const result = prepareSamplingLayout(layout, cellWidth, cellHeight, 5);

    expect(result.cellWidth).toBe(cellWidth);
    expect(result.cellHeight).toBe(cellHeight);
  });

  it("should store original layout in prepared layout", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [{ x: 0.0, y: 0.5, r: 0.2 }],
      externalInfluence: [[1, 0]],
    };

    const result = prepareSamplingLayout(layout, 10, 20, 5);

    expect(result.layout).toBe(layout);
    expect(result.layout.internal).toHaveLength(1);
    expect(result.layout.external).toHaveLength(1);
  });

  it("should create offsets with correct length (sampleCount * 2)", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [{ x: 0.0, y: 0.5, r: 0.2 }],
      externalInfluence: [],
    };

    const sampleCount = 10;
    const result = prepareSamplingLayout(layout, 10, 20, sampleCount);

    // Each offset array should have sampleCount * 2 elements (x, y pairs)
    expect(result.internalOffsets[0].length).toBe(sampleCount * 2);
    expect(result.externalOffsets[0].length).toBe(sampleCount * 2);
  });

  it("should handle layout with no circles", () => {
    const layout: AsciiSamplingLayout = {
      internal: [],
      external: [],
      externalInfluence: [],
    };

    const result = prepareSamplingLayout(layout, 10, 20, 5);

    expect(result.internalOffsets).toHaveLength(0);
    expect(result.externalOffsets).toHaveLength(0);
  });

  it("should handle different sampleCount values", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [],
      externalInfluence: [],
    };

    const result1 = prepareSamplingLayout(layout, 10, 20, 1);
    const result2 = prepareSamplingLayout(layout, 10, 20, 50);
    const result3 = prepareSamplingLayout(layout, 10, 20, 100);

    expect(result1.internalOffsets[0].length).toBe(2);
    expect(result2.internalOffsets[0].length).toBe(100);
    expect(result3.internalOffsets[0].length).toBe(200);
  });

  it("should generate offsets within unit circle range", () => {
    const layout: AsciiSamplingLayout = {
      internal: [{ x: 0.5, y: 0.5, r: 0.3 }],
      external: [],
      externalInfluence: [],
    };

    const result = prepareSamplingLayout(layout, 10, 20, 100);
    const offsets = result.internalOffsets[0];

    // Check that all offset pairs are within unit circle (radius <= 1)
    for (let i = 0; i < offsets.length; i += 2) {
      const x = offsets[i];
      const y = offsets[i + 1];
      const distance = Math.sqrt(x * x + y * y);
      expect(distance).toBeLessThanOrEqual(1.0);
    }
  });
});

describe("applyBrightnessContrast", () => {
  describe("neutral adjustments", () => {
    it("should return unchanged values with neutral brightness (0) and contrast (1)", () => {
      const input = [0, 0.25, 0.5, 0.75, 1.0];
      const result = applyBrightnessContrast(input, 0, 1);

      expect(result).toHaveLength(input.length);
      for (let i = 0; i < input.length; i++) {
        expect(result[i]).toBeCloseTo(input[i], 5);
      }
    });

    it("should not modify the original array", () => {
      const input = [0.2, 0.5, 0.8];
      const original = [...input];
      applyBrightnessContrast(input, 0.3, 1.5);

      expect(input).toEqual(original);
    });
  });

  describe("brightness adjustments", () => {
    it("should increase brightness with positive values", () => {
      const input = [0.3, 0.5, 0.7];
      const result = applyBrightnessContrast(input, 0.2, 1);

      expect(result[0]).toBeCloseTo(0.5, 5);
      expect(result[1]).toBeCloseTo(0.7, 5);
      expect(result[2]).toBeCloseTo(0.9, 5);
    });

    it("should decrease brightness with negative values", () => {
      const input = [0.3, 0.5, 0.7];
      const result = applyBrightnessContrast(input, -0.2, 1);

      expect(result[0]).toBeCloseTo(0.1, 5);
      expect(result[1]).toBeCloseTo(0.3, 5);
      expect(result[2]).toBeCloseTo(0.5, 5);
    });

    it("should clamp brightness to 0 when too dark", () => {
      const input = [0.1, 0.2, 0.3];
      const result = applyBrightnessContrast(input, -0.5, 1);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it("should clamp brightness to 1 when too bright", () => {
      const input = [0.7, 0.8, 0.9];
      const result = applyBrightnessContrast(input, 0.5, 1);

      expect(result[0]).toBe(1);
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(1);
    });
  });

  describe("contrast adjustments", () => {
    it("should increase contrast with values > 1", () => {
      const input = [0.3, 0.5, 0.7];
      const result = applyBrightnessContrast(input, 0, 2);

      // Values below 0.5 should get darker, above 0.5 should get brighter
      // Formula: (value - 0.5) * contrast + 0.5
      expect(result[0]).toBeCloseTo(0.1, 5); // (0.3 - 0.5) * 2 + 0.5 = 0.1
      expect(result[1]).toBeCloseTo(0.5, 5); // (0.5 - 0.5) * 2 + 0.5 = 0.5
      expect(result[2]).toBeCloseTo(0.9, 5); // (0.7 - 0.5) * 2 + 0.5 = 0.9
    });

    it("should decrease contrast with values < 1", () => {
      const input = [0.1, 0.5, 0.9];
      const result = applyBrightnessContrast(input, 0, 0.5);

      // All values should move toward 0.5
      expect(result[0]).toBeCloseTo(0.3, 5); // (0.1 - 0.5) * 0.5 + 0.5 = 0.3
      expect(result[1]).toBeCloseTo(0.5, 5); // (0.5 - 0.5) * 0.5 + 0.5 = 0.5
      expect(result[2]).toBeCloseTo(0.7, 5); // (0.9 - 0.5) * 0.5 + 0.5 = 0.7
    });

    it("should flatten to 0.5 with contrast of 0", () => {
      const input = [0.0, 0.25, 0.5, 0.75, 1.0];
      const result = applyBrightnessContrast(input, 0, 0);

      for (const value of result) {
        expect(value).toBeCloseTo(0.5, 5);
      }
    });

    it("should preserve midpoint (0.5) regardless of contrast", () => {
      const input = [0.5];
      const contrasts = [0, 0.5, 1, 1.5, 2, 3];

      for (const contrast of contrasts) {
        const result = applyBrightnessContrast(input, 0, contrast);
        expect(result[0]).toBeCloseTo(0.5, 5);
      }
    });
  });

  describe("combined adjustments", () => {
    it("should apply both brightness and contrast correctly", () => {
      const input = [0.3, 0.5, 0.7];
      const result = applyBrightnessContrast(input, 0.1, 1.5);

      // Formula: (value - 0.5) * contrast + 0.5 + brightness
      expect(result[0]).toBeCloseTo(0.3, 5); // (0.3 - 0.5) * 1.5 + 0.5 + 0.1 = 0.3
      expect(result[1]).toBeCloseTo(0.6, 5); // (0.5 - 0.5) * 1.5 + 0.5 + 0.1 = 0.6
      expect(result[2]).toBeCloseTo(0.9, 5); // (0.7 - 0.5) * 1.5 + 0.5 + 0.1 = 0.9
    });

    it("should handle negative brightness and high contrast", () => {
      const input = [0.4, 0.5, 0.6];
      const result = applyBrightnessContrast(input, -0.1, 2);

      expect(result[0]).toBeCloseTo(0.2, 5); // (0.4 - 0.5) * 2 + 0.5 - 0.1 = 0.2
      expect(result[1]).toBeCloseTo(0.4, 5); // (0.5 - 0.5) * 2 + 0.5 - 0.1 = 0.4
      expect(result[2]).toBeCloseTo(0.6, 5); // (0.6 - 0.5) * 2 + 0.5 - 0.1 = 0.6
    });
  });

  describe("clamping behavior", () => {
    it("should clamp all values to 0-1 range", () => {
      const input = [0.1, 0.3, 0.5, 0.7, 0.9];
      const result = applyBrightnessContrast(input, 0.5, 3);

      for (const value of result) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it("should handle extreme brightness that would exceed bounds", () => {
      const input = [0.5];

      const result1 = applyBrightnessContrast(input, 2, 1);
      expect(result1[0]).toBe(1);

      const result2 = applyBrightnessContrast(input, -2, 1);
      expect(result2[0]).toBe(0);
    });

    it("should handle extreme contrast that would exceed bounds", () => {
      const input = [0.8];
      const result = applyBrightnessContrast(input, 0, 10);

      expect(result[0]).toBe(1);
    });

    it("should handle combined extremes correctly", () => {
      const input = [0.2, 0.8];
      const result = applyBrightnessContrast(input, 0.6, 5);

      // (0.2 - 0.5) * 5 + 0.5 + 0.6 = -1.5 + 0.5 + 0.6 = -0.4 -> clamped to 0
      expect(result[0]).toBe(0);
      // (0.8 - 0.5) * 5 + 0.5 + 0.6 = 1.5 + 0.5 + 0.6 = 2.6 -> clamped to 1
      expect(result[1]).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = applyBrightnessContrast([], 0.5, 1.5);
      expect(result).toHaveLength(0);
    });

    it("should handle single value array", () => {
      const result = applyBrightnessContrast([0.7], 0.2, 1.2);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(1);
    });

    it("should handle array with all zeros", () => {
      const input = [0, 0, 0];
      const result = applyBrightnessContrast(input, 0.3, 1.5);

      for (const value of result) {
        expect(value).toBeCloseTo(0.05, 5); // (0 - 0.5) * 1.5 + 0.5 + 0.3 = 0.05
      }
    });

    it("should handle array with all ones", () => {
      const input = [1, 1, 1];
      const result = applyBrightnessContrast(input, -0.3, 1.5);

      for (const value of result) {
        expect(value).toBeCloseTo(0.95, 5); // (1 - 0.5) * 1.5 + 0.5 - 0.3 = 0.95
      }
    });

    it("should handle very long arrays efficiently", () => {
      const input = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const result = applyBrightnessContrast(input, 0.1, 1.2);

      expect(result).toHaveLength(1000);
      for (const value of result) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });
});
