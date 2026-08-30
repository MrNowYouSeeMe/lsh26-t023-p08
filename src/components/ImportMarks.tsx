import {
  useMemo,
  useState,
} from "react";

import type {
  DragEvent,
} from "react";

import type {
  StudentResult,
  SubjectDefinition,
} from "../types/models";

import {
  parseMarksTable,
} from "../import/parser";

import {
  validateImportTable,
} from "../import/validator";

import type {
  ImportValidationResult,
} from "../import/types";

import {
  CheckIcon,
  UploadIcon,
  WarningIcon,
  XIcon,
} from "./Icons";

interface ImportMarksProps {
  results: StudentResult[];
}

function deriveSubjects(
  results: StudentResult[]
): SubjectDefinition[] {
  const subjectMap =
    new Map<string, SubjectDefinition>();

  results.forEach((result) => {
    result.compulsoryResults.forEach(
      (subject) => {
        subjectMap.set(
          subject.subjectCode,
          {
            code: subject.subjectCode,
            name: subject.subjectName,
            practical:
              subject.practicalSubject,
          }
        );
      }
    );

    subjectMap.set(
      result.optionalResult.subjectCode,
      {
        code:
          result.optionalResult.subjectCode,
        name:
          result.optionalResult.subjectName,
        practical:
          result.optionalResult.practicalSubject,
      }
    );
  });

  return Array.from(
    subjectMap.values()
  );
}

function buildExample(
  subjects: SubjectDefinition[],
  compulsory: string[],
  className: string
): string {
  const headers = [
    "student_id",
    "name",
    "class",
    "optional",
  ];

  subjects.forEach((subject) => {
    if (subject.practical) {
      headers.push(
        `${subject.code}_theory`,
        `${subject.code}_practical`
      );
    } else {
      headers.push(subject.code);
    }
  });

  const optional =
    subjects.find(
      (subject) =>
        !compulsory.includes(subject.code)
    )?.code ?? "";

  const row = [
    "SAMPLE-01",
    "Sample Student",
    className || "Class 9",
    optional,
  ];

  subjects.forEach((subject) => {
    if (subject.practical) {
      row.push("55", "18");
    } else {
      row.push("75");
    }
  });

  return [
    headers.join(","),
    row.join(","),
  ].join("\n");
}

export function ImportMarks({
  results,
}: ImportMarksProps) {
  const [rawText, setRawText] =
    useState("");

  const [fileName, setFileName] =
    useState("");

  const [error, setError] =
    useState("");

  const [validation, setValidation] =
    useState<ImportValidationResult | null>(
      null
    );

  const [dragging, setDragging] =
    useState(false);

  const subjects = useMemo(
    () => deriveSubjects(results),
    [results]
  );

  const compulsory = useMemo(
    () =>
      results[0]?.compulsoryResults.map(
        (subject) => subject.subjectCode
      ) ?? [],
    [results]
  );

  const currentClass =
    results[0]?.student.class ?? "Class 9";

  const rowsReceived = validation
    ? validation.accepted.length +
      validation.rejected.length
    : 0;

  function clearReport() {
    setValidation(null);
    setError("");
  }

  function validateText() {
    clearReport();

    if (!rawText.trim()) {
      setError(
        "Paste marks or upload a CSV file before validation."
      );
      return;
    }

    try {
      const table =
        parseMarksTable(rawText);

      const report =
        validateImportTable(
          table,
          subjects,
          compulsory
        );

      setValidation(report);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not parse the marks sheet."
      );
    }
  }

  async function readFile(
    file: File
  ) {
    setError("");
    setValidation(null);

    const lowerName =
      file.name.toLowerCase();

    if (
      !lowerName.endsWith(".csv") &&
      !lowerName.endsWith(".txt")
    ) {
      setError(
        "Please upload a .csv or .txt file."
      );
      return;
    }

    try {
      const text = await file.text();

      setRawText(text);
      setFileName(file.name);
    } catch {
      setError(
        "The selected file could not be read."
      );
    }
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      void readFile(file);
    }
  }

  function loadExample() {
    setRawText(
      buildExample(
        subjects,
        compulsory,
        currentClass
      )
    );

    setFileName(
      "Built-in sample"
    );

    clearReport();
  }

  function resetAll() {
    setRawText("");
    setFileName("");
    setValidation(null);
    setError("");
  }

  return (
    <div className="import-page">
      <section className="import-heading">
        <div>
          <div className="eyebrow">
            BONUS • DATA QUALITY
          </div>

          <h1>Import Marks Sheet</h1>

          <p>
            Paste marks from Excel or Google
            Sheets, or upload a CSV file.
            Invalid rows are blocked before
            they reach result processing.
          </p>
        </div>

        <div className="import-security">
          <CheckIcon />

          <div>
            <strong>
              Validation First
            </strong>

            <span>
              AB remains a distinct valid
              state
            </span>
          </div>
        </div>
      </section>

      <section className="import-layout">
        <article className="import-card">
          <header className="import-card__header">
            <div>
              <div className="eyebrow">
                SOURCE DATA
              </div>

              <h2>
                Paste or Upload
              </h2>

              <p>
                CSV and Excel-style tab pasted
                data are supported.
              </p>
            </div>
          </header>

          <div className="import-card__body">
            <div
              className={
                dragging
                  ? "upload-zone upload-zone--dragging"
                  : "upload-zone"
              }
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() =>
                setDragging(false)
              }
              onDrop={handleDrop}
            >
              <UploadIcon />

              <strong>
                Drop your marks sheet here
              </strong>

              <span>
                CSV or text export
              </span>

              <label className="import-file-button">
                Choose File

                <input
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0];

                    if (file) {
                      void readFile(file);
                    }

                    event.target.value = "";
                  }}
                />
              </label>

              {fileName && (
                <small>
                  Loaded: {fileName}
                </small>
              )}
            </div>

            <div className="import-divider">
              <span>OR PASTE TABLE</span>
            </div>

            <textarea
              className="import-textarea"
              value={rawText}
              onChange={(event) => {
                setRawText(
                  event.target.value
                );

                setFileName("");
                clearReport();
              }}
              spellCheck={false}
              placeholder="student_id,name,class,optional,BAN,ENG,MAT,PHY_theory,PHY_practical..."
            />

            <div className="import-actions">
              <button
                type="button"
                className="import-action import-action--secondary"
                onClick={loadExample}
              >
                Load Sample
              </button>

              <button
                type="button"
                className="import-action import-action--secondary"
                onClick={resetAll}
              >
                Clear
              </button>

              <button
                type="button"
                className="import-action import-action--primary"
                onClick={validateText}
              >
                Validate Data
              </button>
            </div>

            <div className="import-format-note">
              <strong>
                Mark limits:
              </strong>

              <span>
                Normal 0–100 or AB • Theory
                0–75 or AB • Practical
                0–25 or AB
              </span>
            </div>
          </div>
        </article>

        <article className="import-card">
          <header className="import-card__header">
            <div>
              <div className="eyebrow">
                VALIDATION REPORT
              </div>

              <h2>
                Import Summary
              </h2>

              <p>
                Every rejected value includes
                an exact reason.
              </p>
            </div>
          </header>

          {!validation && !error && (
            <div className="import-awaiting">
              <UploadIcon />

              <strong>
                Waiting for marks
              </strong>

              <p>
                Add a marks sheet and choose
                Validate Data to generate the
                report.
              </p>
            </div>
          )}

          {error && (
            <div className="import-error">
              <XIcon />

              <div>
                <strong>
                  Validation could not start
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {validation && (
            <div className="import-report">
              <div className="import-summary-grid">
                <article>
                  <span>
                    Rows Received
                  </span>

                  <strong>
                    {rowsReceived}
                  </strong>
                </article>

                <article className="import-summary--accepted">
                  <span>
                    Accepted
                  </span>

                  <strong>
                    {validation.accepted.length}
                  </strong>
                </article>

                <article className="import-summary--rejected">
                  <span>
                    Rejected
                  </span>

                  <strong>
                    {validation.rejected.length}
                  </strong>
                </article>
              </div>

              {validation.schemaErrors.length >
                0 && (
                <div className="schema-errors">
                  <div className="schema-errors__title">
                    <WarningIcon />

                    <strong>
                      Sheet Structure Issues
                    </strong>
                  </div>

                  {validation.schemaErrors.map(
                    (schemaError) => (
                      <div
                        key={schemaError}
                        className="schema-error-row"
                      >
                        {schemaError}
                      </div>
                    )
                  )}
                </div>
              )}

              {validation.rejected.length ===
                0 &&
                validation.schemaErrors.length ===
                  0 && (
                  <div className="import-success">
                    <CheckIcon />

                    <div>
                      <strong>
                        All rows passed validation
                      </strong>

                      <p>
                        No invalid marks or
                        malformed student rows
                        were detected.
                      </p>
                    </div>
                  </div>
                )}

              {validation.rejected.length >
                0 && (
                <div className="rejection-summary">
                  <WarningIcon />

                  <span>
                    {
                      validation.rejected
                        .length
                    }{" "}
                    row
                    {validation.rejected
                      .length === 1
                      ? ""
                      : "s"}{" "}
                    blocked from processing.
                  </span>
                </div>
              )}
            </div>
          )}
        </article>
      </section>

      {validation &&
        validation.issues.length > 0 && (
          <section className="import-table-card">
            <header className="import-table-card__header">
              <div>
                <div className="eyebrow">
                  REJECTED ROW REPORT
                </div>

                <h2>
                  What needs correction?
                </h2>

                <p>
                  Each invalid field is listed
                  separately so the teacher can
                  correct the source sheet.
                </p>
              </div>

              <span className="issue-count">
                {validation.issues.length}{" "}
                issue
                {validation.issues.length ===
                1
                  ? ""
                  : "s"}
              </span>
            </header>

            <div className="import-table-scroll">
              <table className="import-report-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Student</th>
                    <th>Field</th>
                    <th>Value</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {validation.issues.map(
                    (issue, index) => (
                      <tr
                        key={`${issue.row}-${issue.field}-${index}`}
                      >
                        <td>
                          {issue.row}
                        </td>

                        <td>
                          <strong>
                            {issue.student}
                          </strong>
                        </td>

                        <td>
                          {issue.field}
                        </td>

                        <td>
                          <code>
                            {issue.value}
                          </code>
                        </td>

                        <td className="issue-reason">
                          {issue.reason}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      {validation &&
        validation.accepted.length > 0 && (
          <section className="import-table-card">
            <header className="import-table-card__header">
              <div>
                <div className="eyebrow">
                  ACCEPTED PREVIEW
                </div>

                <h2>
                  Rows ready for processing
                </h2>

                <p>
                  Validation succeeded for these
                  students.
                </p>
              </div>

              <span className="accepted-count">
                {validation.accepted.length}{" "}
                accepted
              </span>
            </header>

            <div className="import-table-scroll">
              <table className="import-report-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Optional</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {validation.accepted
                    .slice(0, 10)
                    .map((student) => (
                      <tr key={student.id}>
                        <td>
                          {student.id}
                        </td>

                        <td>
                          <strong>
                            {student.name}
                          </strong>
                        </td>

                        <td>
                          {student.class}
                        </td>

                        <td>
                          {student.optional}
                        </td>

                        <td>
                          <span className="accepted-badge">
                            <CheckIcon />
                            Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {validation.accepted.length >
              10 && (
              <div className="import-more">
                Showing first 10 of{" "}
                {validation.accepted.length}{" "}
                accepted rows.
              </div>
            )}
          </section>
        )}

      <section className="import-rule-card">
        <WarningIcon />

        <div>
          <strong>
            Validation does not change GPA rules
          </strong>

          <p>
            This feature validates source data
            only. GPA, optional bonus,
            compulsory-failure override and
            checking lists remain controlled by
            the existing P08 result engine.
          </p>
        </div>
      </section>
    </div>
  );
}
