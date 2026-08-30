import type {
  CheckingLists,
  StudentResult,
} from "../types/models";

export function buildCheckingLists(
  results: StudentResult[]
): CheckingLists {
  return {
    optionalReview: results.filter(
      (result) => result.flags.optionalReview
    ),

    practicalFail: results.filter(
      (result) => result.flags.practicalFail
    ),

    absent: results.filter(
      (result) => result.flags.absent
    ),
  };
}
