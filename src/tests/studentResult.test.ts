import { describe, expect, it } from "vitest";
import type {
  Student,
  SubjectDefinition,
} from "../types/models";

import { calculateStudentResult } from "../engine/studentResult";

const subjects: SubjectDefinition[] = [
  { code: "BAN", name: "Bangla", practical: false },
  { code: "ENG", name: "English", practical: false },
  { code: "MAT", name: "Mathematics", practical: false },

  { code: "PHY", name: "Physics", practical: true },
  { code: "CHE", name: "Chemistry", practical: true },
  { code: "BIO", name: "Biology", practical: true },

  { code: "HMT", name: "Higher Mathematics", practical: true },
  { code: "REL", name: "Religion", practical: false },
];

const compulsory = [
  "BAN",
  "ENG",
  "MAT",
  "PHY",
  "CHE",
  "BIO",
];

describe("P08 complete student GPA rules", () => {
  it("shows uncancelled GPA but forces 0.00/F on compulsory failure", () => {
    const student: Student = {
      id: "EDGE-FAIL",
      name: "High Average Fail",
      class: "Class 9",
      optional: "HMT",

      marks: {
        BAN: 80,
        ENG: 80,
        MAT: 32,

        PHY: { theory: 75, practical: 25 },
        CHE: { theory: 60, practical: 20 },
        BIO: { theory: 60, practical: 20 },

        HMT: { theory: 60, practical: 20 },
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.uncancelledGpa).toBe(4.67);
    expect(result.hasCompulsoryFailure).toBe(true);
    expect(result.failedCompulsorySubjects).toContain("MAT");

    expect(result.finalGpa).toBe(0);
    expect(result.letterGrade).toBe("F");
  });

  it("optional AB contributes 0 but does not fail the overall result", () => {
    const student: Student = {
      id: "EDGE-OPTIONAL-AB",
      name: "Optional AB Student",
      class: "Class 10",
      optional: "REL",

      marks: {
        BAN: 70,
        ENG: 70,
        MAT: 70,

        PHY: { theory: 50, practical: 20 },
        CHE: { theory: 50, practical: 20 },
        BIO: { theory: 50, practical: 20 },

        REL: "AB",
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.optionalGp).toBe(0);
    expect(result.optionalBonus).toBe(0);

    expect(result.hasCompulsoryFailure).toBe(false);
    expect(result.finalGpa).toBe(4);
    expect(result.letterGrade).toBe("A");

    expect(result.flags.optionalReview).toBe(true);
    expect(result.flags.absent).toBe(true);
  });

  it("numeric zero is a fail but not an absence", () => {
    const student: Student = {
      id: "EDGE-ZERO",
      name: "Numeric Zero Student",
      class: "Class 10",
      optional: "REL",

      marks: {
        BAN: 70,
        ENG: 0,
        MAT: 70,

        PHY: { theory: 50, practical: 20 },
        CHE: { theory: 50, practical: 20 },
        BIO: { theory: 50, practical: 20 },

        REL: 70,
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.hasCompulsoryFailure).toBe(true);
    expect(result.finalGpa).toBe(0);

    expect(result.flags.absent).toBe(false);
  });

  it("optional GP 2 gives zero bonus and enters optional review list", () => {
    const student: Student = {
      id: "EDGE-OPTIONAL-2",
      name: "Optional GP Two",
      class: "Class 9",
      optional: "REL",

      marks: {
        BAN: 50,
        ENG: 50,
        MAT: 50,

        PHY: { theory: 40, practical: 10 },
        CHE: { theory: 40, practical: 10 },
        BIO: { theory: 40, practical: 10 },

        REL: 49,
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.optionalGp).toBe(2);
    expect(result.optionalBonus).toBe(0);
    expect(result.flags.optionalReview).toBe(true);
  });

  it("caps GPA at 5.00", () => {
    const student: Student = {
      id: "EDGE-CAP",
      name: "GPA Cap Student",
      class: "Class 10",
      optional: "HMT",

      marks: {
        BAN: 90,
        ENG: 90,
        MAT: 90,

        PHY: { theory: 70, practical: 20 },
        CHE: { theory: 70, practical: 20 },
        BIO: { theory: 70, practical: 20 },

        HMT: { theory: 70, practical: 20 },
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.uncappedGpa).toBe(5.5);
    expect(result.finalGpa).toBe(5);
    expect(result.letterGrade).toBe("A+");
  });

  it("practical fail flag only comes from practical below 8", () => {
    const student: Student = {
      id: "EDGE-PRACTICAL",
      name: "Practical Fail",
      class: "Class 9",
      optional: "REL",

      marks: {
        BAN: 60,
        ENG: 60,
        MAT: 60,

        PHY: { theory: 60, practical: 5 },
        CHE: { theory: 60, practical: 10 },
        BIO: { theory: 60, practical: 10 },

        REL: 60,
      },
    };

    const result = calculateStudentResult(
      student,
      subjects,
      compulsory
    );

    expect(result.flags.practicalFail).toBe(true);
    expect(result.hasCompulsoryFailure).toBe(true);
  });
});
