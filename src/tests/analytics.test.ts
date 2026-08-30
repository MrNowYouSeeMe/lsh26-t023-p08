import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildAnalytics,
} from "../engine/analytics";

import type {
  StudentResult,
  SubjectEvaluation,
} from "../types/models";

function subject(
  code: string,
  name: string,
  options: {
    status?: "PASS" | "FAIL" | "AB";
    practical?: boolean;
    theoryPassed?: boolean | null;
    practicalPassed?: boolean | null;
    total?: number | null;
    absent?: boolean;
  } = {}
): SubjectEvaluation {
  const status = options.status ?? "PASS";
  const practical = options.practical ?? false;

  return {
    subjectCode: code,
    subjectName: name,
    practicalSubject: practical,

    status,
    absent: options.absent ?? status === "AB",

    totalMark:
      options.total === undefined
        ? status === "AB"
          ? null
          : 70
        : options.total,

    gradePoint:
      status === "PASS" ? 4 : 0,

    theoryMark:
      practical ? 50 : null,

    practicalMark:
      practical ? 15 : null,

    theoryPassed:
      practical
        ? options.theoryPassed ?? true
        : null,

    practicalPassed:
      practical
        ? options.practicalPassed ?? true
        : null,

    failureReasons:
      status === "PASS" ? [] : ["TEST"],

    rule: "Test rule",
  };
}

function result(
  id: string,
  grade: string,
  finalGpa: number,
  compulsoryResults: SubjectEvaluation[]
): StudentResult {
  const failed =
    compulsoryResults.some(
      (item) => item.status !== "PASS"
    );

  return {
    student: {
      id,
      name: `Student ${id}`,
      class: "Class 9",
      optional: "REL",
      marks: {},
    },

    compulsoryResults,

    optionalResult: subject(
      "REL",
      "Religion"
    ),

    compulsoryGpSum: 0,
    optionalGp: 4,
    optionalBonus: 2,
    uncappedGpa: finalGpa,
    uncancelledGpa: finalGpa,

    hasCompulsoryFailure: failed,

    failedCompulsorySubjects:
      compulsoryResults
        .filter(
          (item) => item.status !== "PASS"
        )
        .map((item) => item.subjectCode),

    finalGpa,
    letterGrade: grade,

    flags: {
      optionalReview: false,
      practicalFail: false,
      absent: false,
    },
  };
}

describe("buildAnalytics", () => {
  it("calculates pass rate and grade distribution", () => {
    const commonPass = [
      subject("BAN", "Bangla"),
      subject("ENG", "English"),
    ];

    const failedMath = [
      subject("BAN", "Bangla"),
      subject(
        "ENG",
        "English",
        {
          status: "FAIL",
          total: 20,
        }
      ),
    ];

    const summary = buildAnalytics([
      result(
        "S1",
        "A",
        4.5,
        commonPass
      ),
      result(
        "S2",
        "F",
        0,
        failedMath
      ),
    ]);

    expect(summary.total).toBe(2);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.passRate).toBe(50);
    expect(summary.averageGpa).toBe(2.25);
    expect(
      summary.gradeDistribution.A
    ).toBe(1);
    expect(
      summary.gradeDistribution.F
    ).toBe(1);
  });

  it("finds the most failed compulsory subject", () => {
    const englishFail = subject(
      "ENG",
      "English",
      {
        status: "FAIL",
        total: 20,
      }
    );

    const physicsPracticalFail = subject(
      "PHY",
      "Physics",
      {
        status: "FAIL",
        practical: true,
        practicalPassed: false,
      }
    );

    const summary = buildAnalytics([
      result(
        "S1",
        "F",
        0,
        [
          subject("BAN", "Bangla"),
          englishFail,
          physicsPracticalFail,
        ]
      ),
      result(
        "S2",
        "F",
        0,
        [
          subject("BAN", "Bangla"),
          subject(
            "ENG",
            "English",
            {
              status: "FAIL",
              total: 22,
            }
          ),
          subject("PHY", "Physics", {
            practical: true,
          }),
        ]
      ),
    ]);

    expect(
      summary.mostFailedSubject
        ?.subjectCode
    ).toBe("ENG");

    expect(
      summary.mostFailedSubject
        ?.failures
    ).toBe(2);

    expect(
      summary.mostFailedSubject
        ?.below33
    ).toBe(2);
  });

  it("tracks practical and absence reasons", () => {
    const summary = buildAnalytics([
      result(
        "S1",
        "F",
        0,
        [
          subject(
            "PHY",
            "Physics",
            {
              status: "FAIL",
              practical: true,
              theoryPassed: true,
              practicalPassed: false,
            }
          ),
        ]
      ),
      result(
        "S2",
        "F",
        0,
        [
          subject(
            "PHY",
            "Physics",
            {
              status: "AB",
              practical: true,
              absent: true,
              total: null,
            }
          ),
        ]
      ),
    ]);

    const physics =
      summary.mostFailedSubject;

    expect(physics?.failures).toBe(2);
    expect(
      physics?.practicalFail
    ).toBe(1);
    expect(physics?.absent).toBe(1);
  });
});
