import { describe, expect, it } from "vitest";
import {
  getGradePoint,
  getLetterGrade,
} from "../engine/grade";

describe("P08 grade boundaries", () => {
  const cases: Array<[number, number]> = [
    [100, 5],
    [80, 5],
    [79, 4],
    [70, 4],
    [69, 3.5],
    [60, 3.5],
    [59, 3],
    [50, 3],
    [49, 2],
    [40, 2],
    [39, 1],
    [33, 1],
    [32, 0],
    [0, 0],
  ];

  it.each(cases)(
    "%i marks produces GP %s",
    (mark, expectedGp) => {
      expect(getGradePoint(mark)).toBe(expectedGp);
    }
  );
});

describe("P08 final letter grades", () => {
  it("maps final GPA boundaries correctly", () => {
    expect(getLetterGrade(5, false)).toBe("A+");
    expect(getLetterGrade(4, false)).toBe("A");
    expect(getLetterGrade(3.5, false)).toBe("A-");
    expect(getLetterGrade(3, false)).toBe("B");
    expect(getLetterGrade(2, false)).toBe("C");
    expect(getLetterGrade(1, false)).toBe("D");
  });

  it("forces F when a compulsory subject failed", () => {
    expect(getLetterGrade(4.8, true)).toBe("F");
  });
});
