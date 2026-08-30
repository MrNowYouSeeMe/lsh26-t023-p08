import type {
  StudentResult,
  SubjectEvaluation,
} from "../types/models";

export const GRADE_ORDER = [
  "A+",
  "A",
  "A-",
  "B",
  "C",
  "D",
  "F",
] as const;

export interface SubjectFailureSummary {
  subjectCode: string;
  subjectName: string;
  failures: number;
  absent: number;
  theoryFail: number;
  practicalFail: number;
  below33: number;
}

export interface AnalyticsSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  averageGpa: number;

  gradeDistribution: Record<string, number>;

  subjectFailures: SubjectFailureSummary[];
  mostFailedSubject: SubjectFailureSummary | null;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function classifyFailure(
  subject: SubjectEvaluation,
  summary: SubjectFailureSummary
): void {
  if (subject.absent) {
    summary.absent += 1;
    return;
  }

  if (
    subject.practicalSubject &&
    subject.theoryPassed === false
  ) {
    summary.theoryFail += 1;
  }

  if (
    subject.practicalSubject &&
    subject.practicalPassed === false
  ) {
    summary.practicalFail += 1;
  }

  if (
    !subject.practicalSubject &&
    subject.totalMark !== null &&
    subject.totalMark < 33
  ) {
    summary.below33 += 1;
  }
}

export function buildAnalytics(
  results: StudentResult[]
): AnalyticsSummary {
  const total = results.length;

  const failed = results.filter(
    (result) => result.hasCompulsoryFailure
  ).length;

  const passed = total - failed;

  const passRate =
    total === 0
      ? 0
      : round2((passed / total) * 100);

  const averageGpa =
    total === 0
      ? 0
      : round2(
          results.reduce(
            (sum, result) =>
              sum + result.finalGpa,
            0
          ) / total
        );

  const gradeDistribution: Record<string, number> =
    Object.fromEntries(
      GRADE_ORDER.map((grade) => [grade, 0])
    );

  for (const result of results) {
    gradeDistribution[result.letterGrade] =
      (gradeDistribution[result.letterGrade] ?? 0) + 1;
  }

  const subjectMap =
    new Map<string, SubjectFailureSummary>();

  for (const result of results) {
    for (const subject of result.compulsoryResults) {
      let summary = subjectMap.get(
        subject.subjectCode
      );

      if (!summary) {
        summary = {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          failures: 0,
          absent: 0,
          theoryFail: 0,
          practicalFail: 0,
          below33: 0,
        };

        subjectMap.set(
          subject.subjectCode,
          summary
        );
      }

      if (subject.status !== "PASS") {
        summary.failures += 1;
        classifyFailure(subject, summary);
      }
    }
  }

  const subjectFailures = Array.from(
    subjectMap.values()
  ).sort(
    (a, b) =>
      b.failures - a.failures ||
      a.subjectName.localeCompare(b.subjectName)
  );

  return {
    total,
    passed,
    failed,
    passRate,
    averageGpa,
    gradeDistribution,
    subjectFailures,
    mostFailedSubject:
      subjectFailures.length > 0
        ? subjectFailures[0]
        : null,
  };
}
