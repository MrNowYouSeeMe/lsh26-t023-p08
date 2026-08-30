# ResultGuard Frontend Architecture Guide

This document describes how to modify or redesign the ResultGuard frontend without duplicating or breaking the P08 result rules.

## Architectural Boundary

The UI is a presentation layer.

It must not independently calculate:

- grade points,
- practical pass thresholds,
- optional bonuses,
- final GPA,
- compulsory-failure overrides,
- checking-list membership.

Those values belong to the domain engine.

## Domain Engine

Primary source-of-truth files:

| File | Responsibility |
|---|---|
| `src/engine/grade.ts` | Grade-point and letter-grade boundaries |
| `src/engine/subjectResult.ts` | Normal/practical subject evaluation and AB handling |
| `src/engine/studentResult.ts` | Compulsory/optional aggregation, bonus, cap, final override, flags |
| `src/engine/checkingLists.ts` | Optional Review, Practical Fail, and Absent lists |
| `src/engine/analytics.ts` | Aggregate analysis over calculated student results |

A frontend redesign should consume these outputs rather than reconstruct their formulas.

## Import Boundary

The import subsystem lives separately in:

| File | Responsibility |
|---|---|
| `src/import/parser.ts` | CSV and tab-separated table parsing |
| `src/import/validator.ts` | Identity, schema, subject, range, and AB validation |
| `src/import/types.ts` | Import/report types |

The current import UI validates and previews accepted rows. It does not persist or apply imported rows to the active result fixture.

## Main UI Components

| Component | Responsibility |
|---|---|
| `ResultsTable.tsx` | Student result browsing |
| `FilterBar.tsx` | Search and result/edge filters |
| `StudentTrace.tsx` | Explainable result calculation trace |
| `CheckingCenter.tsx` | Pre-publication checking workflow |
| `Analytics.tsx` | Class-level performance view |
| `ImportMarks.tsx` | Marks paste/upload validation interface |
| `PrintableMarksheet.tsx` | Print-specific individual result sheet |
| `StatCard.tsx` | Dashboard summary card |
| `Badge.tsx` | Status presentation |
| `Icons.tsx` | Project-authored inline SVG React icons |

## Styling

### Design Tokens

Edit:

`src/styles/tokens.css`

Use this file for product-wide visual values such as primary colour, success/failure/warning colours, surfaces, borders, radii, shadows, spacing, and font stack.

### Layout and Component Styling

Edit:

`src/styles/app.css`

This file owns dashboard layout, component presentation, responsive breakpoints, mobile navigation, analytics/import interfaces, trace styling, and print CSS.

## Print Behaviour

`PrintableMarksheet.tsx` is hidden during normal screen use.

The `@media print` rules in `src/styles/app.css` hide the interactive trace/drawer UI and expose only the printable A4-oriented marksheet.

When changing the trace layout, always re-test `Print Marksheet` because screen-drawer dimensions should not leak into print layout.

## Safe Visual Upgrades

Safe changes include colour/token updates, spacing, typography, card treatment, responsive layout, transitions, table density, navigation styling, or replacement of presentation components.

After any visual change, verify:

1. Dashboard at desktop width.
2. Trace readability.
3. Checking Center.
4. Analytics.
5. Import validation report.
6. Mobile navigation/layout.
7. Marksheet print preview.
8. `npm test`.
9. `npm run build`.

## Rule for Future Product Features

If a feature needs GPA data, consume `StudentResult` or extend the engine deliberately.

Do not add a second GPA implementation inside a component.

If accepted imported rows are later applied to results, route them through the same existing student-result engine rather than introducing an import-specific GPA calculation.

## Current Product Extensions

The following features are already implemented and should no longer be treated as future frontend ideas:

- class analytics and grade distribution,
- compulsory-subject failure analysis,
- printable student marksheet,
- CSV/text and spreadsheet-paste validation,
- exact rejected-row reporting.

Possible future work includes persisted datasets, authentication, role-based access, direct `.xlsx` parsing, school information-system integration, and export/report workflows.
