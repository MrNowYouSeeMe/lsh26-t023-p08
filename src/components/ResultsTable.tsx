import type { StudentResult } from "../types/models";
import { Badge } from "./Badge";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "./Icons";

interface ResultsTableProps {
  results: StudentResult[];
  totalFiltered: number;
  page: number;
  pageCount: number;
  pageSize: number;

  onPageChange: (page: number) => void;
  onViewTrace: (result: StudentResult) => void;
}

function ResultFlags({
  result,
}: {
  result: StudentResult;
}) {
  const flags = [];

  if (result.hasCompulsoryFailure) {
    flags.push(
      <Badge key="compulsory" tone="danger">
        Compulsory Fail
      </Badge>
    );
  }

  if (result.flags.practicalFail) {
    flags.push(
      <Badge key="practical" tone="danger">
        Practical Fail
      </Badge>
    );
  }

  if (result.flags.optionalReview) {
    flags.push(
      <Badge key="optional" tone="warning">
        Optional Review
      </Badge>
    );
  }

  if (result.flags.absent) {
    flags.push(
      <Badge key="absent" tone="neutral">
        Absent
      </Badge>
    );
  }

  if (flags.length === 0) {
    flags.push(
      <Badge key="good" tone="success">
        Good Standing
      </Badge>
    );
  }

  return <div className="flag-list">{flags}</div>;
}

export function ResultsTable({
  results,
  totalFiltered,
  page,
  pageCount,
  pageSize,
  onPageChange,
  onViewTrace,
}: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <section className="table-card">
        <div className="empty-state">
          <div className="empty-state__icon">⌕</div>
          <h3>No students found</h3>
          <p>
            Try changing the search query or filters.
          </p>
        </div>
      </section>
    );
  }

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(
    page * pageSize,
    totalFiltered
  );

  return (
    <section className="table-card">
      <div className="table-card__header">
        <div>
          <h2>Student Results</h2>
          <p>
            Final GPA is calculated using the exact P08
            rules.
          </p>
        </div>

        <div className="table-count">
          {totalFiltered} students
        </div>
      </div>

      <div className="table-scroll">
        <table className="result-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Optional</th>
              <th>GPA</th>
              <th>Grade</th>
              <th>Flags</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr key={result.student.id}>
                <td>
                  <div className="student-cell">
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
                        ID: {result.student.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td>{result.student.class}</td>

                <td>
                  <code className="subject-code">
                    {result.student.optional}
                  </code>
                </td>

                <td>
                  <strong
                    className={
                      result.hasCompulsoryFailure
                        ? "gpa-value gpa-value--fail"
                        : "gpa-value gpa-value--pass"
                    }
                  >
                    {result.finalGpa.toFixed(2)}
                  </strong>
                </td>

                <td>
                  <strong
                    className={
                      result.letterGrade === "F"
                        ? "grade grade--fail"
                        : "grade grade--pass"
                    }
                  >
                    {result.letterGrade}
                  </strong>
                </td>

                <td>
                  <ResultFlags result={result} />
                </td>

                <td>
                  <button
                    type="button"
                    className="button button--trace"
                    onClick={() => onViewTrace(result)}
                  >
                    <EyeIcon />
                    View Trace
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Showing {firstItem}–{lastItem} of{" "}
          {totalFiltered}
        </span>

        <div className="pagination__controls">
          <button
            type="button"
            className="page-button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>

          <div className="page-indicator">
            Page <strong>{page}</strong> of{" "}
            <strong>{pageCount}</strong>
          </div>

          <button
            type="button"
            className="page-button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
