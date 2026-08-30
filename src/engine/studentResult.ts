import type {
  Student,
  StudentResult,
  SubjectDefinition,
} from "../types/models";

import { getLetterGrade, roundGpa } from "./grade";
import { evaluateSubject } from "./subjectResult";

export function calculateStudentResult(
  student: Student,
  subjects: SubjectDefinition[],
  compulsoryCodes: string[]
): StudentResult {
  const subjectMap = new Map(
    subjects.map((subject) => [subject.code, subject])
  );

  const compulsoryResults = compulsoryCodes.map((code) => {
    const subject = subjectMap.get(code);

    if (!subject) {
      throw new Error(`Unknown compulsory subject: ${code}`);
    }

    const mark = student.marks[code];

    if (mark === undefined) {
      throw new Error(`${student.id} is missing mark for ${code}`);
    }

    return evaluateSubject(subject, mark);
  });

  const optionalSubject = subjectMap.get(student.optional);

  if (!optionalSubject) {
    throw new Error(
      `${student.id} has unknown optional subject ${student.optional}`
    );
  }

  const optionalMark = student.marks[student.optional];

  if (optionalMark === undefined) {
    throw new Error(
      `${student.id} is missing optional mark for ${student.optional}`
    );
  }

  const optionalResult = evaluateSubject(
    optionalSubject,
    optionalMark
  );

  const compulsoryGpSum = compulsoryResults.reduce(
    (sum, result) => sum + result.gradePoint,
    0
  );

  // R-13:
  // only the part of optional GP above 2.0 helps.
  const optionalBonus = Math.max(
    0,
    optionalResult.gradePoint - 2
  );

  const uncappedGpa =
    (compulsoryGpSum + optionalBonus) / 6;

  const cappedBeforeFailOverride = Math.min(
    5,
    uncappedGpa
  );

  // GPA displayed to 2 decimals.
  const uncancelledGpa = roundGpa(
    cappedBeforeFailOverride
  );

  const failedCompulsorySubjects =
    compulsoryResults
      .filter((result) => result.status !== "PASS")
      .map((result) => result.subjectCode);

  const hasCompulsoryFailure =
    failedCompulsorySubjects.length > 0;

  // Any compulsory failure overrides the final GPA.
  const finalGpa = hasCompulsoryFailure
    ? 0
    : uncancelledGpa;

  const letterGrade = getLetterGrade(
    finalGpa,
    hasCompulsoryFailure
  );

  // R-29 optional checking list:
  // every optional GP <= 2.0, including optional AB.
  const optionalReview =
    optionalResult.gradePoint <= 2.0;

  // R-29 practical-fail list:
  // only an actual practical component below 8 counts.
  // AB is NOT converted to practical=0.
  const allSubjectResults = [
    ...compulsoryResults,
    optionalResult,
  ];

  const practicalFail = allSubjectResults.some(
    (result) =>
      result.practicalMark !== null &&
      result.practicalPassed === false
  );

  const absent = allSubjectResults.some(
    (result) => result.absent
  );

  return {
    student,

    compulsoryResults,
    optionalResult,

    compulsoryGpSum,

    optionalGp: optionalResult.gradePoint,
    optionalBonus,

    uncappedGpa,
    uncancelledGpa,

    hasCompulsoryFailure,
    failedCompulsorySubjects,

    finalGpa,
    letterGrade,

    flags: {
      optionalReview,
      practicalFail,
      absent,
    },
  };
}
