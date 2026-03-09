# DTA Digital Projects Dashboard - Prototype

An interactive, high-performance dashboard for tracking and visualizing major digital projects across the Australian Government. This prototype integrates live data from the **Major Digital Projects Report (MDPR) 2026** via the `data.gov.au` API.

## Architecture Overview

The prototype is built as a **Modern Static Web Application** using Next.js, ensuring high speed, low cost, and easy portability.

### Core Structure
- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router) for a robust, component-based architecture.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and performance-optimized UI.
- **Charts & Visualization**: [Recharts](https://recharts.org/) for interactive and accessible data visualization.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent, clean iconography.

### Data Layer (`lib/data.ts`)
The application implements a "Live-First" data strategy:
1. **API Integration**: Fetches the latest project data directly from the [data.gov.au](https://data.gov.au) CKAN API at runtime.
2. **Dynamic Processing**: Automatically parses CSV data, normalizes project fields, and pre-computes aggregations (Total Budget, DCA Distribution) on the client side.
3. **Resilient Fallback**: Includes built-in sample data to ensure the UI remains functional even if the external API is unreachable.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.0 or higher)
- [npm](https://www.npmjs.com/) (Standard Node Package Manager)

### Local Development
To run the dashboard in development mode with hot-reloading:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing the Production Prototype (Recommended)
Since this dashboard is optimized for **Static Export**, follow these steps to test the final production build locally:

1. **Build the project**:
   ```bash
   npm run build
   ```
   *This command compiles the app and generates a static `out/` directory.*

2. **Serve the static files**:
   ```bash
   # Run a lightweight local server to serve the exported files
   npx serve@latest out
   ```

3. **View the Dashboard**:
   Once running, the terminal will provide a URL (usually `http://localhost:3000`).

## UI Features & Functionality

### 1. KPI Insight Panel
- Real-time aggregation of active project counts.
- Total digital budget tracking in AUD billions.
- Risk monitoring (High-Risk projects with Low/Medium-Low DCA ratings).

### 2. Analytical Visualizations
- **DCA Confidence Level Distribution**: Breakdown of risk assessments (DCA 2026) by Project Tier.
- **Budget Allocation by Portfolio**: Hierarchy of investment across government sectors.
- **DCA Changes (2025 vs 2026)**: Comparative analysis showing improving or deteriorating risk trends.

### 3. Smart Project Table
- **Flexible Layout**: Fixes for column overlapping on high-density data.
- **Search & Sort**: Instant filtering and ordering by project name, budget, or DCA level.
- **DCA 2026 Visualization**: Direct visibility into current and previous assessments.

## Deployment
As a static application, this prototype can be hosted for free on:
- **GitHub Pages**
- **Vercel** (using Static Export)
- **AWS S3 / Azure Static Web Apps**

---
*Created for the DTA Capstone Project - Functional Prototype (Final Revision).*
