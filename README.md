# DTA Dashboard (MDPR 2026)

Interactive dashboard for the 2026 Major Digital Projects Report (MDPR), built with Next.js App Router, React, Tailwind CSS, and Recharts.

## Overview

This project provides a single-page operational dashboard to monitor:

1. Portfolio-level budget distribution.
2. DCA confidence by project tier.
3. Year-over-year DCA comparison.
4. Critical projects timeline.
5. Searchable and sortable project table.

The app includes:

1. Dark and Light theme switching.
2. Accessible navigation and keyboard-friendly table interactions.
3. Runtime CSV parsing and validation.
4. API-level short-term response caching.
5. Quality gates for linting, type-checking, tests, and production build.

## Tech Stack

1. Next.js 16 (App Router, Turbopack)
2. React 19
3. Tailwind CSS v4
4. Radix UI primitives
5. Recharts
6. next-themes
7. Zod
8. Vitest
9. ESLint

## Prerequisites

1. Node.js 20 or newer
2. pnpm 10 or newer

Check your environment:

```bash
node -v
pnpm -v
```

## Installation

From the project root:

```bash
pnpm install
```

## Running the Dashboard

### Development mode

```bash
pnpm dev
```

Default URL:

1. http://localhost:3000

Run on a different port:

```bash
pnpm dev -- -p 3001
```

### Production mode

```bash
pnpm build
pnpm start
```

## Available Scripts

1. `pnpm dev` - Start development server.
2. `pnpm build` - Create optimized production build.
3. `pnpm start` - Start production server.
4. `pnpm lint` - Run ESLint with zero-warning policy.
5. `pnpm typecheck` - Run TypeScript checks with `tsc --noEmit`.
6. `pnpm test` - Run unit tests with Vitest.
7. `pnpm test:watch` - Run Vitest in watch mode.
8. `pnpm test:coverage` - Generate coverage report.

## Quality Gate (Pre-Push Checklist)

Run all checks before pushing to GitHub:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Optional coverage check:

```bash
pnpm test:coverage
```

## Data Source and API

Primary data file:

1. `mdpr-2026-project-data.csv`

Dashboard API endpoint:

1. `/api/dashboard`

Supported query parameters:

1. `portfolio`
2. `agency`
3. `tier`
4. `deliveryStatus`
5. `dca2026`

Example:

```text
/api/dashboard?portfolio=Treasury&tier=Tier%201&dca2026=High
```

## Project Structure (Key Paths)

1. `app/page.tsx` - Main dashboard page and client orchestration.
2. `app/layout.tsx` - Root layout, fonts, theme provider, skip link.
3. `app/api/dashboard/route.ts` - Dashboard API route.
4. `lib/server/dashboard-data.ts` - CSV load, parsing, validation, transformations.
5. `components/dashboard/*` - Charts, filters, KPI panel, and table components.
6. `app/globals.css` - Global design tokens and theme variables.
7. `types/*` - Shared type contracts.

## Themes

The dashboard supports both Dark and Light mode via the sun/moon switch in the top information bar.

Implementation notes:

1. Theme state is managed with `next-themes`.
2. Tokens are defined in `app/globals.css` for `:root` (Light) and `.dark` (Dark).

## Accessibility Notes

Implemented improvements include:

1. Skip-to-content link.
2. Semantic status and alert states for loading/error flows.
3. Keyboard-accessible sorting controls in the project table.
4. Chart fallback data tables for non-visual access.

## Troubleshooting

### Port 3000 already in use

Find process using port 3000 (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

Terminate the process by PID:

```powershell
taskkill /PID <PID> /F
```

Then start again:

```bash
pnpm dev
```

### Dashboard page does not load data

1. Verify app root is reachable: `http://localhost:3000`
2. Verify API is reachable: `http://localhost:3000/api/dashboard`
3. Confirm CSV exists at project root: `mdpr-2026-project-data.csv`

### Hydration warning in development

If you see hydration mismatch warnings referencing extra attributes on `body`, they may come from browser extensions injecting DOM attributes before hydration.

## Release Readiness Status

The project is configured to be release-friendly with:

1. ESLint gate (`--max-warnings=0`)
2. TypeScript gate (`tsc --noEmit`)
3. Unit tests (Vitest)
4. Production build validation

## License and Usage

Internal/project usage unless a separate license is added.
