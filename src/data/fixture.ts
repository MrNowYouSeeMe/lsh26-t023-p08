import type { ResultCase } from "../types/models";

export interface FixtureRoot {
  schema_version: string;
  problem_id: string;
  format_note?: string;
  cases: ResultCase[];
}

export async function loadPublicFixture(): Promise<FixtureRoot> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/P08_school_results_public.json`
  );

  if (!response.ok) {
    throw new Error(
      `Could not load public fixture (${response.status})`
    );
  }

  const data = (await response.json()) as FixtureRoot;

  if (
    data.problem_id !== "P08" ||
    !Array.isArray(data.cases) ||
    data.cases.length === 0
  ) {
    throw new Error("Invalid P08 fixture structure");
  }

  return data;
}
