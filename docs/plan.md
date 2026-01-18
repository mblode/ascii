# ASCII Rendering Library Plan (Expanded)

## Goal
Replace the current ordered-dither pipeline with a shape-aware ASCII renderer implemented as `lib/ascii`, running via `ascii-worker.ts` by default, producing sharper edges and cel-shaded contrast for both static images and interactive previews. (Refs: `docs/technical-spec.md:L1-L21`, `docs/content.md:L5-L21`)

## Source Index (line references)

### Technical Spec (design + algorithms)
- System overview & phases: `docs/technical-spec.md:L14-L22`
- Shape vectors (6D), sampling regions, normalization: `docs/technical-spec.md:L88-L105`, `docs/technical-spec.md:L168-L169`
- Global + directional contrast enhancement: `docs/technical-spec.md:L10-L19`, `docs/technical-spec.md:L405-L468`
- Output options (<pre> and canvas): `docs/technical-spec.md:L12-L21`, `docs/technical-spec.md:L350-L395`
- Performance: k‑d tree, caching, worker/GPU: `docs/technical-spec.md:L400-L468`

### Content (experience targets)
- Motivation: sharp edges + shape-based rendering: `docs/content.md:L5-L21`, `docs/content.md:L90-L101`
- Shape vectors & sampling circles: `docs/content.md:L103-L113`
- Shape-based lookup + normalization: `docs/content.md:L117-L172`
- 6D staggered layout: `docs/content.md:L187-L201`
- Global contrast enhancement: `docs/content.md:L235-L349`
- Directional contrast enhancement + external sampling: `docs/content.md:L500-L563`
- Widened external influence mapping: `docs/content.md:L636-L640`
- Lookup caching + quantization: `docs/content.md:L1031-L1067`, `docs/content.md:L1068-L1097`
- GPU acceleration pipeline (future): `docs/content.md:L1099-L1111`

## Replacement Target (current dither)
- `lib/dither/types.ts`: `DitherParameters`, `NoiseTexture`, `RGB`
- `lib/dither/core.ts`: `applyDither()` (load/resize, grayscale, noise threshold)
- `lib/dither/utils.ts`: hex → RGB, contrast/brightness, wrap

## Assumptions
- ASCII output must still render to `ImageData` for existing preview/download UI.
- A worker-first implementation is required for responsiveness; fallback to main thread only if OffscreenCanvas is unavailable.
- Monochrome (single-color) ASCII is the default; optional color output is deferred.

## Open Questions (resolve before Phase 6)
- Default monospace font choice for public UI? (affects vector precomputation)
- Should we keep the existing `brightness`/`contrast` sliders, or replace with `contrastExponent` + `directionalContrastExponent`?
- Should the ASCII output be primary (`<pre>` text) or stay canvas-first?

---

## Phases & Todos

### Phase 1 — API & Types (foundation) ✅
- [x] Define `AsciiRenderOptions`, `AsciiFontSpec`, `AsciiSamplingLayout`, `AsciiRenderResult`, `AsciiCharacterSet`.
- [x] Define worker message types `AsciiWorkerRequest`/`AsciiWorkerResponse` for file + options → grid + ImageData.
- [x] Define defaults: charset, font metrics, 6D sampling circles, contrast exponents, cache levels.
- [x] Export a stable public API (`lib/ascii/index.ts`) mirroring current `applyDither` usage, plus ASCII-specific options.

### Phase 2 — Character Shape Vectors ✅
- [x] Implement `buildCharacterSet()` to rasterize each glyph to a cell canvas and compute its 6D vector. (Refs: `docs/technical-spec.md:L88-L105`, `docs/content.md:L103-L113`)
- [x] Normalize vectors across the charset (component max normalization). (Refs: `docs/content.md:L155-L172`, `docs/technical-spec.md:L168-L169`)
- [x] Cache by (font spec + cell size + charset + layout) to avoid recomputation across renders.

### Phase 3 — Image Sampling Vectors ✅
- [x] Convert RGB → luminance using relative luminance formula. (Refs: `docs/technical-spec.md:L26-L27`)
- [x] Build internal sampling vectors using the same 6D layout as the character vectors. (Refs: `docs/content.md:L187-L201`)
- [x] Build external sampling vectors for directional contrast enhancement. (Refs: `docs/content.md:L500-L563`)
- [x] Implement sample quality control (sampleCount) and bilinear sampling for stability.

### Phase 4 — Contrast Enhancement ✅
- [x] Apply global contrast enhancement via normalized exponent. (Refs: `docs/content.md:L235-L349`, `docs/technical-spec.md:L10-L19`)
- [x] Apply directional contrast enhancement using external vectors to sharpen boundaries. (Refs: `docs/content.md:L500-L563`)
- [x] Implement widened external influence mapping to reduce staircasing artifacts. (Refs: `docs/content.md:L636-L640`)

### Phase 5 — Character Lookup + Caching ✅
- [x] Implement nearest-neighbor search in 6D with squared distance.
- [x] Add quantized cache keying for sampling vectors. (Refs: `docs/content.md:L1031-L1067`, `docs/technical-spec.md:L423-L457`)
- [ ] Optional: add k‑d tree lookup for larger charsets. (Refs: `docs/technical-spec.md:L406-L422`) — Deferred for future optimization.

### Phase 6 — Output Rendering ✅
- [x] Output ASCII grid as `string[]` rows for `<pre>` rendering. (Refs: `docs/technical-spec.md:L350-L395`)
- [x] Render ASCII grid to `ImageData` via canvas for existing UI pipeline. (Refs: `docs/technical-spec.md:L12-L21`)
- [x] Ensure aspect ratio via `cellWidth`/`cellHeight` and line-height mapping. (Refs: `docs/technical-spec.md:L24-L27`, `docs/technical-spec.md:L390-L395`)

### Phase 7 — Worker Integration (required) ✅
- [x] Implement `lib/workers/ascii-worker.ts` using OffscreenCanvas and the core pipeline.
- [x] Add `lib/ascii/worker-client.ts` for worker orchestration + fallback.
- [x] Default all rendering to worker; detect OffscreenCanvas support for fallback.

### Phase 8 — App Integration (replace dither) ✅
- [x] Add `hooks/use-ascii.ts` mirroring `use-dither` return shape, with `asciiGrid` + `imageData`.
- [x] Update `app/page.tsx` and `components/ascii/*` to read ASCII output instead of dithered image only.
- [x] Add ASCII-specific settings (cell width/height, contrast exponents, sample count) via `AsciiControlsPanel`.

### Phase 9 — QA + Perf ✅
- [x] Unit tests for vector normalization, quantization, and contrast enhancement math. (114 tests passing)
- [ ] Perf sanity checks (cache hit rate, render time on typical images). — Deferred for runtime benchmarking.
- [x] Run `npm exec -- ultracite check` + `npm exec -- ultracite fix`.

---

## File-Level Plan (implementation-ready)

### 1) Types + Defaults
- File: `lib/ascii/types.ts:1`
  - Add all render and worker types. (Refs: `docs/technical-spec.md:L12-L21`, `docs/technical-spec.md:L350-L395`)
- File: `lib/ascii/defaults.ts:1`
  - Add `DEFAULT_CHARSET`, `DEFAULT_FONT`, `DEFAULT_SAMPLING_LAYOUT`, `DEFAULT_RENDER_OPTIONS`, `DEFAULT_CACHE_OPTIONS`. (Refs: `docs/technical-spec.md:L88-L105`, `docs/technical-spec.md:L423-L431`)
- File: `lib/ascii/index.ts:1`
  - Export core API + worker client. (Refs: `docs/technical-spec.md:L12-L21`)

### 2) Character Vectors
- File: `lib/ascii/characters.ts:1`
  - Implement glyph rasterization and 6D vector calculation. (Refs: `docs/technical-spec.md:L88-L105`, `docs/technical-spec.md:L112-L169`, `docs/content.md:L103-L113`)
  - Normalize vectors and cache results. (Refs: `docs/content.md:L155-L172`, `docs/technical-spec.md:L469-L472`)

### 3) Sampling + Contrast
- File: `lib/ascii/sampling.ts:1`
  - Implement luminance conversion + internal/external sampling vectors. (Refs: `docs/technical-spec.md:L26-L27`, `docs/content.md:L187-L201`, `docs/content.md:L500-L563`)
- File: `lib/ascii/contrast.ts:1`
  - Implement global + directional contrast enhancement. (Refs: `docs/content.md:L235-L349`, `docs/content.md:L500-L563`)

### 4) Lookup + Caching
- File: `lib/ascii/lookup.ts:1`
  - Implement nearest neighbor + quantized cache keys. (Refs: `docs/content.md:L1031-L1067`, `docs/technical-spec.md:L423-L457`)
  - Optional k‑d tree integration for large charsets. (Refs: `docs/technical-spec.md:L406-L422`)

### 5) Core Rendering
- File: `lib/ascii/core.ts:1`
  - Implement `renderAsciiFromImageData`, `renderAsciiFromFile`, `renderAsciiToImageData`. (Refs: `docs/technical-spec.md:L12-L21`, `docs/technical-spec.md:L350-L395`)

### 6) Worker Pipeline
- File: `lib/workers/ascii-worker.ts:1`
  - Implement OffscreenCanvas worker and message handling. (Refs: `docs/technical-spec.md:L21`, `docs/technical-spec.md:L469-L470`)
- File: `lib/ascii/worker-client.ts:1`
  - Implement worker orchestration, fallback, and typed request/response.

### 7) App Integration
- File: `hooks/use-ascii.ts:1`
  - Hook returning `asciiGrid`, `imageData`, `isProcessing`, and dimension metadata.
- File: `app/page.tsx:1`
  - Replace dither workflow with ASCII worker outputs.
- File: `components/dither/*`
  - Update preview + controls for ASCII-specific parameters.

---

## Acceptance Criteria
- Output shows sharp edges due to shape-based matching. (Refs: `docs/content.md:L90-L201`)
- Contrast enhancement improves boundary definition without staircasing. (Refs: `docs/content.md:L235-L349`, `docs/content.md:L500-L563`)
- Renderer outputs both text grid and ImageData for preview/download parity. (Refs: `docs/technical-spec.md:L12-L21`)
- Worker-first pipeline is operational with fallback for unsupported browsers. (Refs: `docs/technical-spec.md:L21`, `docs/technical-spec.md:L469-L470`)

## Validation Checklist
- [ ] Types explicit; no `any`.
- [ ] No `console.log` / `debugger` in production code.
- [ ] Ultracite checks pass.
- [ ] Visual output matches sharp edge + contrast goals.
- [ ] Cache hit rate is measurable and reduces lookup cost.

## Standards
Follow Ultracite + TypeScript explicitness rules from `AGENTS.md`. If UI is touched, follow `implement-frontend` standards.
