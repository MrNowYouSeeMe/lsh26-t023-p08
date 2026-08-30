import {
  useMemo,
  useState,
} from "react";

import type { StudentResult } from "../types/models";

import {
  buildAnalytics,
  GRADE_ORDER,
} from "../engine/analytics";

import {
  BarChartIcon,
  CheckIcon,
  UsersIcon,
  WarningIcon,
  XIcon,
} from "./Icons";

interface AnalyticsProps {
  results: StudentResult[];
}

export function Analytics({
  results,
}: AnalyticsProps) {
  const [classFilter, setClassFilter] =
    useState("ALL");

  const classes = useMemo(
    () =>
      Array.from(
        new Set(
          results.map(
            (result) => result.student.class
          )
        )
      ).sort(),
    [results]
  );

  const scopedResults = useMemo(
    () =>
      classFilter === "ALL"
        ? results
        : results.filter(
            (result) =>
              result.student.class === classFilter
          ),
    [results, classFilter]
  );

  const analytics = useMemo(
    () => buildAnalytics(scopedResults),
    [scopedResults]
  );

  const maxGradeCount = Math.max(
    1,
    ...GRADE_ORDER.map(
      (grade) =>
        analytics.gradeDistribution[grade] ?? 0
    )
  );

  const maxSubjectFailures = Math.max(
    1,
    ...analytics.subjectFailures.map(
      (subject) => subject.failures
    )
  );

  const mostFailed =
    analytics.mostFailedSubject;

  return (
    <div className="analytics-page">
      <section className="analytics-heading">
        <div>
          <div className="eyebrow">
            BONUS • CLASS PERFORMANCE
          </div>

          <h1>Class Analytics</h1>

          <p>
            Pass rate, grade distribution and
            compulsory-subject failure patterns are
            derived directly from final engine results.
          </p>
        </div>

        <label className="analytics-scope">
          <span>Analysis scope</span>

          <select
            value={classFilter}
            onChange={(event) =>
              setClassFilter(event.target.value)
            }
          >
            <option value="ALL">
              All classes
            </option>

            {classes.map((className) => (
              <option
                key={className}
                value={className}
              >
                {className}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="analytics-stats">
        <article className="analytics-stat">
          <div className="analytics-stat__icon analytics-stat__icon--primary">
            <UsersIcon />
          </div>

          <div>
            <span>Students</span>
            <strong>{analytics.total}</strong>
            <small>
              Current analysis scope
            </small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon analytics-stat__icon--success">
            <CheckIcon />
          </div>

          <div>
            <span>Pass Rate</span>
            <strong>
              {analytics.passRate.toFixed(2)}%
            </strong>
            <small>
              {analytics.passed} passed •{" "}
              {analytics.failed} failed
            </small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon analytics-stat__icon--primary">
            <BarChartIcon />
          </div>

          <div>
            <span>Average GPA</span>
            <strong>
              {analytics.averageGpa.toFixed(2)}
            </strong>
            <small>
              Final GPA including fail overrides
            </small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon analytics-stat__icon--danger">
            <WarningIcon />
          </div>

          <div>
            <span>Most Failed Subject</span>
            <strong className="analytics-stat__subject">
              {mostFailed
                ? mostFailed.subjectName
                : "None"}
            </strong>
            <small>
              {mostFailed
                ? `${mostFailed.failures} student failure${mostFailed.failures === 1 ? "" : "s"}`
                : "No compulsory failures"}
            </small>
          </div>
        </article>
      </section>

      <div className="analytics-grid">
        <section className="analytics-card">
          <header className="analytics-card__header">
            <div>
              <div className="eyebrow">
                RESULT MIX
              </div>

              <h2>Grade Distribution</h2>

              <p>
                Number of students receiving each final
                letter grade.
              </p>
            </div>
          </header>

          <div className="grade-chart">
            {GRADE_ORDER.map((grade) => {
              const count =
                analytics.gradeDistribution[
                  grade
                ] ?? 0;

              const width =
                (count / maxGradeCount) * 100;

              return (
                <div
                  className="grade-bar-row"
                  key={grade}
                >
                  <div
                    className={`grade-chip ${
                      grade === "F"
                        ? "grade-chip--fail"
                        : ""
                    }`}
                  >
                    {grade}
                  </div>

                  <div className="grade-track">
                    <div
                      className={`grade-fill ${
                        grade === "F"
                          ? "grade-fill--fail"
                          : ""
                      }`}
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>

                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="analytics-card">
          <header className="analytics-card__header">
            <div>
              <div className="eyebrow">
                FAILURE HOTSPOT
              </div>

              <h2>
                Compulsory Subject Failures
              </h2>

              <p>
                Subjects ranked by number of students
                who did not pass.
              </p>
            </div>
          </header>

          <div className="subject-failure-chart">
            {analytics.subjectFailures.map(
              (subject) => {
                const width =
                  (subject.failures /
                    maxSubjectFailures) *
                  100;

                return (
                  <div
                    className="subject-failure-row"
                    key={subject.subjectCode}
                  >
                    <div className="subject-failure-row__label">
                      <strong>
                        {subject.subjectName}
                      </strong>

                      <span>
                        {subject.subjectCode}
                      </span>
                    </div>

                    <div className="subject-failure-track">
                      <div
                        className="subject-failure-fill"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <strong className="subject-failure-count">
                      {subject.failures}
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        </section>
      </div>

      <section className="failure-detail-card">
        <header className="failure-detail-card__header">
          <div>
            <div className="eyebrow">
              FAILURE REASON BREAKDOWN
            </div>

            <h2>
              {mostFailed
                ? mostFailed.subjectName
                : "No failed subject"}
            </h2>

            <p>
              Reasons are based on actual component and
              absence rules from the result engine.
            </p>
          </div>

          {mostFailed && (
            <div className="failure-total-pill">
              {mostFailed.failures} failed
            </div>
          )}
        </header>

        {mostFailed ? (
          <div className="failure-reason-grid">
            <article>
              <span>Absent</span>
              <strong>
                {mostFailed.absent}
              </strong>
              <small>
                AB in this compulsory subject
              </small>
            </article>

            <article>
              <span>Theory Fail</span>
              <strong>
                {mostFailed.theoryFail}
              </strong>
              <small>
                Theory component below 25
              </small>
            </article>

            <article>
              <span>Practical Fail</span>
              <strong>
                {mostFailed.practicalFail}
              </strong>
              <small>
                Practical component below 8
              </small>
            </article>

            <article>
              <span>Below 33</span>
              <strong>
                {mostFailed.below33}
              </strong>
              <small>
                Non-practical subject mark below 33
              </small>
            </article>
          </div>
        ) : (
          <div className="analytics-empty">
            <CheckIcon />
            <strong>
              No compulsory failures in this scope
            </strong>
          </div>
        )}

        <div className="analytics-rule-note">
          <WarningIcon />

          <p>
            Pass/fail analytics never use optional-subject
            failure as an overall failure. Overall failure
            comes only from the existing compulsory-failure
            result produced by the GPA engine.
          </p>
        </div>
      </section>
    </div>
  );
}
