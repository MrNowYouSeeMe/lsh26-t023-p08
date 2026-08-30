import type {
  SubjectDefinition,
  SubjectEvaluation,
  SubjectMark,
} from "../types/models";

import { getGradePoint } from "./grade";

function validateNumber(
  value: number,
  min: number,
  max: number,
  label: string
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be between ${min} and ${max}`);
  }
}

export function evaluateSubject(
  subject: SubjectDefinition,
  mark: SubjectMark
): SubjectEvaluation {
  // AB is intentionally NOT converted to numeric zero.
  if (mark === "AB") {
    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      practicalSubject: subject.practical,

      status: "AB",
      absent: true,

      totalMark: null,
      gradePoint: 0,

      theoryMark: null,
      practicalMark: null,

      theoryPassed: null,
      practicalPassed: null,

      failureReasons: ["ABSENT"],

      rule:
        "AB: student was absent. Subject grade point is 0. AB remains distinct from a numeric mark of 0.",
    };
  }

  // Practical subject:
  // theory /75 must be >=25
  // practical /25 must be >=8
  // both must pass before total grade band is considered.
  if (subject.practical) {
    if (typeof mark !== "object" || mark === null) {
      throw new Error(
        `${subject.code} requires separate theory and practical marks`
      );
    }

    const theory = mark.theory;
    const practical = mark.practical;

    validateNumber(theory, 0, 75, `${subject.code} theory`);
    validateNumber(practical, 0, 25, `${subject.code} practical`);

    const total = theory + practical;

    const theoryPassed = theory >= 25;
    const practicalPassed = practical >= 8;

    const failureReasons: string[] = [];

    if (!theoryPassed) {
      failureReasons.push("THEORY_BELOW_25");
    }

    if (!practicalPassed) {
      failureReasons.push("PRACTICAL_BELOW_8");
    }

    if (!theoryPassed || !practicalPassed) {
      const reasonText = failureReasons
        .map((reason) =>
          reason === "THEORY_BELOW_25"
            ? `theory ${theory}/75 is below 25`
            : `practical ${practical}/25 is below 8`
        )
        .join(" and ");

      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        practicalSubject: true,

        status: "FAIL",
        absent: false,

        totalMark: total,
        gradePoint: 0,

        theoryMark: theory,
        practicalMark: practical,

        theoryPassed,
        practicalPassed,

        failureReasons,

        rule: `Component-pass rule: ${reasonText}. Subject GP = 0 even though total mark is ${total}.`,
      };
    }

    const gradePoint = getGradePoint(total);

    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      practicalSubject: true,

      status: gradePoint === 0 ? "FAIL" : "PASS",
      absent: false,

      totalMark: total,
      gradePoint,

      theoryMark: theory,
      practicalMark: practical,

      theoryPassed: true,
      practicalPassed: true,

      failureReasons: gradePoint === 0 ? ["TOTAL_BELOW_33"] : [],

      rule: `Theory ${theory}/75 passed (>=25) and practical ${practical}/25 passed (>=8). Total ${total}/100 gives GP ${gradePoint}.`,
    };
  }

  // Normal non-practical subject.
  if (typeof mark !== "number") {
    throw new Error(`${subject.code} requires one numeric mark out of 100`);
  }

  validateNumber(mark, 0, 100, subject.code);

  const gradePoint = getGradePoint(mark);

  return {
    subjectCode: subject.code,
    subjectName: subject.name,
    practicalSubject: false,

    status: gradePoint === 0 ? "FAIL" : "PASS",
    absent: false,

    totalMark: mark,
    gradePoint,

    theoryMark: null,
    practicalMark: null,

    theoryPassed: null,
    practicalPassed: null,

    failureReasons: gradePoint === 0 ? ["MARK_BELOW_33"] : [],

    rule:
      gradePoint === 0
        ? `Mark ${mark}/100 is below 33. Subject GP = 0.`
        : `Mark ${mark}/100 falls in the grade band for GP ${gradePoint}.`,
  };
}
