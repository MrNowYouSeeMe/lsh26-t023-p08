import { useMemo, useState } from "react";
import type { StudentResult } from "../types/models";
import { buildCheckingLists } from "../engine/checkingLists";
import { Badge } from "./Badge";
import { InfoIcon, EyeIcon } from "./Icons";

type CheckTab =
  | "optionalReview"
  | "practicalFail"
  | "absent";

interface CheckingCenterProps {
  results: StudentResult[];
  onViewTrace: (result: StudentResult) => void;
}

const labels: Record<CheckTab, string> = {
  optionalReview: "Optional Review",
  practicalFail: "Practical Fail",
  absent: "Absent",
};

function detailFor(
  result: StudentResult,
  tab: CheckTab
): string {
  if (tab === "optionalReview") {
    if (result.optionalResult.absent) {
      return `${result.student.optional}: AB • Optional GP 0.0`;
    }

    return `${result.student.optional}: GP ${result.optionalGp.toFixed(
      1
    )} ≤ 2.0`;
  }

  if (tab === "practicalFail") {
    const failedSubjects = [
      ...result.compulsoryResults,
      result.optionalResult,
    ]
      .filter(
        (subject) =>
          subject.practicalMark !== null &&
          subject.practicalPassed === false
      )
      .map(
        (subject) =>
          `${subject.subjectCode} practical ${subject.practicalMark}/25`
      );

    return failedSubjects.join(" • ");
  }

  const absentSubjects = [
    ...result.compulsoryResults,
    result.optionalResult,
  ]
    .filter((subject) => subject.absent)
    .map((subject) => subject.subjectCode);

  return `AB in ${absentSubjects.join(", ")}`;
}

export function CheckingCenter({
  results,
  onViewTrace,
}: CheckingCenterProps) {
  const [activeTab, setActiveTab] =
    useState<CheckTab>("optionalReview");

  const lists = useMemo(
    () => buildCheckingLists(results),
    [results]
  );

  const activeList = lists[activeTab];

  return (
    <div className="checking-page">
      <section className="checking-hero">
        <div>
          <div className="eyebrow">
            PRE-PUBLICATION CONTROL
          </div>

          <h1>Checking Center</h1>

          <p>
            Review rule-sensitive students before results
            are published.
          </p>
        </div>

        <div className="review-total">
          <span>Review events</span>
          <strong>
            {lists.optionalReview.length +
              lists.practicalFail.length +
              lists.absent.length}
          </strong>
        </div>
      </section>

      <div className="alert alert--info checking-info">
        <InfoIcon />

        <div>
          <strong>
            A student may correctly appear in multiple
            lists.
          </strong>

          <p>
            Lists follow P08 R-29 independently: optional
            GP ≤ 2.0, practical part below 8, and any AB.
          </p>
        </div>
      </div>

      <section className="check-tabs">
        {(
          [
            "optionalReview",
            "practicalFail",
            "absent",
          ] as CheckTab[]
        ).map((tab) => {
          const tone =
            tab === "optionalReview"
              ? "warning"
              : tab === "practicalFail"
                ? "danger"
                : "neutral";

          return (
            <button
              key={tab}
              type="button"
              className={`check-tab ${
                activeTab === tab
                  ? "check-tab--active"
                  : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{labels[tab]}</span>
              <Badge tone={tone}>
                {lists[tab].length}
              </Badge>
            </button>
          );
        })}
      </section>

      <section className="check-list-card">
        <div className="check-list-header">
          <div>
            <h2>{labels[activeTab]}</h2>
            <p>
              {activeList.length} student
              {activeList.length === 1 ? "" : "s"} require
              this check.
            </p>
          </div>
        </div>

        {activeList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✓</div>
            <h3>No students in this list</h3>
            <p>This case has no matching records.</p>
          </div>
        ) : (
          <div className="review-grid">
            {activeList.map((result) => (
              <article
                className="review-card"
                key={result.student.id}
              >
                <div className="review-card__top">
                  <div className="student-avatar">
                    {result.student.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part.charAt(0))
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {result.student.name}
                    </strong>
                    <span>
                      {result.student.id} •{" "}
                      {result.student.class}
                    </span>
                  </div>
                </div>

                <div className="review-card__detail">
                  {detailFor(result, activeTab)}
                </div>

                <div className="review-card__footer">
                  <div>
                    GPA{" "}
                    <strong>
                      {result.finalGpa.toFixed(2)}
                    </strong>{" "}
                    • Grade{" "}
                    <strong>{result.letterGrade}</strong>
                  </div>

                  <button
                    type="button"
                    className="button button--trace"
                    onClick={() => onViewTrace(result)}
                  >
                    <EyeIcon />
                    Trace
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
