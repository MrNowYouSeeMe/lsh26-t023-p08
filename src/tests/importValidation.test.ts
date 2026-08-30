import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseMarksTable,
} from "../import/parser";

import {
  validateImportTable,
} from "../import/validator";

import type {
  SubjectDefinition,
} from "../types/models";

const subjects: SubjectDefinition[] = [
  {
    code: "BAN",
    name: "Bangla",
    practical: false,
  },
  {
    code: "PHY",
    name: "Physics",
    practical: true,
  },
  {
    code: "REL",
    name: "Religion",
    practical: false,
  },
];

const compulsory = [
  "BAN",
  "PHY",
];

const header =
  "student_id,name,class,optional,BAN,PHY_theory,PHY_practical,REL";

function validate(text: string) {
  return validateImportTable(
    parseMarksTable(text),
    subjects,
    compulsory
  );
}

describe("marks import parser", () => {
  it("parses CSV data", () => {
    const table = parseMarksTable(
      `${header}\nS01,Rahim,Class 9,REL,75,55,18,80`
    );

    expect(table.delimiter).toBe("comma");
    expect(table.rows).toHaveLength(1);
    expect(
      table.rows[0].values.name
    ).toBe("Rahim");
  });

  it("parses Excel-style tab pasted data", () => {
    const table = parseMarksTable(
      "student_id\tname\tclass\toptional\tBAN\tPHY_theory\tPHY_practical\tREL\nS01\tRahim\tClass 9\tREL\t75\t55\t18\t80"
    );

    expect(table.delimiter).toBe("tab");
    expect(table.rows).toHaveLength(1);
  });

  it("supports quoted CSV values", () => {
    const table = parseMarksTable(
      `${header}\nS01,"Rahim, Hasan",Class 9,REL,75,55,18,80`
    );

    expect(
      table.rows[0].values.name
    ).toBe("Rahim, Hasan");
  });
});

describe("marks import validation", () => {
  it("accepts a fully valid row", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,75,55,18,80`
    );

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);

    expect(
      result.accepted[0].marks.PHY
    ).toEqual({
      theory: 55,
      practical: 18,
    });
  });

  it("rejects normal marks above 100", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,102,55,18,80`
    );

    expect(result.accepted).toHaveLength(0);

    expect(
      result.issues.some(
        (issue) =>
          issue.field === "Bangla" &&
          issue.reason ===
            "Maximum allowed is 100."
      )
    ).toBe(true);
  });

  it("rejects theory above 75", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,75,80,18,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.field ===
            "Physics Theory" &&
          issue.reason ===
            "Maximum allowed is 75."
      )
    ).toBe(true);
  });

  it("rejects practical above 25", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,75,55,30,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.field ===
            "Physics Practical" &&
          issue.reason ===
            "Maximum allowed is 25."
      )
    ).toBe(true);
  });

  it("accepts AB as a valid raw state", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,AB,AB,AB,AB`
    );

    expect(result.rejected).toHaveLength(0);
    expect(
      result.accepted[0].marks.BAN
    ).toBe("AB");
    expect(
      result.accepted[0].marks.PHY
    ).toBe("AB");
  });

  it("rejects one-sided practical AB", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,75,AB,18,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.field === "Physics" &&
          issue.reason.includes(
            "must both be AB"
          )
      )
    ).toBe(true);
  });

  it("rejects non-numeric garbage", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,hello,55,18,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.value === "hello" &&
          issue.reason ===
            "Must be a number or AB."
      )
    ).toBe(true);
  });

  it("rejects blank required marks", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,,55,18,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.field === "Bangla" &&
          issue.reason ===
            "Required mark missing."
      )
    ).toBe(true);
  });

  it("rejects duplicate student IDs", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,REL,75,55,18,80\nS01,Karim,Class 9,REL,70,50,15,75`
    );

    expect(result.accepted).toHaveLength(1);

    expect(
      result.issues.some(
        (issue) =>
          issue.reason ===
            "Duplicate student ID."
      )
    ).toBe(true);
  });

  it("rejects an unknown optional subject", () => {
    const result = validate(
      `${header}\nS01,Rahim,Class 9,XYZ,75,55,18,80`
    );

    expect(
      result.issues.some(
        (issue) =>
          issue.field ===
            "Optional Subject" &&
          issue.reason ===
            "Unknown optional subject code."
      )
    ).toBe(true);
  });
});
