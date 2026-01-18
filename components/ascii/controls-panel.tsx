"use client";

import { useMemo } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { AsciiParameters } from "@/hooks/use-ascii";

interface AsciiControlsPanelProps {
  parameters: AsciiParameters;
  onParametersChange: (params: Partial<AsciiParameters>) => void;
  originalDimensions?: { width: number; height: number } | null;
  disabled?: boolean;
}

export function AsciiControlsPanel({
  parameters,
  onParametersChange,
  originalDimensions,
  disabled,
}: AsciiControlsPanelProps) {
  const contrastValue = useMemo(
    () => [parameters.contrast],
    [parameters.contrast]
  );
  const columnsValue = useMemo(
    () => [parameters.columns],
    [parameters.columns]
  );

  // Calculate rows for display (columns is now the direct control)
  const cellWidth = originalDimensions
    ? Math.floor(originalDimensions.width / parameters.columns)
    : 8;
  const cellHeight = Math.round(cellWidth * 1.75);
  const gridRows = originalDimensions
    ? Math.floor(originalDimensions.height / cellHeight)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ColorPicker
          disabled={disabled}
          id="foreground"
          label="Foreground color"
          onChange={(value) => onParametersChange({ foreground: value })}
          value={parameters.foreground}
        />

        <ColorPicker
          disabled={disabled}
          id="background"
          label="Background color"
          onChange={(value) => onParametersChange({ background: value })}
          value={parameters.background}
        />

        <div className="space-y-2">
          <Label htmlFor="contrast">
            Contrast: {Math.round(parameters.contrast)}
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={100}
            min={-100}
            onValueChange={([value]) => onParametersChange({ contrast: value })}
            showOrigin
            step={5}
            value={contrastValue}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="columns">Columns: {parameters.columns}</Label>
          <Slider
            disabled={disabled}
            id="columns"
            max={200}
            min={40}
            onValueChange={([value]) => onParametersChange({ columns: value })}
            step={1}
            value={columnsValue}
          />
          <p
            className="text-muted-foreground text-sm leading-[1.6]"
            style={{ textWrap: "pretty" }}
          >
            More columns = more detail
            {gridRows &&
              `. Output: ${parameters.columns} × ${gridRows} characters`}
          </p>
        </div>
      </div>
    </div>
  );
}
