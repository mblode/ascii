"use client";

import {
  BrightnessIcon,
  ColorSwatchIcon,
  ContrastIcon,
  DotGrid3x3Icon,
} from "blode-icons-react";
import { useState } from "react";
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
  const [localBrightness, setLocalBrightness] = useState<number | null>(null);
  const [localEdge, setLocalEdge] = useState<number | null>(null);
  const [localColumns, setLocalColumns] = useState<number | null>(null);

  const displayBrightness = localBrightness ?? parameters.brightness;
  const displayEdge = localEdge ?? parameters.contrastExponent;
  const displayColumns = localColumns ?? parameters.columns;

  const brightnessValue = [displayBrightness];
  const edgeValue = [displayEdge];
  const columnsValue = [displayColumns];

  const cellWidth = renderDimensions
    ? Math.floor(renderDimensions.width / displayColumns)
    : 8;
  const cellHeight = parameters.ledMode
    ? cellWidth
    : Math.round(cellWidth * 1.75);
  const gridRows = renderDimensions
    ? Math.floor(renderDimensions.height / cellHeight)
    : null;

  return (
    <div className="space-y-4">
      <ColorPicker
        disabled={disabled}
        icon={
          <ColorSwatchIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        }
        id="foreground"
        label="Foreground color"
        onChange={(value) => onParametersChange({ foreground: value })}
        value={parameters.foreground}
      />

      <ColorPicker
        disabled={disabled}
        icon={
          <ColorSwatchIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        }
        id="background"
        label="Background color"
        onChange={(value) => onParametersChange({ background: value })}
        value={parameters.background}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="brightness">
            <BrightnessIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Brightness
          </Label>
          <output className="tabular-nums" htmlFor="brightness">
            {Math.round(displayBrightness)}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="brightness"
          max={100}
          min={-100}
          onValueChange={([value]) => {
            setLocalBrightness(value);
            onParametersChange({ brightness: value });
          }}
          onValueCommit={([value]) => {
            setLocalBrightness(null);
            onParametersChange({ brightness: value });
          }}
          showOrigin
          step={5}
          value={brightnessValue}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="edge">
            <ContrastIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Edge sharpening
          </Label>
          <output className="tabular-nums" htmlFor="edge">
            {displayEdge.toFixed(1)}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="edge"
          max={4}
          min={1}
          onValueChange={([value]) => {
            setLocalEdge(value);
            onParametersChange({ contrastExponent: value });
          }}
          onValueCommit={([value]) => {
            setLocalEdge(null);
            onParametersChange({ contrastExponent: value });
          }}
          step={0.1}
          value={edgeValue}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <Label className="flex items-center gap-1.5" htmlFor="columns">
            <DotGrid3x3Icon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            Columns
          </Label>
          <output className="tabular-nums" htmlFor="columns">
            {displayColumns}
          </output>
        </div>
        <Slider
          disabled={disabled}
          id="columns"
          max={200}
          min={40}
          onValueChange={([value]) => {
            setLocalColumns(value);
            onParametersChange({ columns: value });
          }}
          onValueCommit={([value]) => {
            setLocalColumns(null);
            onParametersChange({ columns: value });
          }}
          step={1}
          value={columnsValue}
        />
        {gridRows && (
          <p className="text-muted-foreground text-sm tabular-nums leading-[1.6]">
            Output: {displayColumns} &times; {gridRows} characters
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Display mode</Label>
        <div>
          <Button
            disabled={disabled}
            onClick={() => onParametersChange({ ledMode: !parameters.ledMode })}
            size="sm"
            variant={parameters.ledMode ? "default" : "outline"}
          >
            LED Display
          </Button>
        </div>
      </div>
    </div>
  );
}
