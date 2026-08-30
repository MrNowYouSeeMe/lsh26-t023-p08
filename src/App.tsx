import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ResultCase,
  StudentResult,
} from "./types/models";

import {
  loadPublicFixture,
  type FixtureRoot,
} from "./data/fixture";

import { calculateStudentResult } from "./engine/studentResult";

import {
  FilterBar,
  type EdgeFilter,
  type ResultFilter,
} from "./components/FilterBar";

import { ResultsTable } from "./components/ResultsTable";
import { StudentTrace } from "./components/StudentTrace";
import { CheckingCenter } from "./components/CheckingCenter";
import { Analytics } from "./components/Analytics";
import { ImportMarks } from "./components/ImportMarks";
import { StatCard } from "./components/StatCard";

import {
  BarChartIcon,
  UploadIcon,
  CheckIcon,
  CheckListIcon,
  DashboardIcon,
  GraduationIcon,
  UsersIcon,
  WarningIcon,
  XIcon,
} from "./components/Icons";

type View = "dashboard" | "checking" | "analytics" | "import";

const PAGE_SIZE = 12;

function calculateCaseResults(
  resultCase: ResultCase
): StudentResult[] {
  return resultCase.students.map((student) =>
    calculateStudentResult(
      student,
      resultCase.subjects,
      resultCase.compulsory
    )
  );
}

function App() {
  const [fixture, setFixture] =
    useState<FixtureRoot | null>(null);

  const [selectedCaseId, setSelectedCaseId] =
    useState("PUB-01");

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [activeView, setActiveView] =
    useState<View>("dashboard");

  const [selectedResult, setSelectedResult] =
    useState<StudentResult | null>(null);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] =
    useState("ALL");

  const [resultFilter, setResultFilter] =
    useState<ResultFilter>("ALL");

  const [edgeFilter, setEdgeFilter] =
    useState<EdgeFilter>("ALL");

  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    loadPublicFixture()
      .then((data) => {
        if (cancelled) return;

        setFixture(data);

        const preferred =
          data.cases.find(
            (resultCase) =>
              resultCase.case_id === "PUB-01"
          ) ?? data.cases[0];

        setSelectedCaseId(preferred.case_id);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unknown data loading error"
        );

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCase = useMemo(() => {
    if (!fixture) return null;

    return (
      fixture.cases.find(
        (resultCase) =>
          resultCase.case_id === selectedCaseId
      ) ?? fixture.cases[0]
    );
  }, [fixture, selectedCaseId]);

  const results = useMemo(() => {
    if (!selectedCase) return [];

    return calculateCaseResults(selectedCase);
  }, [selectedCase]);

  const stats = useMemo(() => {
    const total = results.length;

    const failed = results.filter(
      (result) => result.hasCompulsoryFailure
    ).length;

    const passed = total - failed;

    const review = results.filter(
      (result) =>
        result.flags.optionalReview ||
        result.flags.practicalFail ||
        result.flags.absent
    ).length;

    return {
      total,
      passed,
      failed,
      review,
    };
  }, [results]);

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        results.map(
          (result) => result.student.class
        )
      )
    ).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return results.filter((result) => {
      const matchesSearch =
        query.length === 0 ||
        result.student.name
          .toLowerCase()
          .includes(query) ||
        result.student.id
          .toLowerCase()
          .includes(query);

      const matchesClass =
        classFilter === "ALL" ||
        result.student.class === classFilter;

      const matchesResult =
        resultFilter === "ALL" ||
        (resultFilter === "PASS" &&
          !result.hasCompulsoryFailure) ||
        (resultFilter === "FAIL" &&
          result.hasCompulsoryFailure);

      const matchesEdge =
        edgeFilter === "ALL" ||
        (edgeFilter === "COMPULSORY_FAIL" &&
          result.hasCompulsoryFailure) ||
        (edgeFilter === "PRACTICAL_FAIL" &&
          result.flags.practicalFail) ||
        (edgeFilter === "OPTIONAL_REVIEW" &&
          result.flags.optionalReview) ||
        (edgeFilter === "ABSENT" &&
          result.flags.absent);

      return (
        matchesSearch &&
        matchesClass &&
        matchesResult &&
        matchesEdge
      );
    });
  }, [
    results,
    search,
    classFilter,
    resultFilter,
    edgeFilter,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredResults.length / PAGE_SIZE)
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    classFilter,
    resultFilter,
    edgeFilter,
    selectedCaseId,
  ]);

  const pageResults = useMemo(() => {
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredResults.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredResults, page, pageCount]);

  function resetFilters() {
    setSearch("");
    setClassFilter("ALL");
    setResultFilter("ALL");
    setEdgeFilter("ALL");
  }

  function percentage(value: number): string {
    if (stats.total === 0) return "0.0%";

    return `${(
      (value / stats.total) *
      100
    ).toFixed(1)}%`;
  }

  if (loading) {
    return (
      <main className="system-state">
        <div className="loader-ring" />
        <h1>Preparing ResultGuard</h1>
        <p>
          Loading the official P08 public fixture...
        </p>
      </main>
    );
  }

  if (loadError || !fixture || !selectedCase) {
    return (
      <main className="system-state">
        <div className="system-state__error">
          <XIcon />
        </div>

        <h1>Could not load result data</h1>

        <p>
          {loadError ??
            "The P08 public fixture is unavailable."}
        </p>

        <button
          className="button button--primary"
          onClick={() => window.location.reload()}
        >
          Reload application
        </button>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">
            <GraduationIcon />
          </div>

          <div>
            <strong>ResultGuard</strong>
            <span>GPA Engine</span>
          </div>
        </div>

        <div className="sidebar-rule" />

        <nav className="sidebar-nav">
          <button
            type="button"
            className={
              activeView === "dashboard"
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
            onClick={() => setActiveView("dashboard")}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={
              activeView === "checking"
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
            onClick={() => setActiveView("checking")}
          >
            <CheckListIcon />
            <span>Pre-Publication</span>

            {stats.review > 0 && (
              <em>{stats.review}</em>
            )}
          </button>

          <button
            type="button"
            className={
              activeView === "analytics"
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
            onClick={() => setActiveView("analytics")}
          >
            <BarChartIcon />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            className={
              activeView === "import"
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
            onClick={() => setActiveView("import")}
          >
            <UploadIcon />
            <span>Import Marks</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="engine-status">
          <div className="engine-status__dot" />

          <div>
            <strong>Rule Engine Active</strong>
            <span>27 automated tests</span>
          </div>
        </div>

        <div className="sidebar-meta">
          <span>Team LSH26-T023</span>
          <span>P08 • School Results</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <GraduationIcon />
            <strong>ResultGuard</strong>
          </div>

          <div className="topbar__context">
            <span>School Result Processing</span>
            <strong>
              GPA Engine & Publication Checks
            </strong>
          </div>

          <div className="topbar__actions">
            <label className="case-selector">
              <span>Public test case</span>

              <select
                value={selectedCaseId}
                onChange={(event) =>
                  setSelectedCaseId(
                    event.target.value
                  )
                }
              >
                {fixture.cases.map((resultCase) => (
                  <option
                    key={resultCase.case_id}
                    value={resultCase.case_id}
                  >
                    {resultCase.case_id}
                  </option>
                ))}
              </select>
            </label>

            <div className="topbar-badge">
              Schema {fixture.schema_version}
            </div>
          </div>
        </header>

        <main className="main-content">
          {activeView === "dashboard" ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    {selectedCase.case_id} •{" "}
                    {selectedCase.students.length} STUDENTS
                  </div>

                  <h1>Results Dashboard</h1>

                  <p>
                    Every GPA, failure and review flag below
                    is generated by the P08 rule engine.
                  </p>
                </div>

                <div className="rules-chip">
                  <CheckIcon />
                  Exact P08 rules
                </div>
              </section>

              <section className="stats-grid">
                <StatCard
                  label="Total Students"
                  value={stats.total}
                  helper="100% processed"
                  tone="primary"
                  icon={<UsersIcon />}
                />

                <StatCard
                  label="Passed"
                  value={stats.passed}
                  helper={percentage(stats.passed)}
                  tone="success"
                  icon={<CheckIcon />}
                />

                <StatCard
                  label="Failed"
                  value={stats.failed}
                  helper={percentage(stats.failed)}
                  tone="danger"
                  icon={<XIcon />}
                />

                <StatCard
                  label="Needs Review"
                  value={stats.review}
                  helper={percentage(stats.review)}
                  tone="warning"
                  icon={<WarningIcon />}
                />
              </section>

              <FilterBar
                search={search}
                classFilter={classFilter}
                resultFilter={resultFilter}
                edgeFilter={edgeFilter}
                classes={classOptions}
                onSearchChange={setSearch}
                onClassChange={setClassFilter}
                onResultChange={setResultFilter}
                onEdgeChange={setEdgeFilter}
                onReset={resetFilters}
              />

              <ResultsTable
                results={pageResults}
                totalFiltered={filteredResults.length}
                page={Math.min(page, pageCount)}
                pageCount={pageCount}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                onViewTrace={setSelectedResult}
              />
            </>
          ) : activeView === "checking" ? (
            <CheckingCenter
              results={results}
              onViewTrace={setSelectedResult}
            />
          ) : activeView === "analytics" ? (
            <Analytics results={results} />
          ) : (
            <ImportMarks results={results} />
          )}
        </main>

        <nav className="mobile-nav">
          <button
            type="button"
            className={
              activeView === "dashboard"
                ? "mobile-nav__item mobile-nav__item--active"
                : "mobile-nav__item"
            }
            onClick={() => setActiveView("dashboard")}
          >
            <DashboardIcon />
            Dashboard
          </button>

          <button
            type="button"
            className={
              activeView === "checking"
                ? "mobile-nav__item mobile-nav__item--active"
                : "mobile-nav__item"
            }
            onClick={() => setActiveView("checking")}
          >
            <CheckListIcon />
            Checking
          </button>

          <button
            type="button"
            className={
              activeView === "analytics"
                ? "mobile-nav__item mobile-nav__item--active"
                : "mobile-nav__item"
            }
            onClick={() => setActiveView("analytics")}
          >
            <BarChartIcon />
            Analytics
          </button>

          <button
            type="button"
            className={
              activeView === "import"
                ? "mobile-nav__item mobile-nav__item--active"
                : "mobile-nav__item"
            }
            onClick={() => setActiveView("import")}
          >
            <UploadIcon />
            Import
          </button>
        </nav>
      </div>

      {selectedResult && (
        <StudentTrace
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

export default App;


