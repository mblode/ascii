"use client";

import { ControlsPanel } from "@/components/dither/controls-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { DitherParameters } from "@/lib/dither/types";

interface AppSidebarProps {
  uploadedImage: File | null;
  parameters: DitherParameters;
  originalDimensions?: { width: number; height: number } | null;
  onParametersChange: (params: Partial<DitherParameters>) => void;
}

export function AppSidebar({
  uploadedImage,
  parameters,
  originalDimensions,
  onParametersChange,
}: AppSidebarProps) {
  return (
    <Sidebar mobileVariant="none" variant="inset">
      <SidebarHeader className="hidden px-2 md:flex">
        <h1
          className="font-bold text-xl tracking-tight md:text-2xl"
          style={{ textWrap: "balance" }}
        >
          Blue noise
        </h1>
        <p className="text-sm leading-[1.6]" style={{ textWrap: "pretty" }}>
          Apply high-quality blue noise dithering to your images
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="py-3">
            <ControlsPanel
              disabled={!uploadedImage}
              onParametersChange={onParametersChange}
              originalDimensions={originalDimensions}
              parameters={parameters}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
