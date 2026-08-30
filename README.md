# ResultGuard - P08 GPA Engine

**Team:** LSH26-T023
**Problem:** P08 - School Result Processing and GPA Engine
**Hackathon:** LofiStack Hackathon 2026

ResultGuard calculates school results using the exact P08 rules and provides transparent per-student calculation traces and pre-publication checking lists.

## MVP Coverage

- Official P08 public fixture with 60+ students
- Class 9 and Class 10
- Six compulsory subjects and one optional fourth subject
- Normal and theory/practical subjects
- Exact subject GP and final GPA calculation
- Compulsory failure override
- AB handled separately from numeric 0
- Per-student calculation trace
- Optional Review, Practical Fail and Absent checking lists

## Core Rules

Normal grading:
- 80-100 = GP 5.0
- 70-79 = GP 4.0
- 60-69 = GP 3.5
- 50-59 = GP 3.0
- 40-49 = GP 2.0
- 33-39 = GP 1.0
- Below 33 = GP 0.0

Practical subjects require:
- Theory >= 25 out of 75
- Practical >= 8 out of 25

If either component fails, subject GP is 0 regardless of total.

Optional bonus = max(0, optionalGP - 2)

Final uncancelled GPA = (sum of 6 compulsory GPs + optional bonus) / 6

Maximum GPA is 5.00.

If any compulsory subject fails, final GPA becomes 0.00 and letter grade F. The uncancelled GPA remains visible in the trace.

## Absence

AB remains a distinct value and is never converted to numeric zero.

- Compulsory AB causes overall F
- Optional AB gives no optional bonus but does not independently fail the overall result
- Numeric 0 is a real mark and is not considered absent

## Checking Center

- Optional Review: optional GP <= 2.0
- Practical Fail: actual practical component below 8
- Absent: AB in any subject

The same student may appear in multiple lists.

## Features

- Results dashboard
- Student search
- Class filter
- Pass/fail filter
- Edge-case filters
- Pagination
- Public fixture case selector
- Calculation trace
- Pre-publication checking center
- Responsive layout
- Loading, error and empty states

## Run Locally

Install dependencies:

npm install

Start development server:

npm run dev

Run tests:

npm test

Production build:

npm run build

## Architecture

Calculation logic:
src/engine/

Reusable UI:
src/components/

Design tokens:
src/styles/tokens.css

Responsive styling:
src/styles/app.css

See FRONTEND_GUIDE.md for instructions on future frontend upgrades.

The UI does not independently calculate GPA. The calculation engine remains the single source of truth.

## External Services

No backend, database, authentication service, AI API or runtime external API is required.

The official P08 public fixture is bundled locally with the deployed application.

## Possible Next Improvements

- Class summary and grade distribution
- Printable individual marksheet
- Marks-sheet import with row validation

## Event Record

See EVENT.md for the event-start declaration and repository history.
