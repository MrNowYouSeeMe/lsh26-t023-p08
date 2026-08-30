import { describe, expect, it } from "vitest";
import { evaluateSubject } from "../engine/subjectResult";

const physics = {
  code: "PHY",
  name: "Physics",
  practical: true,
};

const bangla = {
  code: "BAN",
  name: "Bangla",
  practical: false,
};

describe("P08 practical subject rules", () => {
  it("passes exact theory/practical boundaries 25 and 8", () => {
    const result = evaluateSubject(
      physics,
      { theory: 25, practical: 8 }
    );

    expect(result.totalMark).toBe(33);
    expect(result.status).toBe("PASS");
    expect(result.gradePoint).toBe(1);
  });

  it("fails when theory is below 25 even if total looks passing", () => {
    const result = evaluateSubject(
      physics,
      { theory: 24, practical: 25 }
    );

    expect(result.totalMark).toBe(49);
    expect(result.status).toBe("FAIL");
    expect(result.gradePoint).toBe(0);
    expect(result.failureReasons).toContain(
      "THEORY_BELOW_25"
    );
  });

  it("fails when practical is below 8 even if total is high", () => {
    const result = evaluateSubject(
      physics,
      { theory: 60, practical: 5 }
    );

    expect(result.totalMark).toBe(65);
    expect(result.status).toBe("FAIL");
    expect(result.gradePoint).toBe(0);
    expect(result.failureReasons).toContain(
      "PRACTICAL_BELOW_8"
    );
  });
});

describe("P08 absence rules", () => {
  it("keeps AB distinct from numeric zero", () => {
    const absent = evaluateSubject(bangla, "AB");
    const zero = evaluateSubject(bangla, 0);

    expect(absent.status).toBe("AB");
    expect(absent.absent).toBe(true);

    expect(zero.status).toBe("FAIL");
    expect(zero.absent).toBe(false);

    expect(absent.gradePoint).toBe(0);
    expect(zero.gradePoint).toBe(0);
  });
});
