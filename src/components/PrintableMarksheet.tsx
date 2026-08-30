import type {
  StudentResult,
  SubjectEvaluation,
} from "../types/models";

interface PrintableMarksheetProps {
  result: StudentResult;
}

function formatMarks(
  subject: SubjectEvaluation
): string {
  if (subject.absent) {
    return "AB";
  }

  if (subject.practicalSubject) {
    return `Theory: ${subject.theoryMark}/75, Practical: ${subject.practicalMark}/25, Total: ${subject.totalMark}/100`;
  }

  return `${subject.totalMark}/100`;
}

export function PrintableMarksheet({
  result,
}: PrintableMarksheetProps) {
  const subjects = [
    ...result.compulsoryResults,
    result.optionalResult,
  ];

  const printedOn =
    new Date().toLocaleDateString();

  return (
    <section className="print-marksheet">
      <header className="print-marksheet__header">
        <div className="print-brand-mark">RG</div>

        <div>
          <h1>ResultGuard</h1>
          <p>
            Individual Student Result Marksheet
          </p>
        </div>
      </header>

      <div className="print-divider" />

      <section className="print-student-grid">
        <div>
          <span>Student Name</span>
          <strong>
            {result.student.name}
          </strong>
        </div>

        <div>
          <span>Student ID</span>
          <strong>
            {result.student.id}
          </strong>
        </div>

        <div>
          <span>Class</span>
          <strong>
            {result.student.class}
          </strong>
        </div>

        <div>
          <span>Optional Subject</span>
          <strong>
            {result.optionalResult.subjectName}
          </strong>
        </div>
      </section>

      <section className="print-result-summary">
        <div>
          <span>Final GPA</span>
          <strong>
            {result.finalGpa.toFixed(2)}
          </strong>
        </div>

        <div>
          <span>Letter Grade</span>
          <strong>
            {result.letterGrade}
          </strong>
        </div>

        <div>
          <span>Result</span>
          <strong>
            {result.hasCompulsoryFailure
              ? "FAIL"
              : "PASS"}
          </strong>
        </div>
      </section>

      <h2 className="print-section-title">
        Subject Results
      </h2>

      <table className="print-result-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Type</th>
            <th>Marks</th>
            <th>GP</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subject) => {
            const isOptional =
              subject.subjectCode ===
              result.student.optional;

            return (
              <tr key={subject.subjectCode}>
                <td>
                  <strong>
                    {subject.subjectName}
                  </strong>

                  <small>
                    {subject.subjectCode}
                  </small>
                </td>

                <td>
                  {isOptional
                    ? "Optional"
                    : "Compulsory"}
                </td>

                <td>
                  {formatMarks(subject)}
                </td>

                <td>
                  {subject.gradePoint.toFixed(1)}
                </td>

                <td>
                  {subject.status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="print-calculation">
        <h2>GPA Calculation</h2>

        <div className="print-calculation__row">
          <span>
            Compulsory GP Sum
          </span>
          <strong>
            {result.compulsoryGpSum.toFixed(2)}
          </strong>
        </div>

        <div className="print-calculation__row">
          <span>
            Optional GP
          </span>
          <strong>
            {result.optionalGp.toFixed(1)}
          </strong>
        </div>

        <div className="print-calculation__row">
          <span>
            Optional Bonus
          </span>
          <strong>
            max(0, {result.optionalGp.toFixed(1)} - 2)
            = {result.optionalBonus.toFixed(2)}
          </strong>
        </div>

        <div className="print-calculation__formula">
          (
          {result.compulsoryGpSum.toFixed(2)}
          {" + "}
          {result.optionalBonus.toFixed(2)}
          ) / 6
          {" = "}
          {result.uncappedGpa.toFixed(2)}
        </div>

        <div className="print-calculation__row print-calculation__row--final">
          <span>
            GPA after 5.00 cap
          </span>
          <strong>
            {result.uncancelledGpa.toFixed(2)}
          </strong>
        </div>

        {result.hasCompulsoryFailure && (
          <div className="print-fail-note">
            Compulsory failure override applied:
            Final GPA = 0.00 and Grade = F.
            Failed compulsory subject(s):{" "}
            {result.failedCompulsorySubjects.join(
              ", "
            )}
          </div>
        )}
      </section>

      <footer className="print-footer">
        <div className="signature-box">
          <div />
          <span>
            Class Teacher Signature
          </span>
        </div>

        <div className="signature-box">
          <div />
          <span>
            Head Teacher Signature
          </span>
        </div>

        <div className="print-date">
          <span>Printed on</span>
          <strong>{printedOn}</strong>
        </div>
      </footer>

      <div className="print-system-note">
        Generated by ResultGuard using the P08
        School Result Processing and GPA Engine.
      </div>
    </section>
  );
}
