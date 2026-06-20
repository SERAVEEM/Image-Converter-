# Local Image Converter - Comprehensive Sprint Plan

This document outlines the detailed, step-by-step roadmap for building a premium, local-first image converter. It supports converting **JPG/JPEG/PNG** files into optimized **WebP** and **AVIF** formats.

---

## 🎯 Project Objectives

1. **100% Local Processing**: No servers, no uploads. Everything happens inside the user's local machine for maximum privacy, speed, and offline capability.
2. **Premium Visuals & Interactions**: A state-of-the-art UI with glassmorphic cards, smooth transitions, drag-and-drop support, visual progress queues, and a side-by-side comparison slider.
3. **Comprehensive Formatting**: Quality controls, resolution scaling, format choosing, and size estimation before exporting.
4. **Batch Processing**: Converting multiple files simultaneously and exporting them in a organized structure or a `.zip` archive.

---

## 🛠️ Tech Stack & Options

We will build this in a **modular fashion**. We start with a **Vite + TypeScript + Vanilla CSS** codebase (Option B), which can run offline in the browser. This exact same frontend can be wrapped into **Tauri** (Option A) to produce a standalone Windows `.exe` application with direct local folder access.

```
┌─────────────────────────────────────────────────────────┐
│              Premium Web Frontend (UI/UX)               │
│        Vite + TypeScript + Custom Vanilla CSS           │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Local Web App Format]           [Tauri Desktop Format]
  - Runs in Browser                - Runs as Native Desktop App
  - Canvas & WASM Codecs           - Local Rust Backend Codecs
  - Save via Browser Downloads     - Save direct to local folders
```

---

## 🎨 UI/UX Design System Specifications

To deliver a premium "WOW" factor, we will implement the following design system:

*   **Theme**: Cyber-dark mode with vivid accents (e.g., emerald green for success, electric violet/indigo for primary actions, deep charcoal glass panels).
*   **Aesthetics**: Glassmorphism (`backdrop-filter: blur()`), subtle glowing card borders, and custom typography (e.g., *Inter* or *Outfit*).
*   **Micro-animations**:
    *   Dynamic drag-over states (glowing pulsing border, text transitions).
    *   Smooth progress bars with glowing loading steps.
    *   Hover scale transitions (`scale(1.02)`) and elastic feedback.
*   **Comparison Interface**: Interactive slider handle to dynamically wipe between "Before" (Original) and "After" (Compressed) states.

---

## 📅 Sprint Phases & Implementation Roadmap

### Phase 1: Environment Setup & CSS Foundations
*   **Goal**: Establish the repository framework, package scripts, and layout.
*   **Tasks**:
    1. Initialize the Vite + TS template in `d:/image converter`.
    2. Write the core `index.css` defining the custom HSL palette, dark theme, and utility styles (flex, grid, borders, neon shadows, typography).
    3. Build the core layout (header, sidebar stats, main card area, footer).
*   **Deliverable**: A running Vite server presenting the base dark-mode shell.

### Phase 2: Core Conversion Engine & Single Image Upload
*   **Goal**: Establish image importing and conversion logic.
*   **Tasks**:
    1. Build the drag-and-drop file input card with full file validation (size, extension, mime-type).
    2. Create the file reader utility using `FileReader` or `URL.createObjectURL`.
    3. Implement the Canvas-based **WebP** conversion engine (using `OffscreenCanvas` where supported, configuring quality parameter `0.0` to `1.0`).
    4. Implement **AVIF** conversion logic. (For Chromium 121+, browser native `canvas.toBlob(..., 'image/avif')` is used, with fallback indicators for older engines).
*   **Deliverable**: Converting a single uploaded image to WebP or AVIF and downloading it with quality control sliders.

### Phase 3: Premium Comparison Slider & Advanced Options
*   **Goal**: Make the conversion interactive and visual.
*   **Tasks**:
    1. Implement a side-by-side comparison slider:
        * Left: Original image.
        * Right: Converted image preview.
        * Divider: Draggable horizontal slider bar.
    2. Add size/metadata estimation (show Original Size vs. Estimated Converted Size and the percentage saved).
    3. Add image manipulation parameters:
        * Max Width / Height scaling.
        * Format Selector (WebP, AVIF).
        * Compression Quality Slider.
*   **Deliverable**: A fully interactive before/after compression playground.

### Phase 4: Batch Processing & ZIP Export
*   **Goal**: Allow processing multiple images in parallel.
*   **Tasks**:
    1. Build a multi-file queue manager card showing each image's progress, status (pending, processing, completed), and individual download options.
    2. Integrate `JSZip` library to compile all converted images into a single `.zip` file on click.
    3. Build a "Stats Tracker" widget displaying total megabytes saved across the session.
*   **Deliverable**: A robust batch image optimizer with ZIP generation.

### Phase 5: Tauri Desktop Compilation (Optional Transition)
*   **Goal**: package the code into a Windows native desktop application.
*   **Tasks**:
    1. Install Tauri CLI and initialize Rust configurations (`cargo tauri init`).
    2. Connect frontend actions to Tauri native Rust file-writing APIs.
    3. Build the production package to compile the final `.exe` application.
*   **Deliverable**: Standalone Windows `.exe` desktop application.

---

## 📈 Quality & Testing Strategy

### Verification Checks
*   **Cross-Browser Testing**: Verify browser-native Canvas conversions across Chrome, Edge, and Firefox.
*   **Performance Benchmarking**: Measure memory footprint and CPU load when converting large (>10MB) images.
*   **Lossless vs. Lossy**: Test rendering at quality 100 (near-lossless) down to quality 20 (highly compressed) to ensure visual integrity.
*   **Responsive Inspection**: Verify that the drag-to-compare interface works seamlessly on mobile screens and wide desktops.
