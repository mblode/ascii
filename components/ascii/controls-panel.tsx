"use client";

import { useMemo } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { AsciiParameters } from "@/hooks/use-ascii";

interface AsciiControlsPanelProps {
  parameters: AsciiParameters;
  onParametersChange: (params: Partial<AsciiParameters>) => void;
  renderDimensions?: { width: number; height: number } | null;
  disabled?: boolean;
}

export function AsciiControlsPanel({
  parameters,
  onParametersChange,
  renderDimensions,
  disabled,
}: AsciiControlsPanelProps) {
  const contrastValue = useMemo(
    () => [parameters.contrastExponent],
    [parameters.contrastExponent]
  );
  const columnsValue = useMemo(
    () => [parameters.columns],
    [parameters.columns]
  );

  // Calculate rows for display (columns is now the direct control)
  const cellWidth = renderDimensions
    ? Math.floor(renderDimensions.width / parameters.columns)
    : 8;
  const cellHeight = Math.round(cellWidth * 1.75);
  const gridRows = renderDimensions
    ? Math.floor(renderDimensions.height / cellHeight)
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
            Contrast exponent: {parameters.contrastExponent.toFixed(1)}
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={4}
            min={1}
            onValueChange={([value]) =>
              onParametersChange({ contrastExponent: value })
            }
            step={0.1}
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
          <p className="text-muted-foreground text-xs leading-[1.6]">
            Preview/output is capped at 1400px on the longest edge for
            performance.
          </p>
        </div>
      </div>
    </div>
  );
}
