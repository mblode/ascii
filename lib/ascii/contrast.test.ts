import { describe, expect, it } from "vitest";
import {
  applyContrastEnhancement,
  applyDirectionalContrast,
  applyGlobalContrast,
} from "./contrast";

describe("applyGlobalContrast", () => {
  it("should return a copy of the vector when exponent is 1 (no change)", () => {
    const vector = [0.5, 0.8, 1.0];
    const result = applyGlobalContrast(vector, 1);

    expect(result).toEqual([0.5, 0.8, 1.0]);
    expect(result).not.toBe(vector); // Should be a new array
  });

  it("should apply power function with exponent 2 (values squared relative to max)", () => {
    const vector = [0.5, 0.8, 1.0];
    const result = applyGlobalContrast(vector, 2);

    // Max is 1.0, so:
    // 0.5 / 1.0 = 0.5, 0.5^2 = 0.25, 0.25 * 1.0 = 0.25
    // 0.8 / 1.0 = 0.8, 0.8^2 = 0.64, 0.64 * 1.0 = 0.64
    // 1.0 / 1.0 = 1.0, 1.0^2 = 1.0, 1.0 * 1.0 = 1.0
    expect(result[0]).toBe(0.25);
    expect(result[1]).toBeCloseTo(0.64, 10);
    expect(result[2]).toBe(1.0);
  });

  it("should handle all zeros vector", () => {
    const vector = [0, 0, 0];
    const result = applyGlobalContrast(vector, 2);

    expect(result).toEqual([0, 0, 0]);
  });

  it("should preserve the maximum value", () => {
    const vector = [100, 200, 50];
    const result = applyGlobalContrast(vector, 3);

    // Max is 200, so maximum should remain 200
    expect(result[1]).toBe(200);
    expect(result[0]).toBeLessThan(100); // Should be darkened
    expect(result[2]).toBeLessThan(50); // Should be darkened
  });

  it("should darken mid-tones more with higher exponent", () => {
    const vector = [0.5, 1.0];
    const result2 = applyGlobalContrast(vector, 2);
    const result3 = applyGlobalContrast(vector, 3);

    // 0.5^2 = 0.25, 0.5^3 = 0.125
    expect(result2[0]).toBe(0.25);
    expect(result3[0]).toBe(0.125);
    expect(result3[0]).toBeLessThan(result2[0]); // Higher exponent darkens more
  });

  it("should handle single element vector", () => {
    const vector = [0.7];
    const result = applyGlobalContrast(vector, 2);

    // Single element is both min and max, normalized to 1.0, then 1.0^2 = 1.0, then denormalized to 0.7
    expect(result).toEqual([0.7]);
  });
});

describe("applyDirectionalContrast", () => {
  it("should return a copy when exponent is 1 (no change)", () => {
    const internal = [0.6, 0.7];
    const external = [0.9, 0.3];
    const influence = [[0], [1]];

    const result = applyDirectionalContrast(internal, external, influence, 1);

    expect(result).toEqual([0.6, 0.7]);
    expect(result).not.toBe(internal); // Should be a new array
  });

  it("should darken internal values near bright external samples", () => {
    const internal = [0.6, 0.6];
    const external = [0.9, 0.3];
    const influence = [[0], [1]]; // internal[0] affected by external[0], internal[1] by external[1]

    const result = applyDirectionalContrast(internal, external, influence, 2);

    // internal[0] = 0.6, maxExternal = 0.9, max(0.6, 0.9) = 0.9
    // normalized = 0.6/0.9 ≈ 0.667, adjusted = 0.667^2 ≈ 0.444, denormalized = 0.444 * 0.9 = 0.4
    expect(result[0]).toBeCloseTo(0.4, 5);

    // internal[1] = 0.6, maxExternal = 0.3, max(0.6, 0.3) = 0.6
    // normalized = 0.6/0.6 = 1.0, adjusted = 1.0^2 = 1.0, denormalized = 1.0 * 0.6 = 0.6
    expect(result[1]).toBeCloseTo(0.6, 5);
  });

  it("should handle zero internal and external values", () => {
    const internal = [0, 0];
    const external = [0, 0];
    const influence = [[0], [1]];

    const result = applyDirectionalContrast(internal, external, influence, 2);

    expect(result).toEqual([0, 0]);
  });

  it("should handle empty external influence", () => {
    const internal = [0.5, 0.8];
    const external = [0.9, 0.3];
    const influence = [[], []]; // No external influence

    const result = applyDirectionalContrast(internal, external, influence, 2);

    // With no external influence, maxExternal = 0
    // internal[0] = 0.5, max(0.5, 0) = 0.5, normalized = 1.0, adjusted = 1.0, result = 0.5
    expect(result).toEqual([0.5, 0.8]);
  });

  it("should handle multiple external influences per internal sample", () => {
    const internal = [0.5];
    const external = [0.3, 0.7, 0.6];
    const influence = [[0, 1, 2]]; // internal[0] affected by all external samples

    const result = applyDirectionalContrast(internal, external, influence, 2);

    // maxExternal = max(0.3, 0.7, 0.6) = 0.7
    // max(0.5, 0.7) = 0.7
    // normalized = 0.5/0.7 ≈ 0.714, adjusted = 0.714^2 ≈ 0.51, denormalized = 0.51 * 0.7 ≈ 0.357
    expect(result[0]).toBeCloseTo(0.357, 2);
  });

  it("should preserve values when internal equals max external", () => {
    const internal = [0.8];
    const external = [0.8, 0.5];
    const influence = [[0, 1]];

    const result = applyDirectionalContrast(internal, external, influence, 2);

    // maxExternal = 0.8, max(0.8, 0.8) = 0.8
    // normalized = 0.8/0.8 = 1.0, adjusted = 1.0^2 = 1.0, result = 0.8
    expect(result[0]).toBe(0.8);
  });
});

describe("applyContrastEnhancement", () => {
  it("should apply directional contrast first, then global contrast", () => {
    const internal = [0.6, 0.6];
    const external = [0.9, 0.3];
    const influence = [[0], [1]];

    const result = applyContrastEnhancement(
      internal,
      external,
      influence,
      2.0, // globalExponent
      2.0 // directionalExponent
    );

    // First apply directional (see directional test above):
    // internal[0] → 0.4, internal[1] → 0.6
    // Then apply global with max = 0.6:
    // 0.4/0.6 ≈ 0.667, 0.667^2 ≈ 0.444, 0.444 * 0.6 ≈ 0.267
    // 0.6/0.6 = 1.0, 1.0^2 = 1.0, 1.0 * 0.6 = 0.6
    expect(result[0]).toBeCloseTo(0.267, 2);
    expect(result[1]).toBeCloseTo(0.6, 5);
  });

  it("should work with exponent 1 for both (no change)", () => {
    const internal = [0.5, 0.7];
    const external = [0.9, 0.3];
    const influence = [[0], [1]];

    const result = applyContrastEnhancement(
      internal,
      external,
      influence,
      1,
      1
    );

    expect(result).toEqual([0.5, 0.7]);
  });

  it("should create cel-shading effect with different exponents", () => {
    const internal = [0.4, 0.5, 0.6];
    const external = [0.8, 0.8, 0.8];
    const influence = [[0], [1], [2]];

    const result = applyContrastEnhancement(
      internal,
      external,
      influence,
      2.5, // Strong global contrast
      1.8 // Moderate directional contrast
    );

    // All values should be darkened
    expect(result[0]).toBeLessThan(0.4);
    expect(result[1]).toBeLessThan(0.5);
    expect(result[2]).toBeLessThan(0.6);

    // Last value should be brightest (preserved relatively)
    expect(result[2]).toBeGreaterThan(result[1]);
    expect(result[1]).toBeGreaterThan(result[0]);
  });

  it("should handle edge case with zero vectors", () => {
    const internal = [0, 0];
    const external = [0, 0];
    const influence = [[0], [1]];

    const result = applyContrastEnhancement(
      internal,
      external,
      influence,
      2,
      2
    );

    expect(result).toEqual([0, 0]);
  });

  it("should apply stronger effect with higher exponents", () => {
    const internal = [0.5, 0.8];
    const external = [1.0, 1.0];
    const influence = [[0], [1]];

    const resultMild = applyContrastEnhancement(
      internal,
      external,
      influence,
      1.5,
      1.5
    );
    const resultStrong = applyContrastEnhancement(
      internal,
      external,
      influence,
      3.0,
      3.0
    );

    // Stronger exponents should darken more
    expect(resultStrong[0]).toBeLessThan(resultMild[0]);
    expect(resultStrong[1]).toBeLessThan(resultMild[1]);
  });
});
