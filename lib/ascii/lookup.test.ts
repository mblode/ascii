import { describe, expect, it } from "vitest";
import {
  createCharacterLookup,
  createLookupCache,
  findNearestCharacter,
  normalizeWithMaxValues,
  quantizeVector,
  squaredEuclideanDistance,
} from "./lookup";
import type { AsciiCharacter, AsciiCharacterSet } from "./types";

describe("squaredEuclideanDistance", () => {
  it("should calculate distance for identical vectors", () => {
    const result = squaredEuclideanDistance([1, 2, 3], [1, 2, 3]);
    expect(result).toBe(0);
  });

  it("should calculate distance for 2D vectors", () => {
    const result = squaredEuclideanDistance([0, 0], [3, 4]);
    // 3^2 + 4^2 = 9 + 16 = 25
    expect(result).toBe(25);
  });

  it("should calculate distance for 3D vectors", () => {
    const result = squaredEuclideanDistance([1, 2, 3], [4, 6, 8]);
    // (4-1)^2 + (6-2)^2 + (8-3)^2 = 9 + 16 + 25 = 50
    expect(result).toBe(50);
  });

  it("should handle negative values", () => {
    const result = squaredEuclideanDistance([-1, -2], [1, 2]);
    // (1-(-1))^2 + (2-(-2))^2 = 4 + 16 = 20
    expect(result).toBe(20);
  });

  it("should handle vectors with different lengths (use minimum length)", () => {
    const result = squaredEuclideanDistance([1, 2, 3, 4], [1, 2]);
    // Only compares first 2 elements: (1-1)^2 + (2-2)^2 = 0
    expect(result).toBe(0);
  });

  it("should handle empty vectors", () => {
    const result = squaredEuclideanDistance([], []);
    expect(result).toBe(0);
  });

  it("should handle single element vectors", () => {
    const result = squaredEuclideanDistance([5], [2]);
    // (5-2)^2 = 9
    expect(result).toBe(9);
  });

  it("should be symmetric", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const dist1 = squaredEuclideanDistance(a, b);
    const dist2 = squaredEuclideanDistance(b, a);
    expect(dist1).toBe(dist2);
  });
});

describe("findNearestCharacter", () => {
  it("should return space for empty character set", () => {
    const result = findNearestCharacter([0.5, 0.5], []);
    expect(result).toBe(" ");
  });

  it("should return the only character when there's one option", () => {
    const chars: AsciiCharacter[] = [{ char: "A", vector: [1, 1] }];
    const result = findNearestCharacter([0.5, 0.5], chars);
    expect(result).toBe("A");
  });

  it("should find nearest character with simple 2D vectors", () => {
    const chars: AsciiCharacter[] = [
      { char: " ", vector: [0, 0] },
      { char: ".", vector: [0.3, 0.3] },
      { char: "#", vector: [1, 1] },
    ];

    // Closest to space
    expect(findNearestCharacter([0.1, 0.1], chars)).toBe(" ");

    // Closest to dot
    expect(findNearestCharacter([0.35, 0.35], chars)).toBe(".");

    // Closest to hash
    expect(findNearestCharacter([0.9, 0.9], chars)).toBe("#");
  });

  it("should use early termination for perfect match", () => {
    const chars: AsciiCharacter[] = [
      { char: "A", vector: [0.5, 0.5] },
      { char: "B", vector: [0.6, 0.6] },
      { char: "C", vector: [0.7, 0.7] },
    ];

    const result = findNearestCharacter([0.5, 0.5], chars);
    expect(result).toBe("A");
  });

  it("should handle 6D vectors (typical for ASCII rendering)", () => {
    const chars: AsciiCharacter[] = [
      { char: " ", vector: [0, 0, 0, 0, 0, 0] },
      { char: "#", vector: [1, 1, 1, 1, 1, 1] },
    ];

    expect(findNearestCharacter([0.1, 0.1, 0.1, 0.1, 0.1, 0.1], chars)).toBe(
      " "
    );
    expect(findNearestCharacter([0.9, 0.9, 0.9, 0.9, 0.9, 0.9], chars)).toBe(
      "#"
    );
    expect(findNearestCharacter([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], chars)).toBe(
      " "
    ); // Equidistant chooses first
  });

  it("should choose first character when equidistant", () => {
    const chars: AsciiCharacter[] = [
      { char: "A", vector: [0, 0] },
      { char: "B", vector: [1, 1] },
    ];

    // [0.5, 0.5] is equidistant from both
    const result = findNearestCharacter([0.5, 0.5], chars);
    expect(result).toBe("A"); // Returns first found (order dependent)
  });
});

describe("normalizeWithMaxValues", () => {
  it("should normalize vector to [0, 1] range", () => {
    const vector = [50, 100];
    const maxValues = [100, 200];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([0.5, 0.5]);
  });

  it("should handle zero max values", () => {
    const vector = [50, 100];
    const maxValues = [0, 200];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([0, 0.5]); // Zero max results in 0
  });

  it("should handle all zero vectors", () => {
    const vector = [0, 0, 0];
    const maxValues = [100, 100, 100];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([0, 0, 0]);
  });

  it("should handle values equal to max", () => {
    const vector = [100, 200, 300];
    const maxValues = [100, 200, 300];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([1, 1, 1]);
  });

  it("should work with 6D vectors", () => {
    const vector = [10, 20, 30, 40, 50, 60];
    const maxValues = [100, 100, 100, 100, 100, 100];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
  });

  it("should handle single element vectors", () => {
    const vector = [75];
    const maxValues = [150];
    const result = normalizeWithMaxValues(vector, maxValues);

    expect(result).toEqual([0.5]);
  });
});

describe("quantizeVector", () => {
  it("should quantize 2D vector with 10 levels", () => {
    const result = quantizeVector([0.15, 0.52], 10);
    // [0.15, 0.52] -> bins [1, 5] -> key = 1*10 + 5 = 15
    expect(result).toBe(15);
  });

  it("should handle edge case [0, 0]", () => {
    const result = quantizeVector([0, 0], 10);
    // [0, 0] -> bins [0, 0] -> key = 0
    expect(result).toBe(0);
  });

  it("should handle edge case [1, 1]", () => {
    const result = quantizeVector([1, 1], 10);
    // [1, 1] -> bins [9, 9] (clamped) -> key = 9*10 + 9 = 99
    expect(result).toBe(99);
  });

  it("should clamp values above 1", () => {
    const result = quantizeVector([1.5, 0.5], 10);
    // [1.5, 0.5] -> clamped to [1, 0.5] -> bins [9, 5] -> key = 9*10 + 5 = 95
    expect(result).toBe(95);
  });

  it("should clamp values below 0", () => {
    const result = quantizeVector([-0.5, 0.5], 10);
    // [-0.5, 0.5] -> clamped to [0, 0.5] -> bins [0, 5] -> key = 0*10 + 5 = 5
    expect(result).toBe(5);
  });

  it("should work with different quantization levels", () => {
    const vector = [0.5, 0.5];

    const result5 = quantizeVector(vector, 5);
    // [0.5, 0.5] -> bins [2, 2] -> key = 2*5 + 2 = 12
    expect(result5).toBe(12);

    const result20 = quantizeVector(vector, 20);
    // [0.5, 0.5] -> bins [10, 10] -> key = 10*20 + 10 = 210
    expect(result20).toBe(210);
  });

  it("should handle 6D vectors", () => {
    const vector = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const result = quantizeVector(vector, 5);

    // bins: [0, 1, 2, 3, 4, 4]
    // key = 0*5^5 + 1*5^4 + 2*5^3 + 3*5^2 + 4*5^1 + 4*5^0
    //     = 0 + 625 + 250 + 75 + 20 + 4 = 974
    expect(result).toBe(974);
  });

  it("should produce different keys for similar but distinct vectors", () => {
    const key1 = quantizeVector([0.1, 0.1], 10);
    const key2 = quantizeVector([0.2, 0.1], 10);
    const key3 = quantizeVector([0.1, 0.2], 10);

    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key2).not.toBe(key3);
  });

  it("should produce same key for vectors in same quantization bin", () => {
    const key1 = quantizeVector([0.51, 0.52], 10);
    const key2 = quantizeVector([0.53, 0.54], 10);
    // Both should be in bin [5, 5]
    expect(key1).toBe(key2);
  });
});

describe("createLookupCache", () => {
  const simpleChars: AsciiCharacter[] = [
    { char: " ", vector: [0, 0] },
    { char: ".", vector: [0.5, 0.5] },
    { char: "#", vector: [1, 1] },
  ];

  it("should cache lookups and track hits/misses", () => {
    const cache = createLookupCache(simpleChars, { quantizationLevels: 10 });

    // First lookup - should be a miss
    const char1 = cache.lookup([0.1, 0.1]);
    expect(char1).toBe(" ");

    let stats = cache.stats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);

    // Second lookup with same quantized vector - should be a hit
    const char2 = cache.lookup([0.12, 0.12]); // Still in bin [1, 1]
    expect(char2).toBe(" ");

    stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);

    // Third lookup with different quantized vector - should be a miss
    const char3 = cache.lookup([0.5, 0.5]);
    expect(char3).toBe(".");

    stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(2);
    expect(stats.size).toBe(2);
  });

  it("should clear cache and reset stats", () => {
    const cache = createLookupCache(simpleChars, { quantizationLevels: 10 });

    cache.lookup([0.1, 0.1]);
    cache.lookup([0.5, 0.5]);

    let stats = cache.stats();
    expect(stats.misses).toBe(2);
    expect(stats.size).toBe(2);

    cache.clear();

    stats = cache.stats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.size).toBe(0);
  });

  it("should work with different quantization levels", () => {
    const cache5 = createLookupCache(simpleChars, { quantizationLevels: 5 });
    const cache20 = createLookupCache(simpleChars, { quantizationLevels: 20 });

    // With 5 levels, bins are larger, so more likely to hit
    cache5.lookup([0.1, 0.1]);
    cache5.lookup([0.19, 0.19]); // Same bin with 5 levels
    expect(cache5.stats().hits).toBe(1);

    // With 20 levels, bins are smaller, so less likely to hit
    cache20.lookup([0.1, 0.1]);
    cache20.lookup([0.19, 0.19]); // Different bin with 20 levels
    expect(cache20.stats().hits).toBe(0);
  });

  it("should return correct characters from cache", () => {
    const cache = createLookupCache(simpleChars, { quantizationLevels: 10 });

    // Populate cache
    expect(cache.lookup([0.05, 0.05])).toBe(" ");
    expect(cache.lookup([0.5, 0.5])).toBe(".");
    expect(cache.lookup([0.95, 0.95])).toBe("#");

    // Verify cache returns same results
    expect(cache.lookup([0.08, 0.08])).toBe(" "); // Same bin as [0.05, 0.05]
    expect(cache.lookup([0.52, 0.52])).toBe("."); // Same bin as [0.5, 0.5]
    expect(cache.lookup([0.98, 0.98])).toBe("#"); // Same bin as [0.95, 0.95]

    // All should be hits
    expect(cache.stats().hits).toBe(3);
    expect(cache.stats().misses).toBe(3);
  });

  it("should handle 6D vectors", () => {
    const chars6d: AsciiCharacter[] = [
      { char: " ", vector: [0, 0, 0, 0, 0, 0] },
      { char: "#", vector: [1, 1, 1, 1, 1, 1] },
    ];

    const cache = createLookupCache(chars6d, { quantizationLevels: 10 });

    const char1 = cache.lookup([0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
    expect(char1).toBe(" ");

    const char2 = cache.lookup([0.9, 0.9, 0.9, 0.9, 0.9, 0.9]);
    expect(char2).toBe("#");

    expect(cache.stats().size).toBe(2);
  });
});

describe("createCharacterLookup", () => {
  const characterSet: AsciiCharacterSet = {
    characters: [
      { char: " ", vector: [0, 0, 0] }, // Normalized already
      { char: ".", vector: [0.5, 0.5, 0.5] }, // Normalized: 50/100 = 0.5
      { char: "#", vector: [1, 1, 1] }, // Normalized: 100/100 = 1
    ],
    maxValues: [1, 1, 1],
    charset: [" ", ".", "#"],
    font: { family: "monospace", size: 12 },
    cellWidth: 8,
    cellHeight: 16,
    layout: {
      internal: [],
      external: [],
      externalInfluence: [],
    },
  };

  it("should create a lookup function that caches", () => {
    const lookup = createCharacterLookup(characterSet);

    const char = lookup([0.5, 0.5, 0.5]);
    expect(char).toBe(".");
  });

  it("should handle vectors at extremes", () => {
    const lookup = createCharacterLookup(characterSet);

    expect(lookup([0, 0, 0])).toBe(" ");
    expect(lookup([1, 1, 1])).toBe("#");
  });

  it("should use default cache options", () => {
    const lookup = createCharacterLookup(characterSet);

    // Call same quantized vector multiple times
    lookup([0.1, 0.1, 0.1]);
    lookup([0.12, 0.12, 0.12]); // Should be same quantized bin with default levels
    lookup([0.5, 0.5, 0.5]);
    lookup([0.52, 0.52, 0.52]); // Should be same bin

    // Hard to test cache hits without exposing internals, but at least verify it works
    expect(lookup([1, 1, 1])).toBe("#");
  });

  it("should use custom cache options", () => {
    const lookup = createCharacterLookup(characterSet, {
      quantizationLevels: 5,
    });

    // With fewer levels, more vectors map to same bin
    const char1 = lookup([0.5, 0.5, 0.5]);
    const char2 = lookup([0.55, 0.55, 0.55]);

    expect(char1).toBe(".");
    expect(char2).toBe(".");
  });

  it("should find nearest character for in-between values", () => {
    const lookup = createCharacterLookup(characterSet);

    // [0.25, 0.25, 0.25]
    // Distance to space: 0.1875, distance to dot: 0.1875, distance to hash: 1.6875
    // Equidistant between space and dot, should return first (space)
    expect(lookup([0.25, 0.25, 0.25])).toBe(" ");

    // [0.75, 0.75, 0.75]
    // Distance to dot: 0.1875, distance to hash: 0.1875 (equidistant)
    // Returns first match (dot)
    expect(lookup([0.75, 0.75, 0.75])).toBe(".");

    // [0.9, 0.9, 0.9]
    // Closer to hash than dot
    expect(lookup([0.9, 0.9, 0.9])).toBe("#");
  });

  it("should work with 6D character set", () => {
    const charSet6d: AsciiCharacterSet = {
      characters: [
        { char: " ", vector: [0, 0, 0, 0, 0, 0] }, // Normalized already
        { char: "#", vector: [1, 1, 1, 1, 1, 1] }, // Normalized: 100/100 = 1
      ],
      maxValues: [1, 1, 1, 1, 1, 1],
      charset: [" ", "#"],
      font: { family: "monospace", size: 12 },
      cellWidth: 8,
      cellHeight: 16,
      layout: {
        internal: [],
        external: [],
        externalInfluence: [],
      },
    };

    const lookup = createCharacterLookup(charSet6d);

    expect(lookup([0.1, 0.1, 0.1, 0.1, 0.1, 0.1])).toBe(" ");
    expect(lookup([0.9, 0.9, 0.9, 0.9, 0.9, 0.9])).toBe("#");
    expect(lookup([0.5, 0.5, 0.5, 0.5, 0.5, 0.5])).toBe(" "); // Equidistant, returns first
  });
});
