"use client";

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CloudUploadIcon,
} from "@fingertip/icons";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AppSidebar } from "@/components/app-sidebar";
import { CanvasPreview } from "@/components/dither/canvas-preview";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDither } from "@/hooks/use-dither";
import { cn } from "@/lib/utils";

export default function DitherPage() {
  const {
    uploadedImage,
    ditheredImage,
    isProcessing,
    parameters,
    originalDimensions,
    setUploadedImage,
    updateParameters,
  } = useDither();

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setUploadedImage(acceptedFiles[0]);
      }
    },
    [setUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: uploadedImage !== null,
  });

  const handleDownload = () => {
    if (!ditheredImage) {
      return;
    }

    // Generate filename from original with -dithered suffix
    let filename = "dithered-image.png";
    if (uploadedImage?.name) {
      const lastDotIndex = uploadedImage.name.lastIndexOf(".");
      if (lastDotIndex > 0) {
        const nameWithoutExt = uploadedImage.name.substring(0, lastDotIndex);
        const ext = uploadedImage.name.substring(lastDotIndex);
        filename = `${nameWithoutExt}-dithered${ext}`;
      } else {
        filename = `${uploadedImage.name}-dithered.png`;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = ditheredImage.width;
    canvas.height = ditheredImage.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.putImageData(ditheredImage, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();


      URL.revokeObjectURL(url);

      // Show success feedback
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, "image/png");
  };

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:border focus:bg-background focus:p-4"
        href="#main-content"
      >
        Skip to main content
      </a>
      <AppSidebar
        onParametersChange={updateParameters}
        originalDimensions={originalDimensions}
        parameters={parameters}
        uploadedImage={uploadedImage}
      />
      <SidebarInset className="flex flex-col">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <h1 className="flex-1 font-semibold text-sm">Blue noise</h1>
          <Button
            aria-label={uploadedImage ? "Upload new image" : "Upload image"}
            onClick={open}
            size="sm"
            variant="outline"
          >
            <ArrowUpCircleIcon className="h-4 w-4" />
            {uploadedImage ? "Upload new" : "Upload"}
          </Button>
          {ditheredImage && (
            <Button
              aria-label="Download dithered image"
              className={cn(downloadSuccess && "scale-110")}
              onClick={handleDownload}
              size="sm"
              variant="default"
            >
              <ArrowDownCircleIcon className="h-4 w-4" />
              Download
            </Button>
          )}
        </header>

        {/* Desktop header with download button */}
        <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b px-4 md:flex">
          <Button onClick={open} size="sm" variant="outline">
            <ArrowUpCircleIcon className="size-4" />
            {uploadedImage ? "Upload new" : "Upload"}
          </Button>
          {ditheredImage && (
            <Button
              className={cn(downloadSuccess && "scale-110")}
              onClick={handleDownload}
              size="sm"
            >
              <ArrowDownCircleIcon className="size-4" />
              Download
            </Button>
          )}
        </header>

        <div className="flex flex-1 flex-col">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col transition-colors md:min-h-0 md:flex-1",
              isDragActive && "bg-primary/5",
              !uploadedImage && "cursor-pointer"
            )}
          >
            <input {...getInputProps()} />

            {/* Drag overlay - scoped to main content area */}
            {isDragActive && (
              <div className="fade-in-0 pointer-events-none absolute inset-0 z-50 flex animate-in items-center justify-center bg-primary/5 duration-150">
                <div className="data-motion-scale fade-in-0 zoom-in-95 flex animate-in flex-col items-center gap-3 rounded-lg border-2 border-primary bg-background p-8 shadow-lg duration-200 [animation-timing-function:var(--ease-enter)]">
                  <CloudUploadIcon
                    aria-hidden="true"
                    className="fade-in-0 zoom-in-95 h-12 w-12 animate-in text-primary duration-200 [animation-delay:50ms] [animation-timing-function:var(--ease-enter)]"
                  />
                  <p className="fade-in-0 slide-in-from-bottom-2 animate-in font-medium text-lg text-primary duration-200 [animation-delay:100ms] [animation-timing-function:var(--ease-enter)]">
                    Drop image to upload
                  </p>
                </div>
              </div>
            )}

            <main
              className="flex w-full flex-col items-center justify-start gap-6 p-4 md:flex-1 md:items-center md:justify-center"
              id="main-content"
            >
              <h1 className="sr-only">
                Blue Noise Dither - Professional Image Dithering Tool
              </h1>
              <CanvasPreview
                ditheredImage={ditheredImage}
                isProcessing={isProcessing}
                onBrowse={open}
                uploadedImage={uploadedImage}
              />
            </main>
          </div>

          <section className="w-full border-border border-t bg-background px-4 py-6 md:hidden">
            <div className="mx-auto w-full max-w-2xl">
              <ControlsPanel
                disabled={!uploadedImage}
                onParametersChange={updateParameters}
                originalDimensions={originalDimensions}
                parameters={parameters}
              />
            </div>
          </section>
        </div>
      </SidebarInset>
    </>
  );
}
