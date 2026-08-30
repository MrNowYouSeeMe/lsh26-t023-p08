# ResultGuard Frontend Upgrade Guide

This frontend is intentionally separated from the P08 calculation engine.

## Safe places to beautify later

### 1. Theme and visual identity

Edit:

`src/styles/tokens.css`

That file contains:

- Primary colour
- Success / fail / warning colours
- Page and card surfaces
- Border colours
- Border radius
- Shadows
- Spacing
- Font stack

A full visual re-theme can be done mainly by changing those variables.

### 2. Layout and responsive behaviour

Edit:

`src/styles/app.css`

The responsive breakpoints are at the bottom of the file.

### 3. Reusable UI components

Edit components individually:

- `src/components/StatCard.tsx`
- `src/components/Badge.tsx`
- `src/components/FilterBar.tsx`
- `src/components/ResultsTable.tsx`
- `src/components/StudentTrace.tsx`
- `src/components/CheckingCenter.tsx`

### 4. Important rule

Do NOT calculate GPA again inside UI components.

The source of truth remains:

- `src/engine/grade.ts`
- `src/engine/subjectResult.ts`
- `src/engine/studentResult.ts`
- `src/engine/checkingLists.ts`

UI components only display data returned by the engine.

This means the frontend can later be redesigned, animated, re-themed, or even replaced without changing the result rules.

## Good future upgrades

After the four MVP requirements are secure:

- Better icons
- Small micro-animations
- Dark mode
- Printable student marksheet
- Grade-distribution chart
- Subject failure summary
- CSV/JSON marks upload
- Saved filter presets

Do not add visual complexity that makes the calculation trace harder for judges to read.
