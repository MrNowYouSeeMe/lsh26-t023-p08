import { useEffect } from "react";
import type {
  StudentResult,
  SubjectEvaluation,
} from "../types/models";
import { Badge } from "./Badge";
import {
  InfoIcon,
  WarningIcon,
  XIcon,
} from "./Icons";

interface StudentTraceProps {
  result: StudentResult;
  onClose: () => void;
}

function marksUsed(result: SubjectEvaluation): string {
  if (result.absent) return "AB";

  if (result.practicalSubject) {
    return `T ${result.theoryMark}/75 • P ${result.practicalMark}/25 • Total ${result.totalMark}/100`;
  }

  return `${result.totalMark}/100`;
}

function statusBadge(result: SubjectEvaluation) {
  if (result.absent) {
    return <Badge tone="neutral">AB</Badge>;
  }

  if (result.status === "FAIL") {
    return <Badge tone="danger">Failed</Badge>;
  }

  return <Badge tone="success">Passed</Badge>;
}

export function StudentTrace({
  result,
  onClose,
}: StudentTraceProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const allSubjects = [
    ...result.compulsoryResults,
    result.optionalResult,
  ];

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="trace-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Calculation trace for ${result.student.name}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="trace-header">
          <div className="trace-student">
            <div className="trace-avatar">
              {result.student.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <div className="eyebrow">
                CALCULATION TRACE
              </div>

              <h2>{result.student.name}</h2>

              <p>
                {result.student.id} •{" "}
                {result.student.class} • Optional{" "}
                {result.student.optional}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close calculation trace"
          >
            <XIcon />
          </button>
        </header>

        <div className="trace-body">
          <div className="trace-score-grid">
            <article
              className={`score-box ${
                result.hasCompulsoryFailure
                  ? "score-box--danger"
                  : "score-box--success"
              }`}
            >
              <span>Final GPA</span>
              <strong>{result.finalGpa.toFixed(2)}</strong>
            </article>

            <article
              className={`score-box ${
                result.hasCompulsoryFailure
                  ? "score-box--danger"
                  : "score-box--success"
              }`}
            >
              <span>Grade</span>
              <strong>{result.letterGrade}</strong>
            </article>

            <article className="score-box">
              <span>Optional Bonus</span>
              <strong>
                {result.optionalBonus.toFixed(2)}
              </strong>
            </article>
          </div>

          {result.hasCompulsoryFailure && (
            <div className="alert alert--danger">
              <WarningIcon />

              <div>
                <strong>
                  Compulsory subject failure override
                </strong>

                <p>
                  Failed compulsory subject(s):{" "}
                  {result.failedCompulsorySubjects.join(
                    ", "
                  )}
                  . Final GPA is therefore 0.00 and grade
                  F.
                </p>
              </div>
            </div>
          )}

          <div className="alert alert--info">
            <InfoIcon />

            <div>
              <strong>
                Uncancelled GPA before compulsory-fail
                override:{" "}
                {result.uncancelledGpa.toFixed(2)}
              </strong>

              <p>
                The trace preserves the calculated average
                even when the final result is overridden.
              </p>
            </div>
          </div>

          <section className="trace-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  SUBJECT-WISE BREAKDOWN
                </div>
                <h3>Marks → GP → Rule</h3>
              </div>

              <span>{allSubjects.length} subjects</span>
            </div>

            <div className="trace-table-wrap">
              <table className="trace-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks Used</th>
                    <th>GP</th>
                    <th>Status</th>
                    <th>Actual Rule Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {allSubjects.map((subject) => {
                    const optional =
                      subject.subjectCode ===
                      result.student.optional;

                    return (
                      <tr
                        key={subject.subjectCode}
                        className={
                          subject.status !== "PASS"
                            ? "trace-row--attention"
                            : ""
                        }
                      >
                        <td>
                          <div className="trace-subject">
                            <strong>
                              {subject.subjectName}
                            </strong>

                            <span>
                              {subject.subjectCode}
                              {optional
                                ? " • Optional"
                                : " • Compulsory"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              subject.absent
                                ? "mark-ab"
                                : ""
                            }
                          >
                            {marksUsed(subject)}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {subject.gradePoint.toFixed(1)}
                          </strong>
                        </td>

                        <td>
                          {statusBadge(subject)}
                        </td>

                        <td className="rule-cell">
                          {subject.rule}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="trace-bottom-grid">
            <section className="calculation-card">
              <div className="eyebrow">
                OPTIONAL SUBJECT
              </div>

              <h3>
                {result.optionalResult.subjectName}
              </h3>

              <div className="formula-line">
                <span>Optional GP</span>
                <strong>
                  {result.optionalGp.toFixed(1)}
                </strong>
              </div>

              <div className="formula-line">
                <span>Rule</span>
                <strong>
                  max(0, GP − 2)
                </strong>
              </div>

              <div className="formula-line">
                <span>Bonus used</span>
                <strong>
                  {result.optionalBonus.toFixed(2)}
                </strong>
              </div>

              {result.flags.optionalReview && (
                <div className="mini-note mini-note--warning">
                  Optional GP ≤ 2.0 → included in
                  Optional Review.
                </div>
              )}
            </section>

            <section className="calculation-card">
              <div className="eyebrow">
                GPA CALCULATION
              </div>

              <h3>Final calculation summary</h3>

              <div className="formula-line">
                <span>6 compulsory GP sum</span>
                <strong>
                  {result.compulsoryGpSum.toFixed(2)}
                </strong>
              </div>

              <div className="formula-line">
                <span>+ optional bonus</span>
                <strong>
                  {result.optionalBonus.toFixed(2)}
                </strong>
              </div>

              <div className="formula-expression">
                (
                {result.compulsoryGpSum.toFixed(2)} +{" "}
                {result.optionalBonus.toFixed(2)}) ÷ 6
                = {result.uncappedGpa.toFixed(2)}
              </div>

              <div className="formula-line formula-line--result">
                <span>GPA after cap</span>
                <strong>
                  {result.uncancelledGpa.toFixed(2)}
                </strong>
              </div>

              {result.hasCompulsoryFailure ? (
                <div className="final-result final-result--fail">
                  Compulsory fail override → 0.00 / F
                </div>
              ) : (
                <div className="final-result final-result--pass">
                  Final → {result.finalGpa.toFixed(2)} /{" "}
                  {result.letterGrade}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
