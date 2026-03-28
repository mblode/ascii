"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  // Local state for in-flight slider values during drag.
  // null = not dragging, use prop value. Non-null = dragging, use local value.
  const [localContrast, setLocalContrast] = useState<number | null>(null);
  const [localColumns, setLocalColumns] = useState<number | null>(null);

  const displayContrast = localContrast ?? parameters.contrastExponent;
  const displayColumns = localColumns ?? parameters.columns;

  const contrastValue = useMemo(() => [displayContrast], [displayContrast]);
  const columnsValue = useMemo(() => [displayColumns], [displayColumns]);

  // Calculate rows for display (columns is now the direct control)
  const cellWidth = renderDimensions
    ? Math.floor(renderDimensions.width / displayColumns)
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
            Contrast exponent: {displayContrast.toFixed(1)}
          </Label>
          <Slider
            disabled={disabled}
            id="contrast"
            max={4}
            min={1}
            onValueChange={([value]) => setLocalContrast(value)}
            onValueCommit={([value]) => {
              setLocalContrast(null);
              onParametersChange({ contrastExponent: value });
            }}
            step={0.1}
            value={contrastValue}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="columns">Columns: {displayColumns}</Label>
          <Slider
            disabled={disabled}
            id="columns"
            max={200}
            min={40}
            onValueChange={([value]) => setLocalColumns(value)}
            onValueCommit={([value]) => {
              setLocalColumns(null);
              onParametersChange({ columns: value });
            }}
            step={1}
            value={columnsValue}
          />
          <p
            className="text-muted-foreground text-sm leading-[1.6]"
            style={{ textWrap: "pretty" }}
          >
            More columns = more detail
            {gridRows && `. Output: ${displayColumns} × ${gridRows} characters`}
          </p>
          <p className="text-muted-foreground text-xs leading-[1.6]">
            Preview/output is capped at 1400px on the longest edge for
            performance.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Display mode</Label>
          <div>
            <Button
              disabled={disabled}
              onClick={() =>
                onParametersChange({ ledMode: !parameters.ledMode })
              }
              size="sm"
              variant={parameters.ledMode ? "default" : "outline"}
            >
              LED Display
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
