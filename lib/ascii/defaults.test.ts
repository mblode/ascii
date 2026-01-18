import { describe, expect, it } from "vitest";
import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_CHARSET,
  DEFAULT_FONT,
  DEFAULT_RENDER_OPTIONS,
  DEFAULT_SAMPLING_LAYOUT,
  mergeOptions,
} from "./defaults";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

describe("defaults", () => {
  describe("DEFAULT_CHARSET", () => {
    it("should contain space as first character (lightest)", () => {
      expect(DEFAULT_CHARSET[0]).toBe(" ");
    });

    it("should contain dense characters at end", () => {
      const lastChars = DEFAULT_CHARSET.slice(-5);
      expect(lastChars).toContain("@");
      expect(lastChars).toContain("$");
    });

    it("should have reasonable length for ASCII art", () => {
      expect(DEFAULT_CHARSET.length).toBeGreaterThan(30);
      expect(DEFAULT_CHARSET.length).toBeLessThan(100);
    });

    it("should contain only unique characters", () => {
      const unique = new Set(DEFAULT_CHARSET);
      expect(unique.size).toBe(DEFAULT_CHARSET.length);
    });
  });

  describe("DEFAULT_FONT", () => {
    it("should specify a monospace font family", () => {
      expect(DEFAULT_FONT.family).toContain("monospace");
    });

    it("should have a reasonable font size", () => {
      expect(DEFAULT_FONT.size).toBeGreaterThan(0);
      expect(DEFAULT_FONT.size).toBeLessThanOrEqual(24);
    });
  });

  describe("DEFAULT_SAMPLING_LAYOUT", () => {
    it("should have 6 internal sampling circles", () => {
      expect(DEFAULT_SAMPLING_LAYOUT.internal).toHaveLength(6);
    });

    it("should have 10 external sampling circles", () => {
      expect(DEFAULT_SAMPLING_LAYOUT.external).toHaveLength(10);
    });

    it("should have external influence mapping for each internal circle", () => {
      expect(DEFAULT_SAMPLING_LAYOUT.externalInfluence).toHaveLength(6);
    });

    it("should have valid circle coordinates (normalized 0-1 for internal)", () => {
      for (const circle of DEFAULT_SAMPLING_LAYOUT.internal) {
        expect(circle.x).toBeGreaterThanOrEqual(0);
        expect(circle.x).toBeLessThanOrEqual(1);
        expect(circle.y).toBeGreaterThanOrEqual(0);
        expect(circle.y).toBeLessThanOrEqual(1);
        expect(circle.r).toBeGreaterThan(0);
      }
    });
  });

  describe("DEFAULT_CACHE_OPTIONS", () => {
    it("should have valid quantization levels", () => {
      expect(DEFAULT_CACHE_OPTIONS.quantizationLevels).toBeGreaterThan(0);
      expect(DEFAULT_CACHE_OPTIONS.quantizationLevels).toBeLessThanOrEqual(32);
    });
  });

  describe("DEFAULT_RENDER_OPTIONS", () => {
    it("should have valid cell dimensions", () => {
      expect(DEFAULT_RENDER_OPTIONS.cellWidth).toBeGreaterThan(0);
      expect(DEFAULT_RENDER_OPTIONS.cellHeight).toBeGreaterThan(0);
    });

    it("should have valid contrast exponents", () => {
      expect(DEFAULT_RENDER_OPTIONS.contrastExponent).toBeGreaterThanOrEqual(1);
      expect(
        DEFAULT_RENDER_OPTIONS.directionalContrastExponent
      ).toBeGreaterThanOrEqual(1);
    });

    it("should have valid color strings", () => {
      expect(DEFAULT_RENDER_OPTIONS.foreground).toMatch(HEX_COLOR_REGEX);
      expect(DEFAULT_RENDER_OPTIONS.background).toMatch(HEX_COLOR_REGEX);
    });
  });

  describe("mergeOptions", () => {
    it("should return defaults when given empty options", () => {
      const result = mergeOptions({});
      expect(result.cellWidth).toBe(DEFAULT_RENDER_OPTIONS.cellWidth);
      expect(result.cellHeight).toBe(DEFAULT_RENDER_OPTIONS.cellHeight);
    });

    it("should override specific options", () => {
      const result = mergeOptions({ cellWidth: 16, cellHeight: 24 });
      expect(result.cellWidth).toBe(16);
      expect(result.cellHeight).toBe(24);
    });

    it("should merge nested font options", () => {
      const result = mergeOptions({ font: { family: "Arial", size: 14 } });
      expect(result.font.family).toBe("Arial");
      expect(result.font.size).toBe(14);
      // Should keep defaults for unspecified properties
      expect(result.font.weight).toBe(DEFAULT_FONT.weight);
    });

    it("should preserve contrast exponents when not overridden", () => {
      const result = mergeOptions({ foreground: "#ff0000" });
      expect(result.contrastExponent).toBe(
        DEFAULT_RENDER_OPTIONS.contrastExponent
      );
      expect(result.directionalContrastExponent).toBe(
        DEFAULT_RENDER_OPTIONS.directionalContrastExponent
      );
    });
  });
});
