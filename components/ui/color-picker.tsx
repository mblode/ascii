"use client";

import { PencilIcon, PlusIcon } from "blode-icons-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{0,6}$/;

const COLOR_PRESETS = [
  "#000000",
  "#FFFFFF",
  "#171717",
  "#525252",
  "#A3A3A3",
  "#D4D4D4",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
] as const;

interface ColorPickerProps {
  id: string;
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ColorPicker({
  id,
  icon,
  label,
  value,
  onChange,
  disabled = false,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (HEX_COLOR_REGEX.test(newValue)) {
      onChange(newValue.toUpperCase());
    }
  };

  const normalizedValue = value.toUpperCase();
  const isPreset = COLOR_PRESETS.includes(
    normalizedValue as (typeof COLOR_PRESETS)[number]
  );

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5" htmlFor={id}>
        {icon}
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <button
              aria-label={`Pick custom ${label.toLowerCase()}`}
              aria-pressed={!isPreset}
              className={cn(
                "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border transition-shadow hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
                !isPreset &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-background"
              )}
              disabled={disabled}
              style={isPreset ? undefined : { backgroundColor: value }}
              type="button"
            >
              {isPreset ? (
                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#fdde5c,#f8ab5c,#f56a62,#a176c8,#759beb,#65beb3,#70db96,#fdde5c)] p-1">
                  <span className="flex size-full items-center justify-center rounded-full bg-background">
                    <PlusIcon className="size-4 shrink-0 text-foreground" />
                  </span>
                </span>
              ) : (
                <span className="flex size-full items-center justify-center">
                  <PencilIcon className="size-3.5 shrink-0 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="flex flex-col gap-3">
              <HexColorPicker color={value} onChange={onChange} />
              <Input
                aria-label={`Hex color for ${label.toLowerCase()}`}
                autoComplete="off"
                className="font-mono tabular-nums"
                maxLength={7}
                onChange={handleInputChange}
                placeholder="#000000"
                spellCheck={false}
                type="text"
                value={value}
              />
            </div>
          </PopoverContent>
        </Popover>

        {COLOR_PRESETS.map((preset) => (
          <button
            aria-label={`Set ${label.toLowerCase()} to ${preset}`}
            aria-pressed={normalizedValue === preset}
            className={cn(
              "size-9 shrink-0 cursor-pointer rounded-full border transition-shadow hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
              normalizedValue === preset
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "border-border"
            )}
            disabled={disabled}
            key={preset}
            onClick={() => onChange(preset)}
            style={{ backgroundColor: preset }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
