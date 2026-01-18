# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blue Noise Dither is a Next.js 16 web application that applies high-quality blue noise dithering to images. It's a client-side image processing tool built with React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

- **Development server**: `npm run dev` (runs on http://localhost:3000)
- **Production build**: `npm run build`
- **Start production**: `npm start`
- **Format/fix code**: `npm exec -- ultracite fix`
- **Check code quality**: `npm exec -- ultracite check`
- **Linting**: `npm run lint`

## Code Quality & Pre-commit

The project uses **Ultracite** (a Biome-based preset) for formatting and linting, enforced via:
- **Husky pre-commit hook**: Automatically runs `npx ultracite fix` on staged files via lint-staged
- Always run `npm exec -- ultracite fix` before committing if not using the hook

See AGENTS.md for detailed code standards (type safety, React patterns, accessibility requirements).

## Architecture

### Application Structure

- **Next.js App Router** (`app/`): Single-page application with client-side rendering
  - `app/page.tsx`: Main dithering interface (uses `"use client"`)
  - `app/layout.tsx`: Root layout with Geist fonts and metadata

- **Component Organization**:
  - `components/ui/`: Radix UI primitives (accordion, button, dialog, etc.) - styled with Tailwind and class-variance-authority
  - `components/dither/`: Application-specific components
    - `image-dropzone.tsx`: File upload via react-dropzone
    - `controls-panel.tsx`: Dithering parameter controls
    - `canvas-preview.tsx`: Side-by-side image preview
    - `download-button.tsx`: Export dithered result

- **Core Logic** (`lib/dither/`):
  - `types.ts`: TypeScript interfaces for `DitherParameters`, `NoiseTexture`, `RGB`
  - `core.ts`: Main dithering algorithm (`applyDither` function)
    - Loads and resizes images using Canvas API
    - Converts to grayscale
    - Applies blue noise threshold algorithm
  - `utils.ts`: Helper functions (hex color conversion, contrast adjustment, wrapping)

- **Noise Textures** (`lib/noise/textures.ts`):
  - Pre-baked blue noise textures embedded as base64 data URLs (64×64, 128×128, 256×256)
  - `loadNoiseTexture()` converts data URLs to `NoiseTexture` objects
  - Large file (~292KB) due to embedded base64 images

- **Custom Hooks** (`hooks/`):
  - `use-dither.ts`: Core state management for the dithering workflow
    - Manages uploaded image, parameters, and processing state
    - Debounces parameter updates (300ms) for real-time preview
    - Triggers dithering when image or parameters change
  - `use-debounce.ts`: Generic debounce hook
  - `use-mobile.ts`: Responsive breakpoint detection

### Key Technologies

- **Next.js 16** with React 19 (using React Compiler via `reactCompiler: true`)
- **TypeScript 5** with strict mode and `@/*` path aliases
- **Tailwind CSS v4** with PostCSS
- **Radix UI** for accessible component primitives
- **react-hook-form** + **Zod** for form validation
- **Sonner** for toast notifications

### Dithering Algorithm

The core algorithm (in `lib/dither/core.ts:60-140`) implements ordered dithering with blue noise:

1. Load and optionally resize the input image
2. Apply contrast adjustment if specified
3. Convert to grayscale (simple RGB average)
4. For each pixel, compare grayscale value to corresponding blue noise threshold
5. Output foreground or background color based on comparison

Blue noise textures are tiled using a wrap function to handle images larger than the noise texture.

## Important Notes

- **Client-side only**: All image processing happens in the browser (no server-side API)
- **Canvas API**: Heavy use of `HTMLCanvasElement` and `ImageData` for image manipulation
- **React 19**: Uses ref as a prop (no `React.forwardRef`)
- **Base64 textures**: `lib/noise/textures.ts` is very large due to embedded noise patterns - avoid reading the entire file
- **Husky setup**: `npm run prepare` initializes git hooks
