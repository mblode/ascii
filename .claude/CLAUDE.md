# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASCII is a Next.js 16 web application that applies high-quality ASCII rendering to images. It's a client-side image processing tool built with React 19, TypeScript, and Tailwind CSS v4.

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

## Important Notes

- **Client-side only**: All image processing happens in the browser (no server-side API)
- **Canvas API**: Heavy use of `HTMLCanvasElement` and `ImageData` for image manipulation
- **React 19**: Uses ref as a prop (no `React.forwardRef`)
- **Base64 textures**: `lib/noise/textures.ts` is very large due to embedded noise patterns - avoid reading the entire file
- **Husky setup**: `npm run prepare` initializes git hooks
