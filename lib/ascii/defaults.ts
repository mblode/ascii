import type {
  AsciiFontSpec,
  AsciiLookupCacheOptions,
  AsciiRenderOptions,
  AsciiSamplingLayout,
} from "./types";

/**
 * Default ASCII character set ordered by visual density (lightest to darkest).
 * Characters are chosen to provide good coverage of the 6D shape space.
 */
export const DEFAULT_CHARSET: string[] = [
  " ",
  ".",
  "'",
  "`",
  "^",
  '"',
  ",",
  ":",
  ";",
  "I",
  "l",
  "!",
  "i",
  ">",
  "<",
  "~",
  "+",
  "_",
  "-",
  "?",
  "]",
  "[",
  "}",
  "{",
  "1",
  ")",
  "(",
  "|",
  "\\",
  "/",
  "t",
  "f",
  "j",
  "r",
  "x",
  "n",
  "u",
  "v",
  "c",
  "z",
  "X",
  "Y",
  "U",
  "J",
  "C",
  "L",
  "Q",
  "0",
  "O",
  "Z",
  "m",
  "w",
  "q",
  "p",
  "d",
  "b",
  "k",
  "h",
  "a",
  "o",
  "*",
  "#",
  "M",
  "W",
  "&",
  "8",
  "%",
  "B",
  "@",
  "$",
];

/**
 * Default monospace font specification.
 * Courier New is widely available and renders consistently across platforms.
 */
export const DEFAULT_FONT: AsciiFontSpec = {
  family: "Courier New, Courier, monospace",
  size: 12,
  weight: "normal",
  style: "normal",
  lineHeight: 1.0,
};

/**
 * 6D sampling layout with staggered circles for optimal coverage.
 * Internal circles capture the shape within each cell.
 * External circles capture neighboring regions for directional contrast.
 *
 * Layout (internal circles):
 *   [0] [1]   <- top row (slightly lower on left, higher on right)
 *   [2] [3]   <- middle row
 *   [4] [5]   <- bottom row (slightly higher on left, lower on right)
 *
 * This staggered arrangement minimizes gaps and captures diagonal features.
 */
export const DEFAULT_SAMPLING_LAYOUT: AsciiSamplingLayout = {
  // Internal sampling circles (6D) - positions as fractions of cell dimensions
  // x, y are center positions (0-1), r is radius as fraction of cell height
  internal: [
    { x: 0.25, y: 0.2, r: 0.18 }, // top-left
    { x: 0.75, y: 0.14, r: 0.18 }, // top-right (slightly higher)
    { x: 0.25, y: 0.5, r: 0.18 }, // middle-left
    { x: 0.75, y: 0.5, r: 0.18 }, // middle-right
    { x: 0.25, y: 0.8, r: 0.18 }, // bottom-left
    { x: 0.75, y: 0.86, r: 0.18 }, // bottom-right (slightly lower)
  ],

  // External sampling circles (10) for directional contrast enhancement
  // Positioned outside cell boundaries to detect neighboring regions
  external: [
    { x: 0.0, y: 0.0, r: 0.15 }, // 0: top-left corner
    { x: 0.5, y: -0.15, r: 0.15 }, // 1: top center
    { x: 1.0, y: 0.0, r: 0.15 }, // 2: top-right corner
    { x: -0.15, y: 0.5, r: 0.15 }, // 3: left center
    { x: 1.15, y: 0.5, r: 0.15 }, // 4: right center
    { x: 0.0, y: 1.0, r: 0.15 }, // 5: bottom-left corner
    { x: 0.5, y: 1.15, r: 0.15 }, // 6: bottom center
    { x: 1.0, y: 1.0, r: 0.15 }, // 7: bottom-right corner
    { x: 0.25, y: -0.15, r: 0.15 }, // 8: top-left-center
    { x: 0.75, y: -0.15, r: 0.15 }, // 9: top-right-center
  ],

  // Mapping from internal circles to external circles that influence them
  // Each internal circle is affected by external samples in its direction
  externalInfluence: [
    [0, 1, 3, 8], // top-left internal <- UL, U, L, top-left-center
    [1, 2, 4, 9], // top-right internal <- U, UR, R, top-right-center
    [0, 3, 5], // middle-left internal <- UL, L, DL
    [2, 4, 7], // middle-right internal <- UR, R, DR
    [3, 5, 6], // bottom-left internal <- L, DL, D
    [4, 6, 7], // bottom-right internal <- R, D, DR
  ],
};

/**
 * Default cache options for quantized vector lookups.
 * 10 levels provides good quality while keeping cache size manageable.
 * Total possible keys: 10^6 = 1,000,000 (approximately 7.6MB if fully saturated)
 */
export const DEFAULT_CACHE_OPTIONS: AsciiLookupCacheOptions = {
  quantizationLevels: 10,
};

/**
 * Default render options combining all defaults.
 */
export const DEFAULT_RENDER_OPTIONS: Required<
  Omit<AsciiRenderOptions, "maxWidth" | "maxHeight">
> & {
  maxWidth: number | null;
  maxHeight: number | null;
} = {
  maxWidth: null,
  maxHeight: null,
  cellWidth: 8,
  cellHeight: 14,
  font: DEFAULT_FONT,
  charset: DEFAULT_CHARSET,
  sampleCount: 12,
  brightness: 0,
  contrast: 0,
  contrastExponent: 2.0,
  directionalContrastExponent: 3.0,
  output: "both",
  foreground: "#ffffff",
  background: "#000000",
  layout: DEFAULT_SAMPLING_LAYOUT,
  cache: DEFAULT_CACHE_OPTIONS,
};

/**
 * Merge user options with defaults, handling nested objects.
 */
export const mergeOptions = (
  options: AsciiRenderOptions
): typeof DEFAULT_RENDER_OPTIONS => ({
  ...DEFAULT_RENDER_OPTIONS,
  ...options,
  font: { ...DEFAULT_FONT, ...options.font },
  layout: options.layout ?? DEFAULT_SAMPLING_LAYOUT,
  cache: { ...DEFAULT_CACHE_OPTIONS, ...options.cache },
});
