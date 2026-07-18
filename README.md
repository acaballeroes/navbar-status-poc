# Navbar-status PoC

A proof-of-concept data visualization project built with TypeScript, Vite, and D3.js.

## Overview

This PoC displays linked and unlinked data areas, including core and draft elements. Users can dynamically adjust the number of data points and see the visualization update in real-time.

The navigation bar serves as the **single source of truth** for the railroad data, displaying the complete dataset in its actual state without any interpolations or abstractions. This ensures that all visualizations and interactions are grounded in real, unmodified data.

Rather than using rectangular representations, this visualization employs **polygonal areas** to represent distinct data domains (core vs. draft states). This approach offers several key advantages:

- **Natural Spatial Representation** - Polygons allow data to occupy its actual geographic or logical space without forcing it into rigid rectangular grids.
- **No Interpolation Required** - Each data point maps directly to its precise position within the polygon, eliminating the need for artificial interpolation between points.
- **Clear State Differentiation** - Distinct polygon shapes and boundaries make it visually intuitive to distinguish between core data and draft data.
- **True Data Positioning** - Data elements are placed at their actual coordinates rather than approximated locations, preserving data integrity and enabling accurate spatial analysis.

## Project Structure

- `src/` - TypeScript source code
  - `main.ts` - Main visualization initialization
  - `utils.ts` - Utility functions for data creation
  - `models.ts` - Type definitions
  - `style.css` - Styling
- `index.html` - HTML entry point
- `package.json` - Project dependencies and scripts

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Dependencies

- **d3** - Data visualization library
- **vite** - Frontend build tool
- **typescript** - TypeScript compiler
