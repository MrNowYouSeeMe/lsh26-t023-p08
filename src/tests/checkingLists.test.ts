import { describe, expect, it } from "vitest";
import { buildCheckingLists } from "../engine/checkingLists";
import type { StudentResult } from "../types/models";

describe("P08 checking lists", () => {
  it("allows the same student to appear on multiple checking lists", () => {
    const fakeResult = {
      flags: {
        optionalReview: true,
        practicalFail: true,
        absent: true,
      },
    } as StudentResult;

    const lists = buildCheckingLists([fakeResult]);

    expect(lists.optionalReview).toHaveLength(1);
    expect(lists.practicalFail).toHaveLength(1);
    expect(lists.absent).toHaveLength(1);
  });
});
