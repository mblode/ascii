import { mergeOptions } from "./defaults";
import type { AsciiRenderOptions } from "./types";

const LED_GAP = 2;

/**
 * Render a brightness grid as an LED display simulation.
 * Each cell is drawn as a horizontal bar whose width encodes brightness
 * and whose color transitions from red (dim) to white (bright).
 */
export const renderLedToImageData = (
  brightnessGrid: number[][],
  options: AsciiRenderOptions = {}
): ImageData => {
  const opts = mergeOptions(options);
  const { cellWidth, cellHeight } = opts;

  const rows = brightnessGrid.length;
  const columns = brightnessGrid[0]?.length ?? 0;
  const width = columns * cellWidth;
  const height = rows * cellHeight;

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : document.createElement("canvas");

  if (!(canvas instanceof OffscreenCanvas)) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2D context");
  }

  // Fill entire canvas black
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, width, height);

  const halfGap = LED_GAP / 2;
  const maxBarWidth = cellWidth - LED_GAP;
  const barHeight = cellHeight - LED_GAP;

  for (let row = 0; row < rows; row++) {
    const brightnessRow = brightnessGrid[row];
    const y = row * cellHeight + halfGap;

    for (let col = 0; col < columns; col++) {
      const b = brightnessRow[col];
      if (b <= 0) {
        continue;
      }

      const x = col * cellWidth + halfGap;

      // Color: red at low brightness, white at full brightness
      const gb = Math.round(b * 255);
      ctx.fillStyle = `rgb(255, ${gb}, ${gb})`;

      // Width scales from 50% (red) to 100% (white); height is always full
      const barWidth = (0.5 + 0.5 * b) * maxBarWidth;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  return ctx.getImageData(0, 0, width, height);
};
